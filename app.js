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
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use('/api/auth', authRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customer',customerProductRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/addresses', addressRoutes);
module.exports =app;
