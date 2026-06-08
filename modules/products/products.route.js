const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    updateProductStatusById,
} = require('./products.controller');
const {
    uploadImages
} = require('./upload.controller');

router.post('/',
    authMiddleware,
    roleMiddleware('ADMIN'),
    createProduct
);
router.get(
    '/',
    getAllProducts
);
router.get(
    "/:id",
    getProductById
);
router.patch(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateProductById,
);
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateProductStatusById,
    
);
//rote to upload uploadImages
router.post(
    '/upload',
    authMiddleware,
    roleMiddleware('ADMIN'),
    upload.array('images',5),
    uploadImages
)
module.exports=router;