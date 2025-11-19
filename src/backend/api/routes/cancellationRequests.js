var express = require('express');
var router = express.Router();
const CancellationRequests = require("../db/models/CancellationRequests");
const Reservations = require("../db/models/Reservations");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const { HTTP_CODES } = require('../config/Enum');

const auth = require('../lib/logger/auth')();
router.use(auth.initialize(), auth.authenticate());

const hasPrivilege = (req, permissionKey) => {
    if (!permissionKey) return true;
    const privileges = Array.isArray(req.user?.roles) ? req.user.roles : [];
    return privileges.some((priv) => priv.key === permissionKey);
};

const isSuperAdmin = (req) => {
    return hasPrivilege(req, "superuser") || 
           (Array.isArray(req.user?.role_details) && req.user.role_details.some(r => {
               const name = (r?.name || '').toLowerCase();
               return name.includes('admin') || name.includes('super');
           }));
};

const isTenant = (req) => {
    const roleDetails = Array.isArray(req.user?.role_details) ? req.user.role_details : [];
    return roleDetails.some((role) => {
        const name = (role?.name || '').toLowerCase();
        return name.includes('saha') || name.includes('tenant');
    });
};

/* POST İptal Talebi Oluşturma - Müşteri */
router.post("/create", async(req, res) => {
    let body = req.body;
    try {
        if (!body.reservation_id) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "reservation_id field must be filled");
        }

        // Rezervasyonu bul (önce raw değerleri al, sonra populate et)
        const reservationRaw = await Reservations.findById(body.reservation_id).lean();
        
        if (!reservationRaw) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Rezervasyon bulunamadı");
        }
        
        // tenant_id ve field_id'yi raw değerlerden al
        const tenantId = reservationRaw.tenant_id;
        const fieldId = reservationRaw.field_id;
        const customerId = reservationRaw.customer_id;
        
        if (!tenantId) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Rezervasyonda tenant_id bulunamadı");
        }
        if (!fieldId) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Rezervasyonda field_id bulunamadı");
        }
        
        // Sadece rezervasyon sahibi iptal talebi oluşturabilir
        if (String(customerId) !== String(req.user.id)) {
            throw new CustomError(Enum.HTTP_CODES.FORBIDDEN, "Authorization Error", "Sadece rezervasyon sahibi iptal talebi oluşturabilir");
        }
        
        // Rezervasyonu populate edilmiş halde de al (diğer kontroller için)
        const reservation = await Reservations.findById(body.reservation_id)
            .populate('field_id', 'name')
            .populate('customer_id', 'first_name last_name email')
            .populate('tenant_id', 'name');

        // Rezervasyon zaten iptal edilmiş mi kontrol et
        if (reservation.status === 'cancelled') {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Bu rezervasyon zaten iptal edilmiş");
        }

        // 3 saat kontrolü - Rezervasyon başlangıç saatine 3 saatten az kaldıysa iptal edilemez
        const now = new Date();
        const reservationStart = new Date(reservation.start);
        const hoursUntilReservation = (reservationStart - now) / (1000 * 60 * 60); // Saat cinsinden

        if (hoursUntilReservation < 3) {
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,
                "Time Restriction",
                `Rezervasyon saatine 3 saatten az kaldığı için iptal edilemez. Kalan süre: ${Math.round(hoursUntilReservation * 10) / 10} saat`
            );
        }

        // Zaten bekleyen bir iptal talebi var mı kontrol et
        const existingRequest = await CancellationRequests.findOne({
            reservation_id: body.reservation_id,
            status: 'pending'
        });

        if (existingRequest) {
            throw new CustomError(Enum.HTTP_CODES.CONFLICT, "Already Exists", "Bu rezervasyon için zaten bekleyen bir iptal talebi mevcut");
        }

        // İptal talebi oluştur (tenantId ve fieldId zaten yukarıda alındı)
        const newCancellationRequest = new CancellationRequests({
            reservation_id: body.reservation_id,
            customer_id: req.user.id,
            tenant_id: tenantId,
            field_id: fieldId,
            reason: body.reason || '',
            status: 'pending',
            request_type: 'customer'
        });

        await newCancellationRequest.save();

        res.status(HTTP_CODES.CREATED).json(
            Response.successResponse({ 
                success: true, 
                cancellation_request_id: newCancellationRequest._id 
            })
        );

    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* GET İptal Taleplerini Listeleme */
router.get("/", async(req, res) => {
    try {
        let query = {};
        
        const userIsSuperAdmin = isSuperAdmin(req);
        const userIsTenant = isTenant(req);

        if (userIsSuperAdmin) {
            // Super admin tüm iptal taleplerini görebilir
            query = {};
        } else if (userIsTenant) {
            // Saha sahibi sadece kendi sahalarının iptal taleplerini görebilir
            query = { tenant_id: req.user.id };
        } else {
            // Müşteri sadece kendi iptal taleplerini görebilir
            query = { customer_id: req.user.id };
        }

        let cancellationRequests = await CancellationRequests.find(query)
            .populate('reservation_id', 'start end price status')
            .populate('customer_id', 'first_name last_name email')
            .populate('tenant_id', 'name')
            .populate('field_id', 'name')
            .populate('reviewed_by', 'first_name last_name email')
            .sort({ created_at: -1 });

        res.json(Response.successResponse(cancellationRequests));
    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        return res.status(errorResponse.code).json(errorResponse);
    }
});

/* POST İptal Talebi Onaylama/Reddetme - Saha Sahibi veya Super Admin */
router.post("/review", async(req, res) => {
    let body = req.body;
    try {
        if (!body._id) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
        }

        if (!body.status || !['approved', 'rejected'].includes(body.status)) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "status must be 'approved' or 'rejected'");
        }

        // İptal talebini bul
        const cancellationRequest = await CancellationRequests.findById(body._id)
            .populate('reservation_id');

        if (!cancellationRequest) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "İptal talebi bulunamadı");
        }

        // Zaten işlenmiş mi kontrol et
        if (cancellationRequest.status !== 'pending') {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Bu iptal talebi zaten işlenmiş");
        }

        // Yetki kontrolü - Sadece saha sahibi veya super admin onaylayabilir/reddedebilir
        const userIsSuperAdmin = isSuperAdmin(req);
        const userIsTenant = isTenant(req);
        const isOwner = String(cancellationRequest.tenant_id) === String(req.user.id);

        if (!userIsSuperAdmin && !(userIsTenant && isOwner)) {
            throw new CustomError(
                Enum.HTTP_CODES.FORBIDDEN,
                "Authorization Error",
                "Sadece saha sahibi veya super admin iptal taleplerini onaylayabilir/reddedebilir"
            );
        }

        // İptal talebini güncelle
        cancellationRequest.status = body.status;
        cancellationRequest.reviewed_by = req.user.id;
        cancellationRequest.reviewed_at = new Date();
        cancellationRequest.response_message = body.response_message || '';

        await cancellationRequest.save();

        // Eğer onaylandıysa, rezervasyonu iptal et
        if (body.status === 'approved') {
            const reservationId = cancellationRequest.reservation_id?._id || cancellationRequest.reservation_id;
            await Reservations.updateOne(
                { _id: reservationId },
                { status: 'cancelled' }
            );
        }

        res.json(Response.successResponse({ success: true }));

    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* POST İptal Talebini Geri Çekme - Müşteri */
router.post("/withdraw", async(req, res) => {
    let body = req.body;
    try {
        if (!body._id) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
        }

        // İptal talebini bul
        const cancellationRequest = await CancellationRequests.findById(body._id);

        if (!cancellationRequest) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "İptal talebi bulunamadı");
        }

        // Sadece bekleyen talepler geri çekilebilir
        if (cancellationRequest.status !== 'pending') {
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,
                "Validation Error!",
                "Sadece bekleyen iptal talepleri geri çekilebilir"
            );
        }

        // Sadece talep sahibi geri çekebilir
        if (String(cancellationRequest.customer_id) !== String(req.user.id)) {
            throw new CustomError(
                Enum.HTTP_CODES.FORBIDDEN,
                "Authorization Error",
                "Sadece iptal talebi sahibi talebi geri çekebilir"
            );
        }

        // İptal talebini sil
        await CancellationRequests.deleteOne({ _id: body._id });

        res.json(Response.successResponse({ success: true, message: "İptal talebi başarıyla geri çekildi" }));

    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;

