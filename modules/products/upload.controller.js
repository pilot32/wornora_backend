const cloudinary = require('../../config/cloudinary.config');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../utils/ApiError');
const { ApiResponse } = require('../../utils/ApiResponse');

const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
    }

    const fileString =
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result =
        await cloudinary.uploader.upload(
            fileString,
            {
                folder: 'wornora/products'
            }
        );

    return res.status(200).json(
        new ApiResponse(200, { result }, 'photo uploaded successfully')
    );
});

module.exports = {
    uploadImage
};
