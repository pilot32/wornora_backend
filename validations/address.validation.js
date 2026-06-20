const Joi = require('joi');

const createAddressSchema = Joi.object({
    fullName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Full name is required',
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 100 characters',
            'any.required': 'Full name is required'
        }),
    phone: Joi.string()
        .trim()
        .pattern(/^[0-9+\-\s()]{8,20}$/)
        .required()
        .messages({
            'string.empty': 'Phone number is required',
            'string.pattern.base': 'Please enter a valid phone number',
            'any.required': 'Phone number is required'
        }),
    addressLine1: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Address line 1 is required',
            'any.required': 'Address line 1 is required'
        }),
    addressLine2: Joi.string()
        .trim()
        .allow('')
        .optional(),
    city: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'City is required',
            'any.required': 'City is required'
        }),
    state: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'State is required',
            'any.required': 'State is required'
        }),
    postalCode: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Postal code is required',
            'any.required': 'Postal code is required'
        }),
    country: Joi.string()
        .trim()
        .default('India')
        .optional(),
    addressType: Joi.string()
        .valid('Home', 'Work', 'Other')
        .default('Home')
        .optional()
        .messages({
            'any.only': 'Address type must be one of: Home, Work, Other'
        }),
    isDefault: Joi.boolean()
        .default(false)
        .optional()
});

const updateAddressSchema = Joi.object({
    fullName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional(),
    phone: Joi.string()
        .trim()
        .pattern(/^[0-9+\-\s()]{8,20}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please enter a valid phone number'
        }),
    addressLine1: Joi.string()
        .trim()
        .optional(),
    addressLine2: Joi.string()
        .trim()
        .allow('')
        .optional(),
    city: Joi.string()
        .trim()
        .optional(),
    state: Joi.string()
        .trim()
        .optional(),
    postalCode: Joi.string()
        .trim()
        .optional(),
    country: Joi.string()
        .trim()
        .optional(),
    addressType: Joi.string()
        .valid('Home', 'Work', 'Other')
        .optional()
        .messages({
            'any.only': 'Address type must be one of: Home, Work, Other'
        }),
    isDefault: Joi.boolean()
        .optional()
})
.min(1)
.messages({
    'object.min': 'At least one field is required for update'
});

const idParamSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid Address ID format. Must be a 24-character hex string',
            'any.required': 'Address ID parameter is required'
        })
});

module.exports = {
    createAddressSchema,
    updateAddressSchema,
    idParamSchema
};
