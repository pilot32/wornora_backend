const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const { getShippingQuoteForCartService } = require('./shipping.service');

const getCartShippingQuote = asyncHandler(async (req, res) => {
    const quote = await getShippingQuoteForCartService(req.user.userId, req.body);

    res.status(200).json(
        new ApiResponse(200, 'Shipping quote fetched successfully', quote)
    );
});

module.exports = {
    getCartShippingQuote
};
