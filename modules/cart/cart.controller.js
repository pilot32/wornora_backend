const Cart = require('./cart.model');
const Product = require('../products/products.model');

/**
 * Function to add the items in the cart of the user.
*/
const addToCart = async (req,res) => {
    try{
        const userId = req.user.userId;
        const{
            productId,quantity =1
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
        if(product.stock < quantity){
            return res.status(400).json({message: "Insufficient stock"});
        }
        let cart = await Cart.findOne({userId});
        //if cart not present then create a new cart for the user and add the product to the cart.
        if(!cart){
            cart = new Cart({
                userId,
                items: [],
                appliedCoupon: null,
            });
        }
        const existingItemIndex = cart.items.findIndex((item)=>  item.productId.toString() === productId);
        
        if(existingItemIndex >= 0){
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (product.stock < newQuantity) {
                return res.status(400).json({message: `Cannot add to cart. Only ${product.stock} items in stock.`});
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        }
        else{
            cart.items.push({
                productId,
                quantity,
                priceAddition: product.price,
            });
        }
        await cart.save();
        await cart.populate('items.productId', 'name price images slug');
        res.status(200).json({
            message: 'Item added to cart',
            cart
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
        const cart = await Cart.findOne({userId}).populate('items.productId','name price images slug');
        if(!cart){
            return res.status(404).json({message: "Cart not found"});
        }
        res.status(200).json({
            message: "Cart items retrieved successfully",
            cart
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
        const item = cart.items.find(
            (i) => i.productId.toString() === productId
        );
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
        if(product.stock < quantity){
            return res.status(400).json({message: `Cannot update quantity. Only ${product.stock} items in stock.`});
        }

        item.quantity = quantity;
        await cart.save();
        await cart.populate('items.productId', 'name price images slug');
        res.status(200).json({
            message: "Cart item quantity updated successfully",
            cart
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

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            (item) => item.productId.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        await cart.save();
        res.status(200).json({ message: 'Item removed from cart', cart });
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
        res.status(200).json({
            message: "Cart cleared successfully",
            cart
        });
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}
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