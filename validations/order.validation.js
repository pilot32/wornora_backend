const Joi = require('joi');
const ORDER_STATUS = require('../constants/order.constants');
const { PAYMENT_METHODS } = require('../constants/payment.constants');
const { PAYMENT_STATUS } = require('../constants/payment.constants');

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        'string.pattern.base': 'ID must be a valid 24-character hex string'
    });

const createOrderSchema = Joi.object({
    shippingAddressId: objectId
        .required()
        .messages({
            'any.required': 'Shipping address is required'
        }),
    billingAddressId: objectId
        .optional(),
    paymentMethod: Joi.string()
        .valid(PAYMENT_METHODS.COD, PAYMENT_METHODS.RAZORPAY)
        .default(PAYMENT_METHODS.COD)
        .optional(),
    deliveryNotes: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .optional()
});

const orderIdParamSchema = Joi.object({
    id: objectId
        .required()
        .messages({
            'any.required': 'Order ID is required'
        })
});

const getAllOrdersSchema = Joi.object({
    orderStatus: Joi.string()
        .valid(
            ORDER_STATUS.PLACED,
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.SHIPPED,
            ORDER_STATUS.OUT_FOR_DELIVERY,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.CANCELLED,
            ORDER_STATUS.RETURNED
        )
        .optional(),
    paymentStatus: Joi.string()
        .valid(
            PAYMENT_STATUS.PENDING,
            PAYMENT_STATUS.PAID,
            PAYMENT_STATUS.COMPLETED,
            PAYMENT_STATUS.FAILED,
            PAYMENT_STATUS.REFUNDED
        )
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
        .optional()
});

const updateOrderStatusSchema = Joi.object({
    orderStatus: Joi.string()
        .valid(
            ORDER_STATUS.PLACED,
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.SHIPPED,
            ORDER_STATUS.OUT_FOR_DELIVERY,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.CANCELLED,
            ORDER_STATUS.RETURNED
        )
        .required(),
    trackingNumber: Joi.string()
        .trim()
        .allow('', null)
        .optional(),
    trackingUrl: Joi.string()
        .trim()
        .uri()
        .allow('', null)
        .optional(),
    adminNote: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
});

const cancelOrderSchema = Joi.object({
    cancellationReason: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .optional()
});

module.exports = {
    createOrderSchema,
    orderIdParamSchema,
    getAllOrdersSchema,
    updateOrderStatusSchema,
    cancelOrderSchema
};
