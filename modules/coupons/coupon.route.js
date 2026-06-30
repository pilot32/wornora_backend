const express = require('express');
const router = express.Router();
const {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCouponById,
    updateCouponStatusById,
    deleteCouponById
} = require('./coupon.controller');

const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');

const {
    createCouponSchema,
    updateCouponSchema,
    updateCouponStatusSchema,
    idParamSchema
} = require('../../validations/coupon.validation');

// Create a coupon
router.post('/',
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(createCouponSchema),
    createCoupon
);

// Get all coupons (Admin only)
router.get('/', 
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAllCoupons
);

// Get coupon by ID
router.get('/:id',
    validationMiddleware(idParamSchema, 'params'),
    getCouponById
);

// Update coupon details
router.patch('/:id',
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updateCouponSchema),
    updateCouponById
);

// Update coupon status
router.patch('/:id/status',
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updateCouponStatusSchema),
    updateCouponStatusById
);

// Delete coupon by ID
router.delete('/:id',
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(idParamSchema, 'params'),
    deleteCouponById
);

module.exports = router;