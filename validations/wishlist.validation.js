const Joi = require('joi');

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        'string.pattern.base': 'ID must be a valid 24-character hex string'
    });

const wishlistProductSchema = Joi.object({
    productId: objectId
        .required()
        .messages({
            'any.required': 'Product ID is required'
        })
});

module.exports = {
    wishlistProductSchema
};
