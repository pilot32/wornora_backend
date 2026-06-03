const express = require('express');
const router = express.Router();
const {createProduct} = require('./products.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');


router.post('/',
    authMiddleware,
    roleMiddleware('ADMIN'),
    createProduct
);
module.exports=router;