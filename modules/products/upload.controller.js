const cloudinary = require('../../config/cloudinary.config');

const uploadImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded'
            });
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

        return res.status(200).json({
            message: 'photo uploaded successfully',
            result
        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }
};

module.exports = {
    uploadImage
};