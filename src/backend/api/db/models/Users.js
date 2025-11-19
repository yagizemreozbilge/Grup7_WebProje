const mongoose = require("mongoose");
const validator = require("validator");
const { PASS_LENGTH, HTTP_CODES } = require("../../config/Enum");
const CustomError = require("../../lib/Error");
const bcrypt = require("bcrypt");

const schema = mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    first_name: String,
    last_name: String,
    phone_number: String
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

schema.virtual("roles", {
    ref: "user_roles",
    localField: "_id",
    foreignField: "user_id"
});

schema.set("toJSON", { virtuals: true });
schema.set("toObject", { virtuals: true });

class Users extends mongoose.Model {

    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }

    validateFieldsBeforeAuth(email, password) {
        if (
            typeof password !== "string" ||
            password.length < PASS_LENGTH.MIN ||
            !validator.isEmail(email)
        ) {
            throw new CustomError(
                HTTP_CODES.UNAUTHORIZED,
                "Validation Error",
                "email or password wrong"
            );
        }
        return null;
    }
}

schema.index({ email: 1 }, { unique: true });
schema.loadClass(Users);

module.exports = mongoose.model("users", schema);
