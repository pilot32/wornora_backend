const express = require('express');
const cors = require('cors');
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
app.use(errorMiddleware);

module.exports = app;
