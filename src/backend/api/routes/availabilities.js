var express = require('express');
var router = express.Router();
const Availabilities = require("../db/models/Availabilities");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error")
const Enum = require("../config/Enum");
const AuditLogs = require("../db/models/AuditLogs");
const { HTTP_CODES } = require('../config/Enum');


/* GET Uygunluk Listeleme. */
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
        
        if(!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");
        if(!body.field_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "field_id field must be filled");
        if(!body.weekday) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "weekday field must be filled");
        if(!body.start_time) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "start_time field must be filled");
        if(!body.end_time) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "end_time field must be filled");

        
        let exists = await Availabilities.findOne({
            tenant_id: body.tenant_id,
            field_id: body.field_id,
            weekday: body.weekday,
            start_time: body.start_time,
            end_time: body.end_time
        });

        if (exists) {
            throw new CustomError(
                Enum.HTTP_CODES.CONFLICT,
                "Already Exists!",
                "This availability for this field already exists."
            );
        }
        
        let newAvailability = new Availabilities({ 
            tenant_id: body.tenant_id,
            field_id: body.field_id,
            weekday: body.weekday,
            start_time: body.start_time,
            end_time: body.end_time,
            is_active: true,
            created_by: req.user?.id
        });

        await newAvailability.save();

        
        res.status(HTTP_CODES.CREATED).json(
            Response.successResponse({
                success: true,
                _id: newAvailability._id
            })
        );

    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});



router.post("/update", async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
   
    if (!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled"); 
    if (!body.field_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "field_id field must be filled"); 
    
    let updates = {};

   
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

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

    
    const hasStartTime = body.start_time !== undefined;
    const hasEndTime = body.end_time !== undefined;

    if (hasStartTime && hasEndTime) {
      updates.start_time = body.start_time;
      updates.end_time = body.end_time;
    } else if (hasStartTime || hasEndTime) {
       
       throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!","start_time and end_time must be provided together or not at all.");
    }


    await Availabilities.updateOne({ _id: body._id, tenant_id: body.tenant_id, field_id: body.field_id }, updates);

 

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
    
    if (!body.tenant_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "tenant_id field must be filled");
    if (!body.field_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "field_id field must be filled");

    await Availabilities.deleteOne({ _id: body._id,tenant_id: body.tenant_id,field_id: body.field_id }); 

 

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;