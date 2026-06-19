const Category = require('./category.model');
const slugify = require('slugify');

const createCategory = async(req,res)=>{
    try{

        const { name, slug, isActive } = req.body;
        const generatedSlug = slug
            ? slugify(slug, { lower: true, strict: true })
            : slugify(name || '', { lower: true, strict: true });

        const existingCategory = await  Category.findOne({
            $or: [{ name }, { slug: generatedSlug }]
        });
        //check for existing category 
        if(existingCategory){
            return res.status(400)
            .json({"message": "category with the same name or slug already exists"});
        }

        const category = await Category.create({
            name,
            slug: generatedSlug,
            isActive,
        });
        res.status(201)
        .json({"message": "Category created",category});

    }
    catch(err){
        res.status(500)
        .json({"message": err.message});
    }

    
}

const getCategoryById = async (req,res)=>{
    try{
        const category = await Category.findById(req.params.id);
        if(!category){
            return res.status(404).json({"message": "category not found"});
        }
        res.status(200)
        .json({"message": "category fetched successfully",category});
    }
    catch(err){
        res.status(500)
        .json({"message": err.message});
    }
}
const getAllCategory = async (req,res)=>{
    try{
        const { isActive, search } = req.query;

        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive;
        }
        if (search) {
            filter.name = {
                $regex: search,
                $options: 'i'
            };
        }

        const categories = await Category.find(filter)
            .sort({ createdAt: -1 });

        if(!categories || categories.length === 0){
            return res.status(404).json({"message": "No categories found"});
        }
        res.status(200).json({
            message: "categories fetched successfully",
            categories
        });
    }
    catch(err){
        res.status(500).json({"message": err.message});
    }
}

const deleteCategoryById = async(req,res)=>{
    try{
        //const {id} = req.body;
        const category = await Category.findByIdAndDelete(req.params.id);
        if(!category){
            return res.status(404).json({"message": "category not found"});
        }
        res.status(200)
        .json({"message": "category deleted successfully"});
    }
    catch(err){ 
        res.status(400).json({"Message": "Unable to delete the category"});
    }

}
const updateCategoryById =async(req,res)=>{
   try {

        const updateData = { ...req.body };

        // If name changes and slug is not explicitly provided, regenerate slug
        if (updateData.name && !updateData.slug) {
            updateData.slug = slugify(
                updateData.name,
                {
                    lower: true,
                    strict: true
                }
            );
        } else if (updateData.slug) {
            updateData.slug = slugify(updateData.slug, { lower: true, strict: true });
        }

        // Check for duplicate name/slug
        if (updateData.name || updateData.slug) {

            const existingCategory = await Category.findOne({
                _id: { $ne: req.params.id },
                $or: [
                    { name: updateData.name },
                    { slug: updateData.slug }
                ]
            });
            if (existingCategory) {
                return res.status(400).json({
                    message: 'Category with same name or slug already exists'
                });
            }
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!category) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        res.status(200).json({
            message: 'Category updated successfully',
            category
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
}
const updateCategoryStatusById = async(req,res)=>{
    try
    {
        const {isActive} = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                isActive
            },
            {
                new: true
            }
        );
        if(!category){
            res.status(404)
            .json({"Message": "Category with id do not exist"});
        }
        res.status(200).json({
            message: "Category status updated successfully",
            category
        });

        

    }
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
};
module.exports= {
    createCategory,
    getCategoryById,
    getAllCategory,
    deleteCategoryById,
    updateCategoryById,
    updateCategoryStatusById
}