const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const { getAdminDashboardService } = require('./admin-dashboard.service');

const getAdminDashboard = asyncHandler(async (req, res) => {
    const dashboard = await getAdminDashboardService();

    res.status(200).json(
        new ApiResponse(200, 'Admin dashboard fetched successfully', dashboard)
    );
});

module.exports = {
    getAdminDashboard,
};
