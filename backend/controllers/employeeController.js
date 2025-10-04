const Employee = require('../models/Employee');
const User = require('../models/User'); // Need to import User model

// Helper to handle Mongoose validation and other errors
const handleError = (res, error, defaultMessage = 'Operation failed.') => {
    if (error.code === 11000) {
        // Handle unique constraint errors for email OR user_id
        return res.status(400).json({ message: 'Duplicate value entered for email or linked user account. Please check inputs.' });
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation failed.', errors: messages });
    }
    console.error("Controller Error:", error);
    res.status(500).json({ message: defaultMessage });
};

// ----------------------------------------------------------------------
// NEW: Fetch all users not currently linked to an employee record
// ----------------------------------------------------------------------
const getUnlinkedUsers = async (req, res) => {
    try {
        // Find all employees that have a user_id defined
        const linkedUserIds = (await Employee.find({ user_id: { $ne: null } }).select('user_id')).map(emp => emp.user_id);

        // Find all users whose _id is NOT in the linkedUserIds array
        // We only need id, email, and role for the frontend selection
        const unlinkedUsers = await User.find({ _id: { $nin: linkedUserIds } }).select('_id email role');
        
        res.status(200).json({
            status: 'success',
            data: {
                unlinkedUsers
            }
        });
    } catch (error) {
        handleError(res, error, 'Failed to fetch unlinked users.');
    }
};


// ----------------------------------------------------------------------
// 1. Get All Employees (GET /api/employees)
// ----------------------------------------------------------------------
const getAllEmployees = async (req, res) => {
    try {
        const { search, department_id, joining_date } = req.query;
        const query = {};

        // Search filter (by name or email)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Department filter
        if (department_id) {
            query.department_id = department_id;
        }

        // Joining Date filter
        if (joining_date) {
            // Match records where joining_date is equal to the given date (start of day)
            const date = new Date(joining_date);
            date.setHours(0, 0, 0, 0);
            
            // To find records on the exact date, we look for records between
            // the start of that day and the start of the next day.
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            query.joining_date = {
                $gte: date,
                $lt: nextDay
            };
        }

        // Find employees and populate linked fields
        const employees = await Employee.find(query)
            .populate('department_id', 'name')
            .populate('user_id', 'email role') // Populate user details
            .sort({ name: 1 }); 

        res.status(200).json({
            status: 'success',
            data: {
                employees
            }
        });
    } catch (error) {
        handleError(res, error, 'Failed to retrieve employees.');
    }
};

// ----------------------------------------------------------------------
// 2. Create Employee (POST /api/employees)
// ----------------------------------------------------------------------
const createEmployee = async (req, res) => {
    try {
        const { user_id, ...rest } = req.body;
        
        const employeeData = rest;
        // Only include user_id if it's provided and not empty
        if (user_id) {
            employeeData.user_id = user_id;
        }
        
        const newEmployee = await Employee.create(employeeData);

        // After creating the employee, fetch the fully populated object for the response
        const populatedEmployee = await Employee.findById(newEmployee._id)
            .populate('department_id', 'name')
            .populate('user_id', 'email role');
            
        res.status(201).json({
            status: 'success',
            message: 'Employee created successfully.',
            data: {
                employee: populatedEmployee
            }
        });
    } catch (error) {
        handleError(res, error, 'Failed to create employee.');
    }
};

// ----------------------------------------------------------------------
// 3. Update Employee (PUT /api/employees/:id)
// ----------------------------------------------------------------------
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Special handling for unlinking a user account
        if (updateData.user_id === '' || updateData.user_id === null) {
            // If the request explicitly tries to unlink, use $unset
            const updatedEmployee = await Employee.findByIdAndUpdate(id, 
                { ...updateData, $unset: { user_id: 1 } }, 
                { new: true, runValidators: true }
            )
            .populate('department_id', 'name')
            .populate('user_id', 'email role');
            
            if (!updatedEmployee) {
                return res.status(404).json({ message: 'Employee not found.' });
            }
            return res.status(200).json({
                status: 'success',
                message: 'Employee updated successfully.',
                data: {
                    employee: updatedEmployee
                }
            });
        }

        // Standard update (either linking a new user or updating other fields)
        const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        })
        .populate('department_id', 'name')
        .populate('user_id', 'email role');

        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Employee updated successfully.',
            data: {
                employee: updatedEmployee
            }
        });
    } catch (error) {
        handleError(res, error, 'Failed to update employee.');
    }
};

// ----------------------------------------------------------------------
// 4. Delete Employee (DELETE /api/employees/:id)
// ----------------------------------------------------------------------
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedEmployee = await Employee.findByIdAndDelete(id);

        if (deletedEmployee) {
            res.status(200).json({
                status: 'success',
                message: 'Employee deleted successfully.'
            });
        } else {
            res.status(404).json({ message: 'Employee not found.' });
        }
    } catch (error) {
        handleError(res, error, 'Failed to delete employee.');
    }
};

module.exports = {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getUnlinkedUsers 
};
