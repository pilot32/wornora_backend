const Joi = require('joi');

const addToCartSchema = Joi.object({
    productId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Product ID must be a valid 24-character hex string',
            'any.required': 'Product ID is required'
        }),
    quantity: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional()
        .messages({
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity must be at least 1'
        })
});

const updateQuantitySchema = Joi.object({
    quantity: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required'
        })
});

const productIdParamSchema = Joi.object({
    productId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Product ID must be a valid 24-character hex string',
            'any.required': 'Product ID parameter is required'
        })
});

const applyCouponSchema = Joi.object({
    code: Joi.string()
        .trim()
        .uppercase()
        .required()
        .messages({
            'string.empty': 'Coupon code is required',
            'any.required': 'Coupon code is required'
        })
});

module.exports = {
    addToCartSchema,
    updateQuantitySchema,
    productIdParamSchema,
    applyCouponSchema
};
