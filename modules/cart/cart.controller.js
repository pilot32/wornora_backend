const Cart = require('./cart.model');
const Product = require('../products/products.model');
const { sameSelection, selectCartItem } = require('./cart-selection');
const {
    validateCouponForCartService,
    calculateCouponDiscount
} = require('../coupons/coupon.service');

const PRODUCT_POPULATE_FIELDS = 'name price discountedPrice images slug stock isActive sizes colors';

const getEffectivePrice = (product) => {
    if (!product) return 0;
    return product.discountedPrice ?? product.price;
};

const populateCart = (cart) => cart.populate('items.productId', PRODUCT_POPULATE_FIELDS);

const createEmptyCartResponse = (userId) => ({
    _id: null,
    userId,
    items: [],
    appliedCoupon: null
});

const syncCartPrices = async (cart) => {
    let changed = false;

    cart.items.forEach((item) => {
        const product = item.productId;

        if (product && typeof product === 'object') {
            const currentPrice = getEffectivePrice(product);
            if (item.priceAddition !== currentPrice) {
                item.priceAddition = currentPrice;
                changed = true;
            }
        }
    });

    if (changed) {
        await cart.save();
        await populateCart(cart);
    }
};

const calculateCartSummary = (cart, coupon = null) => {
    const subtotal = cart.items.reduce(
        (sum, item) => sum + (item.priceAddition * item.quantity),
        0
    );
    const discount = coupon ? calculateCouponDiscount(coupon, subtotal) : 0;
    const shipping = 0;

    return {
        subtotal,
        discount,
        shipping,
        grandTotal: Math.max(subtotal - discount + shipping, 0)
    };
};

const buildCartResponse = async (cart, userId) => {
    if (!cart) {
        return {
            cart: createEmptyCartResponse(userId),
            summary: calculateCartSummary({ items: [] })
        };
    }

    await populateCart(cart);
    await syncCartPrices(cart);

    let coupon = null;
    if (cart.appliedCoupon) {
        const subtotal = calculateCartSummary(cart).subtotal;

        try {
            const couponResult = await validateCouponForCartService(cart.appliedCoupon, subtotal);
            coupon = couponResult.coupon;
        } catch (err) {
            cart.appliedCoupon = null;
            await cart.save();
        }
    }

    return {
        cart,
        summary: calculateCartSummary(cart, coupon)
    };
};

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = new Cart({
            userId,
            items: [],
            appliedCoupon: null
        });
    }

    return cart;
};

/**
 * Function to add the items in the cart of the user.
*/
const addToCart = async (req,res) => {
    try{
        const userId = req.user.userId;
        const{
            productId,quantity =1, selectedSize = '', selectedColor = ''
        } = req.body;
        /**
         * Product availability and stock validation
         */
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({message: "Product not found"});
        }
        if(!product.isActive){
            return res.status(400).json({message: "Product is not available"});
        }
        if (product.sizes?.length && !product.sizes.includes(selectedSize)) {
            return res.status(400).json({ message: 'Please select an available size' });
        }
        if (selectedSize && !product.sizes?.includes(selectedSize)) {
            return res.status(400).json({ message: 'Selected size is not available' });
        }
        if (selectedColor && !product.colors?.some((color) => color.name === selectedColor)) {
            return res.status(400).json({ message: 'Selected colour is not available' });
        }
        if(product.stock < quantity){
            return res.status(400).json({message: "Insufficient stock"});
        }
        let cart = await getOrCreateCart(userId);
        const selection = { selectedSize, selectedColor };
        const productQuantity = cart.items.reduce((total, item) =>
            total + (item.productId.toString() === productId ? item.quantity : 0), 0);
        if (productQuantity + quantity > product.stock) {
            return res.status(400).json({ message: `Cannot add to cart. Only ${product.stock} items in stock.` });
        }
        const existingItemIndex = cart.items.findIndex((item)=> item.productId.toString() === productId && sameSelection(item, selection));
        const productPrice = getEffectivePrice(product);
        
        if(existingItemIndex >= 0){
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (product.stock < newQuantity) {
                return res.status(400).json({message: `Cannot add to cart. Only ${product.stock} items in stock.`});
            }
            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].priceAddition = productPrice;
        }
        else{
            cart.items.push({
                productId,
                selectedSize,
                selectedColor,
                quantity,
                priceAddition: productPrice,
            });
        }
        await cart.save();
        const response = await buildCartResponse(cart, userId);
        res.status(200).json({
            message: 'Item added to cart',
            ...response
        });
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
/**
 * Function to get the items in the cart of the user.
*/
const getCartItems = async (req,res) => {
    try{
        const userId = req.user.userId;
        const cart = await Cart.findOne({userId});
        const response = await buildCartResponse(cart, userId);
        res.status(200).json({
            message: "Cart items retrieved successfully",
            ...response
        });
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}
/**
 * 
 */
const updateQuantity = async (req,res) => {
    try{
        const userId = req.user.userId;
        const {productId} = req.params;
        const {quantity} = req.body;

        const cart = await Cart.findOne({userId});
        if(!cart){
            return res.status(404).json({message: "Cart not found"});
        }
        let item;
        try { item = selectCartItem(cart.items, productId, req.body); }
        catch (error) { return res.status(400).json({ message: error.message }); }
        if(!item){
            return res.status(404).json({message: "Product not found in cart"});
        }

        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({message: "Product not found"});
        }
        if(!product.isActive){
            return res.status(400).json({message: "Product is not available"});
        }
        const otherQuantity = cart.items.reduce((total, line) =>
            total + (line !== item && line.productId.toString() === productId ? line.quantity : 0), 0);
        if(product.stock < quantity + otherQuantity){
            return res.status(400).json({message: `Cannot update quantity. Only ${product.stock} items in stock.`});
        }

        item.quantity = quantity;
        item.priceAddition = getEffectivePrice(product);
        await cart.save();
        const response = await buildCartResponse(cart, userId);
        res.status(200).json({
            message: "Cart item quantity updated successfully",
            ...response
        });
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}
/**
 * Function to remove the item from the cart of the user with the logic of matching length;
 */
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        let selectedItem;
        try { selectedItem = selectCartItem(cart.items, productId, req.query); }
        catch (error) { return res.status(400).json({ message: error.message }); }
        if (!selectedItem) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        cart.items = cart.items.filter((item) => item !== selectedItem);

        await cart.save();
        const response = await buildCartResponse(cart, userId);
        res.status(200).json({ message: 'Item removed from cart', ...response });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
/**
 * Function to clear the cart of the user by setting the items array to empty array.
 */
const clearCart = async (req,res) => {
    try{
        const userId = req.user.userId;
        const cart = await Cart.findOneAndUpdate(
            {userId},
            {items: [], appliedCoupon: null},
            {new: true},
    );
        if(!cart){
            return res.status(404).json({message: "Cart not found"});
        }
        const response = await buildCartResponse(cart, userId);
        res.status(200).json({
            message: "Cart cleared successfully",
            ...response
        });
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}
const applyCouponToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { code } = req.body;
        const cart = await Cart.findOne({ userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cannot apply coupon to an empty cart' });
        }

        await populateCart(cart);
        await syncCartPrices(cart);

        const subtotal = calculateCartSummary(cart).subtotal;
        const couponResult = await validateCouponForCartService(code, subtotal);

        cart.appliedCoupon = couponResult.code;
        await cart.save();

        const response = await buildCartResponse(cart, userId);
        return res.status(200).json({
            message: couponResult.message,
            coupon: {
                code: couponResult.code,
                discount: couponResult.discount
            },
            ...response
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message });
    }
};

const removeCouponFromCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.appliedCoupon = null;
        await cart.save();

        const response = await buildCartResponse(cart, userId);
        return res.status(200).json({
            message: 'Coupon removed from cart',
            ...response
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = {
    addToCart,
    getCartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCouponToCart,
    removeCouponFromCart,
    calculateCartSummary
}
