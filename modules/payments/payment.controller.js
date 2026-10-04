const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const {
    createRazorpayPaymentOrderService,
    verifyRazorpayPaymentService
} = require('../order/order.service');

const createRazorpayPaymentOrder = asyncHandler(async (req, res) => {
    const paymentOrder = await createRazorpayPaymentOrderService(req.user.userId, req.body);

    res.status(201).json(
        new ApiResponse(201, 'Razorpay payment order created successfully', paymentOrder)
    );
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const order = await verifyRazorpayPaymentService(req.user.userId, req.body);

    res.status(200).json(
        new ApiResponse(200, 'Payment verified and order placed successfully', { order })
    );
});

module.exports = {
    createRazorpayPaymentOrder,
    verifyRazorpayPayment
};
