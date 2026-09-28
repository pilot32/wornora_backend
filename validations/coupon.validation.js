const Joi = require('joi');

const validateCouponRules = (value, helpers) => {
    if (value.discountType === 'percentage' && value.discountValue > 100) {
        return helpers.error('any.invalid', {
            message: 'Percentage discount cannot exceed 100'
        });
    }

    if (
        value.startDate &&
        value.expiryDate &&
        new Date(value.startDate).getTime() > new Date(value.expiryDate).getTime()
    ) {
        return helpers.error('any.invalid', {
            message: 'Expiry date must be after start date'
        });
    }

    return value;
};

/**
 * joi validation schema which will validate the incoming request body for creating a new coupon code
 */
const createCouponSchema = Joi.object({
    code: Joi.string().uppercase().trim().required(),
    description: Joi.string().allow('').optional(),
    discountType: Joi.string().valid('percentage','fixed').required(),
    discountValue: Joi.number().min(1).required(),
    minimumCartValue: Joi.number().min(0).allow(null).optional(),
    maximumDiscountAmount: Joi.number().min(0).allow(null).optional(),
    startDate: Joi.date().allow(null).optional(),
    expiryDate: Joi.date().allow(null).optional(),
    usageLimit: Joi.number().integer().min(1).allow(null).optional(),
    perUserLimit: Joi.number().min(1).optional(),
    isActive: Joi.boolean().default(true),
})
.custom(validateCouponRules)
.messages({
    'any.invalid': '{{#message}}'
});

const updateCouponSchema = Joi.object({
    code: Joi.string().uppercase().trim().optional(),
    description: Joi.string().allow('').optional(),
    discountType: Joi.string().valid('percentage','fixed').optional(),
    discountValue: Joi.number().min(1).optional(),
    minimumCartValue: Joi.number().min(0).allow(null).optional(),
    maximumDiscountAmount: Joi.number().min(0).allow(null).optional(),
    startDate: Joi.date().allow(null).optional(),
    expiryDate: Joi.date().allow(null).optional(),
    usageLimit: Joi.number().integer().min(1).allow(null).optional(),
    perUserLimit: Joi.number().min(1).optional(),
    isActive: Joi.boolean().optional(),
})
.min(1)
.custom(validateCouponRules)
.messages({
    'object.min': 'At least one field must be provided for update',
    'any.invalid': '{{#message}}'
});

const updateCouponStatusSchema = Joi.object({
    isActive: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'isActive must be a boolean value (true or false)',
            'any.required': 'isActive field is required'
        })
});

const idParamSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid ID format. Must be a 24-character hex string',
            'any.required': 'ID parameter is required'
        })
});

module.exports = {
    createCouponSchema,
    updateCouponSchema,
    updateCouponStatusSchema,
    idParamSchema
};
