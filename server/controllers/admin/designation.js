const Designation = require('../../models/designation');

const createNewDesignation = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingDesignation = await Designation.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingDesignation) {
            return res.status(400).json({
                status: 400,
                message: 'Designation already exists'
            });
        }

        const newDesignation = new Designation({ name, description });
        await newDesignation.save();

        return res.status(201).json({
            status: 201,
            message: 'Designation created successfully',
            data: newDesignation
        });
    } catch (error) {
        console.error('Error creating designation:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }

}

const getAllDesignations = async (req, res) => {
    try {
        const { page = 1, limit = 100, search = '', status = true } = req.query;

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (status) {
            query.isActive = status === 'true';
        }

        const totalCount = await Designation.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        const designations = await Designation.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ _id: 1 })
            .lean();

        const pagination = {
            totalPages,
            totalCount,
            currentPage: parseInt(page),
        }
        return res.status(200).json({
            status: 200,
            message: 'Designations retrieved successfully',
            data: {
                designations,
                currentPage: parseInt(page),
                pagination
            }
        });
    } catch (error) {
        console.error('Error fetching designations:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const updateDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const existingDesignation = await Designation.findOne({ name: data?.name });

        if (existingDesignation && existingDesignation._id.toString() !== id) {
            return res.status(400).json({
                status: 400,
                message: 'Designation with same name already exists.'
            })

        }

        const updatedDesignation = await Designation.findByIdAndUpdate(id, data, { new: true });

        return res.status(200).json({
            status: 200,
            message: 'Designation updated successfully',
            data: updatedDesignation
        });
    } catch (error) {
        console.error('Error updating designations:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });

    }
}

module.exports = {
    createNewDesignation,
    getAllDesignations,
    updateDesignation
}