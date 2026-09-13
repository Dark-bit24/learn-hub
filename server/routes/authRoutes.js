// ============================================
// AUTH ROUTES
// ============================================

const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe, googleAuth } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register → Register a new user
router.post("/register", registerUser);

// POST /api/auth/login → Login an existing user
router.post("/login", loginUser);

// POST /api/auth/google → Google Login / Signup
router.post("/google", googleAuth);

// GET /api/auth/me → Get current user from token
router.get("/me", protect, getMe);

module.exports = router;
