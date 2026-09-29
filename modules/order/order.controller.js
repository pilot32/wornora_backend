const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const {
    createCodOrderService,
    getMyOrdersService,
    getOrderByIdService,
    getAllOrdersService,
    updateOrderStatusService,
    cancelMyOrderService
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
    const order = await getOrderByIdService(req.user.userId, req.params.id, req.user.role);

    res.status(200).json(
        new ApiResponse(200, 'Order fetched successfully', { order })
    );
});

const getAllOrders = asyncHandler(async (req, res) => {
    const result = await getAllOrdersService(req.query);

    res.status(200).json(
        new ApiResponse(200, 'Orders fetched successfully', result)
    );
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await updateOrderStatusService(req.params.id, req.body);

    res.status(200).json(
        new ApiResponse(200, 'Order status updated successfully', { order })
    );
});

const cancelMyOrder = asyncHandler(async (req, res) => {
    const order = await cancelMyOrderService(req.user.userId, req.params.id, req.body);
    const orderResponse = order.toObject ? order.toObject() : order;
    delete orderResponse.adminNote;

    res.status(200).json(
        new ApiResponse(200, 'Order cancelled successfully', { order: orderResponse })
    );
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelMyOrder
};
