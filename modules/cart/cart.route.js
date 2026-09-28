const express = require('express');
const router = express.Router();
const { addToCart,
        getCartItems,
        updateQuantity, 
        removeFromCart,
        clearCart,
        applyCouponToCart,
        removeCouponFromCart
} = require('./cart.controller');
const {
    addToCartSchema,
    updateQuantitySchema,
    productIdParamSchema,
    applyCouponSchema
} = require('../../validations/cart.validation');
const authMiddleware = require('../../middlewares/auth.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');

//add product to cart
router.post('/add',
    authMiddleware,
    validationMiddleware(addToCartSchema),
    addToCart
);

//get all the items from cart
router.get('/', authMiddleware, getCartItems);

//apply coupon to the cart
router.post('/apply-coupon',
    authMiddleware,
    validationMiddleware(applyCouponSchema),
    applyCouponToCart
);

//remove coupon from the cart
router.delete('/coupon',
    authMiddleware,
    removeCouponFromCart
);

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
