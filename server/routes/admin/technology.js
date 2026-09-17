
const express = require('express');
const router = express.Router();
const Controller = require('../../controllers/admin/technology');

// Technology Category Routes
router.post('/category', Controller.createCategory);
router.get('/category', Controller.getAllCategories);
router.put('/category/:id', Controller.updateCategory);
router.delete('/category/:id', Controller.deleteCategory);

// Technology Routes
router.post('/', Controller.createTechnology);
router.get('/', Controller.getAllTechnologies);
router.put('/:id', Controller.updateTechnology);
router.delete('/:id', Controller.deleteTechnology);

module.exports = router;