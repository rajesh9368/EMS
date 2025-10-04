const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes after this middleware are protected
router.use(protect);

// NEW: Get all users that are not yet linked to an employee record (for Admin/HR selection)
router.get('/unlinked-users', restrictTo('admin', 'HR'), employeeController.getUnlinkedUsers);

// Routes requiring HR or Admin role
router.route('/')
    .get(employeeController.getAllEmployees) // READ is allowed for all authenticated users
    .post(restrictTo('admin', 'HR'), employeeController.createEmployee); // CREATE restricted

router.route('/:id')
    // GET by ID omitted, assuming all data comes from list view for simplicity
    .put(restrictTo('admin', 'HR'), employeeController.updateEmployee) // UPDATE restricted
    .delete(restrictTo('admin', 'HR'), employeeController.deleteEmployee); // DELETE restricted

module.exports = router;
