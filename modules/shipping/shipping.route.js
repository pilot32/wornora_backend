const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const { getCartShippingQuote } = require('./shipping.controller');
const { getCartShippingQuoteSchema } = require('../../validations/shipping.validation');

const router = express.Router();

router.post(
    '/quote',
    authMiddleware,
    validationMiddleware(getCartShippingQuoteSchema),
    getCartShippingQuote
);

module.exports = router;
