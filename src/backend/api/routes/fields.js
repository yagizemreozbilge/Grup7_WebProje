var express = require('express');
var router = express.Router();
const Fields = require("../db/models/Fields");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error")
const Enum = require("../config/Enum");
const AuditLogs = require("../db/models/AuditLogs"); 
const { HTTP_CODES } = require('../config/Enum');

const auth = require('../lib/logger/auth')();
router.use(auth.initialize(), auth.authenticate());
/* GET Alan Listeleme. */
router.get('/', auth.checkRoles("fields_view"),async(req, res) => {

    try {
        let fields = await Fields.find({});

        res.json(Response.successResponse(fields));
    } catch(err) {
            let errorResponse = Response.errorResponse(err);
           
            return res.status(errorResponse.code).json(errorResponse);
    }
  
});

/* GET Tek Alan Detayini Getirme. */
router.get('/:id',  auth.checkRoles("fields_view"),async(req, res) => {
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
router.post("/add",  auth.checkRoles("fields_add"),async(req, res) => {
     let body = req.body;
    try {
        if(!body.name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "name field must be filled");
        if(!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");

        
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

        let newField = new Fields({
            tenant_id: body.tenant_id,
            name: body.name,
            price_per_hour: body.price_per_hour,
            features: body.features,
            latitude: body.latitude,
            longitude: body.longitude,
            address: body.address,
            is_active: true,
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
router.post("/update",  auth.checkRoles("fields_update"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
    if (!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");
    
    let updates = {};

    if (body.name) updates.name = body.name;
    if (body.price_per_hour) updates.price_per_hour = body.price_per_hour;
    if (body.features) updates.features = body.features;
    if (body.latitude) updates.latitude = body.latitude;
    if (body.longitude) updates.longitude = body.longitude;
    if (body.address) updates.address = body.address;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Fields.updateOne({ _id: body._id,tenant_id: body.tenant_id }, updates);

   

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
   
    res.status(errorResponse.code).json(errorResponse);
  }
});

/* GET Alan Silme. */
router.post("/delete",  auth.checkRoles("fields_delete"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!", "_id field must be filled");
   
    
    if (!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");

    
    await Fields.deleteOne({ _id: body._id, tenant_id: body.tenant_id }); 

    

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
  
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;