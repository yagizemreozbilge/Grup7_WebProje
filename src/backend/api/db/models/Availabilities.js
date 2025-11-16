// models/Availabilities.js
const mongoose = require("mongoose");

const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const schema = mongoose.Schema({
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tenants",
        required: true
    },
    field_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "fields",
        required: true
    },


    weekday: {
        type: String,
        enum: WEEKDAYS
    },
    specific_date: {
        type: Date
    },


    start_time: {
        type: String,
        required: true,
        match: /^[0-2]\d:[0-5]\d$/
    },
    end_time: {
        type: String,
        required: true,
        match: /^[0-2]\d:[0-5]\d$/
    },

    repeat_rule: {
        type: String,
        enum: ['NONE', 'WEEKLY'],
        default: 'WEEKLY'
    },
    is_active: {
        type: Boolean,
        default: true
    },
}, {
    versionKey: false,

    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Availabilities extends mongoose.Model {}





module.exports = mongoose.model("availabilities", schema);