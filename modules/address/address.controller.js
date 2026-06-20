const Address = require('./address.model');

/**
 * Create a new address for the logged-in user
 */
const createAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressData = { ...req.body, userId };

        // Check how many addresses the user already has
        const addressCount = await Address.countDocuments({ userId });

        // If this is the user's first address, or if it is explicitly set as default
        if (addressCount === 0 || addressData.isDefault === true) {
            addressData.isDefault = true;
            // Clear default flag on all other addresses for this user
            await Address.updateMany({ userId }, { isDefault: false });
        }

        const address = await Address.create(addressData);

        res.status(201).json({
            message: "Address created successfully",
            address
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get all addresses for the logged-in user
 */
const getUserAddresses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addresses = await Address.find({ userId }).sort({ isDefault: -1, updatedAt: -1 });

        res.status(200).json({
            message: "Addresses retrieved successfully",
            addresses
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Get a specific address by ID (verifies ownership)
 */
const getAddressById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const address = await Address.findOne({ _id: id, userId });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        res.status(200).json({
            message: "Address retrieved successfully",
            address
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Update an existing address
 */
const updateAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const updates = req.body;

        const address = await Address.findOne({ _id: id, userId });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        // Handle changes to default address flag
        if (updates.isDefault === true) {
            await Address.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });
        } else if (updates.isDefault === false && address.isDefault === true) {
            // User is trying to set default address to false. 
            // We must ensure there is always at least one default address if other addresses exist.
            const anotherAddress = await Address.findOne({ userId, _id: { $ne: id } }).sort({ updatedAt: -1 });
            if (anotherAddress) {
                anotherAddress.isDefault = true;
                await anotherAddress.save();
            } else {
                // If this is the only address, it must remain the default one
                updates.isDefault = true;
            }
        }

        // Apply updates
        Object.assign(address, updates);
        await address.save();

        res.status(200).json({
            message: "Address updated successfully",
            address
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Delete an address
 */
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const address = await Address.findOne({ _id: id, userId });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const wasDefault = address.isDefault;

        await Address.deleteOne({ _id: id });

        // If the deleted address was the default, set another address as default
        if (wasDefault) {
            const nextAddress = await Address.findOne({ userId }).sort({ updatedAt: -1 });
            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        res.status(200).json({
            message: "Address deleted successfully"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Set an address as the default address
 */
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const address = await Address.findOne({ _id: id, userId });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        // Update all other addresses of the user to be non-default
        await Address.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });

        address.isDefault = true;
        await address.save();

        res.status(200).json({
            message: "Default address set successfully",
            address
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
//TODO: add theget default route to facilitate checkout process
module.exports = {
    createAddress,
    getUserAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
