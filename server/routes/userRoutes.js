const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Resource = require('../models/Resource');
const { protect } = require('../middleware/authMiddleware');

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
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
