// middlewares/errorHandler.js
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const { HTTP_CODES } = require("../config/Enum");

/**
 * Merkezi hata yakalama middleware'i
 * Tüm route'larda oluşan hataları yakalar ve standart response döner
 */
const errorHandler = (err, req, res, next) => {

    // Console'a log at (development için)
    console.error("❌ Error:", err);

    let error = err;

    // Eğer CustomError değilse, CustomError'a çevir
    if (!(error instanceof CustomError)) {

        // Mongoose validation hatası
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map(e => e.message);
            error = new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Validation Error",
                messages.join(", ")
            );
        }

        // Mongoose duplicate key hatası (unique field)
        else if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            error = new CustomError(
                HTTP_CODES.CONFLICT,
                "Duplicate Entry",
                `${field} already exists`
            );
        }

        // Mongoose CastError (geçersiz ObjectId)
        else if (err.name === "CastError") {
            error = new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Invalid ID",
                "Invalid ID format"
            );
        }

        // JWT hatası
        else if (err.name === "JsonWebTokenError") {
            error = new CustomError(
                HTTP_CODES.UNAUTHORIZED,
                "Invalid Token",
                "Token is invalid"
            );
        }

        // JWT süresi dolmuş
        else if (err.name === "TokenExpiredError") {
            error = new CustomError(
                HTTP_CODES.UNAUTHORIZED,
                "Token Expired",
                "Token has expired"
            );
        }

        // Diğer hatalar
        else {
            error = new CustomError(
                HTTP_CODES.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                err.message || "Something went wrong"
            );
        }
    }

    // Response oluştur ve gönder
    const response = Response.errorResponse(error);
    return res.status(response.code).json(response);
};

module.exports = errorHandler;