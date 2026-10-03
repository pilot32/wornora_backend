const ApiError = require('../../utils/apiError');
const { createMockShippingProvider } = require('./providers/mock-shipping.provider');

const getShippingProvider = () => {
    const providerName = (process.env.SHIPPING_PROVIDER || 'mock').toLowerCase();

    if (providerName === 'mock') {
        return createMockShippingProvider();
    }

    throw new ApiError(503, `Shipping provider "${providerName}" is not configured`);
};

module.exports = {
    getShippingProvider
};
