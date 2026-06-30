const Coupon = require('./coupon.model');
const ApiError = require('../../utils/apiError');

const createCouponService = async (data) => {
    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase().trim() });
    if (existingCoupon) {
        throw new ApiError(400, 'Coupon code already exists');
    }

    const coupon = await Coupon.create(data);
    return coupon;
};

const getAllCouponsService = async () => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return coupons;
};

const getCouponByIdService = async (id) => {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }
    return coupon;
};

const updateCouponByIdService = async (id, data) => {
    const coupon = await Coupon.findByIdAndUpdate(
        id, 
        data, 
        { new: true, runValidators: true }
    );
    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }
    return coupon;
};

const updateCouponStatusByIdService = async (id, isActive) => {
    if (typeof isActive !== 'boolean') {
        throw new ApiError(400, 'isActive must be boolean');
    }
    const coupon = await Coupon.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
    );
    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }
    return coupon;
};

const deleteCouponByIdService = async (id) => {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }
    return coupon;
};

module.exports = {
    createCouponService,
    getAllCouponsService,
    getCouponByIdService,
    updateCouponByIdService,
    updateCouponStatusByIdService,
    deleteCouponByIdService
};
