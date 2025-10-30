const mongoose = require("mongoose");

const RES_STATUSES = ['pending','confirmed','cancelled','completed'];

const schema = mongoose.Schema({
  tenant_id:    { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "tenants", 
    required: true 
},
  field_id:     { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "fields",  
    required: true 
},
  customer_id:  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users",   
    required: true 
},

  start:        { 
    type: Date, 
    required: true 
}, 
  end:          { 
    type: Date, 
    required: true 
},

  price:        { 
    type: Number,
     min: 0, 
     required: true 
    },
  status:       { 
    type: String, 
    enum: RES_STATUSES, 
    default: 'pending' 
},

  client_request_id: { 
    type: String 
} 
}, {
  versionKey: false,
  timestamps: { 
    createdAt: "created_at", 
    updatedAt: "updated_at" 
}
});



class Reservations extends mongoose.Model {}

schema.loadClass(Reservations);

module.exports = mongoose.model("reservations", schema);
