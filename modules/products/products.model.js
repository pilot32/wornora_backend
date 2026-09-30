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
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviewCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

productSchema.index({ isActive: 1, categoryId: 1, subcategoryId: 1 });
productSchema.index({ isActive: 1, featured: 1, createdAt: -1 });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ isActive: 1, averageRating: -1 });

module.exports = mongoose.model('Product',productSchema);
