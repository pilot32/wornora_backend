const HeroSlide = require('./heroSlide.model');
const PromoBanner = require('./promoBanner.model');
const CategoryTile = require('./categoryTile.model');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// ─── Hero Slides ─────────────────────────────────────────────────────────────

/**
 * GET /api/home/hero-slides
 * Public – returns active slides sorted by `order` asc.
 * Optional query: ?activeOnly=true (default behaviour is activeOnly)
 */
const getHeroSlides = asyncHandler(async (req, res) => {
    const { activeOnly = 'true' } = req.query;
    const filter = activeOnly === 'false' ? {} : { isActive: true };

    const slides = await HeroSlide.find(filter).sort({ order: 1, createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, 'Hero slides fetched successfully', slides)
    );
});

/**
 * POST /api/home/hero-slides  (Admin)
 */
const createHeroSlide = asyncHandler(async (req, res) => {
    const slide = await HeroSlide.create(req.body);
    res.status(201).json(
        new ApiResponse(201, 'Hero slide created successfully', slide)
    );
});

/**
 * PATCH /api/home/hero-slides/:id  (Admin)
 */
const updateHeroSlide = asyncHandler(async (req, res) => {
    const slide = await HeroSlide.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if (!slide) throw new ApiError('Hero slide not found', 404);

    res.status(200).json(
        new ApiResponse(200, 'Hero slide updated successfully', slide)
    );
});

/**
 * PATCH /api/home/hero-slides/:id/status  (Admin)
 */
const updateHeroSlideStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const slide = await HeroSlide.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
    );
    if (!slide) throw new ApiError('Hero slide not found', 404);

    res.status(200).json(
        new ApiResponse(200, 'Hero slide status updated successfully', slide)
    );
});

/**
 * DELETE /api/home/hero-slides/:id  (Admin)
 */
const deleteHeroSlide = asyncHandler(async (req, res) => {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) throw new ApiError('Hero slide not found', 404);

    res.status(200).json(
        new ApiResponse(200, 'Hero slide deleted successfully')
    );
});

// ─── Promo Banners ───────────────────────────────────────────────────────────

/**
 * GET /api/home/promo-banners
 * Public – returns active banners sorted by `order` asc.
 */
const getPromoBanners = asyncHandler(async (req, res) => {
    const { activeOnly = 'true' } = req.query;
    const filter = activeOnly === 'false' ? {} : { isActive: true };

    const banners = await PromoBanner.find(filter).sort({ order: 1, createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, 'Promotional banners fetched successfully', banners)
    );
});

/**
 * POST /api/home/promo-banners  (Admin)
 */
const createPromoBanner = asyncHandler(async (req, res) => {
    const banner = await PromoBanner.create(req.body);
    res.status(201).json(
        new ApiResponse(201, 'Promotional banner created successfully', banner)
    );
});

/**
 * PATCH /api/home/promo-banners/:id  (Admin)
 */
const updatePromoBanner = asyncHandler(async (req, res) => {
    const banner = await PromoBanner.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if (!banner) throw new ApiError('Promotional banner not found', 404);

    res.status(200).json(
        new ApiResponse(200, 'Promotional banner updated successfully', banner)
    );
});

/**
 * PATCH /api/home/promo-banners/:id/status  (Admin)
 */
const updatePromoBannerStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const banner = await PromoBanner.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
    );
    if (!banner) throw new ApiError('Promotional banner not found', 404);

    res.status(200).json(
        new ApiResponse(200, 'Promotional banner status updated successfully', banner)
    );
});

/**
 * DELETE /api/home/promo-banners/:id  (Admin)
 */
const deletePromoBanner = asyncHandler(async (req, res) => {
    const banner = await PromoBanner.findByIdAndDelete(req.params.id);
    if (!banner) throw new ApiError('Promotional banner not found', 404);

    res.status(200).json(
        new ApiResponse(200, 'Promotional banner deleted successfully')
    );
});

// ─── Category Tiles ──────────────────────────────────────────────────────────

/**
 * GET /api/home/category-tiles
 * Public – returns active category tiles sorted by `order` asc.
 */
const getCategoryTiles = asyncHandler(async (req, res) => {
    const { activeOnly = 'true' } = req.query;
    const filter = activeOnly === 'false' ? {} : { isActive: true };

    const tiles = await CategoryTile.find(filter).sort({ order: 1, createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, 'Category tiles fetched successfully', tiles)
    );
});

/**
 * POST /api/home/category-tiles  (Admin)
 */
const createCategoryTile = asyncHandler(async (req, res) => {
    const existingTile = await CategoryTile.findOne({ slug: req.body.slug });
    if (existingTile) {
        throw new ApiError('A category tile with this slug already exists', 400);
    }

    const tile = await CategoryTile.create(req.body);
    res.status(201).json(
        new ApiResponse(201, 'Category tile created successfully', tile)
    );
});

/**
 * PATCH /api/home/category-tiles/:id  (Admin)
 */
const updateCategoryTile = asyncHandler(async (req, res) => {
    // If slug is being updated, check for duplicates
    if (req.body.slug) {
        const existingTile = await CategoryTile.findOne({
            _id: { $ne: req.params.id },
            slug: req.body.slug,
        });
        if (existingTile) {
            throw new ApiError('A category tile with this slug already exists', 400);
        }
    }

    const tile = await CategoryTile.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if (!tile) throw new ApiError('Category tile not found', 404);

    res.status(200).json(
        new ApiResponse(200, 'Category tile updated successfully', tile)
    );
});

/**
 * PATCH /api/home/category-tiles/:id/status  (Admin)
 */
const updateCategoryTileStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    const tile = await CategoryTile.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
    );
    if (!tile) throw new ApiError('Category tile not found', 404);

    res.status(200).json(
        new ApiResponse(200, 'Category tile status updated successfully', tile)
    );
});

/**
 * DELETE /api/home/category-tiles/:id  (Admin)
 */
const deleteCategoryTile = asyncHandler(async (req, res) => {
    const tile = await CategoryTile.findByIdAndDelete(req.params.id);
    if (!tile) throw new ApiError('Category tile not found', 404);

    res.status(200).json(
        new ApiResponse(200, 'Category tile deleted successfully')
    );
});

module.exports = {
    // Hero Slides
    getHeroSlides,
    createHeroSlide,
    updateHeroSlide,
    updateHeroSlideStatus,
    deleteHeroSlide,
    // Promo Banners
    getPromoBanners,
    createPromoBanner,
    updatePromoBanner,
    updatePromoBannerStatus,
    deletePromoBanner,
    // Category Tiles
    getCategoryTiles,
    createCategoryTile,
    updateCategoryTile,
    updateCategoryTileStatus,
    deleteCategoryTile,
};
