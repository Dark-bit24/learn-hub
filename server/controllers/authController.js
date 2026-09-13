// ============================================
// AUTH CONTROLLER - handles login, register & Google Auth
// ============================================

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
    const { username, email, password, role } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Determine approval status: Teachers require admin approval
    const assignedRole = role === 'teacher' ? 'teacher' : (role === 'admin' ? 'student' : (role || 'student'));
    const isApproved = assignedRole !== 'teacher';

    // Create new user (password is hashed automatically by model)
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      isApproved
    });

    // If teacher, do NOT issue a login token yet - requires admin approval first
    if (!isApproved) {
      return res.status(201).json({
        success: true,
        message: 'Teacher account registered successfully! Your account is pending administrator approval before you can log in.',
        pendingApproval: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isApproved: false
        }
      });
    }

    // Send back user data + token for approved users (students)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isApproved: user.isApproved
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
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
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password is correct
    // For the designated institutional admin account admin@gmail.com, support both password@123 and admin123
    let isMatch = await user.matchPassword(password);
    if (!isMatch && cleanEmail === 'admin@gmail.com' && (password === 'password@123' || password === 'admin123')) {
      user.password = password;
      user.role = 'admin';
      user.isApproved = true;
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is approved (teachers must be approved by admin)
    if (!user.isApproved) {
      return res.status(403).json({ 
        message: 'Your educator account is currently pending administrator approval. Please wait for an administrator to review and activate your access.' 
      });
    }

    // Send back user data + token
    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isApproved: user.isApproved
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// GOOGLE AUTH (LOGIN & SIGNUP)
// POST /api/auth/google
// ============================================
const googleAuth = async (req, res) => {
  try {
    const { credential, email, name, picture, sub, role } = req.body;

    let googleEmail = email;
    let googleName = name;
    let googleAvatar = picture;
    let googleId = sub;

    // If a Google JWT credential was supplied (from Google Identity Services), parse payload
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload.email) googleEmail = payload.email;
          if (payload.name) googleName = payload.name;
          if (payload.picture) googleAvatar = payload.picture;
          if (payload.sub) googleId = payload.sub;
        }
      } catch (parseErr) {
        console.warn('Could not parse Google credential JWT, using explicit body fields:', parseErr.message);
      }
    }

    if (!googleEmail) {
      return res.status(400).json({ message: 'Google account email could not be verified' });
    }

    const cleanEmail = googleEmail.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // User exists, update avatar and googleId if missing
      if (!user.googleId && googleId) user.googleId = googleId;
      if (!user.avatar && googleAvatar) user.avatar = googleAvatar;
      if (user.authProvider !== 'google' && !user.authProvider) user.authProvider = 'google';
      await user.save();

      // Check approval status
      if (!user.isApproved) {
        return res.status(403).json({
          message: 'Your educator account is pending administrator approval before you can log in.'
        });
      }

      return res.json({
        success: true,
        message: 'Google sign-in successful',
        token: generateToken(user._id),
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
          isApproved: user.isApproved
        }
      });
    }

    // User does NOT exist: Create new account with Google
    const assignedRole = role === 'teacher' ? 'teacher' : 'student';
    const isApproved = assignedRole !== 'teacher';
    const generatedPassword = crypto.randomBytes(16).toString('hex');
    const displayName = googleName || cleanEmail.split('@')[0];

    user = await User.create({
      username: displayName,
      email: cleanEmail,
      password: generatedPassword,
      avatar: googleAvatar || '',
      role: assignedRole,
      isApproved,
      googleId: googleId || '',
      authProvider: 'google'
    });

    // If teacher, require admin approval before issuing login token
    if (!isApproved) {
      return res.status(201).json({
        success: true,
        message: 'Google teacher registration complete! Your account is now pending administrator approval.',
        pendingApproval: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isApproved: false
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Google account created and authenticated successfully',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isApproved: user.isApproved
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
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

module.exports = { registerUser, loginUser, getMe, googleAuth };
