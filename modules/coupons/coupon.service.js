const Coupon = require('./coupon.model');
const ApiError = require('../../utils/apiError');

const normalizeCouponCode = (code) => code.trim().toUpperCase();

const calculateCouponDiscount = (coupon, subtotal) => {
    let discount;

    if (coupon.discountType === 'percentage') {
        discount = Math.round((subtotal * coupon.discountValue) / 100);
    } else {
        discount = Math.min(coupon.discountValue, subtotal);
    }

    if (coupon.maximumDiscountAmount !== null && coupon.maximumDiscountAmount !== undefined) {
        discount = Math.min(discount, coupon.maximumDiscountAmount);
    }

    return discount;
};

const validateCouponRules = (coupon) => {
    if (coupon.discountType === 'percentage' && coupon.discountValue > 100) {
        throw new ApiError(400, 'Percentage discount cannot exceed 100');
    }

    if (
        coupon.startDate &&
        coupon.expiryDate &&
        new Date(coupon.startDate).getTime() > new Date(coupon.expiryDate).getTime()
    ) {
        throw new ApiError(400, 'Expiry date must be after start date');
    }

    if (
        coupon.usageLimit !== null &&
        coupon.usageLimit !== undefined &&
        coupon.usedCount > coupon.usageLimit
    ) {
        throw new ApiError(400, 'Usage limit cannot be less than the current used count');
    }
};

const ensureValidCouponDates = (coupon, now = new Date()) => {
    if (coupon.startDate && coupon.startDate > now) {
        throw new ApiError(400, 'Coupon is not active yet');
    }

    if (coupon.expiryDate && coupon.expiryDate < now) {
        throw new ApiError(400, 'Coupon has expired');
    }
};

const createCouponService = async (data) => {
    const couponData = {
        ...data,
        code: normalizeCouponCode(data.code)
    };
    validateCouponRules(couponData);

    const existingCoupon = await Coupon.findOne({ code: couponData.code });
    if (existingCoupon) {
        throw new ApiError(400, 'Coupon code already exists');
    }

    const coupon = await Coupon.create(couponData);
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
    const updateData = { ...data };
    const currentCoupon = await Coupon.findById(id);

    if (!currentCoupon) {
        throw new ApiError(404, 'Coupon not found');
    }

    if (updateData.code) {
        updateData.code = normalizeCouponCode(updateData.code);
        const existingCoupon = await Coupon.findOne({
            _id: { $ne: id },
            code: updateData.code
        });

        if (existingCoupon) {
            throw new ApiError(400, 'Coupon code already exists');
        }
    }

    validateCouponRules({
        ...currentCoupon.toObject(),
        ...updateData
    });

    const coupon = await Coupon.findByIdAndUpdate(
        id, 
        updateData, 
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

const validateCouponForCartService = async (code, subtotal, now = new Date()) => {
    const coupon = await Coupon.findOne({ code: normalizeCouponCode(code) });

    if (!coupon) {
        throw new ApiError(404, 'Invalid coupon code');
    }

    if (!coupon.isActive) {
        throw new ApiError(400, 'Coupon is inactive');
    }

    ensureValidCouponDates(coupon, now);

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new ApiError(400, 'Coupon usage limit reached');
    }

    if (subtotal < (coupon.minimumCartValue || 0)) {
        throw new ApiError(400, `Minimum cart value for this coupon is ${coupon.minimumCartValue}`);
    }

    const discount = calculateCouponDiscount(coupon, subtotal);

    return {
        coupon,
        code: coupon.code,
        discount,
        message: `Coupon ${coupon.code} applied successfully`
    };
};

module.exports = {
    createCouponService,
    getAllCouponsService,
    getCouponByIdService,
    updateCouponByIdService,
    updateCouponStatusByIdService,
    deleteCouponByIdService,
    validateCouponForCartService,
    calculateCouponDiscount
};
