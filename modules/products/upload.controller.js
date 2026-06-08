const cloudinary = require('../../config/cloudinary.config');


const uploadImages = async(req,res)=>{
    try {
        const files = req.files;
    const uploadedImages = [];
    for(const file of files){
        const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            {
                folder: 'wornore/products'
            }
        );
        uploadedImages.push(
            result.secure_url
        );
        return res.status(200).json({'message':'photo uploaded succesfull',result});
    }
    } catch (e) {
        res.status(500).json({message:e.message});
    }
}
module.exports =
{
    uploadImages
}