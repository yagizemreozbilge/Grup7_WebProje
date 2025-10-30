const mongoose = require("mongoose");

const schema = mongoose.Schema({
  name:         { 
    type: String, 
    required: true, 
    trim: true 
},
  owner_user_id:{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users", 
    required: true 
},
  billing_info: { 
    type: Object 
},
  is_active:    { 
    type: Boolean, 
    default: true 
}
}, {
  versionKey: false,
  timestamps: { 
    createdAt: "created_at", updatedAt: "updated_at" 
}
});



class Tenants extends mongoose.Model {}
schema.loadClass(Tenants);

module.exports = mongoose.model("tenants", schema);
