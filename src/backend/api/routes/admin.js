// routes/admin.js
var express = require('express');
var router = express.Router();

const Admin = require("../db/models/Admin");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const AuditLogs = require("../db/models/AuditLogs");
const { HTTP_CODES } = require("../config/Enum");

/* GET Admin Listeleme. */
router.get('/', async(req, res) => {
    try {
        let admins = await Admin.find({});

        res.json(Response.successResponse(admins));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        return res.status(errorResponse.code).json(errorResponse);
    }
});

/* POST Admin Ekleme. */
router.post('/add', async(req, res) => {
    let body = req.body;
    try {
        if (!body.first_name)
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,
                "Validation Error!",
                "first_name field must be filled"
            );

        if (!body.last_name)
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,
                "Validation Error!",
                "last_name field must be filled"
            );

        if (!body.email)
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,
                "Validation Error!",
                "email field must be filled"
            );

        if (!body.phone_number)
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,
                "Validation Error!",
                "phone_number field must be filled"
            );

        if (!body.password)
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,
                "Validation Error!",
                "password field must be filled"
            );

        let admin = new Admin({
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            phone_number: body.phone_number,
            password: body.password, // hash modelde
            role: body.role || "admin",
            is_active: body.is_active !== undefined ? body.is_active : true,
            created_by: body.created_by || null,
        });

        await admin.save();

        await AuditLogs.create({
            level: "INFO",
            email: null,
            location: "Admins",
            proc_type: "ADD",
            log: { admin_id: admin._id },
        });

        res.json(Response.successResponse({ success: true }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        return res.status(errorResponse.code).json(errorResponse);
    }
});

/* POST Admin Güncelleme. */
router.post('/update', async(req, res) => {
    let body = req.body;
    try {
        if (!body._id)
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,
                "Validation Error!",
                "_id field must be filled"
            );

        let updates = {};

        if (body.first_name) updates.first_name = body.first_name;
        if (body.last_name) updates.last_name = body.last_name;
        if (body.phone_number) updates.phone_number = body.phone_number;
        if (body.email) updates.email = body.email;
        if (body.role) updates.role = body.role;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

        if (body.password) {
            updates.password = body.password; // hash model pre-save
        }

        let admin = await Admin.findOne({ _id: body._id });
        if (!admin) {
            throw new CustomError(
                Enum.HTTP_CODES.NOT_FOUND,
                "Not Found!",
                "Admin not found"
            );
        }

        Object.assign(admin, updates);
        await admin.save();

        await AuditLogs.create({
            level: "INFO",
            email: null,
            location: "Admins",
            proc_type: "UPDATE",
            log: { admin_id: body._id, updates },
        });

        res.json(Response.successResponse({ success: true }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        return res.status(errorResponse.code).json(errorResponse);
    }
});

/* POST Admin Silme. */
router.post('/delete', async(req, res) => {
    let body = req.body;
    try {
        if (!body._id)
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,
                "Validation Error!",
                "_id field must be filled"
            );

        await Admin.deleteOne({ _id: body._id });

        await AuditLogs.create({
            level: "INFO",
            email: null,
            location: "Admins",
            proc_type: "DELETE",
            log: { admin_id: body._id },
        });

        res.json(Response.successResponse({ success: true }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        return res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;