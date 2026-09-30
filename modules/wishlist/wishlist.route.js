const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkWishlist
} = require('./wishlist.controller');
const {
    wishlistProductSchema
} = require('../../validations/wishlist.validation');

router.get(
    '/',
    authMiddleware,
    getWishlist
);

router.post(
    '/',
    authMiddleware,
    validationMiddleware(wishlistProductSchema),
    addToWishlist
);

router.get(
    '/check/:productId',
    authMiddleware,
    validationMiddleware(wishlistProductSchema, 'params'),
    checkWishlist
);

router.delete(
    '/',
    authMiddleware,
    clearWishlist
);

router.delete(
    '/:productId',
    authMiddleware,
    validationMiddleware(wishlistProductSchema, 'params'),
    removeFromWishlist
);

module.exports = router;
