const mongoose = require('mongoose');
const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Product = require('../products/products.model');
const User = require('../users/user.models');
const { getAddressByIdService } = require('../address/address.service');
const {
    validateCouponForCartService
} = require('../coupons/coupon.service');
const ORDER_STATUS = require('../../constants/order.constants');
const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../../constants/payment.constants');
const ApiError = require('../../utils/apiError');

const getEffectivePrice = (product) => product.discountedPrice ?? product.price;

const generateOrderNumber = () => {
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

    return `ORD-${datePart}-${randomPart}`;
};

const buildAddressSnapshot = (address, email) => ({
    fullName: address.fullName,
    email,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country || 'India'
});

const buildOrderItems = (cart) => cart.items.map((item) => {
    const product = item.productId;
    const unitPrice = getEffectivePrice(product);

    return {
        productId: product._id,
        name: product.name,
        slug: product.slug,
        originalPrice: product.price,
        unitPrice,
        image: product.images?.[0] || '',
        quantity: item.quantity,
        totalPrice: unitPrice * item.quantity
    };
});

const validateCartItems = (cart) => {
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, 'Cart is empty');
    }

    cart.items.forEach((item) => {
        const product = item.productId;

        if (!product) {
            throw new ApiError(400, 'A product in your cart is no longer available');
        }

        if (!product.isActive) {
            throw new ApiError(400, `${product.name} is no longer available`);
        }

        if (product.stock < item.quantity) {
            throw new ApiError(400, `Only ${product.stock} item(s) of ${product.name} are in stock`);
        }
    });
};

const createUniqueOrderNumber = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const orderNumber = generateOrderNumber();
        const exists = await Order.exists({ orderNumber });

        if (!exists) {
            return orderNumber;
        }
    }

    throw new ApiError(500, 'Could not generate order number');
};

const createCodOrderService = async (userId, data) => {
    const paymentMethod = data.paymentMethod || PAYMENT_METHODS.COD;

    if (paymentMethod !== PAYMENT_METHODS.COD) {
        throw new ApiError(400, 'Only COD orders are supported right now');
    }

    const [user, cart, shippingAddress, billingAddress] = await Promise.all([
        User.findById(userId),
        Cart.findOne({ userId }).populate('items.productId'),
        getAddressByIdService(userId, data.shippingAddressId),
        getAddressByIdService(userId, data.billingAddressId || data.shippingAddressId)
    ]);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    validateCartItems(cart);

    const orderItems = buildOrderItems(cart);
    const subTotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    let appliedCoupon = {
        code: null,
        discountType: null,
        discountValue: null
    };
    let discountAmount = 0;

    if (cart.appliedCoupon) {
        const couponResult = await validateCouponForCartService(cart.appliedCoupon, subTotal);
        appliedCoupon = {
            code: couponResult.coupon.code,
            discountType: couponResult.coupon.discountType,
            discountValue: couponResult.coupon.discountValue
        };
        discountAmount = couponResult.discount;
    }

    const deliveryCharges = 0;
    const tax = 0;
    const grandTotal = Math.max(subTotal - discountAmount + deliveryCharges + tax, 0);
    const orderNumber = await createUniqueOrderNumber();

    const session = await mongoose.startSession();

    try {
        let createdOrder;

        await session.withTransaction(async () => {
            for (const item of cart.items) {
                const updateResult = await Product.updateOne(
                    {
                        _id: item.productId._id,
                        stock: { $gte: item.quantity },
                        isActive: true
                    },
                    { $inc: { stock: -item.quantity } },
                    { session }
                );

                if (updateResult.modifiedCount !== 1) {
                    throw new ApiError(400, `${item.productId.name} is no longer available in the requested quantity`);
                }
            }

            const [order] = await Order.create([{
                userId,
                orderNumber,
                orderItems,
                shippingAddress: buildAddressSnapshot(shippingAddress, user.email),
                billingAddress: buildAddressSnapshot(billingAddress, user.email),
                appliedCoupon,
                subTotal,
                discountAmount,
                deliveryCharges,
                tax,
                grandTotal,
                orderStatus: ORDER_STATUS.PLACED,
                payment: {
                    method: PAYMENT_METHODS.COD,
                    status: PAYMENT_STATUS.PENDING
                },
                deliveryNotes: data.deliveryNotes || ''
            }], { session });

            await Cart.updateOne(
                { _id: cart._id },
                { items: [], appliedCoupon: null },
                { session }
            );

            createdOrder = order;
        });

        return createdOrder;
    } finally {
        await session.endSession();
    }
};

const getMyOrdersService = async (userId) => {
    return Order.find({ userId })
        .sort({ createdAt: -1 })
        .select('-adminNote')
        .lean();
};

const getOrderByIdService = async (userId, id) => {
    const order = await Order.findOne({ _id: id, userId }).select('-adminNote');

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    return order;
};

module.exports = {
    createCodOrderService,
    getMyOrdersService,
    getOrderByIdService
};
