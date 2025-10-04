const User = require('../models/User');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 

// Use environment variables for secrets/config
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_a_strong_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Helper function to generate a JWT token
const signToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

// ----------------------------------------------------------------------
// 1. User Signup/Registration (POST /api/auth/signup) - Default Employee Role
// ----------------------------------------------------------------------
const signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const newUser = await User.create({
            email,
            password,
            role: 'employee' // Default role for public signups
        });

        const token = signToken(newUser._id, newUser.role);
        
        // Remove password hash before sending response
        newUser.password = undefined; 

        res.status(201).json({
            status: 'success',
            message: 'Account created successfully.',
            token,
            data: {
                user: newUser
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation failed.', errors: messages });
        }
        console.error("Signup error:", error);
        res.status(500).json({ message: 'Internal server error during signup.' });
    }
};

// ----------------------------------------------------------------------
// 2. User Login (POST /api/auth/login)
// ----------------------------------------------------------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Incorrect email or password.' });
        }

        const token = signToken(user._id, user.role);

        res.status(200).json({
            status: 'success',
            message: 'Logged in successfully.',
            token,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};

// ----------------------------------------------------------------------
// 3. Get Current User Profile (GET /api/auth/me) - Protected route
// ----------------------------------------------------------------------
const getMe = async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user._id);
        
        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: 'Internal server error while fetching user profile.' });
    }
};

// ----------------------------------------------------------------------
// 4. Admin User Creation (POST /api/auth/create-user) - Restricted to 'admin'
// ----------------------------------------------------------------------
const createAdminUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // 1. Basic validation
        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Email, password, and role are required.' });
        }
        
        // 2. Role restriction (only allow admin or HR to be created via this route)
        if (!['admin', 'HR'].includes(role)) {
            return res.status(403).json({ message: 'Cannot create users with the "employee" role via this endpoint.' });
        }

        // 3. Create the user
        const newUser = await User.create({
            email,
            password,
            role
        });

        // Remove password hash before sending response
        newUser.password = undefined; 

        res.status(201).json({
            status: 'success',
            message: `User created successfully with role: ${role}.`,
            data: {
                user: newUser
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation failed.', errors: messages });
        }
        console.error("Admin user creation error:", error);
        res.status(500).json({ message: 'Internal server error during user creation.' });
    }
};


module.exports = {
    signup,
    login,
    getMe,
    createAdminUser
};
