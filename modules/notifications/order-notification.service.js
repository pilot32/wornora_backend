const { sendEmail } = require('./email.service');

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(amount || 0);

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const buildItemsHtml = (order) => order.orderItems.map((item) => (
    `<li>${escapeHtml(item.name)} × ${item.quantity} — ${formatCurrency(item.totalPrice)}</li>`
)).join('');

const buildItemsText = (order) => order.orderItems.map((item) => (
    `- ${item.name} × ${item.quantity}: ${formatCurrency(item.totalPrice)}`
)).join('\n');

const getCustomerEmail = (order) => order.shippingAddress?.email || order.billingAddress?.email;

const getPaymentDescription = (order) => {
    if (order.payment?.method === 'RAZORPAY') {
        return 'Paid online with Razorpay';
    }

    return 'Cash on Delivery';
};

const sendCustomerOrderConfirmation = async (order) => {
    const email = getCustomerEmail(order);
    if (!email) {
        console.warn(`Order confirmation skipped for ${order.orderNumber}: customer email is missing`);
        return;
    }

    const total = formatCurrency(order.grandTotal);
    const itemsHtml = buildItemsHtml(order);
    const itemsText = buildItemsText(order);
    const paymentDescription = getPaymentDescription(order);

    await sendEmail({
        to: email,
        subject: `We received your order ${order.orderNumber}`,
        html: `<h2>Thanks for your order, ${escapeHtml(order.shippingAddress?.fullName || 'there')}.</h2><p>Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been placed.</p><ul>${itemsHtml}</ul><p><strong>Total: ${total}</strong></p><p>Payment: ${escapeHtml(paymentDescription)}</p>`,
        text: `Thanks for your order. Order ${order.orderNumber} has been placed.\n\n${itemsText}\n\nTotal: ${total}\nPayment: ${paymentDescription}`,
    });
};

const sendAdminNewOrderAlert = async (order) => {
    const email = process.env.ADMIN_ORDER_EMAIL;
    if (!email) {
        console.warn(`Admin order alert skipped for ${order.orderNumber}: ADMIN_ORDER_EMAIL is not configured`);
        return;
    }

    const orderUrl = process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL.replace(/\/$/, '')}/admin/orders/${order._id}`
        : '';
    const customer = order.shippingAddress || {};
    const itemsHtml = buildItemsHtml(order);
    const itemsText = buildItemsText(order);
    const paymentDescription = getPaymentDescription(order);

    await sendEmail({
        to: email,
        subject: `New order ${order.orderNumber}`,
        html: `<h2>New order received</h2><p><strong>${escapeHtml(order.orderNumber)}</strong> — ${formatCurrency(order.grandTotal)}</p><p>Payment: ${escapeHtml(paymentDescription)}</p><p>Customer: ${escapeHtml(customer.fullName)} (${escapeHtml(customer.email)})</p><ul>${itemsHtml}</ul>${orderUrl ? `<p><a href="${escapeHtml(orderUrl)}">Open order in admin</a></p>` : ''}`,
        text: `New order ${order.orderNumber}\nPayment: ${paymentDescription}\nCustomer: ${customer.fullName} (${customer.email})\n\n${itemsText}\n\nTotal: ${formatCurrency(order.grandTotal)}${orderUrl ? `\nAdmin: ${orderUrl}` : ''}`,
    });
};

const sendCustomerStatusUpdate = async (order) => {
    const email = getCustomerEmail(order);
    if (!email) {
        console.warn(`Order status email skipped for ${order.orderNumber}: customer email is missing`);
        return;
    }

    const status = String(order.orderStatus || '').replace(/_/g, ' ');
    const trackingHtml = order.trackingUrl
        ? `<p><a href="${escapeHtml(order.trackingUrl)}">Track your order</a></p>`
        : '';
    const trackingText = order.trackingUrl ? `\nTrack your order: ${order.trackingUrl}` : '';

    await sendEmail({
        to: email,
        subject: `Order ${order.orderNumber} is ${status}`,
        html: `<p>Your order <strong>${escapeHtml(order.orderNumber)}</strong> is now <strong>${escapeHtml(status)}</strong>.</p>${trackingHtml}`,
        text: `Your order ${order.orderNumber} is now ${status}.${trackingText}`,
    });
};

const runSafely = (label, task) => {
    Promise.resolve(task()).catch((error) => {
        console.error(`${label} email failed:`, error.message);
    });
};

const notifyOrderPlaced = (order) => {
    runSafely('Customer order confirmation', () => sendCustomerOrderConfirmation(order));
    runSafely('Admin new-order alert', () => sendAdminNewOrderAlert(order));
};

const notifyOrderStatusChanged = (order) => {
    runSafely('Customer order status update', () => sendCustomerStatusUpdate(order));
};

module.exports = {
    notifyOrderPlaced,
    notifyOrderStatusChanged,
};
