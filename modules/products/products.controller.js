const Product = require('./products.model');
const Category = require('../categories/category.model');
const Subcategory = require('../subcategories/subcategory.model');
const slugify = require('slugify');




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
module.exports = {
    createProduct
}