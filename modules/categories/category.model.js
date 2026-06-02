const mongoose = require('mongoose');
const slugify = require('slugify');
const categorySchema = new mongoose.Schema({
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
categorySchema.pre('save', function() {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

module.exports = mongoose.model('Category',categorySchema);