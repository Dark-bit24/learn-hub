// ============================================
// USER MODEL - defines how user data is stored
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // User's display name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  // User's email (must be unique)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  // User's hashed password
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // User profile picture URL
  avatar: {
    type: String,
    default: ''
  },

  // User bio
  bio: {
    type: String,
    default: '',
    maxlength: [200, 'Bio cannot exceed 200 characters']
  },

  // Resources saved/bookmarked by user
  savedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],

  // User role
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },

  // Account approval status (for teachers)
  isApproved: {
    type: Boolean,
    default: true
  }

}, {
  // Automatically add createdAt and updatedAt fields
  timestamps: true
});

// ============================================
// HASH PASSWORD BEFORE SAVING
// ============================================
userSchema.pre('save', async function(next) {
  // Only hash if password was changed
  if (!this.isModified('password')) return next();

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================
// METHOD TO CHECK PASSWORD ON LOGIN
// ============================================
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
