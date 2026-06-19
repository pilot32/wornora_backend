const express = require('express');
const router = express.Router();
const { addToCart,
        getCartItems,
        updateQuantity, 
        removeFromCart,
        clearCart,
        calculateCartSummary 
    } = require('./cart.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const {
    addToCartSchema,
    updateQuantitySchema,
    productIdParamSchema
} = require('../../validations/cart.validation');

//add product to cart
router.post('/add',
    authMiddleware,
    validationMiddleware(addToCartSchema),
    addToCart
);

//get all the items from cart
router.get('/', authMiddleware, getCartItems);

//update the quantity of  items in cart
router.patch('/:productId',
    authMiddleware,
    validationMiddleware(productIdParamSchema, 'params'),
    validationMiddleware(updateQuantitySchema),
    updateQuantity
);

//remove the single item from the cart
router.delete('/:productId',
    authMiddleware,
    validationMiddleware(productIdParamSchema, 'params'),
    removeFromCart
);

//clear the cart
router.delete('/', authMiddleware, clearCart);   

module.exports = router;
