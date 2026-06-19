const Joi = require('joi');

const createSubcategorySchema = Joi.object({
    name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
        'string.empty': 'Subcategory name is required',
        'string.min': 'Subcategory name must be at least 2 characters',
        'string.max': 'Subcategory name cannot exceed 50 characters',
        'any.required': 'Subcategory name is required',
    }),

    categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
        'string.pattern.base': 'Category ID must be a valid 24-character hex string',
        'any.required': 'Category ID is required'
    }),

    slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .optional()
    .messages({
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
    }),

    isActive: Joi.boolean()
    .optional()
    .default(true),

    image: Joi.string()
    .uri()
    .allow('')
    .messages({
        'string.uri': 'Image must be a valid URL',
    }),
});

const updateSubcategorySchema = Joi.object({
    name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
        'string.empty': 'Subcategory name cannot be empty',
        'string.min': 'Subcategory name must be at least 2 characters',
        'string.max': 'Subcategory name cannot exceed 50 characters'
    }),

    categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
        'string.pattern.base': 'Category ID must be a valid 24-character hex string'
    }),

    slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .optional()
    .messages({
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
    }),

    isActive: Joi.boolean()
    .optional(),

    image: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
        'string.uri': 'Image must be a valid URL'
    }), 
})
.min(1)
.messages({
    'object.min': 'At least one field must be provided for update', 
});

//id parameter schema 

const updateSubcategoryStatusSchema = Joi.object({
    isActive: Joi.boolean()
    .required()
    .messages({
        'boolean.base': 'isActive must be a boolean value (true or false)',
        'any.required': 'isActive field is required'
    }),
});

//id parameter schema for id validation 

const idParamSchema = Joi.object({
    id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
        'string.pattern.base': 'Invalid ID format. Must be a 24-character hex string',
        'any.required': 'ID parameter is required'
    }),
});


//query parameter schema for validation of query for pagination and get all route

const getAllSubcategoriesSchema = Joi.object({
    categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
        'string.pattern.base': 'Category ID must be a valid 24-character hex string'
    }),

    isActive: Joi.boolean()
    .optional(),

    search: Joi.string()
    .trim()
    .optional()
    .allow('')
});


module.exports = {
    createSubcategorySchema,
    updateSubcategorySchema,
    updateSubcategoryStatusSchema,
    idParamSchema,
    getAllSubcategoriesSchema
}