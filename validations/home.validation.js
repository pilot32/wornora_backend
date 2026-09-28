const Joi = require('joi');
const { HERO_SLIDE_ALIGN, PROMO_BANNER_ACCENT } = require('../constants/home.constants');

// ─── Shared ─────────────────────────────────────────────────────────────────

const idParamSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid ID format. Must be a 24-character hex string',
            'any.required': 'ID parameter is required',
        }),
});

const statusSchema = Joi.object({
    isActive: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'isActive must be a boolean value (true or false)',
            'any.required': 'isActive field is required',
        }),
});

// ─── Hero Slides ─────────────────────────────────────────────────────────────

const ctaSchema = Joi.object({
    label: Joi.string().trim().required(),
    to: Joi.string().trim().required(),
});

const secondaryCtaSchema = Joi.object({
    label: Joi.string().trim().optional().allow(''),
    to: Joi.string().trim().optional().allow(''),
});

const createHeroSlideSchema = Joi.object({
    eyebrow: Joi.string().trim().optional().allow(''),
    title: Joi.string().trim().required().messages({
        'string.empty': 'Title is required',
        'any.required': 'Title is required',
    }),
    subtitle: Joi.string().trim().optional().allow(''),
    cta: ctaSchema.required().messages({
        'any.required': 'CTA is required',
    }),
    secondaryCta: secondaryCtaSchema.optional(),
    image: Joi.string().uri().required().messages({
        'string.uri': 'Image must be a valid URL',
        'any.required': 'Image is required',
    }),
    align: Joi.string()
        .valid(...Object.values(HERO_SLIDE_ALIGN))
        .default(HERO_SLIDE_ALIGN.LEFT)
        .optional()
        .messages({
            'any.only': `align must be one of: ${Object.values(HERO_SLIDE_ALIGN).join(', ')}`,
        }),
    isActive: Joi.boolean().default(true).optional(),
    order: Joi.number().integer().min(0).default(0).optional(),
});

const updateHeroSlideSchema = Joi.object({
    eyebrow: Joi.string().trim().optional().allow(''),
    title: Joi.string().trim().optional(),
    subtitle: Joi.string().trim().optional().allow(''),
    cta: ctaSchema.optional(),
    secondaryCta: secondaryCtaSchema.optional(),
    image: Joi.string().uri().optional().messages({
        'string.uri': 'Image must be a valid URL',
    }),
    align: Joi.string()
        .valid(...Object.values(HERO_SLIDE_ALIGN))
        .optional()
        .messages({
            'any.only': `align must be one of: ${Object.values(HERO_SLIDE_ALIGN).join(', ')}`,
        }),
    isActive: Joi.boolean().optional(),
    order: Joi.number().integer().min(0).optional(),
}).min(1).messages({
    'object.min': 'At least one field is required for update',
});

// ─── Promo Banners ───────────────────────────────────────────────────────────

const createPromoBannerSchema = Joi.object({
    eyebrow: Joi.string().trim().optional().allow(''),
    title: Joi.string().trim().required().messages({
        'string.empty': 'Title is required',
        'any.required': 'Title is required',
    }),
    subtitle: Joi.string().trim().optional().allow(''),
    cta: ctaSchema.required().messages({
        'any.required': 'CTA is required',
    }),
    image: Joi.string().uri().required().messages({
        'string.uri': 'Image must be a valid URL',
        'any.required': 'Image is required',
    }),
    accent: Joi.string()
        .valid(...Object.values(PROMO_BANNER_ACCENT))
        .default(PROMO_BANNER_ACCENT.GOLD)
        .optional()
        .messages({
            'any.only': `accent must be one of: ${Object.values(PROMO_BANNER_ACCENT).join(', ')}`,
        }),
    isActive: Joi.boolean().default(true).optional(),
    order: Joi.number().integer().min(0).default(0).optional(),
});

const updatePromoBannerSchema = Joi.object({
    eyebrow: Joi.string().trim().optional().allow(''),
    title: Joi.string().trim().optional(),
    subtitle: Joi.string().trim().optional().allow(''),
    cta: ctaSchema.optional(),
    image: Joi.string().uri().optional().messages({
        'string.uri': 'Image must be a valid URL',
    }),
    accent: Joi.string()
        .valid(...Object.values(PROMO_BANNER_ACCENT))
        .optional()
        .messages({
            'any.only': `accent must be one of: ${Object.values(PROMO_BANNER_ACCENT).join(', ')}`,
        }),
    isActive: Joi.boolean().optional(),
    order: Joi.number().integer().min(0).optional(),
}).min(1).messages({
    'object.min': 'At least one field is required for update',
});

// ─── Category Tiles ──────────────────────────────────────────────────────────

const createCategoryTileSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required',
    }),
    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/)
        .required()
        .messages({
            'string.empty': 'Slug is required',
            'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
            'any.required': 'Slug is required',
        }),
    to: Joi.string().trim().required().messages({
        'string.empty': 'Link target (to) is required',
        'any.required': 'Link target (to) is required',
    }),
    image: Joi.string().uri().required().messages({
        'string.uri': 'Image must be a valid URL',
        'any.required': 'Image is required',
    }),
    isActive: Joi.boolean().default(true).optional(),
    order: Joi.number().integer().min(0).default(0).optional(),
});

const updateCategoryTileSchema = Joi.object({
    name: Joi.string().trim().optional(),
    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/)
        .optional()
        .messages({
            'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
        }),
    to: Joi.string().trim().optional(),
    image: Joi.string().uri().optional().messages({
        'string.uri': 'Image must be a valid URL',
    }),
    isActive: Joi.boolean().optional(),
    order: Joi.number().integer().min(0).optional(),
}).min(1).messages({
    'object.min': 'At least one field is required for update',
});

module.exports = {
    idParamSchema,
    statusSchema,
    // Hero Slides
    createHeroSlideSchema,
    updateHeroSlideSchema,
    // Promo Banners
    createPromoBannerSchema,
    updatePromoBannerSchema,
    // Category Tiles
    createCategoryTileSchema,
    updateCategoryTileSchema,
};
