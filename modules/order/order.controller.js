const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const {
    createCodOrderService,
    getMyOrdersService,
    getOrderByIdService
} = require('./order.service');

const createOrder = asyncHandler(async (req, res) => {
    const order = await createCodOrderService(req.user.userId, req.body);

    res.status(201).json(
        new ApiResponse(201, 'Order placed successfully', { order })
    );
});

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await getMyOrdersService(req.user.userId);

    res.status(200).json(
        new ApiResponse(200, 'Orders fetched successfully', { orders })
    );
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await getOrderByIdService(req.user.userId, req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Order fetched successfully', { order })
    );
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById
};
