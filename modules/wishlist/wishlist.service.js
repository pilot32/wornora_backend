const Wishlist = require('./wishlist.model');
const Product = require('../products/products.model');
const ApiError = require('../../utils/apiError');

const wishlistPopulate = {
    path: 'productId',
    match: { isActive: true },
    populate: [
        { path: 'categoryId', select: 'name slug' },
        { path: 'subcategoryId', select: 'name slug' }
    ]
};

const normalizeWishlistItems = (items) =>
    items.filter((item) => item.productId);

const getWishlistService = async (userId) => {
    const items = await Wishlist.find({ userId })
        .populate(wishlistPopulate)
        .sort({ createdAt: -1 })
        .lean();

    return normalizeWishlistItems(items);
};

const addToWishlistService = async (userId, productId) => {
    const product = await Product.findOne({ _id: productId, isActive: true });

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const existingItem = await Wishlist.findOne({ userId, productId })
        .populate(wishlistPopulate);

    if (existingItem) {
        return existingItem;
    }

    const item = await Wishlist.create({ userId, productId });
    await item.populate(wishlistPopulate);

    return item;
};

const removeFromWishlistService = async (userId, productId) => {
    const item = await Wishlist.findOneAndDelete({ userId, productId });

    if (!item) {
        throw new ApiError(404, 'Product not found in wishlist');
    }

    return {
        productId,
        removed: true
    };
};

const clearWishlistService = async (userId) => {
    await Wishlist.deleteMany({ userId });

    return {
        cleared: true
    };
};

const checkWishlistService = async (userId, productId) => {
    const exists = await Wishlist.exists({ userId, productId });

    return {
        productId,
        inWishlist: Boolean(exists)
    };
};

module.exports = {
    getWishlistService,
    addToWishlistService,
    removeFromWishlistService,
    clearWishlistService,
    checkWishlistService
};
