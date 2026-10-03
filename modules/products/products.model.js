const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        hex: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        _id: false
    }
);

const shippingDimensionsSchema = new mongoose.Schema(
    {
        weightKg: {
            type: Number,
            required: true,
            min: 0.01
        },
        lengthCm: {
            type: Number,
            required: true,
            min: 0.1
        },
        widthCm: {
            type: Number,
            required: true,
            min: 0.1
        },
        heightCm: {
            type: Number,
            required: true,
            min: 0.1
        }
    },
    {
        _id: false
    }
);

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

        style: {
            type: String,
            trim: true,
            default: ''
        },

        material: {
            type: String,
            trim: true,
            default: ''
        },

        colors: {
            type: [colorSchema],
            default: []
        },

        sizes: [{
            type: String,
            trim: true
        }],

        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],

        careInstructions: {
            type: String,
            trim: true,
            default: ''
        },

        shippingDimensions: {
            type: shippingDimensionsSchema,
            default: undefined
        },

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
productSchema.index({ isActive: 1, style: 1 });
productSchema.index({ isActive: 1, sizes: 1 });
productSchema.index({ isActive: 1, 'colors.name': 1 });
productSchema.index({ isActive: 1, tags: 1 });

module.exports = mongoose.model('Product',productSchema);
