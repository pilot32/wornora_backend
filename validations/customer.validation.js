const Joi = require('joi');

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        'string.pattern.base': 'ID must be a valid 24-character hex string'
    });

const getCustomerProductsSchema = Joi.object({
    categoryId: objectId
        .optional(),
    subcategoryId: objectId
        .optional(),
    featured: Joi.boolean()
        .optional(),
    inStock: Joi.boolean()
        .optional(),
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
        .optional(),
    search: Joi.string()
        .trim()
        .allow('')
        .optional(),
    style: Joi.string()
        .trim()
        .allow('')
        .optional(),
    color: Joi.string()
        .trim()
        .allow('')
        .optional(),
    size: Joi.string()
        .trim()
        .allow('')
        .optional(),
    tag: Joi.string()
        .trim()
        .allow('')
        .optional(),
    minPrice: Joi.number()
        .min(0)
        .optional(),
    maxPrice: Joi.number()
        .min(0)
        .optional(),
    minRating: Joi.number()
        .min(0)
        .max(5)
        .optional(),
    sortBy: Joi.string()
        .valid('price', 'name', 'createdAt', 'averageRating', 'reviewCount')
        .default('createdAt')
        .optional(),
    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .optional()
})
.custom((value, helpers) => {
    if (
        value.minPrice !== undefined &&
        value.maxPrice !== undefined &&
        value.minPrice > value.maxPrice
    ) {
        return helpers.error('any.invalid', {
            message: 'minPrice cannot be greater than maxPrice'
        });
    }

    return value;
})
.messages({
    'any.invalid': '{{#message}}'
});

const customerProductIdSchema = Joi.object({
    id: objectId
        .required()
        .messages({
            'any.required': 'Product ID is required'
        })
});

module.exports = {
    getCustomerProductsSchema,
    customerProductIdSchema
};
