const express = require('express');
const router = express.Router();


const
{   getAllProducts,
    getFeaturedProducts,
    getNewArrivals,
    getProductById} = require('./customer.controller');

router.get(
    '/products',
    getAllProducts,
);
router.get(
    '/products/featured',
    getFeaturedProducts,
);
router.get(
    '/products/new-arrivals',
    getNewArrivals,
);
router.get(
    '/products/:id',
    getProductById,
);

module.exports = router;