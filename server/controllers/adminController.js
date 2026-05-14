// ============================================
// ADMIN CONTROLLER - handles admin tasks
// ============================================

const User = require('../models/User');
const Resource = require('../models/Resource');

// @desc    Get all pending teacher accounts
// @route   GET /api/admin/pending-teachers
// @access  Private/Admin
const getPendingTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve a teacher account
// @route   PUT /api/admin/approve-teacher/:id
// @access  Private/Admin
const approveTeacher = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: 'Account approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all resources for admin review
// @route   GET /api/admin/resources
// @access  Private/Admin
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find({})
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting the last admin or yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a user as admin
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, isApproved } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      isApproved: isApproved !== undefined ? isApproved : true
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete any resource
// @route   DELETE /api/admin/resources/:id
// @access  Private/Admin
const deleteResourceAdmin = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPendingTeachers,
  approveTeacher,
  getAllResources,
  getAllUsers,
  deleteUser,
  createUser,
  deleteResourceAdmin
};
