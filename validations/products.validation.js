const Joi = require('joi');
//create product schema 
const createProductSchema = Joi.object({
    name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
        'string.empty': 'Product name is required',
        'string.min': 'Product name must be at least 3 characters',
        'string.max': 'Product name cannot exceed 100 characters',
        'any.required': 'Product name is required'
    }),

    slug: Joi.string()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .optional()
    .messages({
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
    }),
    
    description: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description cannot exceed 2000 characters',
        'any.required': 'Description is required'
    }),

    categoryId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        'string.pattern.base': 'Category ID must be a valid 24-character hex string',
        'any.required': 'Category ID is required'
    }),

    subcategoryId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        'string.pattern.base': 'Subcategory ID must be a valid 24-character hex string',
        'any.required': 'Subcategory ID is required'
    }),

    price: Joi.number()
    .positive()
    .min(0)
    .required()
    .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be greater than 0',
        'any.required': 'Price is required'
    }),

    discountedPrice: Joi.number()
    .positive()
    .optional()
    .allow(null)
    .min(0)
    .messages({
        'number.positive': 'Discounted price must be greater than 0'
    }),

    stock: Joi.number()
    .integer()
    .min(1)
    .default(0)
    .optional()
    .messages({
        'number.base': 'Stock must be a number',
        'number.integer': 'Stock must be an integer',
        'number.min': 'Stock cannot be negative'
    }),

    images: Joi.array()
    .items(Joi.string().uri())
    .optional()
    .messages({
        'array.base': 'Images must be an array',
        'string.uri': 'Each image must be a valid URL'
    }),

    isActive: Joi.boolean()
    .default(true)
    .optional()

});

//update product schema 

const updateProductSchema = Joi.object({
    name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional()
    .messages({
        'string.empty': 'Product name cannot be empty',
        'string.min': 'Product name must be at least 3 characters',
        'string.max': 'Product name cannot exceed 100 characters'
    }),

    slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .optional()
    .messages({
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens'
    }),

    description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .optional()
    .messages({
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description cannot exceed 2000 characters'
    }),

    categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
        'string.pattern.base': 'Category ID must be a valid 24-character hex string'
    }),

    subcategoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
        'string.pattern.base': 'Subcategory ID must be a valid 24-character hex string'
    }),

    price: Joi.number()
    .positive()
    .optional()
    .messages({
        'number.positive': 'Price must be greater than 0'
    }),

    discountedPrice: Joi.number()
    .positive()
    .optional()
    .allow(null)
    .messages({
        'number.positive': 'Discounted price must be greater than 0'
    }),

    stock: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
        'number.integer': 'Stock must be an integer',
        'number.min': 'Stock cannot be negative'
    }),

    images: Joi.array()
    .items(Joi.string().uri())
    .optional()
    .messages({
        'string.uri': 'Each image must be a valid URL'
    }),

    isActive: Joi.boolean()
    .optional(),

    featured: Joi.boolean()
    .optional()
})
.min(1)
.messages({
    'object.min': 'At least one field is required for update'
});

//update status schema 

const updateStatusSchema = Joi.object({
    isActive: Joi.boolean()
    .required()
    .messages({
        'boolean.base': 'isActive must be a boolean value (true or false)',
        'any.required': 'isActive field is required'
    }),
});


// update featured statss schema 

const updateFeaturedSchema = Joi.object({
    featured: Joi.boolean()
    .required()
    .messages({
        'boolean.base': "featured must be a boolean value",
        'any.required': "featured field is required"
    })
});


const idParamSchema = Joi.object({
    id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
        'string.pattern.base': "invalid id format Id must be in hex format",
        'any.required': "id parameter is required"
    }),
});

//query parameter schema for get all products 

const getAllProductsSchema = Joi.object({
    categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
        'string.pattern.base': 'Category ID must be a valid 24-character hex string'
    }),

    subcategoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
        'string.pattern.base': 'Subcategory ID must be a valid 24-character hex string'
    }),

    featured: Joi.boolean()
    .optional()
    .messages({
        'boolean.base': 'featured must be a boolean value'
    }),

    isActive: Joi.boolean()
    .optional()
    .messages({
        'boolean.base': 'isActive must be a boolean value'
    }),

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
    .optional()
    .allow(''),

    minPrice: Joi.number()
    .min(0)
    .optional()
    .messages({
        'number.min': 'minPrice cannot be negative'
    }),

    maxPrice: Joi.number()
    .min(0)
    .optional()
    .messages({
        'number.min': 'maxPrice cannot be negative'
    }),

    sortBy: Joi.string()
    .valid('price', 'name', 'createdAt', 'updatedAt')
    .default('createdAt')
    .optional(),

    sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .optional()
});

//image upload schema 

const uploadImageSchema = Joi.object({
    image: Joi.any()
    .required()
    .messages({
        'any.required': 'Image file is required'
    }),
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    updateStatusSchema,
    updateFeaturedSchema,
    idParamSchema,
    getAllProductsSchema,
    uploadImageSchema
}