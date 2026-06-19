const Subcategory = require('./subcategory.model');
const Category = require('../categories/category.model');
const slugify = require('slugify');
//const subcategoryModel = require('./subcategory.model');
const createSubCategory = async(req,res)=>{
    try{
        const {name ,categoryId ,image} = req.body;
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

        const existingSubcategory = await Subcategory.findOne({
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
            image: image || '',
        });
        //populate for response 
        await subcategory.populate('categoryId', 'name');
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
        const {categoryId, isActive, search} = req.query;
        
        const filter = {};
        if(categoryId){
            filter.categoryId=categoryId;
        }
        if(isActive !== undefined) filter.isActive = (isActive === 'true' || isActive === true);
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        //added filter if only the user sends it.
        const subcategories = await Subcategory.find(filter)
            .populate('categoryId', 'name')
            .sort({ name: 1 });

        res.status(200).json({
            message: 'Subcategories fetched successfully',
            data: subcategories
        });     
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
        //slug regenration
        if(updateData.name && !updateData.slug){
            updateData.slug = slugify(
                updateData.name,
                { lower: true, strict: true }
            );
        } else if (updateData.slug) {
            updateData.slug = slugify(updateData.slug, { lower: true, strict: true });
        }

        if (updateData.name || updateData.slug) {
            const orConditions = [];
            if (updateData.name) orConditions.push({name: updateData.name});
            if (updateData.slug) orConditions.push({slug: updateData.slug});

            const existingSubcategory = await Subcategory.findOne({
                _id: {$ne: req.params.id},
                $or: orConditions
            });
            if(existingSubcategory) {
                return res.status(400).json({"message":"Subcategory with same name or slug already exists"});
            }
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
            ).populate('categoryId', 'name');

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