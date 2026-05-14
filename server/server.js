// ============================================
// MAIN ENTRY POINT FOR OUR BACKEND SERVER
// ============================================

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Create Express application
const app = express();

// ============================================
// MIDDLEWARE - runs on every request
// ============================================

// Allow frontend to communicate with backend
app.use(cors({
  origin: "*"
}));

// Allow server to read JSON data from requests
app.use(express.json());

// Allow server to read form data
app.use(express.urlencoded({ extended: true }));

// Make uploaded files accessible via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES - API endpoints
// ============================================

// Authentication routes (login, register)
app.use('/api/auth', require('./routes/authRoutes'));

// Resource routes (CRUD operations)
app.use('/api/resources', require('./routes/resourceRoutes'));

// User profile routes
app.use('/api/users', require('./routes/userRoutes'));

// Admin routes
app.use('/api/admin', require('./routes/adminRoutes'));

// Test route - check if server is running
app.get('/', (req, res) => {
  res.send("Backend is connected");
});

// ============================================
// ERROR HANDLERS
// ============================================

// Handle routes that don't exist
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Handle server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});