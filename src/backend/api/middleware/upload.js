// middlewares/upload.js
const multer = require("multer");
const path = require("path");
const CustomError = require("../lib/Error");
const { HTTP_CODES } = require("../config/Enum");
const fs = require("fs");

// Upload klasörünü oluştur (yoksa)
const uploadDir = path.join(__dirname, "..", "uploads", "fields");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Dosya depolama yapılandırması
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Unique filename: fieldId_timestamp_originalname
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);

        // Türkçe karakterleri temizle
        const cleanName = nameWithoutExt
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/Ğ/g, 'G')
            .replace(/Ü/g, 'U')
            .replace(/Ş/g, 'S')
            .replace(/İ/g, 'I')
            .replace(/Ö/g, 'O')
            .replace(/Ç/g, 'C')
            .replace(/[^a-zA-Z0-9]/g, '-');

        cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    }
});

// Dosya filtresi (sadece resimler)
const fileFilter = (req, file, cb) => {
    // Kabul edilen dosya türleri
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new CustomError(
                HTTP_CODES.BAD_REQUEST,
                "Invalid File Type",
                "Only JPEG, PNG, GIF and WEBP images are allowed"
            ),
            false
        );
    }
};

// Multer yapılandırması
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB maksimum dosya boyutu
    }
});

/**
 * Tek dosya upload middleware
 * Kullanım: upload.single('field_image')
 */
const uploadSingle = upload.single("field_image");

/**
 * Çoklu dosya upload middleware (maksimum 10 resim)
 * Kullanım: upload.array('field_images', 10)
 */
const uploadMultiple = upload.array("field_images", 10);

/**
 * Upload hata yakalama wrapper
 */
const handleUploadError = (uploadFunction) => {
    return (req, res, next) => {
        uploadFunction(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // Multer hataları
                if (err.code === "LIMIT_FILE_SIZE") {
                    return next(
                        new CustomError(
                            HTTP_CODES.BAD_REQUEST,
                            "File Too Large",
                            "File size cannot exceed 5MB"
                        )
                    );
                }

                if (err.code === "LIMIT_FILE_COUNT") {
                    return next(
                        new CustomError(
                            HTTP_CODES.BAD_REQUEST,
                            "Too Many Files",
                            "Maximum 10 images can be uploaded"
                        )
                    );
                }

                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return next(
                        new CustomError(
                            HTTP_CODES.BAD_REQUEST,
                            "Unexpected Field",
                            "Unexpected file field"
                        )
                    );
                }

                return next(
                    new CustomError(
                        HTTP_CODES.BAD_REQUEST,
                        "Upload Error",
                        err.message
                    )
                );
            } else if (err) {
                // Diğer hatalar (fileFilter'dan gelen hatalar)
                return next(err);
            }

            // Hata yoksa devam et
            next();
        });
    };
};

/**
 * Dosya silme yardımcı fonksiyonu
 */
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("✅ File deleted:", filePath);
            return true;
        }
        return false;
    } catch (err) {
        console.error("❌ Error deleting file:", err);
        return false;
    }
};

/**
 * Çoklu dosya silme
 */
const deleteFiles = (filePaths) => {
    const results = filePaths.map(filePath => deleteFile(filePath));
    return results.every(result => result === true);
};

module.exports = {
    uploadSingle: handleUploadError(uploadSingle),
    uploadMultiple: handleUploadError(uploadMultiple),
    deleteFile,
    deleteFiles,
    uploadDir
};