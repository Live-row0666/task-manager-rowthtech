const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 400,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

const validateTask = [
    body('summary').notEmpty().withMessage('Task summary is required'),
    body('project').isMongoId().withMessage('Valid project ID is required'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
    handleValidationErrors
];

const validateUser = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

const validateProject = [
    body('name').notEmpty().withMessage('Project name is required'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
    handleValidationErrors
];

module.exports = {
    validateTask,
    validateUser,
    validateProject,
    handleValidationErrors
};