const mongoose = require('mongoose');

const cuoponSchema = mongoose.Schema({
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
        min: 0,
    },
    minimumCartValue: {
        type: Number,
        default: 0,
    },
    maximumDiscountAmount: {
        type: Number,
        default: null,
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
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    perUserLimit: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}); 

module.exports = mongoose.model('Coupon', cuoponSchema);