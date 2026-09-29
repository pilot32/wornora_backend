const Joi = require('joi');

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        'string.pattern.base': 'ID must be a valid 24-character hex string'
    });

const createReviewSchema = Joi.object({
    productId: objectId
        .required()
        .messages({
            'any.required': 'Product is required'
        }),
    rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot exceed 5',
            'any.required': 'Rating is required'
        }),
    title: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .optional(),
    comment: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
});

const updateReviewSchema = Joi.object({
    rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .optional(),
    title: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .optional(),
    comment: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
})
.min(1)
.messages({
    'object.min': 'At least one field is required for update'
});

const reviewIdParamSchema = Joi.object({
    id: objectId
        .required()
        .messages({
            'any.required': 'Review ID is required'
        })
});

const productIdParamSchema = Joi.object({
    productId: objectId
        .required()
        .messages({
            'any.required': 'Product ID is required'
        })
});

const getProductReviewsSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional(),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .optional()
});

module.exports = {
    createReviewSchema,
    updateReviewSchema,
    reviewIdParamSchema,
    productIdParamSchema,
    getProductReviewsSchema
};
