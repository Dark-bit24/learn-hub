// ============================================
// AUTH CONTROLLER - handles login & register
// ============================================

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ============================================
// GENERATE JWT TOKEN
// ============================================
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// ============================================
// REGISTER NEW USER
// POST /api/auth/register
// ============================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Determine approval status
    // Teachers are NOT approved by default
    const isApproved = role === 'teacher' ? false : true;

    // Create new user (password is hashed automatically by model)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      isApproved
    });

    // Send back user data + token
    res.status(201).json({
      message: 'Account created successfully',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isApproved: user.isApproved
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// LOGIN USER
// POST /api/auth/login
// ============================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password is correct
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is approved
    if (!user.isApproved) {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }

    // Send back user data + token
    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isApproved: user.isApproved
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// GET CURRENT USER (from token)
// GET /api/auth/me
// ============================================
const getMe = async (req, res) => {
  try {
    // req.user comes from our auth middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
