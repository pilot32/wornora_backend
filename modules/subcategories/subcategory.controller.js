const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const { 
    createSubCategoryService,
    getSubCategoriesByIdService,
    getAllSubCategoriesService,
    updateSubCategoryByIdService,
    deleteSubCategoryByIdService,
    updateStatusSubCategoryByIdService
} = require('./subcategory.service');

const createSubCategory = asyncHandler(async (req, res) => {
    const subcategory = await createSubCategoryService(req.body);
    
    res.status(201).json(
        new ApiResponse(201, 'Subcategory created successfully', subcategory)
    );
});

const getSubCategoriesById = asyncHandler(async (req, res) => {
    const subcategory = await getSubCategoriesByIdService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Subcategory fetched successfully', subcategory)
    );
});

const getAllSubCategories = asyncHandler(async (req, res) => {
    const subcategories = await getAllSubCategoriesService(req.query);

    res.status(200).json(
        new ApiResponse(200, 'Subcategories fetched successfully', subcategories)
    );
});

const updateSubCategoryById = asyncHandler(async (req, res) => {
    const subcategory = await updateSubCategoryByIdService(req.params.id, req.body);

    res.status(200).json(
        new ApiResponse(200, 'Subcategory updated successfully', subcategory)
    );
});

const deleteSubCategoryById = asyncHandler(async (req, res) => {
    const subcategory = await deleteSubCategoryByIdService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Subcategory disabled successfully', subcategory)
    );
});

const updateStatusSubCategoryById = asyncHandler(async (req, res) => {
    const subcategory = await updateStatusSubCategoryByIdService(req.params.id, req.body.isActive);

    res.status(200).json(
        new ApiResponse(200, 'Status updated successfully', subcategory)
    );
});

module.exports = {
    createSubCategory,
    deleteSubCategoryById,
    getAllSubCategories,
    getSubCategoriesById,
    updateSubCategoryById,
    updateStatusSubCategoryById,
};