const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    // department_id is handled by Mongoose's default _id
    name: {
        type: String,
        required: [true, 'Department name is required.'],
        unique: true,
        trim: true
    },
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
