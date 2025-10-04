const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    // emp_id is handled by Mongoose's default _id
    name: {
        type: String,
        required: [true, 'Employee name is required.'],
        validate: {
            validator: (val) => /^[a-zA-Z\s]+$/.test(val),
            message: 'Name must contain only alphabetic characters and spaces.'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department ID is required.']
    },
    role: {
        type: String,
        enum: ['employee', 'HR', 'admin'],
        default: 'employee'
    },
    joining_date: {
        type: Date,
        default: Date.now
    },
    // NEW: Link to the User model (for login credentials)
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true, // Only one employee record per user account
        sparse: true, // Allows multiple null values (for unlinked employees)
        required: false
    }
}, {
    // Enable virtual fields if needed later, and to ensure JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
