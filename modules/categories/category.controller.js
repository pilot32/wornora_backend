const Category = require('./category.model');
const slugify = require('slugify');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../utils/ApiError');
const { ApiResponse } = require('../../utils/ApiResponse');

const createCategory = asyncHandler(async (req, res) => {
    const { name, slug, isActive } = req.body;
    const generatedSlug = slug
        ? slugify(slug, { lower: true, strict: true })
        : slugify(name || '', { lower: true, strict: true });

    if (!name) {
        throw new ApiError(400, "name is required");
    }

    const existingCategory = await Category.findOne({
        $or: [{ name }, { slug: generatedSlug }]
    });
    if (existingCategory) {
        throw new ApiError(400, "category with the same name or slug already exists");
    }
    const category = await Category.create({
        name,
        slug: generatedSlug,
        isActive,
    });
    return res.status(201).json(
        new ApiResponse(201, category, "Category created")
    );
});

const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
        throw new ApiError(404, "category not found");
    }
    return res.status(200).json(
        new ApiResponse(200, category, "category fetched successfully")
    );
});

const getAllCategory = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    if (!categories || categories.length === 0) {
        throw new ApiError(404, "No categories found");
    }
    return res.status(200).json(
        new ApiResponse(200, categories, "categories fetched successqully")
    );
});

const deleteCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
        throw new ApiError(404, "category not found");
    }
    return res.status(200).json(
        new ApiResponse(200, null, "category deleted successfully")
    );
});

const updateCategoryById = asyncHandler(async (req, res) => {
    const updateData = { ...req.body };

    // If name changes, regenerate slug
    if (updateData.name) {
        updateData.slug = slugify(
            updateData.name,
            {
                lower: true,
                strict: true
            }
        );
    }
    console.log(updateData);
    console.log(req.params.id);
    // Check for duplicate name/slug
    if (updateData.name || updateData.slug) {
        const existingCategory = await Category.findOne({
            _id: { $ne: req.params.id },
            $or: [
                { name: updateData.name },
                { slug: updateData.slug }
            ]
        });
        console.log(existingCategory);
        if (existingCategory) {
            throw new ApiError(400, 'Category with same name or slug already exists');
        }
    }

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    return res.status(200).json(
        new ApiResponse(200, category, 'Category updated successfully')
    );
});

const updateCategoryStatusById = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
        throw new ApiError(400, "isActive must be of boolean");
    }
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            isActive
        },
        {
            new: true
        }
    );
    if (!category) {
        throw new ApiError(404, "Category with id do not exist");
    }
    return res.status(200).json(
        new ApiResponse(200, category, "Category status updated successfully")
    );
});

module.exports = {
    createCategory,
    getCategoryById,
    getAllCategory,
    deleteCategoryById,
    updateCategoryById,
    updateCategoryStatusById
}
