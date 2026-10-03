const Cart = require('../cart/cart.model');
const { getAddressByIdService } = require('../address/address.service');
const { validateCouponForCartService } = require('../coupons/coupon.service');
const { getShippingProvider } = require('./shipping-provider.service');
const ApiError = require('../../utils/apiError');

const DEFAULT_PACKAGE_DIMENSIONS = {
    weightKg: 0.5,
    lengthCm: 25,
    widthCm: 20,
    heightCm: 5
};

const PICKUP_POSTAL_CODE = process.env.SHIPPING_PICKUP_POSTAL_CODE || '751003';

const roundMeasurement = (value) => Math.round(value * 100) / 100;

const getDimensionsForProduct = (product) => product.shippingDimensions || DEFAULT_PACKAGE_DIMENSIONS;

const buildShipmentFromCart = (cart) => {
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, 'Cart is empty');
    }

    const missingProductDimensions = [];
    let totalWeightKg = 0;
    let lengthCm = 0;
    let widthCm = 0;
    let heightCm = 0;

    cart.items.forEach((item) => {
        const product = item.productId;
        if (!product || !product.isActive) {
            throw new ApiError(400, 'A product in your cart is no longer available');
        }

        const dimensions = getDimensionsForProduct(product);
        if (!product.shippingDimensions) {
            missingProductDimensions.push({
                productId: product._id,
                name: product.name
            });
        }

        totalWeightKg += dimensions.weightKg * item.quantity;
        lengthCm = Math.max(lengthCm, dimensions.lengthCm);
        widthCm = Math.max(widthCm, dimensions.widthCm);
        heightCm += dimensions.heightCm * item.quantity;
    });

    const volumetricWeightKg = (lengthCm * widthCm * heightCm) / 5000;
    const chargeableWeightKg = Math.max(totalWeightKg, volumetricWeightKg);

    return {
        actualWeightKg: roundMeasurement(totalWeightKg),
        volumetricWeightKg: roundMeasurement(volumetricWeightKg),
        chargeableWeightKg: roundMeasurement(chargeableWeightKg),
        dimensions: {
            lengthCm: roundMeasurement(lengthCm),
            widthCm: roundMeasurement(widthCm),
            heightCm: roundMeasurement(heightCm)
        },
        usedFallbackDimensions: missingProductDimensions.length > 0,
        missingProductDimensions
    };
};

const selectRecommendedCourier = (quote) => quote.courierOptions.find((courier) => courier.recommended)
    || quote.courierOptions[0];

const quoteCartShipment = async ({ cart, shippingAddress, paymentMethod, declaredValue }) => {
    const shipment = buildShipmentFromCart(cart);
    const provider = getShippingProvider();
    const quote = await provider.getQuote({
        pickupPostalCode: PICKUP_POSTAL_CODE,
        deliveryPostalCode: shippingAddress.postalCode,
        paymentMethod,
        declaredValue,
        shipment
    });
    const recommendedCourier = selectRecommendedCourier(quote);

    return {
        ...quote,
        recommendedCourier,
        deliveryCharge: recommendedCourier.deliveryCharge
    };
};

const getShippingQuoteForCartService = async (userId, data) => {
    const [cart, shippingAddress] = await Promise.all([
        Cart.findOne({ userId }).populate('items.productId', 'name isActive shippingDimensions'),
        getAddressByIdService(userId, data.shippingAddressId)
    ]);

    const subTotal = cart?.items.reduce(
        (sum, item) => sum + ((item.priceAddition || 0) * item.quantity),
        0
    ) || 0;
    let discountAmount = 0;

    if (cart?.appliedCoupon) {
        const couponResult = await validateCouponForCartService(cart.appliedCoupon, subTotal);
        discountAmount = couponResult.discount;
    }

    return quoteCartShipment({
        cart,
        shippingAddress,
        paymentMethod: data.paymentMethod,
        declaredValue: Math.max(subTotal - discountAmount, 0)
    });
};

module.exports = {
    getShippingQuoteForCartService,
    quoteCartShipment
};
