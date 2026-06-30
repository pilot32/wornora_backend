const Category = require('./category.model');
const slugify = require('slugify');
const ApiError = require('../../utils/apiError');


const createCategoryService = async (data) => {
    const generatedSlug = data.slug
        ? slugify(data.slug, { lower: true, strict: true })
        : slugify(data.name || '', { lower: true, strict: true });

    const existingCategory = await Category.findOne({
        $or: [{ name: data.name }, { slug: generatedSlug }]
    });

    if (existingCategory) {
        throw new ApiError(400, 'Category with the same name or slug already exists');
    }

    const category = await Category.create({
        name: data.name,
        slug: generatedSlug,
        isActive: data.isActive,
        image: data.image
    });

    return category;
};

const getCategoryByIdService = async (id) => {
    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    return category;
};

const getAllCategoryService = async (query) => {
    const { isActive, search } = query;

    const filter = {};
    if (isActive !== undefined) {
        filter.isActive = isActive;
    }
    if (search) {
        filter.name = {
            $regex: search,
            $options: 'i'
        };
    }

    const categories = await Category.find(filter)
        .sort({ createdAt: -1 });

    if (!categories || categories.length === 0) {
        throw new ApiError(404, 'No categories found');
    }

    return categories;
};

const deleteCategoryByIdService = async (id) => {
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    return category;
};

const updateCategoryByIdService = async (id, data) => {
    const updateData = { ...data };

    if (updateData.name && !updateData.slug) {
        updateData.slug = slugify(updateData.name, {
            lower: true,
            strict: true
        });
    } else if (updateData.slug) {
        updateData.slug = slugify(updateData.slug, { lower: true, strict: true });
    }

    if (updateData.name || updateData.slug) {
        const existingCategory = await Category.findOne({
            _id: { $ne: id },
            $or: [
                { name: updateData.name },
                { slug: updateData.slug }
            ]
        });

        if (existingCategory) {
            throw new ApiError(400, 'Category with same name or slug already exists');
        }
    }

    const category = await Category.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    return category;
};

const updateCategoryStatusByIdService = async (id, isActive) => {
    const category = await Category.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
    );

    if (!category) {
        throw new ApiError(404, 'Category with id does not exist');
    }

    return category;
};

module.exports = {
    createCategoryService,
    getCategoryByIdService,
    getAllCategoryService,
    deleteCategoryByIdService,
    updateCategoryByIdService,
    updateCategoryStatusByIdService
};