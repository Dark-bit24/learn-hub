// ============================================
// MAIN ENTRY POINT FOR OUR BACKEND SERVER
// ============================================

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Connect to MongoDB database
connectDB();

// Create Express application
const app = express();

// ============================================
// MIDDLEWARE - runs on every request
// ============================================

// Enable Gzip compression
// Enable Gzip compression
app.use(compression());

// Security HTTP headers
app.use(helmet());

// Basic rate limiting: max 300 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Allow frontend to communicate with backend
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5000',
      'http://localhost:3000',
      'https://learn-hub-psi-ashen.vercel.app',
      'https://learn-hub-x0ol.onrender.com'
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id']
}));

// Allow server to read JSON data from requests
app.use(express.json());

// Allow server to read form data
app.use(express.urlencoded({ extended: true }));

// Make uploaded files accessible via URL with 1-day caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d' }));

// Fallback for missing uploaded files to prevent falling through to generic 'Route not found'
app.use('/uploads', (req, res) => {
  res.status(404).json({ message: 'File not found' });
});


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

// AI Tutor routes
app.use('/api/ai', require('./routes/aiRoutes'));


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

// Handle Multer file-upload errors (wrong type, too large, etc.)
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message === 'Only PDF, DOC, images allowed' || err.message === 'Only JPG, JPEG, PNG allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

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