const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const {
    createRazorpayPaymentOrder,
    verifyRazorpayPayment
} = require('./payment.controller');
const {
    createRazorpayPaymentOrderSchema,
    verifyRazorpayPaymentSchema
} = require('../../validations/payment.validation');

const router = express.Router();

router.post(
    '/razorpay/order',
    authMiddleware,
    validationMiddleware(createRazorpayPaymentOrderSchema),
    createRazorpayPaymentOrder
);

router.post(
    '/razorpay/verify',
    authMiddleware,
    validationMiddleware(verifyRazorpayPaymentSchema),
    verifyRazorpayPayment
);

module.exports = router;
