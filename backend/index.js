require('dotenv').config(); // Load .env early
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors()); // Enable CORS for frontend access
app.use(express.json()); // Body parser, reading data from body into req.body

// --- 2. DATABASE CONNECTION (Mock) ---
// Read DB URI from environment or fallback to local mock
const DB_URI = process.env.MONGODB_URI;

mongoose.connect(DB_URI)
    .then(() => console.log('DB connection successful!'))
    .catch(err => console.error('DB connection failed:', err.message));

// --- 3. ROUTES ---

// Authentication routes
app.use('/api/auth', authRoutes);

// Management routes
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

// --- 4. START SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});
