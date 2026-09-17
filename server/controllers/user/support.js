const Support = require('../../models/support');
const { uploadToS3 } = require('../../config/aws');

class UserSupportController {
    // Create support ticket
    async createTicket(req, res) {
        try {
            const data = req.body;
            data.user = req.body.userId;
            const ticket = await Support.create(data);

            // const ticket = await Support.create(req.body);
            const populatedTicket = await Support.findById(ticket._id)
                .populate('user', 'name email');

            res.status(201).json({
                status: 201,
                message: 'Support ticket created successfully',
                data: populatedTicket
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async updateTicket(req, res) {
        try {

            const ticket = await Support.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            ).populate('user', 'name email').populate('assignedTo', 'name email');

            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    message: 'Support ticket not found'
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Support ticket updated successfully',
                data: ticket
            });
        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get user's tickets
    async getMyTickets(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;

            let query = { user: req.user.id };
            if (status) query.status = status;

            const tickets = await Support.find(query)
                .populate('assignedTo', 'name email')
                .populate('responses.respondedBy', 'name email')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 });

            const count = await Support.countDocuments(query);

            res.status(200).json({
                status: 200,
                message: 'Support tickets retrieved successfully',
                data: tickets,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalTickets: count
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get single ticket
    async getTicket(req, res) {
        try {
            const ticket = await Support.findOne({
                _id: req.params.id,
                user: req.user.id
            })
                .populate('assignedTo', 'name email')
                .populate('responses.respondedBy', 'name email');

            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    message: 'Support ticket not found'
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Support ticket retrieved successfully',
                data: ticket
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Add response to ticket
    async addResponse(req, res) {
        try {
            const { message } = req.body;

            const ticket = await Support.findOneAndUpdate(
                { _id: req.params.id, user: req.user.id },
                {
                    $push: {
                        responses: {
                            message,
                            respondedBy: req.user.id,
                            isAdminResponse: false
                        }
                    }
                },
                { new: true }
            ).populate('responses.respondedBy', 'name email');

            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    message: 'Support ticket not found'
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Response added successfully',
                data: ticket
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = new UserSupportController();