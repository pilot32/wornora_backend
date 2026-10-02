const swaggerJsdoc = require('swagger-jsdoc');

const operation = (summary, secured = false, tags = []) => ({
    tags,
    summary,
    ...(secured ? { security: [{ bearerAuth: [] }] } : {}),
    responses: {
        200: { description: 'Request completed successfully' },
        400: { description: 'Validation error' },
        401: { description: 'Authentication required' },
        500: { description: 'Internal server error' }
    }
});

const addPaths = (paths, prefix, routes, secured, tag) => {
    routes.forEach(({ path, methods, summary, secured: routeSecured }) => {
        const fullPath = `${prefix}${path}`.replace(/:([A-Za-z]+)/g, '{$1}');
        paths[fullPath] ||= {};
        methods.forEach((method) => {
            paths[fullPath][method] = operation(
                summary,
                routeSecured ?? secured,
                [tag]
            );
        });
    });
};

const paths = {};

addPaths(paths, '/api/auth', [
    { path: '/register', methods: ['post'], summary: 'Register a user' },
    { path: '/login', methods: ['post'], summary: 'Log in a user' },
    { path: '/profile', methods: ['get'], summary: 'Get the current user profile', secured: true },
    { path: '/test-admin', methods: ['post'], summary: 'Check admin access', secured: true }
], false, 'Authentication');

addPaths(paths, '/api/categories', [
    { path: '/', methods: ['get', 'post'], summary: 'List or create categories' },
    { path: '/:id', methods: ['get', 'patch', 'delete'], summary: 'Get, update, or delete a category' },
    { path: '/:id/status', methods: ['patch'], summary: 'Update category status' }
], true, 'Categories');

addPaths(paths, '/api/subcategories', [
    { path: '/', methods: ['get'], summary: 'List subcategories' },
    { path: '/', methods: ['post'], summary: 'Create a subcategory', secured: true },
    { path: '/:id', methods: ['get'], summary: 'Get a subcategory' },
    { path: '/:id', methods: ['patch', 'delete'], summary: 'Update or delete a subcategory', secured: true },
    { path: '/:id/status', methods: ['patch'], summary: 'Update subcategory status', secured: true }
], false, 'Subcategories');

addPaths(paths, '/api/products', [
    { path: '/', methods: ['get'], summary: 'List products', secured: false },
    { path: '/', methods: ['post'], summary: 'Create a product' },
    { path: '/:id', methods: ['get'], summary: 'Get a product', secured: false },
    { path: '/:id', methods: ['patch', 'delete'], summary: 'Update or delete a product' },
    { path: '/:id/status', methods: ['patch'], summary: 'Update product status' },
    { path: '/:id/featured', methods: ['patch'], summary: 'Update product featured status' },
    { path: '/upload', methods: ['post'], summary: 'Upload a product image' }
], true, 'Products');

addPaths(paths, '/api/customer', [
    { path: '/products', methods: ['get'], summary: 'List customer products' },
    { path: '/products/featured', methods: ['get'], summary: 'List featured products' },
    { path: '/products/new-arrivals', methods: ['get'], summary: 'List new arrivals' },
    { path: '/products/:id', methods: ['get'], summary: 'Get a customer product' }
], false, 'Customer products');

addPaths(paths, '/api/cart', [
    { path: '/', methods: ['get', 'delete'], summary: 'Get or clear the cart' },
    { path: '/add', methods: ['post'], summary: 'Add a product to the cart' },
    { path: '/apply-coupon', methods: ['post'], summary: 'Apply a coupon to the cart' },
    { path: '/coupon', methods: ['delete'], summary: 'Remove the cart coupon' },
    { path: '/:productId', methods: ['patch', 'delete'], summary: 'Update or remove a cart item' }
], true, 'Cart');

addPaths(paths, '/api/coupon', [
    { path: '/', methods: ['get', 'post'], summary: 'List or create coupons' },
    { path: '/:id', methods: ['get', 'patch', 'delete'], summary: 'Get, update, or delete a coupon' },
    { path: '/:id/status', methods: ['patch'], summary: 'Update coupon status' }
], true, 'Coupons');

addPaths(paths, '/api/addresses', [
    { path: '/', methods: ['get', 'post'], summary: 'List or create addresses' },
    { path: '/default', methods: ['get'], summary: 'Get the default address' },
    { path: '/:id', methods: ['get', 'patch', 'delete'], summary: 'Get, update, or delete an address' },
    { path: '/:id/default', methods: ['patch'], summary: 'Set the default address' }
], true, 'Addresses');

addPaths(paths, '/api/home', [
    { path: '/hero-slides', methods: ['get'], summary: 'List hero slides' },
    { path: '/hero-slides', methods: ['post'], summary: 'Create a hero slide', secured: true },
    { path: '/hero-slides/:id', methods: ['patch', 'delete'], summary: 'Update or delete a hero slide', secured: true },
    { path: '/hero-slides/:id/status', methods: ['patch'], summary: 'Update hero slide status', secured: true },
    { path: '/promo-banners', methods: ['get'], summary: 'List promo banners' },
    { path: '/promo-banners', methods: ['post'], summary: 'Create a promo banner', secured: true },
    { path: '/promo-banners/:id', methods: ['patch', 'delete'], summary: 'Update or delete a promo banner', secured: true },
    { path: '/promo-banners/:id/status', methods: ['patch'], summary: 'Update promo banner status', secured: true },
    { path: '/category-tiles', methods: ['get'], summary: 'List category tiles' },
    { path: '/category-tiles', methods: ['post'], summary: 'Create a category tile', secured: true },
    { path: '/category-tiles/:id', methods: ['patch', 'delete'], summary: 'Update or delete a category tile', secured: true },
    { path: '/category-tiles/:id/status', methods: ['patch'], summary: 'Update category tile status', secured: true }
], false, 'Home content');

addPaths(paths, '/api/orders', [
    { path: '/', methods: ['get', 'post'], summary: 'List or create orders' },
    { path: '/me', methods: ['get'], summary: 'List the current user orders' },
    { path: '/:id', methods: ['get'], summary: 'Get an order' },
    { path: '/:id/status', methods: ['patch'], summary: 'Update order status' },
    { path: '/:id/cancel', methods: ['patch'], summary: 'Cancel an order' }
], true, 'Orders');

addPaths(paths, '/api/reviews', [
    { path: '/product/:productId', methods: ['get'], summary: 'List product reviews' },
    { path: '/me', methods: ['get'], summary: 'List the current user reviews', secured: true },
    { path: '/', methods: ['post'], summary: 'Create a review', secured: true },
    { path: '/:id', methods: ['patch', 'delete'], summary: 'Update or delete a review', secured: true }
], false, 'Reviews');

addPaths(paths, '/api/wishlist', [
    { path: '/', methods: ['get', 'post', 'delete'], summary: 'Get, add to, or clear the wishlist' },
    { path: '/check/:productId', methods: ['get'], summary: 'Check a product in the wishlist' },
    { path: '/:productId', methods: ['delete'], summary: 'Remove a product from the wishlist' }
], true, 'Wishlist');

addPaths(paths, '/api/admin', [
    { path: '/dashboard', methods: ['get'], summary: 'Get admin dashboard analytics' }
], true, 'Admin');

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'E-commerce API',
            version: '1.0.0',
            description: 'API documentation for the e-commerce backend.'
        },
        servers: [{
            url: `http://localhost:${process.env.PORT || 5000}`,
            description: 'Local development server'
        }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        paths
    },
    apis: []
});

module.exports = swaggerSpec;
