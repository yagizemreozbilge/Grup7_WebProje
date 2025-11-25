var express = require('express');
var router = express.Router();
const Reservations = require("../db/models/Reservations");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error")
const Enum = require("../config/Enum");
const AuditLogs = require("../db/models/AuditLogs");
const { HTTP_CODES } = require('../config/Enum');

const auth = require('../lib/logger/auth')();
router.use(auth.initialize(), auth.authenticate());

const hasPrivilege = (req, permissionKey) => {
    if (!permissionKey) return true;
    const privileges = Array.isArray(req.user?.roles) ? req.user.roles : [];
    return privileges.some((priv) => priv.key === permissionKey);
};
/* GET Rezervasyon Listeleme. */
router.get('/', async(req, res) => {
    try {
        const canViewAll = hasPrivilege(req, "reservations_view");
        let query = {};
        
        if (!canViewAll) {
            // Oyuncu sadece kendi rezervasyonlarını görebilir
            // Saha sahibi kendi sahalarının rezervasyonlarını görebilir
            const roleDetails = Array.isArray(req.user?.role_details) ? req.user.role_details : [];
            const isTenant = roleDetails.some((role) => {
                const name = (role?.name || '').toLowerCase();
                return name.includes('saha') || name.includes('tenant');
            });
            
            if (isTenant) {
                // Tenant hem kendi rezervasyonlarını hem de sahalarının rezervasyonlarını görebilir
                query = {
                    $or: [
                        { customer_id: req.user.id },
                        { tenant_id: req.user.id }
                    ]
                };
            } else {
                query = { customer_id: req.user.id };
            }
        }
        
        let reservations = await Reservations.find(query).populate('field_id', 'name').populate('customer_id', 'first_name last_name email');

        res.json(Response.successResponse(reservations));
    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        return res.status(errorResponse.code).json(errorResponse);
    }
});

/* GET Rezervasyon Ekleme. */
router.post("/add", async(req, res) => {
     let body = req.body;
    try {

        const canCreateForOthers = hasPrivilege(req, "reservations_add");
        if (!canCreateForOthers) {
            body.customer_id = req.user.id;
        } else if (!body.customer_id) {
            body.customer_id = req.user.id;
        }
        
        if (String(body.customer_id) !== String(req.user.id) && !canCreateForOthers) {
            throw new CustomError(Enum.HTTP_CODES.FORBIDDEN, "Authorization Error", "You cannot create reservations for other users.");
        }

        if(!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");
        if(!body.start) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "start field must be filled");
        if(!body.end) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "end field must be filled");
        if(!body.field_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "field_id field must be filled");

        if(!body.status) {
            body.status = "pending";
        }

        // Zaman aralığı çakışma kontrolü
        const startTime = new Date(body.start);
        const endTime = new Date(body.end);

        const conflictingReservation = await Reservations.findOne({
            field_id: body.field_id,
            status: { $in: ['pending', 'confirmed'] }, // Sadece bekleyen ve onaylı rezervasyonları kontrol et
            $or: [
                // Yeni rezervasyon mevcut rezervasyonun içinde başlıyor
                { start: { $lte: startTime }, end: { $gt: startTime } },
                // Yeni rezervasyon mevcut rezervasyonun içinde bitiyor
                { start: { $lt: endTime }, end: { $gte: endTime } },
                // Yeni rezervasyon mevcut rezervasyonu tamamen kapsıyor
                { start: { $gte: startTime }, end: { $lte: endTime } }
            ]
        });

        if (conflictingReservation) {
            throw new CustomError(
                Enum.HTTP_CODES.CONFLICT,
                "Time Conflict!",
                "Bu saatte saha zaten rezerve edilmiş. Lütfen başka bir saat seçin."
            );
        }

        let newReservation = new Reservations({
            tenant_id: body.tenant_id,
            field_id: body.field_id,
            customer_id: body.customer_id,
            start: body.start,
            end: body.end,
            price: body.price,
            status: body.status,
            is_active: true,
            created_by: req.user?.id
        });

        await newReservation.save();

        res.status(HTTP_CODES.CREATED).json(
            Response.successResponse({ success: true })
        );

    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


/* GET Rezervasyon Guncellenme. */
router.post("/update", auth.checkRoles("reservations_update"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
  
    if (!body.field_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "field_id field must be filled");
    if (!body.customer_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "customer_id field must be filled");

    let updates = {};

    if (body.tenant_id) updates.tenant_id = body.tenant_id;
    if (body.field_id) updates.field_id = body.field_id;
    if (body.customer_id) updates.customer_id = body.customer_id;
    if (body.start) updates.start = body.start;
    if (body.end) updates.end = body.end;
    if (body.price) updates.price = body.price;
    if (body.status) updates.status = body.status;
    if (body.client_request_id) updates.client_request_id = body.client_request_id;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Reservations.updateOne({ _id: body._id, tenant_id:body.tenant_id, field_id:body.field_id, customer_id:body.customer_id}, updates);

    

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/* Rezervasyon Onay/Red - Saha Sahibi */
router.post("/approve", async(req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
    if (!body.status || !['confirmed', 'cancelled'].includes(body.status)) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "status must be 'confirmed' or 'cancelled'");
    }

    // Rezervasyonu bul
    const reservation = await Reservations.findById(body._id);
    if (!reservation) {
      throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Reservation not found");
    }

    // Sadece saha sahibi veya super admin onaylayabilir
    const isOwner = String(reservation.tenant_id) === String(req.user.id);
    const isSuperAdmin = hasPrivilege(req, "superuser") || 
                         (Array.isArray(req.user?.role_details) && req.user.role_details.some(r => {
                           const name = (r?.name || '').toLowerCase();
                           return name.includes('admin') || name.includes('super');
                         }));

    if (!isOwner && !isSuperAdmin) {
      throw new CustomError(Enum.HTTP_CODES.FORBIDDEN, "Authorization Error", "Only field owner or super admin can approve/reject reservations");
    }

    await Reservations.updateOne(
      { _id: body._id },
      { status: body.status }
    );

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/* GET Rezervasyon Silme. */
router.post("/delete", auth.checkRoles("reservations_delete"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!", "_id field must be filled");
    
    if (!body.field_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "field_id field must be filled");
    if (!body.customer_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "customer_id field must be filled");

    await Reservations.deleteOne({ _id: body._id, tenant_id:body.tenant_id, field_id:body.field_id, customer_id:body.customer_id }); 

    

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});


module.exports = router;