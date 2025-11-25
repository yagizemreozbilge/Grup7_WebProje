var express = require('express');
var router = express.Router();
const Fields = require("../db/models/Fields");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error")
const Enum = require("../config/Enum");
const AuditLogs = require("../db/models/AuditLogs"); 
const { HTTP_CODES } = require('../config/Enum');

const auth = require('../lib/logger/auth')();
const requireAuth = [auth.initialize(), auth.authenticate()];

const TENANT_KEYWORDS = ['saha', 'tenant'];

const hasPrivilege = (req, permissionKey) => {
    if (!permissionKey) return true;
    const privileges = Array.isArray(req.user?.roles) ? req.user.roles : [];
    return privileges.some((priv) => priv.key === permissionKey);
};

const hasRoleKeyword = (req, keywords = TENANT_KEYWORDS) => {
    const roleDetails = Array.isArray(req.user?.role_details) ? req.user.role_details : [];
    return roleDetails.some((role) => {
        const name = (role?.role_name || role?.name || '').toLowerCase();
        return keywords.some((keyword) => keyword && name.includes(keyword));
    });
};

const isSuperAdmin = (req) => {
    const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const roleDetails = Array.isArray(req.user?.role_details) ? req.user.role_details : [];
    
    return userRoles.includes('superuser') ||
           roleDetails.some((role) => {
               const name = (role?.role_name || role?.name || '').toLowerCase();
               return name.includes('admin') || name.includes('super');
           });
};

const ensureFieldPermission = (permissionKey) => (req, res, next) => {
    if (hasPrivilege(req, permissionKey) || hasRoleKeyword(req)) {
        return next();
    }

    let errorResponse = Response.errorResponse(
        new CustomError(
            HTTP_CODES.FORBIDDEN,
            "Authorization Error",
            "Need Permission"
        )
    );

    return res.status(errorResponse.code).json(errorResponse);
};
/* GET Alan Listeleme. */
router.get('/', async(req, res) => {

    try {
        // Super admin tüm sahaları görebilir, diğerleri sadece onaylıları
        const query = isSuperAdmin(req) 
            ? { deleted_at: null }
            : { approval_status: 'approved', deleted_at: null, is_active: true };
        
        let fields = await Fields.find(query);

        res.json(Response.successResponse(fields));
    } catch(err) {
            let errorResponse = Response.errorResponse(err);
           
            return res.status(errorResponse.code).json(errorResponse);
    }
  
});

/* GET Pending Sahalar - Sadece Super Admin */
/* ÖNEMLİ: Bu route /:id route'undan ÖNCE olmalı! */
router.get("/pending", ...requireAuth, async (req, res) => {
  try {
    if (!isSuperAdmin(req)) {
      throw new CustomError(Enum.HTTP_CODES.FORBIDDEN, "Authorization Error", "Only super admin can view pending fields");
    }

    let fields = await Fields.find({ 
      approval_status: 'pending',
      deleted_at: null 
    }).populate('tenant_id', 'first_name last_name email');

    res.json(Response.successResponse(fields));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/* GET Tek Alan Detayini Getirme. */
router.get('/:id', async(req, res) => {
    const fieldId = req.params.id; 
    
    
    try {
        if(!fieldId) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "ID parameter is missing");
        }
        
        
        if (!Fields.base.Types.ObjectId.isValid(fieldId)) {
            
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Invalid Field ID format");
        }
       

        let field = await Fields.findById(fieldId);

        if (!field) {
           
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "Field not found with the given ID");
        }

        res.json(Response.successResponse(field));
    } catch(err) {
            let errorResponse = Response.errorResponse(err);
           
            return res.status(errorResponse.code).json(errorResponse);
    }
  
});

//* Alan Ekleme. */
router.post("/add",  ...requireAuth, ensureFieldPermission("fields_add"),async(req, res) => {
     let body = req.body;
    try {
        if (!hasPrivilege(req, "fields_add") || !body.tenant_id) {
            body.tenant_id = req.user.id;
        }

        if(!body.name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "name field must be filled");
        if(!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");
        if(!body.city) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "city field must be filled");

        
        let exists = await Fields.findOne({
            tenant_id: body.tenant_id,
            name: body.name.trim()
        });

        if (exists) {
            throw new CustomError(
                Enum.HTTP_CODES.CONFLICT,
                "Already Exists!",
                "This field already exists for this tenant."
            );
        }

        // Super admin ise otomatik onaylı, tenant ise pending
        const approvalStatus = isSuperAdmin(req) ? 'approved' : 'pending';

        let newField = new Fields({
            tenant_id: body.tenant_id,
            name: body.name,
            price_per_hour: typeof body.price_per_hour === 'number' ? body.price_per_hour : Number(body.price_per_hour) || 0,
            features: Array.isArray(body.features) ? body.features : [],
            photos: Array.isArray(body.photos) ? body.photos : (body.photos ? [body.photos] : []),
            latitude: typeof body.latitude === 'number' ? body.latitude : 0,
            longitude: typeof body.longitude === 'number' ? body.longitude : 0,
            address: body.address || body.city || '',
            city: body.city,
            is_active: true,
            approval_status: approvalStatus,
            created_by: req.user?.id
        });

        await newField.save();

        res.status(HTTP_CODES.CREATED).json(
            Response.successResponse({ success: true, _id: newField._id })
        ); 
    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


/* Alan Guncelleme. */
router.post("/update",  ...requireAuth, ensureFieldPermission("fields_update"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
    if (!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");
    
    let updates = {};

    if (body.name) updates.name = body.name;
    if (body.price_per_hour) updates.price_per_hour = body.price_per_hour;
    if (Array.isArray(body.features)) updates.features = body.features;
    if (typeof body.latitude === 'number') updates.latitude = body.latitude;
    if (typeof body.longitude === 'number') updates.longitude = body.longitude;
    if (body.address) updates.address = body.address;
    if (body.city) updates.city = body.city;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Fields.updateOne({ _id: body._id,tenant_id: body.tenant_id }, updates);

   

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
   
    res.status(errorResponse.code).json(errorResponse);
  }
});

/* Saha Onaylama - Sadece Super Admin */
router.post("/approve", ...requireAuth, async (req, res) => {
  let body = req.body;
  try {
    if (!isSuperAdmin(req)) {
      throw new CustomError(Enum.HTTP_CODES.FORBIDDEN, "Authorization Error", "Only super admin can approve fields");
    }

    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
    if (!body.approval_status || !['approved', 'rejected'].includes(body.approval_status)) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "approval_status must be 'approved' or 'rejected'");
    }

    await Fields.updateOne(
      { _id: body._id },
      { approval_status: body.approval_status }
    );

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/* GET Alan Silme - Soft Delete (Super Admin Onayı Gerekli) */
router.post("/delete",  ...requireAuth, ensureFieldPermission("fields_delete"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!", "_id field must be filled");
   
    if (!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");

    // Super admin direkt silebilir, tenant ise soft delete (deleted_at set edilir)
    if (isSuperAdmin(req)) {
      await Fields.deleteOne({ _id: body._id, tenant_id: body.tenant_id });
    } else {
      // Tenant sadece kendi sahasını silebilir ve soft delete yapılır
      const field = await Fields.findOne({ _id: body._id, tenant_id: body.tenant_id });
      if (!field) {
        throw new CustomError(Enum.HTTP_CODES.FORBIDDEN, "Authorization Error", "You can only delete your own fields");
      }
      await Fields.updateOne(
        { _id: body._id },
        { deleted_at: new Date() }
      );
    }

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;