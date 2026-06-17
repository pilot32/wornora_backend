const express = require('express');
const router = express.Router();
const {createCoupon} = require('./coupon.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const {createCouponSchema} = require('../../validations/coupon.validation');

router.post('/',
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(createCouponSchema),
    createCoupon);
module.exports = router;