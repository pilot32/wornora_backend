const mongoose = require('mongoose');

const categoryTileSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    // e.g. "/shop?category=clothing&subcategory=sarees"
    to: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary or image URL
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('CategoryTile', categoryTileSchema);
