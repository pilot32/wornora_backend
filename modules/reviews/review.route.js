const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const {
    getProductReviews,
    getMyReviews,
    createReview,
    updateReview,
    deleteReview
} = require('./review.controller');
const {
    createReviewSchema,
    updateReviewSchema,
    reviewIdParamSchema,
    productIdParamSchema,
    getProductReviewsSchema
} = require('../../validations/review.validation');

router.get(
    '/product/:productId',
    validationMiddleware(productIdParamSchema, 'params'),
    validationMiddleware(getProductReviewsSchema, 'query'),
    getProductReviews
);

router.get(
    '/me',
    authMiddleware,
    getMyReviews
);

router.post(
    '/',
    authMiddleware,
    validationMiddleware(createReviewSchema),
    createReview
);

router.patch(
    '/:id',
    authMiddleware,
    validationMiddleware(reviewIdParamSchema, 'params'),
    validationMiddleware(updateReviewSchema),
    updateReview
);

router.delete(
    '/:id',
    authMiddleware,
    validationMiddleware(reviewIdParamSchema, 'params'),
    deleteReview
);

module.exports = router;
