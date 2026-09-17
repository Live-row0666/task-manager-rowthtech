const tasks = require('../models/task');
const projects = require('../models/project');
const axios = require('axios');

const imsTicketsToTaskConversion = async (req,res) => {

    const Project = await projects.find({name: /IMS/i}).select('_id');   
    
    try {
        const { status = '', isActive = 'true', skip = '0', search = '' } = req.query;
        
        const response = await axios.get(`https://ims.rowthtech.com/api/support/getAllTicketShowForAdmin?status=${status}&limit=50000&page=${skip}&isActive=${isActive}&search=${search}`);
        
        const tickets = response.data.result;
        
        for(const ticket of tickets) {
            // Check if task already exists
            const existingTask = await tasks.findOne({
                summary: `[IMS-${ticket.ticketId}] ${ticket.moduleName}`
            });

            if (!existingTask) {
                await tasks.create({
                    project: Project[0]._id,
                    workType: 'Bug', 
                    status: ticket.status === 'resolved' ? 'Done' : 'In Progress',
                    summary: `[IMS-${ticket.ticketId}] ${ticket.moduleName}`,
                    description: ticket.description,
                    priority: ticket.priority === 'medium' ? 'Medium' : 'High',
                    labels: [ticket.issueType, ticket.moduleName],
                    attachments: ticket.image ? [{
                        name: `IMS-${ticket.ticketId}-image`,
                        url: ticket.image,
                        uploadedAt: ticket.createdAt,
                        fileType: 'image'
                    }] : [],
                    createdAt: ticket.createdAt,
                    updatedAt: ticket.updatedAt
                });
            }
        }
        return res.status(200).json({ status:200,message: 'All Tickets are converted To task and everything is uptodate' });
       

    } catch (error) {
        console.error('Error fetching IMS tickets:', error);
        return res.status(500).json({status:500, error: 'Error fetching IMS tickets' });
    }

};

module.exports = imsTicketsToTaskConversion;


