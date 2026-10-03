const Joi = require('joi');
const { PAYMENT_METHODS } = require('../constants/payment.constants');

const getCartShippingQuoteSchema = Joi.object({
    shippingAddressId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
        'string.pattern.base': 'Shipping address ID must be a valid 24-character hex string',
        'any.required': 'Shipping address is required'
    }),
    paymentMethod: Joi.string()
    .valid(PAYMENT_METHODS.COD, PAYMENT_METHODS.RAZORPAY)
    .default(PAYMENT_METHODS.COD)
    .optional()
});

module.exports = {
    getCartShippingQuoteSchema
};
