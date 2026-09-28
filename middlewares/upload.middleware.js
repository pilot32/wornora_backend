// src/middlewares/upload.middleware.js

const multer = require('multer');

const storage = multer.memoryStorage();
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }

        const error = new Error('Only JPG, PNG, and WebP images are allowed');
        error.statusCode = 400;
        return cb(error);
    },
});

module.exports = upload;
