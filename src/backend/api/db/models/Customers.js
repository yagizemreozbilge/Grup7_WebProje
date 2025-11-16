const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const schema = mongoose.Schema({
    // Temel Bilgiler
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone_number: {
        type: String,
        required: true,
        trim: true
    },

    // Şifre (Kayıtlı müşteriler için)
    password: {
        type: String,
        required: false
    },

    // Adres Bilgileri
    address: {
        street: String,
        city: String,
        district: String,
        postal_code: String,
        country: {
            type: String,
            default: "Türkiye"
        }
    },

    // Profil Bilgileri
    profile_photo: {
        type: String,
        default: null
    },
    date_of_birth: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: null
    },

    // İstatistikler
    total_reservations: {
        type: Number,
        default: 0
    },
    completed_reservations: {
        type: Number,
        default: 0
    },
    cancelled_reservations: {
        type: Number,
        default: 0
    },
    total_spent: {
        type: Number,
        default: 0
    },

    // Favori Sahalar
    favorite_fields: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "fields"
    }],

    // Bildirim Tercihleri
    notification_preferences: {
        email_notifications: {
            type: Boolean,
            default: true
        },
        sms_notifications: {
            type: Boolean,
            default: true
        },
        promotional_notifications: {
            type: Boolean,
            default: false
        }
    },

    // Hesap Durumu
    is_active: {
        type: Boolean,
        default: true
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    is_guest: {
        type: Boolean,
        default: false
    },

    // Doğrulama Kodları
    verification_code: {
        type: String,
        default: null
    },
    verification_code_expires: {
        type: Date,
        default: null
    },
    reset_password_token: {
        type: String,
        default: null
    },
    reset_password_expires: {
        type: Date,
        default: null
    },

    // Son Aktivite
    last_login: {
        type: Date,
        default: null
    },
    last_reservation: {
        type: Date,
        default: null
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null
    }
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Indexes
schema.index({ email: 1 });
schema.index({ phone_number: 1 });
schema.index({ is_active: 1 });

class Customers extends mongoose.Model {

    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }

    // Tam isim
    getFullName() {
        return `${this.first_name} ${this.last_name}`;
    }
}

schema.loadClass(Customers);

module.exports = mongoose.model("customers", schema);