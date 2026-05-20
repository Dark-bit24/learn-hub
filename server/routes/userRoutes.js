const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Resource = require('../models/Resource');
const { protect } = require('../middleware/authMiddleware');

// ============================================
// AVATAR UPLOAD CONFIG
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max for avatars
  fileFilter: (req, file, cb) => {
    const allowed = /png|jpg|jpeg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Only JPG, JPEG, PNG allowed'));
  }
});

// GET /api/users/profile → get my profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('savedResources');

    // Get resources uploaded by this user
    const uploads = await Resource.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ user, uploads });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/profile → update profile
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updateData = { username, bio };

    // If a new avatar was uploaded
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
