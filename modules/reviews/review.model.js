const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        title: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ''
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ''
        },
        isVerifiedPurchase: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

reviewSchema.index(
    { userId: 1, productId: 1 },
    {
        unique: true,
        partialFilterExpression: { isActive: true }
    }
);

module.exports = mongoose.model('Review', reviewSchema);
