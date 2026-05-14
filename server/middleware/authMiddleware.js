// ============================================
// AUTH MIDDLEWARE - protects private routes
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in request headers
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {

      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, deny access
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database and attach to request
    req.user = await User.findById(decoded.id).select('-password');

    // Continue to the next middleware/route
    next();

  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
