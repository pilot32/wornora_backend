const mongoose = require('mongoose');
const { PROMO_BANNER_ACCENT } = require('../../constants/home.constants');

const promoBannerSchema = new mongoose.Schema({
    eyebrow: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    cta: {
        label: { type: String, required: true },
        to: { type: String, required: true },
    },
    image: { type: String, required: true }, // Cloudinary or image URL
    accent: {
        type: String,
        enum: Object.values(PROMO_BANNER_ACCENT),
        default: PROMO_BANNER_ACCENT.GOLD,
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('PromoBanner', promoBannerSchema);
