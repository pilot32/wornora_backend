const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.route');
const categoryRoutes = require('./modules/categories/category.route');
const subCategoryRoutes = require('./modules/subcategories/subcategory.route');
const productRoutes = require('./modules/products/products.route');
const customerProductRoutes = require('./modules/customer/customer.route');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use('/api/auth', authRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customer',customerProductRoutes);
module.exports =app;
