const { Technology, TechnologyCategory } = require('../../models/technology');

// CRUD Operations for Technology Category
const createCategory = async (req, res) => {
    try {
        // Check if category with same name already exists
        const existingCategory = await TechnologyCategory.findOne({
            name: req.body.name
        });

        if (existingCategory) {
            return res.status(400).json({
                status: 400,
                message: 'Category with this name already exists'
            });
        }

        const category = new TechnologyCategory(req.body);
        await category.save();
        return res.status(201).json({ status: 201, message: 'Category created successfully' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const { searchQuery = '', page = 1, limit = 10 } = req.query;
        let query = {};
        if (searchQuery) {
            query = { name: { $regex: searchQuery, $options: 'i' } };
        }
        const skip = (page - 1) * limit;
        const categories = await TechnologyCategory.find(query)
            .skip(skip)
            .limit(parseInt(limit)).select('name description')
            .lean();
        const total = await TechnologyCategory.countDocuments(query);
        return res.status(200).json({
            categories,
            status: 200,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCategory = await TechnologyCategory.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }
        return res.status(200).json({ message: "Category Updated SuccessFully", status: 200 });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await TechnologyCategory.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }
        return res.status(200).json({ status: 200, message: 'Category deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};

// CRUD Operations for Technology
const createTechnology = async (req, res) => {
    try {
        // Check if technology with same name already exists
        const existingTechnology = await Technology.findOne({
            name: req.body.name
        });
        
        if (existingTechnology) {
            return res.status(400).json({
                status: 400,
                message: 'Technology with this name already exists'
            });
        }

        const technology = new Technology(req.body);
        const savedTechnology = await technology.save();
        return res.status(201).json({ status: 201, data: savedTechnology, message: 'Technology created successfully' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};

const getAllTechnologies = async (req, res) => {
    try {
        const { searchQuery = '', categoryId = null, page = 1, limit = 10 } = req.query;
        let query = {};
        if (searchQuery && searchQuery.trim() !== '') {
            query.name = { $regex: searchQuery, $options: 'i' };
        }
        if (categoryId) {
            query.category = categoryId;
        }
        const skip = (page - 1) * limit;
        const technologies = await Technology.find(query)
            .select('name description category')
            .populate('category', 'name description')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        const total = await Technology.countDocuments(query);
        return res.status(200).json({
            status: 200,
            data: technologies,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};

const updateTechnology = async (req, res) => {
    try {
        const { id } = req.params;
         console.log(req.body)
        const updatedTechnology = await Technology.findByIdAndUpdate(id, req.body, { new: true }).populate('category');
        if (!updatedTechnology) {
            return res.status(404).json({ status: 404, message: 'Technology not found' });
        }
        return res.status(200).json({ status: 200, data: updatedTechnology, message: 'Technology updated successfully' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};

const deleteTechnology = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTechnology = await Technology.findByIdAndDelete(id);
        if (!deletedTechnology) {
            return res.status(404).json({ status: 404, message: 'Technology not found' });
        }
        return res.status(200).json({ status: 200, message: 'Technology deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};

module.exports = {
    // Technology Category operations
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    // Technology operations
    createTechnology,
    getAllTechnologies,
    updateTechnology,
    deleteTechnology
};
