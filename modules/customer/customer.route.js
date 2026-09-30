const express = require('express');
const router = express.Router();
const validationMiddleware = require('../../middlewares/validation.middleware');


const
{   getAllProducts,
    getFeaturedProducts,
    getNewArrivals,
    getProductById} = require('./customer.controller');
const {
    getCustomerProductsSchema,
    customerProductIdSchema
} = require('../../validations/customer.validation');

router.get(
    '/products',
    validationMiddleware(getCustomerProductsSchema, 'query'),
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
    validationMiddleware(customerProductIdSchema, 'params'),
    getProductById,
);

module.exports = router;
