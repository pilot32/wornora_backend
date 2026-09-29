const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const USER_ROLES = require('../../constants/roles');
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelMyOrder
} = require('./order.controller');
const {
    createOrderSchema,
    orderIdParamSchema,
    getAllOrdersSchema,
    updateOrderStatusSchema,
    cancelOrderSchema
} = require('../../validations/order.validation');

router.post(
    '/',
    authMiddleware,
    validationMiddleware(createOrderSchema),
    createOrder
);

router.get(
    '/',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(getAllOrdersSchema, 'query'),
    getAllOrders
);

router.get(
    '/me',
    authMiddleware,
    getMyOrders
);

router.patch(
    '/:id/status',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(orderIdParamSchema, 'params'),
    validationMiddleware(updateOrderStatusSchema),
    updateOrderStatus
);

router.patch(
    '/:id/cancel',
    authMiddleware,
    validationMiddleware(orderIdParamSchema, 'params'),
    validationMiddleware(cancelOrderSchema),
    cancelMyOrder
);

router.get(
    '/:id',
    authMiddleware,
    validationMiddleware(orderIdParamSchema, 'params'),
    getOrderById
);

module.exports = router;
