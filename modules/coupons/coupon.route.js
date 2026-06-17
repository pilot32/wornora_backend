const express = require('express');
const router = express.Router();
const {createCoupon,getAllCoupons,getCuponById,updateCouponById,updateCouponStatusById,deleteCouponById} = require('./coupon.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const {createCouponSchema} = require('../../validations/coupon.validation');
//TODO: GET /api/coupons/code/WELCOME10
router.post('/',
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(createCouponSchema),
    createCoupon);

router.get('/', 
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAllCoupons);

router.get('/:id', getCuponById);

router.patch('/:id',
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateCouponById);

router.patch('/:id/status',
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateCouponStatusById);

router.delete('/:id',
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteCouponById);

module.exports = router;