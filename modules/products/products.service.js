const Product = require('./products.model');
const Category = require('../categories/category.model');
const Subcategory = require('../subcategories/subcategory.model');
const slugify = require('slugify');
const ApiError = require('../../utils/apiError');

const createProductService = async (data) => {
    const {
        name,
        categoryId,
        subcategoryId,
        description,
        price,
        discountedPrice,
        stock,
        images,
        isActive,
        featured,
    } = data;

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(404, 'Please enter a valid category ID');
    }

    // Validate subcategory exists
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
        throw new ApiError(404, 'Please enter a valid subcategory ID');
    }

    // Checking the relationship if it's valid or not
    if (subcategory.categoryId.toString() !== categoryId) {
        throw new ApiError(400, 'No active relationship found between category and subcategory');
    }

    // Generate slug from name and check for duplicates
    const generatedSlug = slugify(name, {
        lower: true,
        strict: true
    });

    const existingProduct = await Product.findOne({ slug: generatedSlug });
    if (existingProduct) {
        throw new ApiError(400, 'Product already exists');
    }

    // Create product
    const product = await Product.create({
        name,
        slug: generatedSlug,
        description,
        categoryId,
        subcategoryId,
        price,
        discountedPrice: discountedPrice || null,
        stock: stock || 1,
        images: images || [],
        isActive: isActive !== undefined ? isActive : true,
        featured: featured !== undefined ? featured : false
    });

    await product.populate([
        { path: 'categoryId', select: 'name slug' },
        { path: 'subcategoryId', select: 'name slug' }
    ]);

    return product;
};

const getAllProductsService = async (query) => {
    const {
        categoryId,
        subcategoryId,
        featured,
        isActive,
        page = 1,
        limit = 10,
        search,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = query;

    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (subcategoryId) filter.subcategoryId = subcategoryId;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('categoryId', 'name slug')
            .populate('subcategoryId', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limitNum),
        Product.countDocuments(filter)
    ]);

    return {
        products,
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

const getProductByIdService = async (id) => {
    const product = await Product.findById(id)
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name');

    if (!product) {
        throw new ApiError(404, 'No Product found');
    }

    return product;
};

const updateProductByIdService = async (id, data) => {
    const updateData = { ...data };

    // Regenerate slug if name is changed
    if (updateData.name) {
        updateData.slug = slugify(updateData.name, {
            lower: true,
            strict: true
        });
    }

    // Get the current product from the db to compare with updated values
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
        throw new ApiError(404, 'Product not found');
    }

    // Check if duplicate slug exists
    if (updateData.slug) {
        const existingProduct = await Product.findOne({
            _id: { $ne: id },
            slug: updateData.slug
        });
        if (existingProduct) {
            throw new ApiError(400, 'Product with same name already exists');
        }
    }

    // Resolve category and subcategory IDs
    const categoryId = updateData.categoryId || currentProduct.categoryId;
    const subcategoryId = updateData.subcategoryId || currentProduct.subcategoryId;

    // Validate category and subcategory exist
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(404, 'Category not found');
    }
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    // Validate relationship
    if (subcategory.categoryId.toString() !== categoryId.toString()) {
        throw new ApiError(400, 'Subcategory does not belong to selected category');
    }

    // Determine the final price of the product
    const finalPrice = updateData.price ?? currentProduct.price;
    const finalDiscountedPrice = updateData.discountedPrice ?? currentProduct.discountedPrice;

    if (finalPrice < 0) {
        throw new ApiError(400, 'Price cannot be negative');
    }
    if (finalDiscountedPrice && finalDiscountedPrice > finalPrice) {
        throw new ApiError(400, 'Discounted price cannot exceed actual price');
    }

    // Update product
    const product = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    )
        .populate('categoryId', 'name slug')
        .populate('subcategoryId', 'name slug');

    return product;
};

const updateProductStatusByIdService = async (id, isActive) => {
    const product = await Product.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
    )
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name');

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    return product;
};

const updateProductFeaturedStatusByIdService = async (id, featured) => {
    const product = await Product.findByIdAndUpdate(
        id,
        { featured },
        { new: true }
    )
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name');

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    return product;
};

const deleteProductByIdService = async (id) => {
    const product = await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    return {
        id: product._id,
        name: product.name,
        isActive: product.isActive
    };
};

module.exports = {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    updateProductByIdService,
    updateProductStatusByIdService,
    updateProductFeaturedStatusByIdService,
    deleteProductByIdService
};
