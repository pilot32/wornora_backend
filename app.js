const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.route');
const categoryRoutes = require('./modules/categories/category.route');
const subCategoryRoutes = require('./modules/subcategories/subcategory.route');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
module.exports =app;
