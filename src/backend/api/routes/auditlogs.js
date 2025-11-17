// routes/auditlogs.js
const express = require("express");
const router = express.Router();

const auth = require("../lib/logger/auth")();
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const { HTTP_CODES } = require("../config/Enum");
const AuditLogs = require("../db/models/AuditLogs");

// Tüm audit log istekleri JWT ile korunsun
router.use(auth.initialize(), auth.authenticate());

router.get("/", async(req, res) => {
    try {
        const {
            email,
            level,
            begin_date,
            end_date,
            skip = 0,
            limit = 50,
        } = req.query;

        const filter = {};

        if (email) filter.email = email;
        if (level) filter.level = level;

        if (begin_date || end_date) {
            filter.created_at = {};
            if (begin_date) filter.created_at.$gte = new Date(begin_date);
            if (end_date) filter.created_at.$lte = new Date(end_date);
        }

        const logs = await AuditLogs.find(filter)
            .sort({ created_at: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const response = Response.successResponse(logs, HTTP_CODES.OK);
        return res.status(response.code).json(response);
    } catch (err) {
        const response = Response.errorResponse(err);
        return res.status(response.code).json(response);
    }
});

module.exports = router;