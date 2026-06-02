const mongoose = require('mongoose');
const slugify = require('slugify');
const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    categoryId:{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true,

    },
    image: {
        type: String,
        default: ''
    }
}, 
{
    timestamps: true
});


module.exports = mongoose.model('Subcategory',subCategorySchema);