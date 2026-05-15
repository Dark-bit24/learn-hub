// ============================================
// AUTH ROUTES
// ============================================

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// --------------------------------------------
// REGISTER ROUTE
// --------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password, // hashed by model pre-save hook
      role: role || "student",
      isApproved: role === "teacher" ? false : true
    });

    res.status(201).json({
      message: "User registered successfully",
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

// --------------------------------------------
// LOGIN ROUTE (EXACT FIX)
// --------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("BODY:", req.body);

    // Find user
    const user = await User.findOne({ email });

    console.log("USER FOUND:", user ? "YES" : "NO");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Check if account is approved
    if (!user.isApproved) {
      console.log("LOGIN FAILED: Account not approved");
      return res.status(403).json({
        success: false,
        message: "Account pending admin approval. Please wait for an administrator to activate your account."
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("LOGIN SUCCESS");

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// --------------------------------------------
// GET ME ROUTE
// --------------------------------------------
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
