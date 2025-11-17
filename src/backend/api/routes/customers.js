// db/models/Admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const schema = mongoose.Schema({
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
    password: {
        type: String,
        required: true,
    },

    // Admin tipi
    role: {
        type: String,
        enum: ["super_admin", "admin"],
        default: "admin",
    },

    is_active: {
        type: Boolean,
        default: true,
    },

    last_login: {
        type: Date,
        default: null,
    },

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

schema.index({ email: 1 }, { unique: true });
schema.index({ is_active: 1 });

// Şifre hashle
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

class Admin extends mongoose.Model {
    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }

    getFullName() {
        return `${this.first_name} ${this.last_name}`;
    }
}

schema.loadClass(Admin);

module.exports = mongoose.model("admins", schema);