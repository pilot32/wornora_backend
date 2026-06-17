const Cart = require('./cart.model');
const Product = require('../products/products.model');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../utils/ApiError');
const { ApiResponse } = require('../../utils/ApiResponse');

/**
 * Function to add the items in the cart of the user.
*/
const addToCart = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const {
        productId, quantity = 1
    } = req.body;
    /**
     * Validations to validate the request body and check if the product is available in the stock or not.
     */
    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }
    if (quantity < 1 || !Number.isInteger(quantity)) {
        throw new ApiError(400, "Quantity must be a positive integer");
    }
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    if (!product.isActive) {
        throw new ApiError(400, "Product is not available");
    }
    if (product.stock < quantity) {
        throw new ApiError(400, "Insufficient stock");
    }
    let cart = await Cart.findOne({ userId });
    //if cart not present then create a new cart for the user and add the product to the cart.
    if (!cart) {
        cart = new Cart({
            userId,
            items: [],
            appliedCoupon: null,
        });
    }
    const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
    }
    else {
        cart.items.push({
            productId,
            quantity,
            priceAddition: product.price,
        });
    }
    await cart.save();
    await cart.populate('items.productId', 'name price images slug');
    return res.status(200).json(
        new ApiResponse(200, cart, 'Item added to cart')
    );
});

/**
 * Function to get the items in the cart of the user.
*/
const getCartItems = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price images slug');
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }
    return res.status(200).json(
        new ApiResponse(200, cart, "Cart items retrieved successfully")
    );
});

/**
 * 
 */
const updateQuantity = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
        throw new ApiError(400, "Quantity must be a positive integer");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }
    const item = cart.items.find(
        (i) => i.productId.toString() === productId
    );
    if (!item) {
        throw new ApiError(404, "Product not found in cart");
    }
    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.productId', 'name price images slug');
    return res.status(200).json(
        new ApiResponse(200, cart, "Cart item quantity updated successfully")
    );
});

/**
 * Function to remove the item from the cart of the user with the logic of matching length;
 */
const removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { productId, prodctId } = req.params;
    const itemId = productId || prodctId;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(404, 'Cart not found');
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
        (item) => item.productId.toString() !== itemId
    );

    if (cart.items.length === initialLength) {
        throw new ApiError(404, 'Item not found in cart');
    }

    await cart.save();
    return res.status(200).json(
        new ApiResponse(200, cart, 'Item removed from cart')
    );
});

/**
 * Function to clear the cart of the user by setting the items array to empty array.
 */
const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const cart = await Cart.findOneAndUpdate(
        { userId },
        { items: [], appliedCoupon: null },
        { new: true },
    );
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }
    return res.status(200).json(
        new ApiResponse(200, cart, "Cart cleared successfully")
    );
});

/**
 * Function to calculate the total summary of the cart for the user.
 */
const calculateCartSummary = (cart) => {

    const subtotal =
        cart.items.reduce(
            (sum, item) =>
                sum +
                item.priceAddition *
                item.quantity,
            0
        );

    return {
        subtotal,
        discount: 0,
        grandTotal: subtotal
    };
};

module.exports = {
    addToCart,
    getCartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    calculateCartSummary
}
