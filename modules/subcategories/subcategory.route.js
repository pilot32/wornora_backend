const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const router = express.Router();
const {
    createSubCategory,
    getAllSubCategories,
    getSubCategoriesById,
    updateStatusSubCategoryById,
    deleteSubCategoryById,
    updateSubCategoryById
    } = require('./subcategory.controller')

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createSubCategory
);

router.get(
    "/",
    getAllSubCategories
);

router.get(
    "/:id",
    getSubCategoriesById
);

router.patch(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateSubCategoryById
);

router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateStatusSubCategoryById
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteSubCategoryById
);
module.exports =router;