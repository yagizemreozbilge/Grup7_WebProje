const mongoose = require("mongoose");
const validator = require("validator");
const { PASS_LENGTH, HTTP_CODES } = require("../../config/Enum");
const CustomError = require("../../lib/Error");
const bcrypt = require("bcrypt");

const schema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        
    },
    password: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    first_name: String,
    last_name: String,
    phone_number: String,

    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Roles", required: true }]
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});



class Users extends mongoose.Model {

    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }

    validateFieldsBeforeAuth(email, password) {
        if (typeof password !== "string" || password.length < PASS_LENGTH || !validator.isEmail(email)
)
            throw new CustomError(HTTP_CODES.UNAUTHORIZED, "Validation Error", "email or password wrong");

        return null;
    }

}



schema.index({ email: 1 }, { unique: true });
schema.loadClass(Users);
module.exports = mongoose.model("users", schema);