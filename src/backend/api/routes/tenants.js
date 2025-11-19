var express = require('express');
var router = express.Router();
const Tenants = require("../db/models/Tenants");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error")
const Enum = require("../config/Enum");
const AuditLogs = require("../db/models/AuditLogs");
const { HTTP_CODES } = require('../config/Enum');

const auth = require('../lib/logger/auth')();
router.use(auth.initialize(), auth.authenticate());

router.get('/', auth.checkRoles("tenants_view"),async(req, res) => {
    try {
        let tenants = await Tenants.find({});
        res.json(Response.successResponse(tenants));
    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        return res.status(errorResponse.code).json(errorResponse); 
    }
});



router.post("/add", auth.checkRoles("tenants_add"),async(req, res) => {
    let body = req.body;
    try {

        if (!body.name)
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "name field must be filled");

        if (!body.owner_user_id)
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "owner_user_id field must be filled");

        let exists = await Tenants.findOne({
            name: body.name.trim(),
            owner_user_id: body.owner_user_id
        });

        if (exists) {
            
            throw new CustomError(
                Enum.HTTP_CODES.CONFLICT,
                "Already Exists!",
                "This tenant already exists for this owner."
            );
        }

        
        let newTenant = new Tenants({
            name: body.name,
            owner_user_id: body.owner_user_id,
            billing_info: body.billing_info,
            is_active: true,
            created_by: req.user?.id
        });

        await newTenant.save();

        res.status(HTTP_CODES.CREATED).json(
            Response.successResponse({
                success: true,
                _id: newTenant._id
            })
        );

    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});


router.post("/update", auth.checkRoles("tenants_update"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
    if (!body.owner_user_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "owner_user_id field must be filled"); 
    
    let updates = {};

    if (body.name) updates.name = body.name;
    if (body.owner_user_id) updates.owner_user_id = body.owner_user_id;
    if (body.billing_info) updates.billing_info = body.billing_info;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Tenants.updateOne({ _id: body._id, owner_user_id:body.owner_user_id }, updates);

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse); 
  }
});



router.post("/delete", auth.checkRoles("tenants_delete"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!", "_id field must be filled");
    if (!body.owner_user_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "owner_user_id field must be filled");
    
    await Tenants.deleteOne({ _id: body._id, owner_user_id:body.owner_user_id }); 

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse); 
  }
});

module.exports = router;
