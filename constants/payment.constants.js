const PAYMENT_STATUS = Object.freeze({
    PENDING: 'PENDING',
    PAID: 'PAID',
    COMPLETED: 'COMPLETED',
    REFUNDED: 'REFUNDED',
});

const PAYMENT_METHODS = Object.freeze({
    RAZORPAY: 'RAZORPAY',
    COD: 'CASH ON DELIVERY',

});

module.exports = {
    PAYMENT_STATUS,
    PAYMENT_METHODS
}
