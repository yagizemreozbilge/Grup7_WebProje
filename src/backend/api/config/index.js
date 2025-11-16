// api/config/index.js
require('dotenv').config();

const {
    PORT,
    LOG_LEVEL,
    MONGO_URI,
    JWT_SECRET,
    TOKEN_EXPIRE_TIME,
} = process.env;

module.exports = {
    PORT: PORT || 3000,
    LOG_LEVEL: LOG_LEVEL || "debug",

    // .env içinde MONGO_URI kullandığın için onu baz alıyoruz
    CONNECTION_STRING: MONGO_URI || "mongodb://127.0.0.1:27017/Grup7_WebProje",

    JWT: {
        // Artık secret .env'den geliyor
        SECRET: JWT_SECRET || "dev_jwt_secret", // local geliştirme için fallback

        EXPIRE_TIME: !isNaN(parseInt(TOKEN_EXPIRE_TIME)) ?
            parseInt(TOKEN_EXPIRE_TIME) :
            24 * 60 * 60 // varsayılan: 1 gün (saniye)
    }
};