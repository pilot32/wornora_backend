const mongoose = require('mongoose');
const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Product = require('../products/products.model');
const User = require('../users/user.models');
const { getAddressByIdService } = require('../address/address.service');
const {
    validateCouponForCartService
} = require('../coupons/coupon.service');
const { quoteCartShipment } = require('../shipping/shipping.service');
const ORDER_STATUS = require('../../constants/order.constants');
const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../../constants/payment.constants');
const USER_ROLES = require('../../constants/roles');
const ApiError = require('../../utils/apiError');
const {
    notifyOrderPlaced,
    notifyOrderStatusChanged,
} = require('../notifications/order-notification.service');

const getEffectivePrice = (product) => product.discountedPrice ?? product.price;
const STOCK_RESTORE_STATUSES = [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED];
const FINAL_STATUSES = [ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED];
const STATUS_TRANSITIONS = {
    [ORDER_STATUS.PLACED]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURNED],
    [ORDER_STATUS.CANCELLED]: [],
    [ORDER_STATUS.RETURNED]: []
};

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

const buildShippingQuoteSnapshot = (quote) => ({
    provider: quote.provider,
    providerQuoteId: quote.providerQuoteId,
    courierId: quote.recommendedCourier.courierId,
    courierName: quote.recommendedCourier.courierName,
    chargeableWeightKg: quote.shipment.chargeableWeightKg,
    estimatedDeliveryDays: quote.recommendedCourier.estimatedDeliveryDays,
    isEstimated: quote.isEstimated,
    quotedAt: new Date()
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

    const shippingQuote = await quoteCartShipment({
        cart,
        shippingAddress,
        paymentMethod,
        declaredValue: Math.max(subTotal - discountAmount, 0)
    });
    const deliveryCharges = shippingQuote.deliveryCharge;
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
                shippingQuote: buildShippingQuoteSnapshot(shippingQuote),
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

        notifyOrderPlaced(createdOrder);
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

const getOrderByIdService = async (userId, id, role) => {
    const filter = role === USER_ROLES.ADMIN ? { _id: id } : { _id: id, userId };
    const select = role === USER_ROLES.ADMIN ? '' : '-adminNote';
    const order = await Order.findOne(filter).select(select);

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    return order;
};

const getAllOrdersService = async (query) => {
    const {
        orderStatus,
        paymentStatus,
        page = 1,
        limit = 10,
        search
    } = query;

    const filter = {};

    if (orderStatus) {
        filter.orderStatus = orderStatus;
    }

    if (paymentStatus) {
        filter['payment.status'] = paymentStatus;
    }

    if (search) {
        filter.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'shippingAddress.email': { $regex: search, $options: 'i' } },
            { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
        ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Order.countDocuments(filter)
    ]);

    return {
        orders,
        pagination: {
            currentPage: pageNum,
            limit: limitNum,
            totalItems: total,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1
        }
    };
};

const validateStatusTransition = (currentStatus, nextStatus) => {
    if (currentStatus === nextStatus) {
        return;
    }

    if (FINAL_STATUSES.includes(currentStatus)) {
        throw new ApiError(400, `Cannot update an order that is already ${currentStatus}`);
    }

    const allowedStatuses = STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedStatuses.includes(nextStatus)) {
        throw new ApiError(400, `Cannot change order status from ${currentStatus} to ${nextStatus}`);
    }
};

const updateOrderStatusService = async (id, data) => {
    const session = await mongoose.startSession();

    try {
        let updatedOrder;
        let statusChanged = false;

        await session.withTransaction(async () => {
            const order = await Order.findById(id).session(session);

            if (!order) {
                throw new ApiError(404, 'Order not found');
            }

            validateStatusTransition(order.orderStatus, data.orderStatus);
            statusChanged = order.orderStatus !== data.orderStatus;

            if (
                data.orderStatus === ORDER_STATUS.CANCELLED &&
                STOCK_RESTORE_STATUSES.includes(order.orderStatus)
            ) {
                for (const item of order.orderItems) {
                    await Product.updateOne(
                        { _id: item.productId },
                        { $inc: { stock: item.quantity } },
                        { session }
                    );
                }
            }

            order.orderStatus = data.orderStatus;

            if (data.trackingNumber !== undefined) {
                order.trackingNumber = data.trackingNumber || null;
            }

            if (data.trackingUrl !== undefined) {
                order.trackingUrl = data.trackingUrl || null;
            }

            if (data.adminNote !== undefined) {
                order.adminNote = data.adminNote;
            }

            if (data.orderStatus === ORDER_STATUS.DELIVERED) {
                order.deliveryDate = new Date();
                if (order.payment.method === PAYMENT_METHODS.COD) {
                    order.payment.status = PAYMENT_STATUS.PAID;
                    order.payment.paidAt = new Date();
                }
            }

            await order.save({ session });
            updatedOrder = order;
        });

        if (statusChanged) {
            notifyOrderStatusChanged(updatedOrder);
        }

        return updatedOrder;
    } finally {
        await session.endSession();
    }
};

const cancelMyOrderService = async (userId, id, data) => {
    const session = await mongoose.startSession();

    try {
        let cancelledOrder;

        await session.withTransaction(async () => {
            const order = await Order.findOne({ _id: id, userId }).session(session);

            if (!order) {
                throw new ApiError(404, 'Order not found');
            }

            if (!STOCK_RESTORE_STATUSES.includes(order.orderStatus)) {
                throw new ApiError(400, `Cannot cancel an order that is already ${order.orderStatus}`);
            }

            if (order.payment.status === PAYMENT_STATUS.PAID) {
                throw new ApiError(400, 'Paid orders cannot be cancelled from customer account');
            }

            for (const item of order.orderItems) {
                await Product.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: item.quantity } },
                    { session }
                );
            }

            order.orderStatus = ORDER_STATUS.CANCELLED;
            order.adminNote = data.cancellationReason
                ? `Customer cancellation reason: ${data.cancellationReason}`
                : order.adminNote;

            await order.save({ session });
            cancelledOrder = order;
        });

        notifyOrderStatusChanged(cancelledOrder);
        return cancelledOrder;
    } finally {
        await session.endSession();
    }
};

module.exports = {
    createCodOrderService,
    getMyOrdersService,
    getOrderByIdService,
    getAllOrdersService,
    updateOrderStatusService,
    cancelMyOrderService
};
