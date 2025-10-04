const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Read JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_a_strong_secret';

// ----------------------------------------------------------------------
// Middleware to verify JWT token (Protection)
// ----------------------------------------------------------------------
const protect = async (req, res, next) => {
    let token;

    // 1) Getting token and check if it's there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ 
            message: 'You are not logged in! Please log in to get access.' 
        });
    }

    try {
        // 2) Verification token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3) Check if user still exists (optional, but good practice)
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ 
                message: 'The user belonging to this token no longer exists.' 
            });
        }
        
        // 4) Grant access to protected route
        req.user = currentUser;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Your token has expired! Please log in again.' });
        }
        return res.status(500).json({ message: 'Token verification failed.' });
    }
};

// ----------------------------------------------------------------------
// Middleware for Role-Based Access Control (RBAC)
// ----------------------------------------------------------------------
// Usage: restrictTo('admin', 'HR')
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user is set by the protect middleware
        if (!req.user) {
            return res.status(403).json({ message: 'Access denied. User not authenticated.' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'You do not have permission to perform this action.' 
            });
        }
        
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};
