const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Target folder for service images
const uploadDir = path.join(__dirname, '../../public/uploads/services');

// Ensure destination directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'service-' + uniqueSuffix + ext);
    }
});

// File filter for images (jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Format non supporté. Extensions autorisées : jpg, jpeg, png, webp'));
    }
};

const uploadService = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = uploadService;
