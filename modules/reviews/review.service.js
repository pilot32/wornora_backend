const Review = require('./review.model');
const mongoose = require('mongoose');
const Product = require('../products/products.model');
const Order = require('../order/order.model');
const USER_ROLES = require('../../constants/roles');
const ORDER_STATUS = require('../../constants/order.constants');
const ApiError = require('../../utils/apiError');

const refreshProductRating = async (productId) => {
    const productObjectId = new mongoose.Types.ObjectId(productId);
    const [result] = await Review.aggregate([
        {
            $match: {
                productId: productObjectId,
                isActive: true
            }
        },
        {
            $group: {
                _id: '$productId',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    await Product.findByIdAndUpdate(productObjectId, {
        averageRating: result ? Number(result.averageRating.toFixed(1)) : 0,
        reviewCount: result ? result.reviewCount : 0
    });
};

const hasDeliveredPurchase = async (userId, productId) => {
    const order = await Order.exists({
        userId,
        orderStatus: ORDER_STATUS.DELIVERED,
        'orderItems.productId': productId
    });

    return Boolean(order);
};

const getProductReviewsService = async (productId, query) => {
    const pageNum = Math.max(1, parseInt(query.page || 1));
    const limitNum = Math.max(1, parseInt(query.limit || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = {
        productId,
        isActive: true
    };

    const [reviews, total] = await Promise.all([
        Review.find(filter)
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Review.countDocuments(filter)
    ]);

    return {
        reviews,
        pagination: {
            currentPage: pageNum,
            limit: limitNum,
            totalItems: total,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1
        }
    };
};

const getMyReviewsService = async (userId) => {
    return Review.find({ userId, isActive: true })
        .populate('productId', 'name slug images averageRating reviewCount')
        .sort({ createdAt: -1 })
        .lean();
};

const createReviewService = async (userId, data) => {
    const product = await Product.findOne({
        _id: data.productId,
        isActive: true
    });

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const isVerifiedPurchase = await hasDeliveredPurchase(userId, data.productId);
    if (!isVerifiedPurchase) {
        throw new ApiError(403, 'You can review this product after a delivered purchase');
    }

    const existingReview = await Review.findOne({
        userId,
        productId: data.productId,
        isActive: true
    });

    if (existingReview) {
        throw new ApiError(400, 'You have already reviewed this product');
    }

    const review = await Review.create({
        userId,
        productId: data.productId,
        rating: data.rating,
        title: data.title || '',
        comment: data.comment || '',
        isVerifiedPurchase
    });

    await refreshProductRating(product._id);
    await review.populate('userId', 'name');

    return review;
};

const updateReviewService = async (userId, role, id, data) => {
    const filter = role === USER_ROLES.ADMIN
        ? { _id: id, isActive: true }
        : { _id: id, userId, isActive: true };

    const review = await Review.findOne(filter);

    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    if (data.rating !== undefined) {
        review.rating = data.rating;
    }

    if (data.title !== undefined) {
        review.title = data.title;
    }

    if (data.comment !== undefined) {
        review.comment = data.comment;
    }

    await review.save();
    await refreshProductRating(review.productId);
    await review.populate('userId', 'name');

    return review;
};

const deleteReviewService = async (userId, role, id) => {
    const filter = role === USER_ROLES.ADMIN
        ? { _id: id, isActive: true }
        : { _id: id, userId, isActive: true };

    const review = await Review.findOne(filter);

    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    review.isActive = false;
    await review.save();
    await refreshProductRating(review.productId);

    return {
        id: review._id,
        productId: review.productId,
        isActive: review.isActive
    };
};

module.exports = {
    getProductReviewsService,
    getMyReviewsService,
    createReviewService,
    updateReviewService,
    deleteReviewService
};
