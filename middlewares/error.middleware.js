const ApiError = require('../utils/apiError');
const multer = require('multer');

const errorMiddleware = (err, req, res, next) => {
    console.log(err);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.code === 'LIMIT_FILE_SIZE'
                ? 'File size cannot exceed 5MB'
                : err.message
        });
    }

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || []
        });
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.statusCode ? err.message : "Internal Server Error"
    });
};

module.exports = errorMiddleware;
