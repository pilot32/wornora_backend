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
/** Function to get all the coupons in the list 
 * 
*/

const getAllCoupons = async (req,res)=>{
    try{
        const coupons = await Coupon.find()
        .sort({createdAt: -1});

        return res.status(200).json({
            coupons
        });
    }
    catch(err){
        return res.status(500).json({
            message: err.message
        });
    }
}
/** Function to get the cuopons by id. */
const getCuponById = async (req,res) => {
    try{
        const cuopon = await Coupon.findById(req.params.id);
        if(!cuopon){
            return res.status(404).json({
                message: 'Cuopon not found'
            });
        }
        return res.status(200).json({
            cuopon
        });
    }
    catch(err){
        return res.status(500).json({
            message: err.message
        });
    }
}
/**Fucntion to update the details of the cuopon*/
const updateCouponById = async (req,res)=>{
    try{
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, 
            req.body, 
            { new: true, 
            runValidators: true });
        if(!coupon){ 
            return res.status(404).json({
                message: 'Coupon not found'
            });
        }
        return res.status(200).json({ message: 'Coupon updated successfully', coupon });
    }
    catch(err){
        return res.status(500).json({ message: err.message });
    }
}

const updateCouponStatusById = async (req, res) => {
    try {
        const { isActive } = req.body;
        if(typeof isActive !== 'boolean'){
            return res.status(400).json({
                message: 'isActive must be boolean'
            });
        }
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, 
            { isActive }, 
            { new: true });
        if (!coupon) {
            return res.status(404).
            json({ message: 'Coupon not found' });
        }
        return res.status(200).json({ message: 'Status updated successfully', coupon });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * Fucntion to delete the cuopon by the id.
 */

const deleteCouponById = async (req,res) => { 
    try{
        const coupon = await Coupon.findByIdAndDelete(req.params.id); 

        if(!coupon){
            return res.status(404).json({
                message: 'Coupon not found'
            });
        }
        return res.status(200).json({
            message: 'Coupon deleted successfully'
        });
    }
    catch(err){
        return res.status(500).json({
            message: err.message
        }); 
    }
}
module.exports = {
    createCoupon,
    getAllCoupons,
    getCuponById,
    updateCouponById,
    updateCouponStatusById,
    deleteCouponById
}
