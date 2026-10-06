jest.mock('../modules/cart/cart.model', () => ({ findOne: jest.fn() }));
jest.mock('../modules/products/products.model', () => ({ findById: jest.fn() }));
jest.mock('../modules/coupons/coupon.service', () => ({
    validateCouponForCartService: jest.fn(), calculateCouponDiscount: jest.fn()
}));

const Cart = require('../modules/cart/cart.model');
const Product = require('../modules/products/products.model');
const { addToCart, updateQuantity, removeFromCart } = require('../modules/cart/cart.controller');
const { selectCartItem } = require('../modules/cart/cart-selection');
const { addToCartSchema, updateQuantitySchema, cartSelectionSchema } = require('../validations/cart.validation');
const productId = '507f1f77bcf86cd799439011';
const makeResponse = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });
const makeCart = (items) => ({
    items, save: jest.fn().mockResolvedValue(),
    populate: jest.fn().mockImplementation(function () { return Promise.resolve(this); })
});

beforeEach(() => jest.clearAllMocks());

test('cart request validation preserves selected size and colour', () => {
    const input = { productId, quantity: 1, selectedSize: 'M', selectedColor: 'Gold' };
    const result = addToCartSchema.validate(input, { stripUnknown: true });
    expect(result.error).toBeUndefined();
    expect(result.value).toEqual(input);
    expect(updateQuantitySchema.validate({ quantity: 2, selectedSize: 'M' }).error).toBeUndefined();
    expect(cartSelectionSchema.validate({ selectedSize: ['M', 'L'] }).error).toBeDefined();
});

test('ambiguous legacy requests cannot change several size rows', () => {
    const items = [{ productId, selectedSize: 'M' }, { productId, selectedSize: 'L' }];
    expect(() => selectCartItem(items, productId, {})).toThrow('Select a size');
    expect(selectCartItem(items, productId, { selectedSize: 'M' })).toBe(items[0]);
});

test('missing or unavailable sizes cannot enter the authenticated cart', async () => {
    Product.findById.mockResolvedValue({ isActive: true, sizes: ['M', 'L'], stock: 10 });
    for (const selectedSize of ['', 'XS']) {
        const res = makeResponse();
        await addToCart({ user: { userId: 'user' }, body: { productId, selectedSize } }, res);
        expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(Cart.findOne).not.toHaveBeenCalled();
});

test('adding another size creates a separate row and keeps its selection', async () => {
    Product.findById.mockResolvedValue({ isActive: true, sizes: ['M', 'L'], stock: 10, price: 100 });
    const cart = makeCart([{ productId, selectedSize: 'M', quantity: 1, priceAddition: 100 }]);
    Cart.findOne.mockResolvedValue(cart);
    const res = makeResponse();
    await addToCart({ user: { userId: 'user' }, body: { productId, selectedSize: 'L', quantity: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(cart.items).toHaveLength(2);
    expect(cart.items[1]).toMatchObject({ selectedSize: 'L', quantity: 2 });
    expect(cart.save).toHaveBeenCalled();
});

test('adding the same selection increments only that row', async () => {
    Product.findById.mockResolvedValue({ isActive: true, sizes: ['M', 'L'], stock: 10, price: 100 });
    const cart = makeCart([{ productId, selectedSize: 'M', quantity: 1, priceAddition: 100 },
        { productId, selectedSize: 'L', quantity: 1, priceAddition: 100 }]);
    Cart.findOne.mockResolvedValue(cart);
    await addToCart({ user: { userId: 'user' }, body: { productId, selectedSize: 'M', quantity: 2 } }, makeResponse());
    expect(cart.items.map((item) => item.quantity)).toEqual([3, 1]);
});

test('stock is enforced across sizes rather than independently per row', async () => {
    Product.findById.mockResolvedValue({ isActive: true, sizes: ['M', 'L'], stock: 2, price: 100 });
    const cart = makeCart([{ productId, selectedSize: 'M', quantity: 2 }]);
    Cart.findOne.mockResolvedValue(cart);
    const res = makeResponse();
    await addToCart({ user: { userId: 'user' }, body: { productId, selectedSize: 'L' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(cart.save).not.toHaveBeenCalled();
});

test('quantity updates and removal affect only the selected size', async () => {
    Product.findById.mockResolvedValue({ isActive: true, stock: 10, price: 100 });
    const cart = makeCart([{ productId, selectedSize: 'M', quantity: 1 },
        { productId, selectedSize: 'L', quantity: 1 }]);
    Cart.findOne.mockResolvedValue(cart);
    const req = { user: { userId: 'user' }, params: { productId }, body: { selectedSize: 'M', quantity: 3 } };
    await updateQuantity(req, makeResponse());
    expect(cart.items.map((item) => item.quantity)).toEqual([3, 1]);
    await removeFromCart({ ...req, query: { selectedSize: 'L' } }, makeResponse());
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].selectedSize).toBe('M');
});

test('cart and order schemas retain selected size and colour', () => {
    const CartModel = jest.requireActual('../modules/cart/cart.model');
    const OrderModel = require('../modules/order/order.model');
    const selection = { productId, selectedSize: 'M', selectedColor: 'Gold', quantity: 1 };
    const cart = new CartModel({ items: [{ ...selection, priceAddition: 100 }] });
    const order = new OrderModel({ orderItems: [{ ...selection, name: 'Dress', slug: 'dress', originalPrice: 100, unitPrice: 100, totalPrice: 100 }] });
    const expected = { selectedSize: 'M', selectedColor: 'Gold', quantity: 1 };
    expect(cart.toObject().items[0]).toMatchObject(expected);
    expect(order.toObject().orderItems[0]).toMatchObject(expected);
    expect(cart.items[0].productId.toString()).toBe(productId);
    expect(order.orderItems[0].productId.toString()).toBe(productId);
});
