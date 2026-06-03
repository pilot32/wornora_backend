const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true
        },

        description: {
            type: String,
            required: true
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },

        subcategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subcategory',
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        discountedPrice: {
            type: Number,
            default: null
        },

        stock: {
            type: Number,
            default: 0,
            min: 0
        },

        images: [{
            type: String
        }],

        isActive: {
            type: Boolean,
            default: true
        },
        featured: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Product',productSchema);