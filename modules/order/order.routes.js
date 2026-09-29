const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const {
    createOrder,
    getMyOrders,
    getOrderById
} = require('./order.controller');
const {
    createOrderSchema,
    orderIdParamSchema
} = require('../../validations/order.validation');

router.post(
    '/',
    authMiddleware,
    validationMiddleware(createOrderSchema),
    createOrder
);

router.get(
    '/me',
    authMiddleware,
    getMyOrders
);

router.get(
    '/:id',
    authMiddleware,
    validationMiddleware(orderIdParamSchema, 'params'),
    getOrderById
);

module.exports = router;
