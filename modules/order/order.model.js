const mongoose = require('mongoose');
const ORDER_STATUS = require('../../constants/order.constants');
const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../../constants/payment.constants');

const addressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        trim: true,
    },

    phone: {
        type: String,
        required: true,
        trim: true,
    },

    addressLine1: {
        type: String,
        required: true,
        trim: true,
    },
    addressLine2: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    postalCode: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        default: 'India',
    },
});

const paymentSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: [
            PAYMENT_METHODS.RAZORPAY,
            PAYMENT_METHODS.COD
        ]
    },
    status: {
        type: String,
        enum: [
            PAYMENT_STATUS.PENDING,
            PAYMENT_STATUS.PAID,
            PAYMENT_STATUS.COMPLETED,
            PAYMENT_STATUS.FAILED,
            PAYMENT_STATUS.REFUNDED
        ],
        default: PAYMENT_STATUS.PENDING,
    },
    transactionId: {
        type: String,
        default: null,
    },

    paymentDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },

    paidAt: {
        type: Date,
        default: null
    },

    failureReason: {
        type: String,
        default: null
    },
});

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
    },
    originalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    image: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        required: true,
    },
    totalPrice:{
        type: Number,
        required: true,
        min: 0,
    },
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    orderItems: [orderItemSchema],

    shippingAddress: {
        type: addressSchema,
        required: true
    },

    billingAddress: {
        type: addressSchema,
        required: true
    },

    appliedCoupon:{
        code: {
            type: String,
            default: null,
        },
        discountType: {
            type: String,
            enum: ['percentage','fixed'],
        },
        discountValue: {
            type: Number,
            default: null,
        },
    },

    subTotal: {
        type: Number,
        required: true,
        min: 0 
    },

    deliveryCharges: {
        type: Number,
        default: 0,
        min: 0
    },

    tax: {
        type: Number,
        default: 0,
        min: 0
    },

    grandTotal: {
        type: Number,
        required: true,
        min: 0
    },

    orderStatus: {
        type: String,
        enum: [
            ORDER_STATUS.PENDING,
            ORDER_STATUS.PLACED,
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.SHIPPED,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.CANCELLED,
            ORDER_STATUS.RETURNED,
            ORDER_STATUS.OUT_FOR_DELIVERY
        ],
        default: ORDER_STATUS.PLACED,
        index: true
    },

    payment: {
        type: paymentSchema,
        required: true
    },

    trackingNumber: {
        type: String,
        default: null
    },
    trackingUrl: {
        type: String,
        default: null
    },
    adminNote: {
        type: String,
        default: ''
    },
    deliveryNotes: {
        type: String,
        default: ''
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deliveryDate: {
        type: Date,
        default: null
    },
    currency: {
        type: String,
        default: 'INR'
    },
},
{timestamps: true});

module.exports = mongoose.model('Order', orderSchema);
