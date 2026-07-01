const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const USER_ROLES = require('../../constants/roles');
const {
  createCategory,
  deleteCategoryById,
  getCategoryById,
  getAllCategory,
  updateCategoryById,
  updateCategoryStatusById
} = require('./category.controller');
const {
    createCategorySchema, 
    getAllCategoriesSchema,
    updateCategorySchema,
    idParamSchema,
    updateCategoryStatusSchema  
} = require('../../validations/categories.validation');

router.post(
  '/',
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  validationMiddleware(createCategorySchema),
  createCategory
);
router.get(
  "/", 
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  validationMiddleware(getAllCategoriesSchema, 'query'),
  getAllCategory
);

router.get(
  "/:id", 
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  validationMiddleware(idParamSchema, 'params'),
  getCategoryById
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  validationMiddleware(idParamSchema, 'params'),
  validationMiddleware(updateCategorySchema),
  updateCategoryById
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  validationMiddleware(idParamSchema, 'params'),
  deleteCategoryById
);
router.patch(
  "/:id/status", 
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  validationMiddleware(idParamSchema, 'params'),
  validationMiddleware(updateCategoryStatusSchema),
  updateCategoryStatusById
);



module.exports = router;