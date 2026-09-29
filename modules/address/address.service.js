const Address = require('./address.model');
const ApiError = require('../../utils/apiError');

const createAddressService = async (userId, data) => {
    const addressData = { ...data, userId };

    const addressCount = await Address.countDocuments({ userId });

    if (addressCount === 0 || addressData.isDefault === true) {
        addressData.isDefault = true;
        await Address.updateMany({ userId }, { isDefault: false });
    }

    return Address.create(addressData);
};

const getUserAddressesService = async (userId) => {
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, updatedAt: -1 });
    return addresses;
};

const getAddressByIdService = async (userId, id) => {
    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
        throw new ApiError(404, 'Address not found');
    }

    return address;
};

const getDefaultAddressService = async (userId) => {
    const address = await Address.findOne({ userId, isDefault: true });

    if (!address) {
        throw new ApiError(404, 'Default address not found');
    }

    return address;
};

const updateAddressService = async (userId, id, updates) => {
    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
        throw new ApiError(404, 'Address not found');
    }

    if (updates.isDefault === true) {
        await Address.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });
    } else if (updates.isDefault === false && address.isDefault === true) {
        const anotherAddress = await Address.findOne({ userId, _id: { $ne: id } }).sort({ updatedAt: -1 });

        if (anotherAddress) {
            anotherAddress.isDefault = true;
            await anotherAddress.save();
        } else {
            updates.isDefault = true;
        }
    }

    Object.assign(address, updates);
    await address.save();

    return address;
};

const deleteAddressService = async (userId, id) => {
    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
        throw new ApiError(404, 'Address not found');
    }

    const wasDefault = address.isDefault;

    await Address.deleteOne({ _id: id });

    if (wasDefault) {
        const nextAddress = await Address.findOne({ userId }).sort({ updatedAt: -1 });
        if (nextAddress) {
            nextAddress.isDefault = true;
            await nextAddress.save();
        }
    }

    return null;
};

const setDefaultAddressService = async (userId, id) => {
    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
        throw new ApiError(404, 'Address not found');
    }

    await Address.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });

    address.isDefault = true;
    await address.save();

    return address;
};

module.exports = {
    createAddressService,
    getUserAddressesService,
    getAddressByIdService,
    getDefaultAddressService,
    updateAddressService,
    deleteAddressService,
    setDefaultAddressService
};
