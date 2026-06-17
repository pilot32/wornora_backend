const Coupon = require('./coupon.model');

/**
 * Function to create a new cuopon code 
 */

const createCoupon = async (req, res) => {
    try {
        //no need to destructure everything from req.body, just use it directly using the dot convention.
        const data = req.body;
        const existingCoupon = await Coupon.findOne({code: data.code});
        if (existingCoupon) {
            return res.status(400).json({
                message: 'Coupon code already exists'
            });
        }

        const coupon = await Coupon.create(data);

        return res.status(201).json({
            message:
                'Coupon created successfully',
            coupon
        });
    } catch (err) {

        return res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    createCoupon
}
