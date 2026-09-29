const PAYMENT_STATUS = Object.freeze({
    PENDING: 'PENDING',
    PAID: 'PAID',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
});

const PAYMENT_METHODS = Object.freeze({
    RAZORPAY: 'RAZORPAY',
    COD: 'COD',

});

module.exports = {
    PAYMENT_STATUS,
    PAYMENT_METHODS
}
