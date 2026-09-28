const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const USER_ROLES = require('../../constants/roles');

const {
    getHeroSlides,
    createHeroSlide,
    updateHeroSlide,
    updateHeroSlideStatus,
    deleteHeroSlide,
    getPromoBanners,
    createPromoBanner,
    updatePromoBanner,
    updatePromoBannerStatus,
    deletePromoBanner,
    getCategoryTiles,
    createCategoryTile,
    updateCategoryTile,
    updateCategoryTileStatus,
    deleteCategoryTile,
} = require('./home.controller');

const {
    idParamSchema,
    statusSchema,
    createHeroSlideSchema,
    updateHeroSlideSchema,
    createPromoBannerSchema,
    updatePromoBannerSchema,
    createCategoryTileSchema,
    updateCategoryTileSchema,
} = require('../../validations/home.validation');

// ─── Hero Slides ─────────────────────────────────────────────────────────────

// Public: fetch active hero slides (supports ?activeOnly=false for admin preview)
router.get('/hero-slides', getHeroSlides);

// Admin: create a new hero slide
router.post(
    '/hero-slides',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(createHeroSlideSchema),
    createHeroSlide
);

// Admin: update a hero slide by ID
router.patch(
    '/hero-slides/:id',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updateHeroSlideSchema),
    updateHeroSlide
);

// Admin: toggle isActive status of a hero slide
router.patch(
    '/hero-slides/:id/status',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(statusSchema),
    updateHeroSlideStatus
);

// Admin: permanently delete a hero slide
router.delete(
    '/hero-slides/:id',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(idParamSchema, 'params'),
    deleteHeroSlide
);

// ─── Promo Banners ───────────────────────────────────────────────────────────

// Public: fetch active promo banners
router.get('/promo-banners', getPromoBanners);

// Admin: create a new promo banner
router.post(
    '/promo-banners',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(createPromoBannerSchema),
    createPromoBanner
);

// Admin: update a promo banner by ID
router.patch(
    '/promo-banners/:id',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updatePromoBannerSchema),
    updatePromoBanner
);

// Admin: toggle isActive status of a promo banner
router.patch(
    '/promo-banners/:id/status',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(statusSchema),
    updatePromoBannerStatus
);

// Admin: permanently delete a promo banner
router.delete(
    '/promo-banners/:id',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(idParamSchema, 'params'),
    deletePromoBanner
);

// ─── Category Tiles ──────────────────────────────────────────────────────────

// Public: fetch active category tiles
router.get('/category-tiles', getCategoryTiles);

// Admin: create a new category tile
router.post(
    '/category-tiles',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(createCategoryTileSchema),
    createCategoryTile
);

// Admin: update a category tile by ID
router.patch(
    '/category-tiles/:id',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updateCategoryTileSchema),
    updateCategoryTile
);

// Admin: toggle isActive status of a category tile
router.patch(
    '/category-tiles/:id/status',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(statusSchema),
    updateCategoryTileStatus
);

// Admin: permanently delete a category tile
router.delete(
    '/category-tiles/:id',
    authMiddleware,
    roleMiddleware(USER_ROLES.ADMIN),
    validationMiddleware(idParamSchema, 'params'),
    deleteCategoryTile
);

module.exports = router;
