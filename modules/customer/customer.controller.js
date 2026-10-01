const Product = require('../products/products.model');
const { getPagination } = require('../../utils/pagination');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Function to return the all active producst from the
 * Database.Which will serve the front-end for the homepage and products page too.
 */
const getAllProducts = async (req,res)=>{
    try{
        const { page, skip, limit } = getPagination(req);
        const {
            categoryId,
            subcategoryId,
            search,
            featured,
            inStock,
            style,
            color,
            size,
            tag,
            minPrice,
            maxPrice,
            minRating,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = {
            isActive: true
        };

        if(categoryId){
            filter.categoryId=categoryId;
        }
        if(subcategoryId){
            filter.subcategoryId=subcategoryId;
        }
        if(featured !== undefined){
            filter.featured = featured;
        }
        if(style){
            filter.style = { $regex: `^${escapeRegex(style)}$`, $options: 'i' };
        }
        if(color){
            filter['colors.name'] = { $regex: `^${escapeRegex(color)}$`, $options: 'i' };
        }
        if(size){
            filter.sizes = { $regex: `^${escapeRegex(size)}$`, $options: 'i' };
        }
        if(tag){
            filter.tags = { $regex: `^${escapeRegex(tag)}$`, $options: 'i' };
        }
        if(inStock === true){
            filter.stock = { $gt: 0 };
        }
        if(minRating !== undefined){
            filter.averageRating = { $gte: Number(minRating) };
        }
        if(search){
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { style: { $regex: search, $options: 'i' } },
                { material: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
                { 'colors.name': { $regex: search, $options: 'i' } }
            ];
        }
        if(minPrice !== undefined || maxPrice !== undefined){
            filter.price = {};
            if(minPrice !== undefined) filter.price.$gte = Number(minPrice);
            if(maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('categoryId','name slug')
            .populate('subcategoryId','name slug')
            .sort(sort);

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            products
        });
    }
    catch(err){
        res.status(500).json({message: err.message});
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
        _id: req.params.id,
        isActive:true
    })
    .populate('categoryId','name')
    .populate('subcategoryId','name');

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
module.exports = {
    getAllProducts,
    getFeaturedProducts,
    getNewArrivals,
    getProductById
};
