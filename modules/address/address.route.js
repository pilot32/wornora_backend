const express = require('express');
const router = express.Router();

const {
    createAddress,
    getUserAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require('./address.controller');

const authMiddleware = require('../../middlewares/auth.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');

const {
    createAddressSchema,
    updateAddressSchema,
    idParamSchema
} = require('../../validations/address.validation');

// Create a new address
router.post('/',
    authMiddleware,
    validationMiddleware(createAddressSchema    ),
    createAddress
);

// Get all addresses for the logged-in user
router.get('/',
    authMiddleware,
    getUserAddresses
);

// Get a specific address by ID
router.get('/:id',
    authMiddleware,
    validationMiddleware(idParamSchema, 'params'),
    getAddressById
);

// Update an address by ID
router.patch('/:id',
    authMiddleware,
    validationMiddleware(idParamSchema, 'params'),
    validationMiddleware(updateAddressSchema),
    updateAddress
);

// Delete an address by ID
router.delete('/:id',
    authMiddleware,
    validationMiddleware(idParamSchema, 'params'),
    deleteAddress
);

// Set an address as default
router.patch('/:id/default',
    authMiddleware,
    validationMiddleware(idParamSchema, 'params'),
    setDefaultAddress
);
//TODO: add the get defualt route for checkout facilitation
module.exports = router;
