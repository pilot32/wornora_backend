const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    code:{
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    description:{
        type: String,
    },
    discountType:{
        type: String,
        enum: ['percentage','fixed'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 1,
    },
    minimumCartValue: {
        type: Number,
        default: 0,
        min: 0,
    },
    maximumDiscountAmount: {
        type: Number,
        default: null,
        min: 0,
    },
    startDate: {
        type: Date,
        default: null,
    },
    expiryDate: {
        type: Date,
        default: null,
    },
    usageLimit: {
        type: Number,
        default: null,
        min: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    perUserLimit: {
        type: Number,
        default: 1,
        min: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
