// ============================================
// RESOURCE MODEL - defines learning resource data
// ============================================

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  // Resource title
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  // Full description of the resource
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Subject category
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: [
      'Mathematics',
      'Science',
      'Technology',
      'Programming',
      'History',
      'Language',
      'Arts',
      'Business',
      'Other'
    ]
  },

  // Type of resource
  type: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: ['PDF', 'Video', 'Article', 'Tutorial', 'Link', 'Notes']
  },

  // External URL link
  url: {
    type: String,
    default: ''
  },

  // Uploaded file path
  file: {
    type: String,
    default: ''
  },

  // Thumbnail image
  thumbnail: {
    type: String,
    default: ''
  },

  // Who uploaded this resource
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // How many times this was viewed
  views: {
    type: Number,
    default: 0
  },

  // Users who saved/liked this resource
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Is this resource featured on homepage
  featured: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
