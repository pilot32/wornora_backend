const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const {
    createSubcategorySchema,
    updateSubcategorySchema,
    updateSubcategoryStatusSchema,
    idParamSchema,
    getAllSubcategoriesSchema
} = require('../../validations/subcategories.validation');

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
    validationMiddleware(createSubcategorySchema),
    createSubCategory
);
//public routes
router.get(
    "/",
    validationMiddleware(getAllSubcategoriesSchema, 'query'),
    getAllSubCategories
);
//public route 
router.get(
    "/:id",
    validationMiddleware(idParamSchema, 'params'),
    getSubCategoriesById
);

router.patch(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updateSubcategorySchema),
    updateSubCategoryById
);

router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updateSubcategoryStatusSchema),
    updateStatusSubCategoryById
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validationMiddleware(idParamSchema, 'params'),
    deleteSubCategoryById
);
module.exports =router;