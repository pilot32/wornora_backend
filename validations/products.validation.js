const Joi = require('joi');

const colorSchema = Joi.object({
    name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
        'string.empty': 'Color name is required',
        'string.max': 'Color name cannot exceed 50 characters',
        'any.required': 'Color name is required'
    }),

    hex: Joi.string()
    .trim()
    .pattern(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .allow('')
    .optional()
    .messages({
        'string.pattern.base': 'Color hex must be a valid hex color'
    })
});

const productAttributeFields = {
    style: Joi.string()
    .trim()
    .max(80)
    .allow('')
    .optional()
    .messages({
        'string.max': 'Style cannot exceed 80 characters'
    }),

    material: Joi.string()
    .trim()
    .max(120)
    .allow('')
    .optional()
    .messages({
        'string.max': 'Material cannot exceed 120 characters'
    }),

    colors: Joi.array()
    .items(colorSchema)
    .max(20)
    .optional()
    .messages({
        'array.base': 'Colors must be an array',
        'array.max': 'A product cannot have more than 20 colors'
    }),

    sizes: Joi.array()
    .items(
        Joi.string()
        .trim()
        .max(20)
        .messages({
            'string.max': 'Size cannot exceed 20 characters'
        })
    )
    .max(30)
    .optional()
    .messages({
        'array.base': 'Sizes must be an array',
        'array.max': 'A product cannot have more than 30 sizes'
    }),

    tags: Joi.array()
    .items(
        Joi.string()
        .trim()
        .lowercase()
        .max(40)
        .messages({
            'string.max': 'Tag cannot exceed 40 characters'
        })
    )
    .max(30)
    .optional()
    .messages({
        'array.base': 'Tags must be an array',
        'array.max': 'A product cannot have more than 30 tags'
    }),

    careInstructions: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
        'string.max': 'Care instructions cannot exceed 1000 characters'
    }),

    shippingDimensions: Joi.object({
        weightKg: Joi.number()
        .min(0.01)
        .required()
        .messages({
            'number.base': 'Package weight must be a number',
            'number.min': 'Package weight must be at least 0.01 kg',
            'any.required': 'Package weight is required when shipping dimensions are provided'
        }),

        lengthCm: Joi.number()
        .min(0.1)
        .required()
        .messages({
            'number.base': 'Package length must be a number',
            'number.min': 'Package length must be at least 0.1 cm',
            'any.required': 'Package length is required when shipping dimensions are provided'
        }),

        widthCm: Joi.number()
        .min(0.1)
        .required()
        .messages({
            'number.base': 'Package width must be a number',
            'number.min': 'Package width must be at least 0.1 cm',
            'any.required': 'Package width is required when shipping dimensions are provided'
        }),

        heightCm: Joi.number()
        .min(0.1)
        .required()
        .messages({
            'number.base': 'Package height must be a number',
            'number.min': 'Package height must be at least 0.1 cm',
            'any.required': 'Package height is required when shipping dimensions are provided'
        })
    })
    .optional()
    .messages({
        'object.base': 'Shipping dimensions must be an object'
    })
};

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
    .min(0)
    .optional()
    .allow(null)
    .messages({
        'number.min': 'Discounted price cannot be negative'
    }),

    stock: Joi.number()
    .integer()
    .min(0)
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
    .optional(),

    featured: Joi.boolean()
    .default(false)
    .optional(),

    ...productAttributeFields

})
.custom((value, helpers) => {
    if (
        value.discountedPrice !== undefined &&
        value.discountedPrice !== null &&
        value.discountedPrice > value.price
    ) {
        return helpers.error('any.invalid', {
            message: 'Discounted price cannot exceed actual price'
        });
    }

    return value;
})
.messages({
    'any.invalid': '{{#message}}'
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
    .min(0)
    .optional()
    .allow(null)
    .messages({
        'number.min': 'Discounted price cannot be negative'
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
    .optional(),

    ...productAttributeFields
})
.min(1)
.custom((value, helpers) => {
    if (
        value.price !== undefined &&
        value.discountedPrice !== undefined &&
        value.discountedPrice !== null &&
        value.discountedPrice > value.price
    ) {
        return helpers.error('any.invalid', {
            message: 'Discounted price cannot exceed actual price'
        });
    }

    return value;
})
.messages({
    'object.min': 'At least one field is required for update',
    'any.invalid': '{{#message}}'
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

    style: Joi.string()
    .trim()
    .optional()
    .allow(''),

    color: Joi.string()
    .trim()
    .optional()
    .allow(''),

    size: Joi.string()
    .trim()
    .optional()
    .allow(''),

    tag: Joi.string()
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
