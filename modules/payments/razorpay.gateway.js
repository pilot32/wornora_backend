const crypto = require('crypto');
const ApiError = require('../../utils/apiError');

const RAZORPAY_API_URL = process.env.RAZORPAY_API_URL || 'https://api.razorpay.com/v1';

const getCredentials = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new ApiError(503, 'Razorpay test keys are not configured on the server');
    }

    return { keyId, keySecret };
};

const getAuthorizationHeader = ({ keyId, keySecret }) => (
    `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
);

const getRazorpayKeyId = () => getCredentials().keyId;

const createRazorpayOrder = async ({ amount, receipt, notes }) => {
    const credentials = getCredentials();
    const response = await fetch(`${RAZORPAY_API_URL}/orders`, {
        method: 'POST',
        headers: {
            Authorization: getAuthorizationHeader(credentials),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount,
            currency: 'INR',
            receipt,
            notes
        })
    });
    const payload = await response.json();

    if (!response.ok) {
        throw new ApiError(502, payload.error?.description || 'Razorpay could not create a payment order');
    }

    return {
        razorpayOrder: payload,
        keyId: credentials.keyId
    };
};

const verifyRazorpayPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    const { keySecret } = getCredentials();
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(razorpaySignature, 'utf8');

    return expectedBuffer.length === receivedBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

module.exports = {
    createRazorpayOrder,
    getRazorpayKeyId,
    verifyRazorpayPaymentSignature
};
