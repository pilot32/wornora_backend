require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

const User = require('../modules/users/user.models');
const Category = require('../modules/categories/category.model');
const Subcategory = require('../modules/subcategories/subcategory.model');
const Product = require('../modules/products/products.model');
const Address = require('../modules/address/address.model');
const Cart = require('../modules/cart/cart.model');
const Coupon = require('../modules/coupons/coupon.model');
const Order = require('../modules/order/order.model');

const mongoUri = process.env.MONGO_TEST_URI || process.env.MONGO_DB_URI;
const marker = `SMOKE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const customerPassword = 'SmokeCustomer123!';
const adminPassword = 'SmokeAdmin123!';

let customer;
let admin;
let customerToken;
let adminToken;
let categoryId;
let subcategoryId;
let productId;
let addressId;
let couponCode;
let firstOrderId;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const cleanup = async () => {
    const users = await User.find({ email: { $regex: `^${marker}` } }).select('_id');
    const userIds = users.map((user) => user._id);

    await Order.deleteMany({
        $or: [
            { userId: { $in: userIds } },
            { deliveryNotes: { $regex: `^${marker}` } }
        ]
    });
    await Cart.deleteMany({ userId: { $in: userIds } });
    await Address.deleteMany({
        $or: [
            { userId: { $in: userIds } },
            { fullName: { $regex: `^${marker}` } }
        ]
    });
    await Coupon.deleteMany({ code: { $regex: `^${marker}` } });
    await Product.deleteMany({ $or: [{ name: { $regex: `^${marker}` } }, { slug: { $regex: `^${marker.toLowerCase()}` } }] });
    await Subcategory.deleteMany({ $or: [{ name: { $regex: `^${marker}` } }, { slug: { $regex: `^${marker.toLowerCase()}` } }] });
    await Category.deleteMany({ $or: [{ name: { $regex: `^${marker}` } }, { slug: { $regex: `^${marker.toLowerCase()}` } }] });
    await User.deleteMany({ email: { $regex: `^${marker}` } });
};

beforeAll(async () => {
    if (!mongoUri) {
        throw new Error('Full API smoke tests require MONGO_TEST_URI or MONGO_DB_URI');
    }

    await mongoose.connect(mongoUri);
    await cleanup();
}, 30000);

afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await cleanup();
        await mongoose.disconnect();
    }
}, 30000);

describe('e-commerce API smoke flow', () => {
    test('completes the customer, catalog, cart, order, and cancellation flow', async () => {
        const customerEmail = `${marker.toLowerCase()}-customer@example.com`;
        const adminEmail = `${marker.toLowerCase()}-admin@example.com`;

        let response = await request(app)
            .post('/api/auth/register')
            .send({ name: `${marker} Customer`, email: customerEmail, password: customerPassword });
        expect(response.status).toBe(200);

        response = await request(app)
            .post('/api/auth/login')
            .send({ email: customerEmail, password: customerPassword });
        expect(response.status).toBe(200);
        expect(response.body.token).toEqual(expect.any(String));
        customerToken = response.body.token;
        customer = await User.findOne({ email: customerEmail });
        expect(customer).toBeTruthy();

        admin = await User.create({
            name: `${marker} Admin`,
            email: adminEmail,
            password: await bcrypt.hash(adminPassword, 10),
            role: 'ADMIN'
        });

        response = await request(app)
            .post('/api/auth/login')
            .send({ email: adminEmail, password: adminPassword });
        expect(response.status).toBe(200);
        expect(response.body.token).toEqual(expect.any(String));
        adminToken = response.body.token;

        response = await request(app)
            .post('/api/categories')
            .set(auth(adminToken))
            .send({ name: `${marker} Category`, slug: `${marker.toLowerCase()}-category` });
        expect(response.status).toBe(201);
        categoryId = response.body.data._id;

        response = await request(app)
            .post('/api/subcategories')
            .set(auth(adminToken))
            .send({ name: `${marker} Subcategory`, slug: `${marker.toLowerCase()}-subcategory`, categoryId });
        expect(response.status).toBe(201);
        subcategoryId = response.body.data._id;

        const createProduct = (name, slug, stock) => request(app)
            .post('/api/products')
            .set(auth(adminToken))
            .send({
                name,
                slug,
                description: `${marker} smoke product description`,
                categoryId,
                subcategoryId,
                price: 1000,
                discountedPrice: 800,
                stock
            });

        response = await createProduct(`${marker} Product One`, `${marker.toLowerCase()}-product-one`, 5);
        expect(response.status).toBe(201);
        productId = response.body.data._id;

        response = await request(app).get(`/api/customer/products?search=${encodeURIComponent(marker)}`);
        expect(response.status).toBe(200);
        expect(response.body.products.some((product) => product._id === productId)).toBe(true);

        response = await request(app)
            .post('/api/addresses')
            .set(auth(customerToken))
            .send({
                fullName: `${marker} Address`,
                phone: '9876543210',
                addressLine1: `${marker} Street`,
                city: 'Bengaluru',
                state: 'Karnataka',
                postalCode: '560001',
                country: 'India',
                addressType: 'Home',
                isDefault: true
            });
        expect(response.status).toBe(201);
        addressId = response.body.data._id;

        response = await request(app).get('/api/addresses/default').set(auth(customerToken));
        expect(response.status).toBe(200);
        expect(response.body.data._id).toBe(addressId);

        couponCode = `${marker}-COUPON`;
        response = await request(app)
            .post('/api/coupon')
            .set(auth(adminToken))
            .send({ code: couponCode, discountType: 'fixed', discountValue: 100, minimumCartValue: 500 });
        expect(response.status).toBe(201);

        response = await request(app)
            .post('/api/cart/add')
            .set(auth(customerToken))
            .send({ productId, quantity: 2 });
        expect(response.status).toBe(200);
        expect(response.body.cart.items).toHaveLength(1);
        expect(response.body.summary.subtotal).toBe(1600);

        response = await request(app)
            .post('/api/cart/apply-coupon')
            .set(auth(customerToken))
            .send({ code: couponCode });
        expect(response.status).toBe(200);
        expect(response.body.coupon.discount).toBe(100);
        expect(response.body.summary.discount).toBe(100);
        expect(response.body.summary.grandTotal).toBe(1500);

        response = await request(app)
            .post('/api/orders')
            .set(auth(customerToken))
            .send({ shippingAddressId: addressId, paymentMethod: 'COD', deliveryNotes: `${marker} delivery` });
        expect(response.status).toBe(201);
        const firstOrder = response.body.data.order;
        firstOrderId = firstOrder._id;
        expect(firstOrder.orderStatus).toBe('PLACED');
        expect(firstOrder.payment.method).toBe('COD');
        expect(firstOrder.payment.status).toBe('PENDING');
        expect(firstOrder.subTotal).toBe(1600);
        expect(firstOrder.discountAmount).toBe(100);
        expect(firstOrder.grandTotal).toBe(1500);

        expect((await Product.findById(productId)).stock).toBe(3);
        expect((await Cart.findOne({ userId: customer._id })).items).toHaveLength(0);
        expect(await Order.exists({ _id: firstOrderId, userId: customer._id })).toBeTruthy();

        response = await request(app).get('/api/orders/me').set(auth(customerToken));
        expect(response.status).toBe(200);
        expect(response.body.data.orders.some((order) => order._id === firstOrderId)).toBe(true);

        response = await request(app).get(`/api/orders/${firstOrderId}`).set(auth(customerToken));
        expect(response.status).toBe(200);
        expect(response.body.data.order._id).toBe(firstOrderId);

        response = await request(app)
            .get(`/api/orders?search=${encodeURIComponent(firstOrder.orderNumber)}`)
            .set(auth(adminToken));
        expect(response.status).toBe(200);
        expect(response.body.data.orders.some((order) => order._id === firstOrderId)).toBe(true);

        response = await request(app)
            .patch(`/api/orders/${firstOrderId}/status`)
            .set(auth(adminToken))
            .send({ orderStatus: 'CONFIRMED', adminNote: `${marker} confirmed` });
        expect(response.status).toBe(200);
        expect(response.body.data.order.orderStatus).toBe('CONFIRMED');

        response = await request(app)
            .patch(`/api/orders/${firstOrderId}/status`)
            .set(auth(adminToken))
            .send({ orderStatus: 'DELIVERED' });
        expect(response.status).toBe(400);

        response = await createProduct(`${marker} Product Two`, `${marker.toLowerCase()}-product-two`, 1);
        expect(response.status).toBe(201);
        const secondProductId = response.body.data._id;

        response = await request(app)
            .post('/api/cart/add')
            .set(auth(customerToken))
            .send({ productId: secondProductId, quantity: 1 });
        expect(response.status).toBe(200);

        response = await request(app)
            .post('/api/orders')
            .set(auth(customerToken))
            .send({ shippingAddressId: addressId, paymentMethod: 'COD', deliveryNotes: `${marker} cancellation` });
        expect(response.status).toBe(201);
        const secondOrderId = response.body.data.order._id;
        expect((await Product.findById(secondProductId)).stock).toBe(0);

        response = await request(app)
            .patch(`/api/orders/${secondOrderId}/status`)
            .set(auth(adminToken))
            .send({ orderStatus: 'CANCELLED', adminNote: `${marker} cancelled` });
        expect(response.status).toBe(200);
        expect(response.body.data.order.orderStatus).toBe('CANCELLED');
        expect((await Product.findById(secondProductId)).stock).toBe(1);
    }, 60000);
});