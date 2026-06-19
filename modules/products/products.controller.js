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

        // Validate category exist or not 
        const category = await Category.findById(categoryId);
        if(!category){
            return res.status(404).json({"message": "Please enter a valid category ID"});
        }
        //validate subcategory exist or not
        const subcategory = await Subcategory.findById(subcategoryId);
        if(!subcategory){
            return res.status(404).json({"message": "Please enter a valid subcategory ID"});
        }

        // Checking the relationship if it's valid or not 
        if(subcategory.categoryId.toString() !== categoryId){
            return res.status(404).json({"message":"No active relationship found between category and subcategory"});
        }
        //generate slug from name and check if the product already exists or not
        const generatedSlug = slugify(name,{
                lower: true,
                strict: true
            });
        //check for duplicate slug 
        const existingProduct = await Product.findOne({slug: generatedSlug});
        if(existingProduct){
            return res.status(400).json({"message":"Product already exists"});
        }
        //create product
        const product = await Product.create(
            {
                name,
                slug: generatedSlug,
                description,
                categoryId,
                subcategoryId,
                price,
                discountedPrice: discountedPrice || null,
                stock: stock || 1,
                images: images || [],
                isActive: isActive !== undefined ? isActive : true,
                featured: featured !== undefined ? featured : false
            });

            await product.populate([
                {path: 'categoryId',select: 'name slug'},
                {path: 'subcategoryId',select: 'name slug'}
            ]);
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
            page = 1,
            limit = 10,
            search,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        //using query paramters better for filtering;

        const filter ={};
        if(categoryId) filter.categoryId=categoryId;

        if(subcategoryId) filter.subcategoryId=subcategoryId;
        if(featured !== undefined) filter.featured = featured === 'true';
        if(isActive !== undefined) filter.isActive = isActive === 'true';
        
        if(search){
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if(minPrice !== undefined || maxPrice !== undefined){
            filter.price = {};
            if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
        }
        //using the params for the pagination 

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum-1)* limitNum;

        //sortin the product 
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        //executin the query 
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('categoryId', 'name slug')
                .populate('subcategoryId', 'name slug')
                .sort(sort)
                .skip(skip)
                .limit(limitNum),
            Product.countDocuments(filter)
        ]);
        res.status(200).json({
            message: 'Products fetched successfully',
            data: products,
            pagination: {
                currentPage: pageNum,
                limit: limitNum,
                totalItems: total,
                totalPages: Math.ceil(total / limitNum),
                hasNextPage: pageNum < Math.ceil(total / limitNum),
                hasPrevPage: pageNum > 1
            }
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
            return res.status(404).json({"message":"No Product found"});
        }
        return res.status(201).json({"message":"Product fetched succesfully",product});
    }
    catch(err){
        res.status(500).json({"message":err.message});
    }

}
const updateProductById= async (req,res)=>{
    try{
        const updateProduct = {...req.body};

        //regenrate slug if name is changed.
        if(updateProduct.name){
            updateProduct.slug = slugify(updateProduct.name,{
                    lower: true,
                    strict: true
                }
            )};
            //get the current product from the db to compare with updated values 
            const currentProduct = await Product.findById(req.params.id);
            if(!currentProduct){
                return res.status(400).json({ message: 'Product not found'});
            }

            //check if duplicate slug exists or not.
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
        //determin the final price of the product 
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
            })
            .populate('categoryId', 'name slug')
            .populate('subcategoryId', 'name slug');
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

        const product = await Product.findByIdAndUpdate(req.params.id,
            {isActive},
            {new: true})
            .populate('categoryId', 'name')
            .populate('subcategoryId', 'name');
            if(!product){
                return res.status(400).json({message:'Product not found'});
            }
            res.status(200).json({message:'Status updated successfully',product});
    }
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
}

//update the featured status 

const updateProductFeaturedStatusById = async (req,res) => {
    try{
        const { featured } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { featured },
            { new: true }
        ).populate('categoryId', 'name')
         .populate('subcategoryId', 'name');

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            message: `Product ${featured ? 'featured' : 'unfeatured'} successfully`,
            product
        });
    }
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
};


//soft delete the product by id

const deleteProductById = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            message: 'Product disabled successfully',
            product: {
                id: product._id,
                name: product.name,
                isActive: product.isActive
            }
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    updateProductStatusById,
    updateProductFeaturedStatusById,
    deleteProductById
}