const Product = require('../products/products.model');


/**
 * Function to return the all active producst from the
 * Database.Which will serve the front-end for the homepage and products page too.
 */
const getAllProducts = async (req,res)=>{
    try{
        const {
            categoryId,
            subcategoryId,
        } = req.query;
        const filter = {
            isActive: true,
        };
        if(categoryId){
            filter.categoryId=categoryId;
        }
        if(subcategoryId){
            filter.subcategoryId=subcategoryId;
        }
        
        const products = await Product.find(filter)
            .populate('categoryId','name')
            .populate('subcategoryId','name')
            .sort({createdAt:-1});

            res.status(200).json({products});
    }
    catch(err){
        res.status(500),json({message:err.message});
    }
}
/**
 * Function to get the all featured products for home page and product pages too
 * since we have less products that why 
 */

const getFeaturedProducts = async (req,res) =>{
    try{
        const products = await Product.find({
        isActive: true,
        featured: true
    });
    res.status(200).json({products});
    }
    catch(err){
    
    res.status(500).json({message:err.message});
    }
}
/**
 * Funciton to get the new Arrivals using the logic of createdAt=-1 so that it returns the latest
 * products uploaded to the database;
 */

const getNewArrivals = async(req,res)=>{
    try{
        const products = await Product.find({isActive: true})
        .sort({createdAt:-1})
        .limit(12);
        res.status(200).json({products});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

/**
 * Function to get the specific products according to the id 
 * for the product page in the customer side;
 */

const getProductById = async(req,res)=>{
    try{
        const product = await Product.findOne({
        id: req.params.id,
        isActive:true
    })
    .populate('categoryId','name')
    .populater('subcategoryId','name');

    if(!product){
        return res.status(400).json({'message':'no product found'});
    }
    return res.status(200).json({product});
    }
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
}
/**Function to get the product according to search pattern
 * MVP-no regex just simple search and lookup in DB.
 */
const getProductBySearch = async (req,res) => {
    const{
        categoryId,
        subcategoryId,
        search,
    }=req.query;

}

module.exports={
    getAllProducts,
    getFeaturedProducts,
    getNewArrivals,
    getProductById,
}