const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    updateProductStatusById,
    updateProductFeaturedStatusById,
    deleteProductById
} = require('./products.controller');
const {
    uploadImage
} = require('./upload.controller');
const {
    createProductSchema,
    updateProductSchema,
    updateStatusSchema,
    updateFeaturedSchema,
    uploadImageSchema,
    idParamSchema,
    getAllProductsSchema
} = require('../../validations/products.validation');

//route to create product 
router.post(
    '/',
    authMiddleware,
    roleMiddleware('ADMIN'),
    validationMiddleware(createProductSchema),
    createProduct
);

//route to get all products
router.get(
    '/',
    validationMiddleware(getAllProductsSchema, 'query'),
    getAllProducts
);

// get by id
router.get(
    "/:id",
    validationMiddleware(idParamSchema, 'params'),
    getProductById
);

//update the product by id 
router.patch(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updateProductSchema),
    updateProductById
);

//update the product status by id
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updateStatusSchema),
    updateProductStatusById
);

//update the product featured status by id
router.patch(
    "/:id/featured",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updateFeaturedSchema),
    updateProductFeaturedStatusById
);

//route to upload uploadImages
router.post(
    '/upload',
    upload.single('image'),
    uploadImage
);

//soft delete the product by id
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(idParamSchema, 'params'),
    deleteProductById
);

module.exports = router;