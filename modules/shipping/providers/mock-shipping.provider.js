const { PAYMENT_METHODS } = require('../../../constants/payment.constants');
const ApiError = require('../../../utils/apiError');

const REMOTE_PINCODE_PREFIXES = ['7', '8', '9'];

const roundCurrency = (value) => Math.round(value * 100) / 100;

const getZone = (pickupPostalCode, deliveryPostalCode) => {
    if (pickupPostalCode.slice(0, 3) === deliveryPostalCode.slice(0, 3)) {
        return 'LOCAL';
    }

    if (REMOTE_PINCODE_PREFIXES.includes(deliveryPostalCode.charAt(0))) {
        return 'REMOTE';
    }

    if (pickupPostalCode.charAt(0) === deliveryPostalCode.charAt(0)) {
        return 'REGIONAL';
    }

    return 'NATIONAL';
};

const getBaseCharge = (zone) => ({
    LOCAL: 45,
    REGIONAL: 65,
    NATIONAL: 85,
    REMOTE: 115
}[zone]);

const getWeightSurcharge = (chargeableWeightKg) => {
    const additionalHalfKgSlabs = Math.max(0, Math.ceil((chargeableWeightKg - 0.5) / 0.5));
    return additionalHalfKgSlabs * 20;
};

const createMockShippingProvider = () => ({
    name: 'mock',

    async getQuote({ pickupPostalCode, deliveryPostalCode, paymentMethod, declaredValue, shipment }) {
        if (!/^\d{6}$/.test(deliveryPostalCode)) {
            throw new ApiError(400, 'A valid six-digit delivery postal code is required');
        }

        const zone = getZone(pickupPostalCode, deliveryPostalCode);
        const baseCharge = getBaseCharge(zone);
        const weightSurcharge = getWeightSurcharge(shipment.chargeableWeightKg);
        const codCharge = paymentMethod === PAYMENT_METHODS.COD
            ? Math.max(20, roundCurrency(declaredValue * 0.02))
            : 0;
        const surfaceCharge = roundCurrency(baseCharge + weightSurcharge + codCharge);
        const expressCharge = roundCurrency(surfaceCharge + 40);

        return {
            provider: 'mock',
            isEstimated: true,
            providerQuoteId: `mock-${pickupPostalCode}-${deliveryPostalCode}-${shipment.chargeableWeightKg}`,
            pickupPostalCode,
            deliveryPostalCode,
            zone,
            serviceable: true,
            shipment,
            courierOptions: [
                {
                    courierId: 'mock-surface',
                    courierName: 'Mock Surface',
                    deliveryCharge: surfaceCharge,
                    estimatedDeliveryDays: { min: 4, max: 7 },
                    codAvailable: true,
                    recommended: true
                },
                {
                    courierId: 'mock-express',
                    courierName: 'Mock Express',
                    deliveryCharge: expressCharge,
                    estimatedDeliveryDays: { min: 2, max: 4 },
                    codAvailable: true,
                    recommended: false
                }
            ]
        };
    }
});

module.exports = {
    createMockShippingProvider
};
