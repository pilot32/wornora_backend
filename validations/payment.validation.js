const Joi = require('joi');

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        'string.pattern.base': 'ID must be a valid 24-character hex string'
    });

const createRazorpayPaymentOrderSchema = Joi.object({
    shippingAddressId: objectId.required().messages({
        'any.required': 'Shipping address is required'
    }),
    billingAddressId: objectId.optional(),
    deliveryNotes: Joi.string().trim().max(500).allow('').optional()
});

const verifyRazorpayPaymentSchema = Joi.object({
    orderId: objectId.required().messages({
        'any.required': 'Order ID is required'
    }),
    razorpayOrderId: Joi.string().trim().required(),
    razorpayPaymentId: Joi.string().trim().required(),
    razorpaySignature: Joi.string().trim().required()
});

module.exports = {
    createRazorpayPaymentOrderSchema,
    verifyRazorpayPaymentSchema
};
