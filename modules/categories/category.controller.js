const Category = require('./category.model');
const slugify = require('slugify');

const createCategory = async(req,res)=>{
    try{

        const { name, slug, isActive } = req.body;
        const generatedSlug = slug
            ? slugify(slug, { lower: true, strict: true })
            : slugify(name || '', { lower: true, strict: true });

        if (!name) {
            return res.status(400).json({ "message": "name is required" });
        }

        const existingCategory = await  Category.findOne({
            $or: [{ name }, { slug: generatedSlug }]
        });
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

const getCetgoryById = async (req,res)=>{
    try{
        const {id} = req.body;
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
        const categories = await Category.find();
        if(!categories || categories.length === 0){
            return res.status(404).json({"message": "No categories found"});
        }
        res.status(200)
        .json({"message": "categories fetched successqully",categories});
    }
    catch(err){
        res.status(500)
        .json({"message": err.message});
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

        // If name changes, regenerate slug
        if (updateData.name) {
            updateData.slug = slugify(
                updateData.name,
                {
                    lower: true,
                    strict: true
                }
            );
        }
        console.log(updateData);
        console.log(req.params.id);
        // Check for duplicate name/slug
        if (updateData.name || updateData.slug) {

            const existingCategory = await Category.findOne({
                _id: { $ne: req.params.id },
                $or: [
                    { name: updateData.name },
                    { slug: updateData.slug }
                ]
            });
            console.log(existingCategory);
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
        if(typeof isActive !== "boolean"){
            return res.status(400)
            .json({"message": "isActive must be of boolean"});
        }
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
    getCetgoryById,
    getAllCategory,
    deleteCategoryById,
    updateCategoryById,
    updateCategoryStatusById
}