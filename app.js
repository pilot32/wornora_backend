const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./modules/auth/auth.route');
const categoryRoutes = require('./modules/categories/category.route');
const subCategoryRoutes = require('./modules/subcategories/subcategory.route');
const productRoutes = require('./modules/products/products.route');
const customerProductRoutes = require('./modules/customer/customer.route');
const cartRoutes = require('./modules/cart/cart.route');
const couponRoutes = require('./modules/coupons/coupon.route');
const addressRoutes = require('./modules/address/address.route');
const homeRoutes = require('./modules/home/home.route');
const orderRoutes = require('./modules/order/order.routes');
const reviewRoutes = require('./modules/reviews/review.route');
const wishlistRoutes = require('./modules/wishlist/wishlist.route');
const adminDashboardRoutes = require('./modules/admin/admin-dashboard.route');
const shippingRoutes = require('./modules/shipping/shipping.route');
const paymentRoutes = require('./modules/payments/payment.route');
const errorMiddleware = require('./middlewares/error.middleware');
const app = express();

const allowedOrigins = (
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173,http://127.0.0.1:5173'
)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowAllOrigins = allowedOrigins.includes('*');

app.use(cors({
    origin: allowAllOrigins
        ? true
        : (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            const error = new Error('Not allowed by CORS');
            error.statusCode = 403;
            return callback(error);
        },
    credentials: !allowAllOrigins
}));
app.use(express.json());
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customer',customerProductRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminDashboardRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payments', paymentRoutes);
app.use(errorMiddleware);

module.exports = app;
