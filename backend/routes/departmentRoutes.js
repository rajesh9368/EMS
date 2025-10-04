const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All department management routes require authentication
router.use(protect);

router.route('/')
    .get(departmentController.getAllDepartments) // Read is allowed for all authenticated users
    .post(restrictTo('admin', 'HR'), departmentController.createDepartment); // Create restricted

router.route('/:id')
    .put(restrictTo('admin', 'HR'), departmentController.updateDepartment) // Update restricted
    .delete(restrictTo('admin', 'HR'), departmentController.deleteDepartment); // Delete restricted

module.exports = router;
