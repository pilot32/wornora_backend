const mongose = require('mongoose');

const cuoponSchema = mongoose.Schema({
    code:{
        type: String,
        require: true,
        unique: true,
        uppercase: true,
        trime: true,
    },
    description:{
        type: String,
    },
    discountType:{
        type: String,
        enum: ['percentage','fixed'],
        require: true,
    },
    discountValue: {
        type: Number,
        require: true,
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
        defualt: null,
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
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}); 

module.exports = mongoose.model('Cuopon', cuoponSchema);