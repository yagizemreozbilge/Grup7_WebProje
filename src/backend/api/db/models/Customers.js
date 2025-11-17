// db/models/Customers.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const schema = mongoose.Schema({
    // Temel Bilgiler
    first_name: {
        type: String,
        required: true,
        trim: true,
    },
    last_name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone_number: {
        type: String,
        required: true,
        trim: true,
    },

    // Opsiyonel şifre (kayıtlı müşteri için)
    password: {
        type: String,
        required: false,
    },

    // Durum
    is_active: {
        type: Boolean,
        default: true,
    },
    is_guest: {
        type: Boolean,
        default: false,
    },

    // İstatistik
    total_reservations: {
        type: Number,
        default: 0,
    },
    total_spent: {
        type: Number,
        default: 0,
    },

    // Oluşturan kullanıcı (admin panelden eklendiyse)
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});

// Indexler
schema.index({ email: 1 }, { unique: true });
schema.index({ phone_number: 1 });
schema.index({ is_active: 1 });

// Şifre değişiyorsa hashle
schema.pre("save", async function(next) {
    if (!this.isModified("password") || !this.password) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

class Customers extends mongoose.Model {
    validPassword(password) {
        if (!this.password) return false;
        return bcrypt.compareSync(password, this.password);
    }

    getFullName() {
        return `${this.first_name} ${this.last_name}`;
    }
}

schema.loadClass(Customers);

module.exports = mongoose.model("customers", schema);