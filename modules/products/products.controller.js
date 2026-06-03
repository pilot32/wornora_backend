const Product = require('./products.model');
const Category = require('../categories/category.model');
const Subcategory = require('../subcategories/subcategory.model');
const slugify = require('slugify');
//TODO: disable or enable the featured or not option 




const createProduct = async (req,res) => {
    try{
        const {
            name,
            slug,
            description,
            categoryId,
            subcategoryId,
            price,
            discountedPrice,
            stock,
            images,
            isActive,
            featured,
        } = req.body;

        // Validation for required fields 
        if(
            !name||
            !description ||
            !categoryId ||
            !subcategoryId ||
            price === undefined
        ){
            return res.status(400).json({"message": "Please provide all required fields correctly"});
        }
        const category = await Category.findById(categoryId);
        if(!category){
            return res.status(400).json({"message": "Please enter a valid category ID"});
        }
        const subcategory = await Subcategory.findById(subcategoryId);
        if(!subcategory){
            return res.status(400).json({"message": "Please enter a valid subcategory ID"});
        }

        // Checking the relationship if it's valid or not 
        if(subcategory.categoryId.toString() !== categoryId){
            return res.status(400).json({"message":"No active relationship found between category and subcategory"});
        }

        if(price < 0){
            return res.status(400).json({"message":"Price cannot be negative"});
        }
        if (
            discountedPrice &&
            discountedPrice > price
        ){
            return res.status(400).json({
            message:
                "Discounted price cannot exceed price"
            });
        }
        const generatedSlug = slugify(
            name,
            {
                lower: true,
                strict: true
            }
        );
        const existingProduct = await Product.findOne({slug: generatedSlug});
        if(existingProduct){
            return res.status(400).json({"message":"Product already exists"});
        }
        const product = await Product.create(
            {
                name,
                slug: generatedSlug,
                description,
                categoryId,
                subcategoryId,
                price,
                discountedPrice,
                stock,
                images,
                isActive,
                featured
            });
            return res.status(201).json({"message":"Product created successfully", product});
    }
    catch(err){
        return res.status(500).json({
            message: err.message
        });
    }
}

const getAllProducts = async (req,res)=>{
    try{
        const {
            categoryId,
            subcategoryId,
            featured,
            isActive,
        } = req.query;
        //using query paramters better for pagination and filtering;

        const filter ={};
        if(categoryId){
            filter.categoryId=categoryId;
        }
        if(subcategoryId){
            filter.subcategoryId=subcategoryId;
        }
        if(featured){
            filter.featured = featured === 'true';
        }
        if(isActive){
            filter.isActive=isActive==='true';
        }

        const products = await Product.find(filter)
        .populate('categoryId','name')
        .populate('subcategoryId','name')
        .sort({createdAt:-1});
        if (products.length === 0) {
            return res.status(200).json({
                message: 'No products match the criteria',
                products: []
            });
        }
        res.status(200).json({
            "message":"Products fetched succesfully",products
        });
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

const getProductById= async (req,res)=>{
    try{
        const product = await Product.findById(req.params.id)
        .populate('categoryId','name')
        .populate('subcategoryId','name');
        
        if(!product){
            return res.status(400).json({"message":"No Product found"});
        }
        return res.status(201).json({"message":"Product fetched succesfully",product});
    }
    catch(err){
        res.status(400).json({"message":err.message});
    }

}
const updateProductById= async (req,res)=>{
    try{
        const updateProduct = {...req.body};
        if(updateProduct.name){
            updateProduct.slug = slugify(
                updateProduct.name,
                {
                    lower: true,
                    strict: true
                }
            )};
            const currentProduct = await Product.findById(req.params.id);
            if(!currentProduct){
                return res.status(400).json({ message: 'Product not found'});
            }
            if(updateProduct.slug){
                //check the slug because the user will be sending id only of the product not the name 
            
                const existingProduct = await Product.findOne({
                    _id: { $ne: req.params.id },
                    slug: updateProduct.slug
                });
            if (existingProduct) {
                return res.status(400).json({
                    message:
                        'Product with same name already exists'
                });
            }
        }
            //take the name of category and subcategory if the user has provided or not 
            //the user will only provide the id of the procduct so we will only feed in new updated product 
            const categoryId =
                updateProduct.categoryId ||
                currentProduct.categoryId;

            const subcategoryId =
                updateProduct.subcategoryId ||
                currentProduct.subcategoryId;
    
            
    //validate if the category and subcategory exists 
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }
        const subcategory = await Subcategory.findById(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({
                message: 'Subcategory not found'
            });
        }
        //validate relationship if they are actually related the category and sucategory 
        if (subcategory.categoryId.toString() !== categoryId.toString()) {
            return res.status(400).json({
                message:
                    'Subcategory does not belong to selected category'
            });
        }
        const finalPrice =
            updateProduct.price ??
            currentProduct.price;

        const finalDiscountedPrice =
            updateProduct.discountedPrice ??
            currentProduct.discountedPrice;
            //validatiing the final price for edge cases
        if (finalPrice < 0) {
            return res.status(400).json({
                message:
                    'Price cannot be negative'
            });
        }
            if (finalDiscountedPrice && finalDiscountedPrice > finalPrice) {
            return res.status(400).json({
                message:
                    'Discounted price cannot exceed actual price'
            });
        }

        //update product 
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateProduct,
            {
                new: true,
                runValidators: true,
            });
        return res.status(200).json({message: "Product updated successfully",product});
    }
    catch(err){
         return res.status(500).json({
            message: err.message
        });
    }
}
const updateProductStatusById = async (req,res)=>{
    try{
        const{isActive} = req.body;
        if(typeof isActive !== 'boolean'){
            return res.status(400).json({message:'isActive must be boolean'});
        }

        const product = await Product.findByIdAndUpdate(req.params.id,
            {
                isActive
            },
            {
                new: true
            });
            if(!product){
                return res.status(400).json({message:'product` not found'});
            }
            res.status(200).json({message:'Status updated successfully',product});
    }
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
}


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    updateProductStatusById
}