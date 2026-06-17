const Subcategory = require('./subcategory.model');
const Category = require('../categories/category.model');
const slugify = require('slugify');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../utils/ApiError');
const { ApiResponse } = require('../../utils/ApiResponse');

const createSubCategory = asyncHandler(async (req, res) => {
    const { name, categoryId, image } = req.body;
    if (!name || !categoryId) {
        throw new ApiError(400, "name and id required");
    }
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(404, "category not found");
    }
    //if catgory exist generate slug
    const generatedSlug = slugify(name,
        {
            lower: true,
            strict: true
        });
    //check for duplicates

    const existingSubcategory = await Subcategory.findOne(
        {
            categoryId,
            $or: [
                { name },
                { slug: generatedSlug }
            ]
        });
    if (existingSubcategory) {
        throw new ApiError(400, 'Subcategory already exists in this category');
    }
    const subcategory = await Subcategory.create({
        name,
        slug: generatedSlug,
        categoryId,
        image,
    });
    return res.status(201).json(
        new ApiResponse(201, subcategory, 'Subcategory created successfully')
    );
});

const getSubCategoriesById = asyncHandler(async (req, res) => {
    const subcategory = await Subcategory
        .findById(req.params.id)
        .populate('categoryId', 'name');

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    return res.status(200).json(
        new ApiResponse(200, subcategory, 'Subcategory fetched successfully')
    );
});

const getAllSubCategories = asyncHandler(async (req, res) => {
    //user os requiestinf thats why query
    const { categoryId } = req.query;
    const filter = {};
    if (categoryId) {
        filter.categoryId = categoryId;
    }
    //added filter if only the user sends it.
    const subcategories = await Subcategory.find(filter)
        .populate('categoryId', 'name')
        .sort({ name: 1 })
    return res.status(200).json(
        new ApiResponse(200, subcategories, 'Subcategories fetched successfully')
    );
});

const updateSubCategoryById = asyncHandler(async (req, res) => {
    const updateData = { ...req.body };
    if (updateData.name) {
        updateData.slug = slugify(
            updateData.name,
            {
                lower: true,
                strict: true
            }
        )
    }
    const existingSubcategory = await Subcategory.findOne({
        _id: { $ne: req.params.id },
        categoryId: updateData.categoryId,
        $or: [
            { name: updateData.name },
            { slug: updateData.slug },
        ]
    });
    if (existingSubcategory) {
        throw new ApiError(400, "Suacatgeory already exists");
    }
    const subcategory = await Subcategory.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );
    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }
    return res.status(200).json(
        new ApiResponse(200, subcategory, 'Subcategory updated successfully')
    );
});

const deleteSubCategoryById = asyncHandler(async (req, res) => {
    const subcategory =
        await Subcategory.findByIdAndUpdate(
            req.params.id,
            {
                isActive: false
            },
            {
                new: true
            }
        );

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }
    return res.status(200).json(
        new ApiResponse(200, subcategory, 'Subcategory disabled successfully')
    );
});

const updateStatusSubCategoryById = asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    if (
        typeof isActive !== 'boolean'
    ) {
        throw new ApiError(400, 'isActive must be boolean');
    }

    const subcategory =
        await Subcategory.findByIdAndUpdate(
            req.params.id,
            {
                isActive
            },
            {
                new: true
            }
        );

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }
    return res.status(200).json(
        new ApiResponse(200, subcategory, 'Status updated successfully')
    );
});

module.exports = {
    createSubCategory,
    deleteSubCategoryById,
    getAllSubCategories,
    getSubCategoriesById,
    updateSubCategoryById,
    updateStatusSubCategoryById,
}
