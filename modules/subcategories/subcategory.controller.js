const Subcategory = require('./subcategory.model');
const Category = require('../categories/category.model');
const slugify = require('slugify');
//const subcategoryModel = require('./subcategory.model');
const createSubCategory = async(req,res)=>{
    try{
        const {name ,categoryId ,image} = req.body;
        if(!name || !categoryId){
            return res.status(400).json({"message": "name and id required"});
        }
        const category = await Category.findById(categoryId);
        if(!category){
            return res.status(404).json({"message": "category not found"});
        }
        //if catgory exist generate slug
        const generatedSlug = slugify(name,
            {
            lower:true,
            strict: true
        });
        //check for duplicates

        const existingSubcategory = await Subcategory.findOne(
            {
                categoryId,
                $or: [
                    {name},
                    {slug: generatedSlug}
                ]
            });
        if (existingSubcategory) {
            return res.status(400).json({
                message: 'Subcategory already exists in this category'
            });
        }
        const subcategory = await Subcategory.create({
            name,
            slug: generatedSlug,
            categoryId,
            image,
        });
        res.status(200).json({message: 'Subcategory created successfully',subcategory})

    }   
    catch(err){
        res.status(500).json({
        message: err.message
    });
    }
}
const getSubCategoriesById = async(req, res)=>{
    try {

        const subcategory = await Subcategory
            .findById(req.params.id)
            .populate('categoryId', 'name');

        if (!subcategory) {
            return res.status(404).json({
                message: 'Subcategory not found'
            });
        }

        res.status(200).json({
            message: 'Subcategory fetched successfully',
            subcategory
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

}
const getAllSubCategories = async(req,res)=>{
    try{
        //user os requiestinf thats why query
        const {categoryId} = req.query;
        const filter = {};
        if(categoryId){
            filter.categoryId=categoryId;
        }
        //added filter if only the user sends it.
        const subcategories = await Subcategory.find(filter)
        .populate('categoryId' ,'name')
        .sort({name: 1})
        res.status(200).json({message: 'Subcategories fetched successfully',
            subcategories})     
    }
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
}
const updateSubCategoryById = async(req,res)=>{
    try {
        const updateData = {...req.body};
        if(updateData.name){
            updateData.slug = slugify(
                updateData.name,
                {
                    lower: true,
                    strict: true
                }
            )
        }
        const existingSubcategory = await Subcategory.findOne({
            _id: {$ne: req.params.id},
            categoryId: updateData.categoryId,
            $or: [
                {name: updateData.name},
                {slug: updateData.slug},
            ]
        });
        if(existingSubcategory) {
            return res.status(400)
            .json({"message":"Suacatgeory already exists"});
        }
        const subcategory = await Subcategory.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );
        if (!subcategory) {
            return res.status(404).json({
                "message": 'Subcategory not found'
            });
        }
        res.status(200).json({
            "message":
                'Subcategory updated successfully',
            subcategory
        });

    } catch (err) {
        res.status(500).json({
            "message": err.message
        });

    }
};
const deleteSubCategoryById = async(req,res)=>{
    try{
        const subcategory =
            await Subcategory.findByIdAndUpdate(
                req.params.id,
                {
                    isActive: false
                },
                {
                    new: true
                }
            );

        if (!subcategory) {
            return res.status(404).json({
                message: 'Subcategory not found'
            });
        }
        res.status(200).json({
            message:
                'Subcategory disabled successfully',
            subcategory
        });
    }
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
}
const updateStatusSubCategoryById = async(req,res)=>{
    try{
        const { isActive } = req.body;

        if (
            typeof isActive !== 'boolean'
        ) {
            return res.status(400).json({
                message:
                    'isActive must be boolean'
            });
        }

        const subcategory =
            await Subcategory.findByIdAndUpdate(
                req.params.id,
                {
                    isActive
                },
                {
                    new: true
                }
            );

        if (!subcategory) {
            return res.status(404).json({
                message:
                    'Subcategory not found'
            });

    }
    res.status(200).json({
            message:
                'Status updated successfully',
            subcategory
        });
}
    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
}
module.exports ={
    createSubCategory,
    deleteSubCategoryById,
    getAllSubCategories,
    getSubCategoriesById,
    updateSubCategoryById,
    updateStatusSubCategoryById,
}