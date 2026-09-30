const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const {
    getWishlistService,
    addToWishlistService,
    removeFromWishlistService,
    clearWishlistService,
    checkWishlistService
} = require('./wishlist.service');

const getWishlist = asyncHandler(async (req, res) => {
    const items = await getWishlistService(req.user.userId);

    res.status(200).json(
        new ApiResponse(200, 'Wishlist fetched successfully', { items })
    );
});

const addToWishlist = asyncHandler(async (req, res) => {
    const item = await addToWishlistService(req.user.userId, req.body.productId);

    res.status(200).json(
        new ApiResponse(200, 'Product added to wishlist', { item })
    );
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const result = await removeFromWishlistService(req.user.userId, req.params.productId);

    res.status(200).json(
        new ApiResponse(200, 'Product removed from wishlist', result)
    );
});

const clearWishlist = asyncHandler(async (req, res) => {
    const result = await clearWishlistService(req.user.userId);

    res.status(200).json(
        new ApiResponse(200, 'Wishlist cleared successfully', result)
    );
});

const checkWishlist = asyncHandler(async (req, res) => {
    const result = await checkWishlistService(req.user.userId, req.params.productId);

    res.status(200).json(
        new ApiResponse(200, 'Wishlist status fetched successfully', result)
    );
});

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkWishlist
};
