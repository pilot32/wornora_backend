const Subcategory = require('./subcategory.model');
const slugify = require('slugify');
const ApiError = require('../../utils/apiError');
const Category = require('../categories/category.model');

const createSubCategoryService = async (data) => {
    const category = await Category.findById(data.categoryId);
    if (!category) {
        throw new ApiError(404, "category not found");
    }
    const generatedSlug = slugify(data.name, {
            lower: true,
            strict: true
    });
    // check for duplicates
    const existingSubcategory = await Subcategory.findOne({
        $or: [
            { name: data.name },
            { slug: generatedSlug }
        ]
    });
    if (existingSubcategory) {
        throw new ApiError(400, 'Subcategory already exists in this category');
    }

    const subcategory = await Subcategory.create({
        name: data.name,
        slug: generatedSlug,
        categoryId: data.categoryId,
        image: data.image || '',
    });
    // populate for response 
    await subcategory.populate('categoryId', 'name');
    return subcategory;
};

const getSubCategoriesByIdService = async (id) => {
    const subcategory = await Subcategory
        .findById(id)
        .populate('categoryId', 'name');

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    return subcategory;
};

const getAllSubCategoriesService = async (query) => {
    const { categoryId, isActive, search } = query;
    
    const filter = {};
    if (categoryId) {
        filter.categoryId = categoryId;
    }
    if (isActive !== undefined) {
        filter.isActive = (isActive === 'true' || isActive === true);
    }
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } }
        ];
    }

    const subcategories = await Subcategory.find(filter)
        .populate('categoryId', 'name')
        .sort({ name: 1 });

    return subcategories;
};

const updateSubCategoryByIdService = async (id, data) => {
    const updateData = { ...data };
    
    // slug regeneration
    if (updateData.name && !updateData.slug) {
        updateData.slug = slugify(updateData.name, { lower: true, strict: true });
    } else if (updateData.slug) {
        updateData.slug = slugify(updateData.slug, { lower: true, strict: true });
    }

    if (updateData.name || updateData.slug) {
        const orConditions = [];
        if (updateData.name) orConditions.push({ name: updateData.name });
        if (updateData.slug) orConditions.push({ slug: updateData.slug });

        const existingSubcategory = await Subcategory.findOne({
            _id: { $ne: id },
            $or: orConditions
        });
        if (existingSubcategory) {
            throw new ApiError(400, "Subcategory with same name or slug already exists");
        }
    }

    const subcategory = await Subcategory.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    return subcategory;
};

const deleteSubCategoryByIdService = async (id) => {
    const subcategory = await Subcategory.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    return subcategory;
};

const updateStatusSubCategoryByIdService = async (id, isActive) => {
    if (typeof isActive !== 'boolean') {
        throw new ApiError(400, 'isActive must be boolean');
    }

    const subcategory = await Subcategory.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
    ).populate('categoryId', 'name');

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    return subcategory;
};

module.exports = {
    createSubCategoryService,
    getSubCategoriesByIdService,
    getAllSubCategoriesService,
    updateSubCategoryByIdService,
    deleteSubCategoryByIdService,
    updateStatusSubCategoryByIdService
};