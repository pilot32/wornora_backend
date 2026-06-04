const express = require('express');
const router = express.Router();
const {createCategory,deleteCategoryById,getCategoryById,getAllCategory,updateCategoryById,updateCategoryStatusById} = require('./category.controller');

const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');


router.post('/',authMiddleware,roleMiddleware('ADMIN'),createCategory);
router.get("/", getAllCategory);

router.get("/:id", getCategoryById);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateCategoryById
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteCategoryById
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateCategoryStatusById
);



module.exports = router;