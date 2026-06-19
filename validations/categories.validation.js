const Joi = require('joi');


const createCategorySchema = Joi.object({
    name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
        'string.empty': 'category name is required',
        'string.min': 'Category name must be at least 2 characters long',
        'string.max': 'Category name must be at most 50 characters long',
        'any.required': 'Category name is required',
    }),

    slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .optional()
    .messages({
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
    }),

    isActive: Joi.boolean().default(true),

    image: Joi.string()
    .uri()
    .allow('')
    .messages({
        'string.uri': 'Image must be a valid URL',
    }),
});


//2 Update validation schema 

const updateCategorySchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.empty': 'Category name cannot be empty',
            'string.min': 'Category name must be at least 2 characters',
            'string.max': 'Category name cannot exceed 50 characters'
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
        })
})
.min(1) // At least one field must be provided
.messages({
    'object.min': 'At least one field is required for update'
});


//update the status of the category 
const updateCategoryStatusSchema = Joi.object({
    isActive: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'isActive must be a boolean value (true or false)',
            'any.required': 'isActive field is required'
        })
});

//id parameter for the validation middleware
const idParamSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid ID format. Must be a 24-character hex string',
            'any.required': 'ID parameter is required'
        })
});


//for paginate 
const getAllCategoriesSchema = Joi.object({
    isActive: Joi.boolean()
        .optional(),
    
    search: Joi.string()
        .trim()
        .optional()
        .allow('')
});
module.exports = {
    createCategorySchema,
    updateCategorySchema,
    updateCategoryStatusSchema,
    idParamSchema,
    getAllCategoriesSchema
}

