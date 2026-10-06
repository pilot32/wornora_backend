const mongoose = require('mongoose');
//TODO: the logic of the cuopon code is not implemented its just added as the field of schema the logic
//and calculation has to be added in later phase of the development of the project. 
/**
 * Schema for the items(products) what will the items array of the cart collection will have
 */
const cartItemSchema = new mongoose.Schema({
    selectedSize: { type: String, trim: true, default: '' },
    selectedColor: { type: String, trim: true, default: '' },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },

    quantity:{
        type: Number,
        default: 1,
    },
    priceAddition: {
        type: Number,
        required: true,
    },
});
/** This schema refers to the represenatation of the entitites of the cart collection in the database. 
 * It will have the userId and items array which will have the products that the user has added to the cart.
 */
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    items: [cartItemSchema],

    appliedCoupon: {
        type: String,
        default: null
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('Cart',cartSchema);
