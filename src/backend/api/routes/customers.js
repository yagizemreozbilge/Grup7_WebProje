var express = require('express');
var router = express.Router();
const Customers = require("../db/models/Customers"); 
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const AuditLogs = require("../db/models/AuditLogs");
const { HTTP_CODES } = require('../config/Enum');


/* Musteri Listeleme */
router.get('/', async(req, res) => {
    try {
        let customers = await Customers.find({});
        res.json(Response.successResponse(customers));
    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        return res.status(errorResponse.code).json(errorResponse);
    }
});

/* Musteri Ekleme */
router.post("/add", async(req, res) => {
    let body = req.body;
    try {
        
        if (!body.first_name || !body.last_name || !body.email || !body.phone_number) {
            throw new CustomError(HTTP_CODES.BAD_REQUEST, "Validation Error!", "first_name, last_name, email, and phone_number fields must be filled.");
        }
        
        
        const isRegistered = body.is_guest === false || body.is_guest === undefined;
        if (isRegistered && !body.password) {
            throw new CustomError(HTTP_CODES.BAD_REQUEST, "Validation Error!", "Password field must be filled for non-guest users.");
        }

        let newCustomer = new Customers({
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            phone_number: body.phone_number,
            password: body.password, 
            is_guest: body.is_guest,
            is_active: true,
            created_by: req.user?.id 
        });

       
        await newCustomer.save();

        res.json(Response.successResponse({ success: true, customer_id: newCustomer._id }));
    } catch(err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* Musteri Guncelleme */
router.post("/update", async (req, res) => {
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

        let updates = {};
        
        
        if (body.first_name) updates.first_name = body.first_name;
        if (body.last_name) updates.last_name = body.last_name;
        if (body.email) updates.email = body.email;
        if (body.phone_number) updates.phone_number = body.phone_number;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
        if (typeof body.is_guest === "boolean") updates.is_guest = body.is_guest;
        
        
        if (body.password) updates.password = body.password; 
        await Customers.updateOne({ _id: body._id }, updates); 

        

        res.json(Response.successResponse({ success: true }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

/* Musteri Silme */
router.post("/delete", async (req, res) => {
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(HTTP_CODES.BAD_REQUEST,"Validation Error!", "_id field must be filled");
        
        
        const result = await Customers.deleteOne({ _id: body._id }); 
        
        if (result.deletedCount === 0) {
            throw new CustomError(HTTP_CODES.NOT_FOUND, "Not Found", "Customer not found or already deleted.");
        }

        

        res.json(Response.successResponse({ success: true }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;