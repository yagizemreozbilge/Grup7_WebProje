// middlewares/validation.js
const CustomError = require("../lib/Error");
const { HTTP_CODES } = require("../config/Enum");
const Reservation = require("../db/models/Reservation");
const Field = require("../db/models/Field");
const moment = require("moment");

/**
 * Email formatı kontrolü
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Telefon numarası kontrolü (Türkiye formatı)
 */
const validatePhoneNumber = (phone) => {
    // 05XX XXX XX XX veya +90 5XX XXX XX XX formatları
    const phoneRegex = /^(\+90|0)?5\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Şifre güvenlik kontrolü
 */
const validatePassword = (password) => {
    // En az 6 karakter
    if (password.length < 6) {
        return { valid: false, message: "Password must be at least 6 characters" };
    }
    return { valid: true };
};

/**
 * Tarih formatı kontrolü ve geçerlilik
 */
const validateDate = (date) => {
    const dateObj = moment(date);

    if (!dateObj.isValid()) {
        return { valid: false, message: "Invalid date format" };
    }

    // Geçmiş tarih kontrolü
    if (dateObj.isBefore(moment(), 'day')) {
        return { valid: false, message: "Date cannot be in the past" };
    }

    return { valid: true };
};

/**
 * Rezervasyon saati kontrolü (08:00 - 23:00 arası)
 */
const validateReservationTime = (startTime, endTime) => {
    const start = moment(startTime, "HH:mm");
    const end = moment(endTime, "HH:mm");

    // Format kontrolü
    if (!start.isValid() || !end.isValid()) {
        return { valid: false, message: "Invalid time format. Use HH:mm" };
    }

    // Saat aralığı kontrolü (08:00 - 23:00)
    const minHour = 8;
    const maxHour = 23;

    if (start.hour() < minHour || end.hour() > maxHour) {
        return {
            valid: false,
            message: `Reservations are only available between ${minHour}:00 and ${maxHour}:00`
        };
    }

    // Bitiş saati başlangıçtan sonra olmalı
    if (end.isSameOrBefore(start)) {
        return { valid: false, message: "End time must be after start time" };
    }

    // Minimum rezervasyon süresi (1 saat)
    const duration = end.diff(start, 'hours');
    if (duration < 1) {
        return { valid: false, message: "Minimum reservation duration is 1 hour" };
    }

    return { valid: true };
};

/**
 * Rezervasyon çakışma kontrolü
 * HalıSahaMax için kritik fonksiyon!
 */
const checkReservationConflict = async(req, res, next) => {
    try {
        const { field_id, date, start_time, end_time } = req.body;

        // Gerekli alanlar var mı?
        if (!field_id || !date || !start_time || !end_time) {
            throw new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Missing Fields",
                "field_id, date, start_time and end_time are required"
            );
        }

        // Saha var mı kontrol et
        const field = await Field.findById(field_id);
        if (!field) {
            throw new CustomError(
                HTTP_CODES.NOT_FOUND,
                "Field Not Found",
                "Field does not exist"
            );
        }

        // Saha aktif mi?
        if (!field.is_active) {
            throw new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Field Inactive",
                "This field is not available for reservations"
            );
        }

        // Tarih kontrolü
        const dateValidation = validateDate(date);
        if (!dateValidation.valid) {
            throw new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Invalid Date",
                dateValidation.message
            );
        }

        // Saat kontrolü
        const timeValidation = validateReservationTime(start_time, end_time);
        if (!timeValidation.valid) {
            throw new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Invalid Time",
                timeValidation.message
            );
        }

        // Rezervasyon çakışması kontrolü
        const conflictingReservations = await Reservation.find({
            field_id: field_id,
            date: date,
            status: { $in: ["pending", "confirmed"] }, // İptal edilmemiş rezervasyonlar
            $or: [
                // Yeni rezervasyon mevcut bir rezervasyonun içinde başlıyor
                {
                    start_time: { $lte: start_time },
                    end_time: { $gt: start_time }
                },
                // Yeni rezervasyon mevcut bir rezervasyonun içinde bitiyor
                {
                    start_time: { $lt: end_time },
                    end_time: { $gte: end_time }
                },
                // Yeni rezervasyon mevcut bir rezervasyonu kapsıyor
                {
                    start_time: { $gte: start_time },
                    end_time: { $lte: end_time }
                }
            ]
        });

        if (conflictingReservations.length > 0) {
            throw new CustomError(
                HTTP_CODES.CONFLICT,
                "Time Slot Conflict",
                `This time slot is already reserved. Conflicting reservations: ${conflictingReservations.length}`
            );
        }

        // Çakışma yok, devam et
        next();

    } catch (err) {
        next(err);
    }
};

/**
 * Kayıt formu validasyonu
 */
const validateRegistration = (req, res, next) => {
    try {
        const { first_name, last_name, email, phone_number, password } = req.body;

        // Boş alan kontrolü
        if (!first_name || !last_name || !email || !phone_number || !password) {
            throw new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Missing Fields",
                "All fields are required"
            );
        }

        // Email kontrolü
        if (!validateEmail(email)) {
            throw new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Invalid Email",
                "Please provide a valid email address"
            );
        }

        // Telefon kontrolü
        if (!validatePhoneNumber(phone_number)) {
            throw new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Invalid Phone",
                "Please provide a valid Turkish phone number (05XXXXXXXXX)"
            );
        }

        // Şifre kontrolü
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            throw new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Weak Password",
                passwordValidation.message
            );
        }

        next();

    } catch (err) {
        next(err);
    }
};

/**
 * Saha ekleme/güncelleme validasyonu
 */
const validateField = (req, res, next) => {
    try {
        const { name, address, city, district, price_per_hour } = req.body;

        // Boş alan kontrolü
        if (!name || !address || !city || !district || !price_per_hour) {
            throw new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Missing Fields",
                "name, address, city, district and price_per_hour are required"
            );
        }

        // Fiyat kontrolü
        if (isNaN(price_per_hour) || price_per_hour <= 0) {
            throw new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Invalid Price",
                "Price per hour must be a positive number"
            );
        }

        next();

    } catch (err) {
        next(err);
    }
};

module.exports = {
    validateEmail,
    validatePhoneNumber,
    validatePassword,
    validateDate,
    validateReservationTime,
    checkReservationConflict,
    validateRegistration,
    validateField
};