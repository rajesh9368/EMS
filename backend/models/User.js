const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        minlength: 8,
        select: false // Never return password hash in queries by default
    },
    role: {
        type: String,
        enum: ['employee', 'HR', 'admin'],
        default: 'employee'
    }
});

// DOCUMENT MIDDLEWARE: Runs before .save() and .create()
userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    next();
});

// INSTANCE METHOD: Compare candidate password with the one in the database
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
