const Product = require('../products/products.model');
const { getPagination } = require('../../utils/pagination');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../utils/ApiError');
const { ApiResponse } = require('../../utils/ApiResponse');

/**
 * Function to return the all active producst from the
 * Database.Which will serve the front-end for the homepage and products page too.
 */
const getAllProducts = asyncHandler(async (req, res) => {
    const { page, skip, limit } = getPagination(req);
    const {
        categoryId,
        subcategoryId,
        search,
    } = req.query;

    const filter = {
        isActive: true
    };

    if (categoryId) {
        filter.categoryId = categoryId;
    }
    if (subcategoryId) {
        filter.subcategoryId = subcategoryId;
    }
    if (search) {
        filter.name = {
            $regex: search,
            $options: 'i',
        };
    }

    const products = await Product.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            products
        }, "Products fetched successfully")
    );
});

/**
 * Function to get the all featured products for home page and product pages too
 * since we have less products that why 
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({
        isActive: true,
        featured: true
    });
    return res.status(200).json(
        new ApiResponse(200, { products }, "Featured products fetched")
    );
});

/**
 * Funciton to get the new Arrivals using the logic of createdAt=-1 so that it returns the latest
 * products uploaded to the database;
 */
const getNewArrivals = asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(12);
    return res.status(200).json(
        new ApiResponse(200, { products }, "New arrivals fetched")
    );
});

/**
 * Function to get the specific products according to the id 
 * for the product page in the customer side;
 */
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findOne({
        _id: req.params.id,
        isActive: true
    })
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name');

    if (!product) {
        throw new ApiError(404, 'no product found');
    }
    return res.status(200).json(
        new ApiResponse(200, { product }, "Product fetched")
    );
});

module.exports = {
    getAllProducts,
    getFeaturedProducts,
    getNewArrivals,
    getProductById
};
