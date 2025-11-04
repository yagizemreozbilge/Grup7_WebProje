var express = require('express');
var router = express.Router();
const Availabilities = require("../db/models/Availabilities");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error")
const Enum = require("../config/Enum");
const AuditLogs = require("../db/models/AuditLogs");
const { HTTP_CODES } = require('../config/Enum');


/* GET Kategori Listeleme. */
router.get('/', async(req, res) => {

    try {
        let availabilities = await Availabilities.find({});

        res.json(Response.successResponse(availabilities));
    } catch(err) {
            let errorResponse = Response.errorResponse(err);
return res.status(errorResponse.code).json(errorResponse);

    }
  
});


router.post("/add", async(req, res) => {
     let body = req.body;
    try {
        if(!body.name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "name fields must be fiiled");
        let availabilities = new Availabilities({
            tenant_id:body.tenant_id,
            field_id:body.field_id,
            weekday:body.weekday,
            start_time: body.start_time,
            end_time: body.end_time,
            is_active:true,
            created_by: req.user?.id
        });

        AuditLogs.info(req.user?.email, "Availabilities", "Add", availability);
        await availabilities.save();

        res.json(Response.successResponse({success: true}));
    } catch(err) {
          res.json(Response.errorResponse(err));
          
    }
     
});




router.post("/update", async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
    if (!body.tenant._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");
    if (!body.field._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "field_id field must be filled");
    let updates = {};

    if (body.weekday) {
      const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
      if (!WEEKDAYS.includes(body.weekday)) {
        throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          "Validation Error!",
          "weekday must be one of MO, TU, WE, TH, FR, SA, SU"
        );
      }
      updates.weekday = body.weekday;
    }

    if (!body.start_time && !body.end_time) {
      updates.start_time = body.start_time;
  updates.end_time = body.end_time;
    } else {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!","start_time and end_time must be filled");
    }
    if (body.name) updates.name = body.name;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Availabilities.updateOne({ _id: body._id, tenant_id: body.tenant_id, field_id: body.field_id }, updates);

    AuditLogs.info(req.user?.email, "Availabilities", "Update", { _id: body._id, ...updates });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});



router.post("/delete", async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!", "_id field must be filled");
    if (!body.tenant._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");
    if (!body.field._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "field_id field must be filled");

    await Availabilities.deleteOne({ _id: body._id,tenant_id: body.tenant_id,field_id: body.field_id }); 

    AuditLogs.info(req.user?.email, "Availabilities", "Delete", { _id: body._id, tenant_id: body.tenant_id, field_id: body.field_id });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});



module.exports = router;