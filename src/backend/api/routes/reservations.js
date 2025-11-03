var express = require('express');
var router = express.Router();
const Reservations = require("../db/models/Reservations");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error")
const Enum = require("../config/Enum");
const AuditLogs = require("../lib/AuditLogs");


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


router.post("/add", async(req, res) => {
     let body = req.body;
    try {
        if(!body.name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "name fields must be fiiled");
        let reservations = new Reservations({
            name:body.name,
            is_active:true,
            created_by: req.user?.id
        });

        AuditLogs.info(req.user?.email, "Reservations", "Add", reservation);
        await reservation.save();

        res.json(Response.successResponse({success: true}));
    } catch(err) {
          res.json(Response.errorResponse(err));
          
    }
     
});




router.post("/update", async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

    let updates = {};

    if (body.name) updates.name = body.name;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    await Reservations.updateOne({ _id: body._id }, updates);

    AuditLogs.info(req.user?.email, "Reservations", "Update", { _id: body._id, ...updates });

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

    await Reservations.deleteOne({ _id: body._id }); 

    AuditLogs.info(req.user?.email, "Reservations", "Delete", { _id: body._id });

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});



module.exports = router;