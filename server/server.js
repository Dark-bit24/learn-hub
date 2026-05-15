// ============================================
// MAIN ENTRY POINT FOR OUR BACKEND SERVER
// ============================================

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
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

// Enable Gzip compression
app.use(compression());

// Allow frontend to communicate with backend
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://learn-hub-psi-ashen.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Allow server to read JSON data from requests
app.use(express.json());

// Allow server to read form data
app.use(express.urlencoded({ extended: true }));

// Make uploaded files accessible via URL with 1-day caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d' }));

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

// API status check route
app.get('/api', (req, res) => {
  res.json({ message: 'API working' });
});

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
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Server error', 
    error: err.message 
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});