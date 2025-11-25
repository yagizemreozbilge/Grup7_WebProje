const mongoose = require("mongoose");

const CANCEL_STATUSES = ['pending', 'approved', 'rejected'];
const REQUEST_TYPES = ['customer', 'tenant', 'admin'];

const schema = mongoose.Schema({
  reservation_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "reservations", 
    required: true 
  },
  customer_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users", 
    required: true 
  },
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
  reason: { 
    type: String, 
    required: false 
  },
  status: { 
    type: String, 
    enum: CANCEL_STATUSES, 
    default: 'pending' 
  },
  reviewed_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users", 
    required: false 
  },
  reviewed_at: { 
    type: Date, 
    required: false 
  },
  response_message: { 
    type: String, 
    required: false 
  },
  request_type: {
    type: String,
    enum: REQUEST_TYPES,
    default: 'customer'
  }
}, {
  versionKey: false,
  timestamps: { 
    createdAt: "created_at", 
    updatedAt: "updated_at" 
  }
});

// Index for faster queries
schema.index({ reservation_id: 1 });
schema.index({ customer_id: 1 });
schema.index({ tenant_id: 1 });
schema.index({ status: 1 });

class CancellationRequests extends mongoose.Model {}

module.exports = mongoose.model("cancellation_requests", schema);

