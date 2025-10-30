// api/config/index.js
require('dotenv').config();

module.exports = {
  CONNECTION_STRING: process.env.CONNECTION_STRING || 'mongodb://localhost:27017/Grup7_WebProje',
  PORT: process.env.PORT || 3000,
};