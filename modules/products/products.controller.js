const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    updateProductByIdService,
    updateProductStatusByIdService,
    updateProductFeaturedStatusByIdService,
    deleteProductByIdService
} = require('./products.service');




const createProduct = asyncHandler(async (req, res) => {
    const product = await createProductService(req.body);

    res.status(201).json(
        new ApiResponse(201, 'Product created successfully', product)
    );
});

const getAllProducts = asyncHandler(async (req, res) => {
    const result = await getAllProductsService(req.query);

    res.status(200).json(
        new ApiResponse(200, 'Products fetched successfully', result)
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await getProductByIdService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Product fetched successfully', product)
    );
});

const updateProductById = asyncHandler(async (req, res) => {
    const product = await updateProductByIdService(req.params.id, req.body);

    res.status(200).json(
        new ApiResponse(200, 'Product updated successfully', product)
    );
});

const updateProductStatusById = asyncHandler(async (req, res) => {
    const product = await updateProductStatusByIdService(req.params.id, req.body.isActive);

    res.status(200).json(
        new ApiResponse(200, 'Status updated successfully', product)
    );
});

//update the featured status 

const updateProductFeaturedStatusById = asyncHandler(async (req, res) => {
    const product = await updateProductFeaturedStatusByIdService(req.params.id, req.body.featured);

    res.status(200).json(
        new ApiResponse(200, `Product ${req.body.featured ? 'featured' : 'unfeatured'} successfully`, product)
    );
});

//soft delete the product by id

const deleteProductById = asyncHandler(async (req, res) => {
    const product = await deleteProductByIdService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Product disabled successfully', product)
    );
});

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    updateProductStatusById,
    updateProductFeaturedStatusById,
    deleteProductById
}