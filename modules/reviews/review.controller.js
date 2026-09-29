const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const {
    getProductReviewsService,
    getMyReviewsService,
    createReviewService,
    updateReviewService,
    deleteReviewService
} = require('./review.service');

const getProductReviews = asyncHandler(async (req, res) => {
    const result = await getProductReviewsService(req.params.productId, req.query);

    res.status(200).json(
        new ApiResponse(200, 'Reviews fetched successfully', result)
    );
});

const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await getMyReviewsService(req.user.userId);

    res.status(200).json(
        new ApiResponse(200, 'Reviews fetched successfully', { reviews })
    );
});

const createReview = asyncHandler(async (req, res) => {
    const review = await createReviewService(req.user.userId, req.body);

    res.status(201).json(
        new ApiResponse(201, 'Review created successfully', { review })
    );
});

const updateReview = asyncHandler(async (req, res) => {
    const review = await updateReviewService(req.user.userId, req.user.role, req.params.id, req.body);

    res.status(200).json(
        new ApiResponse(200, 'Review updated successfully', { review })
    );
});

const deleteReview = asyncHandler(async (req, res) => {
    const review = await deleteReviewService(req.user.userId, req.user.role, req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Review deleted successfully', { review })
    );
});

module.exports = {
    getProductReviews,
    getMyReviews,
    createReview,
    updateReview,
    deleteReview
};
