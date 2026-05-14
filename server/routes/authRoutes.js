// ============================================
// AUTH ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register → Create new account
router.post('/register', registerUser);

// POST /api/auth/login → Login
router.post('/login', loginUser);

// GET /api/auth/me → Get current user (protected)
router.get('/me', protect, getMe);

module.exports = router;
