const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    updateProductStatusById,
} = require('./products.controller');


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

module.exports=router;