
const mongoose = require("mongoose");

const schema = mongoose.Schema({
  tenant_id:      { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users", required: true 
},
  name:           { 
    type: String, required: true, trim: true 
},
  photos:         [
    { 
        type: String 
    }
],
  price_per_hour: { 
    type: Number,
     min: 0, 
     required: true 
    },
  features:       [
    { 
        type: String 
    }
],

  
  latitude:       { 
    type: Number, 
    default: 0
},
  longitude:      { 
    type: Number, 
    default: 0
 },

  address:        { 
    type: String, 
    trim: true 
},
  city:           {
    type: String,
    trim: true
  },
  is_active:      { 
    type: Boolean, 
    default: true 
  },
  approval_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  deleted_at: {
    type: Date,
    default: null
  }
}, {
  versionKey: false,
  timestamps: { 
    createdAt: "created_at", 
    updatedAt: "updated_at" 
}
});



class Fields extends mongoose.Model {}


module.exports = mongoose.model("fields", schema);
