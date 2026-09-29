const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const {
    createAddressService,
    getUserAddressesService,
    getAddressByIdService,
    getDefaultAddressService,
    updateAddressService,
    deleteAddressService,
    setDefaultAddressService
} = require('./address.service');

/**
 * Create a new address for the logged-in user
 */
const createAddress = asyncHandler(async (req, res) => {
    const address = await createAddressService(req.user.userId, req.body);

    res.status(201).json(
        new ApiResponse(201, 'Address created successfully', address)
    );
});

/**
 * Get all addresses for the logged-in user
 */
const getUserAddresses = asyncHandler(async (req, res) => {
    const addresses = await getUserAddressesService(req.user.userId);

    res.status(200).json(
        new ApiResponse(200, 'Addresses retrieved successfully', addresses)
    );
});

/**
 * Get a specific address by ID (verifies ownership)
 */
const getAddressById = asyncHandler(async (req, res) => {
    const address = await getAddressByIdService(req.user.userId, req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Address retrieved successfully', address)
    );
});

/**
 * Get the default address for the logged-in user
 */
const getDefaultAddress = asyncHandler(async (req, res) => {
    const address = await getDefaultAddressService(req.user.userId);

    res.status(200).json(
        new ApiResponse(200, 'Default address retrieved successfully', address)
    );
});

/**
 * Update an existing address
 */
const updateAddress = asyncHandler(async (req, res) => {
    const address = await updateAddressService(req.user.userId, req.params.id, req.body);

    res.status(200).json(
        new ApiResponse(200, 'Address updated successfully', address)
    );
});

/**
 * Delete an address
 */
const deleteAddress = asyncHandler(async (req, res) => {
    await deleteAddressService(req.user.userId, req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Address deleted successfully')
    );
});

/**
 * Set an address as the default address
 */
const setDefaultAddress = asyncHandler(async (req, res) => {
    const address = await setDefaultAddressService(req.user.userId, req.params.id);

    res.status(200).json(
        new ApiResponse(200, 'Default address set successfully', address)
    );
});

module.exports = {
    createAddress,
    getUserAddresses,
    getAddressById,
    getDefaultAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
