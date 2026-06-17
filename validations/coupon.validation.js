const Joi = require('joi');
/**
 * joi validation schema which will validate the incoming request body for creating a new coupon code
 */
const createCouponSchema = Joi.object({
    code: Joi.string().uppercase().trim().required(),
    description: Joi.string().allow('').optional(),
    discountType: Joi.string().valid('percentage','fixed').required(),
    discountValue: Joi.number().min(0).required(),
    minimumCartValue: Joi.number().min(0).allow(null).optional(),
    maximumDiscountAmount: Joi.number().min(0).allow(null).optional(),
    startDate: Joi.date().allow(null).optional(),
    expiryDate: Joi.date().allow(null).optional(),
    usageLimit: Joi.number().min(0).allow(null).optional(),
    perUserLimit: Joi.number().min(1).optional(),
    isActive: Joi.boolean().default(true),
});
const updateCouponSchema = Joi.object({
    code: Joi.string().uppercase().trim().optional(),
    description: Joi.string().allow('').optional(),
    discountType: Joi.string().valid('percentage','fixed').optional(),
    discountValue: Joi.number().min(0).optional(),
    minimumCartValue: Joi.number().min(0).allow(null).optional(),
    maximumDiscountAmount: Joi.number().min(0).allow(null).optional(),
    startDate: Joi.date().allow(null).optional(),
    expiryDate: Joi.date().allow(null).optional(),
    usageLimit: Joi.number().min(0).allow(null).optional(),
    perUserLimit: Joi.number().min(1).optional(),
    isActive: Joi.boolean().optional(),
});
module.exports = {
    createCouponSchema,
    updateCouponSchema,
}