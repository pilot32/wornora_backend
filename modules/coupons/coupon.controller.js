const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const {
    createCouponService,
    getAllCouponsService,
    getCouponByIdService,
    updateCouponByIdService,
    updateCouponStatusByIdService,
    deleteCouponByIdService
} = require('./coupon.service');

/**
 * Function to create a new coupon code 
 */
const createCoupon = asyncHandler(async (req, res) => {
    const coupon = await createCouponService(req.body);

    res.status(201).json(
        new ApiResponse(201, 'Coupon created successfully', coupon)
    );
});

/** 
 * Function to get all the coupons in the list 
 */
const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await getAllCouponsService();

    res.status(200).json(
        new ApiResponse(200, 'Coupons fetched successfully', coupons)
    );
});

/** 
 * Function to get the coupon by ID. 
 */
const getCouponById = asyncHandler(async (req, res) => {
    const coupon = await getCouponByIdService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Coupon fetched successfully', coupon)
    );
});

/** 
 * Function to update the details of the coupon 
 */
const updateCouponById = asyncHandler(async (req, res) => {
    const coupon = await updateCouponByIdService(req.params.id, req.body);

    res.status(200).json(
        new ApiResponse(200, 'Coupon updated successfully', coupon)
    );
});

/**
 * Function to update coupon active status
 */
const updateCouponStatusById = asyncHandler(async (req, res) => {
    const coupon = await updateCouponStatusByIdService(req.params.id, req.body.isActive);

    res.status(200).json(
        new ApiResponse(200, 'Status updated successfully', coupon)
    );
});

/**
 * Function to delete the coupon by ID
 */
const deleteCouponById = asyncHandler(async (req, res) => {
    await deleteCouponByIdService(req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Coupon deleted successfully')
    );
});

module.exports = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCouponById,
    updateCouponStatusById,
    deleteCouponById
};
