const Product = require('./products.model');
const Category = require('../categories/category.model');
const Subcategory = require('../subcategories/subcategory.model');
const slugify = require('slugify');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../utils/ApiError');
const { ApiResponse } = require('../../utils/ApiResponse');
//TODO: disable or enable the featured or not option 

const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        slug,
        description,
        categoryId,
        subcategoryId,
        price,
        discountedPrice,
        stock,
        images,
        isActive,
        featured,
    } = req.body;

    // Validation for required fields
    if (
        !name ||
        !description ||
        !categoryId ||
        !subcategoryId ||
        price === undefined
    ) {
        throw new ApiError(400, "Please provide all required fields correctly");
    }
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(400, "Please enter a valid category ID");
    }
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
        throw new ApiError(400, "Please enter a valid subcategory ID");
    }

    // Checking the relationship if it's valid or not
    if (subcategory.categoryId.toString() !== categoryId) {
        throw new ApiError(400, "No active relationship found between category and subcategory");
    }

    if (price < 0) {
        throw new ApiError(400, "Price cannot be negative");
    }
    if (
        discountedPrice &&
        discountedPrice > price
    ) {
        throw new ApiError(400, "Discounted price cannot exceed price");
    }
    const generatedSlug = slugify(
        name,
        {
            lower: true,
            strict: true
        }
    );
    const existingProduct = await Product.findOne({ slug: generatedSlug });
    if (existingProduct) {
        throw new ApiError(400, "Product already exists");
    }
    const product = await Product.create(
        {
            name,
            slug: generatedSlug,
            description,
            categoryId,
            subcategoryId,
            price,
            discountedPrice,
            stock,
            images,
            isActive,
            featured
        });
    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

const getAllProducts = asyncHandler(async (req, res) => {
    const {
        categoryId,
        subcategoryId,
        featured,
        isActive,
    } = req.query;
    //using query paramters better for pagination and filtering;

    const filter = {};
    if (categoryId) {
        filter.categoryId = categoryId;
    }
    if (subcategoryId) {
        filter.subcategoryId = subcategoryId;
    }
    if (featured) {
        filter.featured = featured === 'true';
    }
    if (isActive) {
        filter.isActive = isActive === 'true';
    }

    const products = await Product.find(filter)
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ createdAt: -1 });
    if (products.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], 'No products match the criteria')
        );
    }
    return res.status(200).json(
        new ApiResponse(200, products, "Products fetched succesfully")
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name');

    if (!product) {
        throw new ApiError(400, "No Product found");
    }
    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched succesfully")
    );
});

const updateProductById = asyncHandler(async (req, res) => {
    const updateProduct = { ...req.body };
    if (updateProduct.name) {
        updateProduct.slug = slugify(
            updateProduct.name,
            {
                lower: true,
                strict: true
            }
        )
    };
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
        throw new ApiError(400, 'Product not found');
    }
    if (updateProduct.slug) {
        //check the slug because the user will be sending id only of the product not the name

        const existingProduct = await Product.findOne({
            _id: { $ne: req.params.id },
            slug: updateProduct.slug
        });
        if (existingProduct) {
            throw new ApiError(400, 'Product with same name already exists');
        }
    }
    //take the name of category and subcategory if the user has provided or not
    //the user will only provide the id of the procduct so we will only feed in new updated product
    const categoryId =
        updateProduct.categoryId ||
        currentProduct.categoryId;

    const subcategoryId =
        updateProduct.subcategoryId ||
        currentProduct.subcategoryId;


    //validate if the category and subcategory exists
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(404, 'Category not found');
    }
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }
    //validate relationship if they are actually related the category and sucategory
    if (subcategory.categoryId.toString() !== categoryId.toString()) {
        throw new ApiError(400, 'Subcategory does not belong to selected category');
    }
    const finalPrice =
        updateProduct.price ??
        currentProduct.price;

    const finalDiscountedPrice =
        updateProduct.discountedPrice ??
        currentProduct.discountedPrice;
    //validatiing the final price for edge cases
    if (finalPrice < 0) {
        throw new ApiError(400, 'Price cannot be negative');
    }
    if (finalDiscountedPrice && finalDiscountedPrice > finalPrice) {
        throw new ApiError(400, 'Discounted price cannot exceed actual price');
    }

    //update product
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        updateProduct,
        {
            new: true,
            runValidators: true,
        });
    return res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

const updateProductStatusById = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
        throw new ApiError(400, 'isActive must be boolean');
    }

    const product = await Product.findByIdAndUpdate(req.params.id,
        {
            isActive
        },
        {
            new: true
        });
    if (!product) {
        throw new ApiError(400, 'product not found');
    }
    return res.status(200).json(
        new ApiResponse(200, product, 'Status updated successfully')
    );
});

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    updateProductStatusById
}
