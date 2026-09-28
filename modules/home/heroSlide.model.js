const mongoose = require('mongoose');
const { HERO_SLIDE_ALIGN } = require('../../constants/home.constants');

const heroSlideSchema = new mongoose.Schema({
    eyebrow: { type: String, trim: true },
    // supports "\n" for layout line-breaks in the frontend
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    cta: {
        label: { type: String, required: true },
        to: { type: String, required: true },
    },
    secondaryCta: {
        label: { type: String },
        to: { type: String },
    },
    image: { type: String, required: true }, // Cloudinary or image URL
    align: {
        type: String,
        enum: Object.values(HERO_SLIDE_ALIGN),
        default: HERO_SLIDE_ALIGN.LEFT,
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
