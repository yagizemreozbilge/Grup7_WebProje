var express = require('express');
var router = express.Router();
const Reservations = require("../db/models/Reservations");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error")
const Enum = require("../config/Enum");
const AuditLogs = require("../db/models/AuditLogs");
const { HTTP_CODES } = require('../config/Enum');


/* GET Rezervasyon Listeleme. */
router.get('/', async(req, res) => {

    try {
        let reservations = await Reservations.find({});

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
       
        if(!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id fields must be fiiled");
        if(!body.start) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "start fields must be fiiled");
        if(!body.end) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "end fields must be fiiled");
        
        
        let newReservation = new Reservations({
            tenant_id:body.tenant_id,
            field_id:body.field_id,
            customer_id:body.customer_id,
            start:body.start,
            end:body.end,
            price:body.price,
            status:body.status,
            is_active:true,
            created_by: req.user?.id
        });

        
        await newReservation.save();

        res.json(Response.successResponse({success: true}));
    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
     
});

/* GET Rezervasyon Guncellenme. */
router.post("/update", async (req, res) => {
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

/* GET Rezervasyon Silme. */
router.post("/delete", async (req, res) => {
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