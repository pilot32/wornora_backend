const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const {
    createCategoryService,
    getCategoryByIdService,
    getAllCategoryService,
    deleteCategoryByIdService,
    updateCategoryByIdService,
    updateCategoryStatusByIdService
} = require('./category.service');

const createCategory = asyncHandler(async (req, res) => {
    const category = await createCategoryService(req.body);
    
    res.status(201).json(
        new ApiResponse(201, "Category created", category)
    );
});

const getCategoryById = asyncHandler(async (req, res) => {
    const category = await getCategoryByIdService(req.params.id);
    
    res.status(200).json(
        new ApiResponse(200, "Category fetched successfully", category)
    );
});

const getAllCategory = asyncHandler(async (req, res) => {
    const categories = await getAllCategoryService(req.query);
    
    res.status(200).json(
        new ApiResponse(200, "Categories fetched successfully", categories)
    );
});

const deleteCategoryById = asyncHandler(async (req, res) => {
    await deleteCategoryByIdService(req.params.id);
    
    res.status(200).json(
        new ApiResponse(200, "Category deleted successfully")
    );
});

const updateCategoryById = asyncHandler(async (req, res) => {
    const category = await updateCategoryByIdService(req.params.id, req.body);

    res.status(200).json(
        new ApiResponse(200, 'Category updated successfully', category)
    );
});

const updateCategoryStatusById = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const category = await updateCategoryStatusByIdService(req.params.id, isActive);
    
    res.status(200).json(
        new ApiResponse(200, "Category status updated successfully", category)
    );
});

module.exports = {
    createCategory,
    getCategoryById,
    getAllCategory,
    deleteCategoryById,
    updateCategoryById,
    updateCategoryStatusById
};