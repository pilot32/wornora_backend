const Order = require('../order/order.model');
const Product = require('../products/products.model');
const User = require('../users/user.models');
const ORDER_STATUS = require('../../constants/order.constants');
const USER_ROLES = require('../../constants/roles');

const REVENUE_STATUSES = [ORDER_STATUS.DELIVERED];
const SALES_STATUSES = [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
];

const getAdminDashboardService = async () => {
    const parsedLowStockThreshold = Number.parseInt(process.env.LOW_STOCK_THRESHOLD || '5', 10);
    const lowStockThreshold = Number.isInteger(parsedLowStockThreshold) && parsedLowStockThreshold >= 0
        ? parsedLowStockThreshold
        : 5;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
        orderStatusCounts,
        totalCustomers,
        totalProducts,
        activeProducts,
        lowStockProductCount,
        lowStockProducts,
        recentOrders,
        revenueSummary,
        revenueByDay,
        topSellingProducts,
    ] = await Promise.all([
        Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        ]),
        User.countDocuments({ role: USER_ROLES.USER }),
        Product.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ isActive: true, stock: { $lte: lowStockThreshold } }),
        Product.find({ isActive: true, stock: { $lte: lowStockThreshold } })
            .sort({ stock: 1, updatedAt: -1 })
            .limit(10)
            .select('name slug stock images')
            .lean(),
        Order.find()
            .sort({ createdAt: -1 })
            .limit(8)
            .select('orderNumber shippingAddress.fullName shippingAddress.email grandTotal orderStatus payment createdAt')
            .lean(),
        Order.aggregate([
            { $match: { orderStatus: { $in: REVENUE_STATUSES } } },
            { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' }, deliveredOrders: { $sum: 1 } } },
        ]),
        Order.aggregate([
            { $match: { orderStatus: { $in: REVENUE_STATUSES }, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$grandTotal' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
            { $match: { orderStatus: { $in: SALES_STATUSES } } },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.productId',
                    name: { $first: '$orderItems.name' },
                    image: { $first: '$orderItems.image' },
                    quantitySold: { $sum: '$orderItems.quantity' },
                    sales: { $sum: '$orderItems.totalPrice' },
                },
            },
            { $sort: { quantitySold: -1, sales: -1 } },
            { $limit: 5 },
        ]),
    ]);

    const statusCounts = orderStatusCounts.reduce((counts, item) => {
        counts[item._id] = item.count;
        return counts;
    }, {});
    const revenue = revenueSummary[0] || { totalRevenue: 0, deliveredOrders: 0 };

    return {
        metrics: {
            totalRevenue: revenue.totalRevenue,
            totalOrders: orderStatusCounts.reduce((sum, item) => sum + item.count, 0),
            deliveredOrders: revenue.deliveredOrders,
            pendingOrders: (statusCounts[ORDER_STATUS.PLACED] || 0) + (statusCounts[ORDER_STATUS.PENDING] || 0),
            confirmedOrders: statusCounts[ORDER_STATUS.CONFIRMED] || 0,
            shippedOrders: (statusCounts[ORDER_STATUS.SHIPPED] || 0) + (statusCounts[ORDER_STATUS.OUT_FOR_DELIVERY] || 0),
            cancelledOrders: statusCounts[ORDER_STATUS.CANCELLED] || 0,
            totalCustomers,
            totalProducts,
            activeProducts,
            lowStockProductCount,
        },
        recentOrders,
        lowStockProducts,
        topSellingProducts,
        revenueByDay,
    };
};

module.exports = {
    getAdminDashboardService,
};
