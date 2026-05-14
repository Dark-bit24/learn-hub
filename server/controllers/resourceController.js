// ============================================
// RESOURCE CONTROLLER - full CRUD operations
// ============================================

const Resource = require('../models/Resource');
const User = require('../models/User');
const path = require('path');

// ============================================
// GET ALL RESOURCES (with filters)
// GET /api/resources
// ============================================
const getResources = async (req, res) => {
  try {
    // Get filter options from URL query
    // Example: /api/resources?subject=Math&type=PDF
    const { subject, type, search } = req.query;

    // Build filter object
    let filter = {};
    if (subject) filter.subject = subject;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch resources, populate uploader name
    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 }); // Newest first

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// GET SINGLE RESOURCE BY ID
// GET /api/resources/:id
// ============================================
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name avatar email');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// CREATE NEW RESOURCE
// POST /api/resources
// ============================================
const createResource = async (req, res) => {
  try {
    const { title, description, subject, type, url } = req.body;

    // Get uploaded file path if exists
    const file = req.file ? `/uploads/${req.file.filename}` : '';

    // Create resource in database
    const resource = await Resource.create({
      title,
      description,
      subject,
      type,
      url: url || '',
      file,
      uploadedBy: req.user._id // from auth middleware
    });

    // Return created resource with uploader info
    const populated = await resource.populate('uploadedBy', 'name avatar');
    res.status(201).json(populated);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// UPDATE RESOURCE
// PUT /api/resources/:id
// ============================================
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if logged-in user owns this resource OR is admin
    if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this resource' });
    }

    // Update the resource
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name avatar');

    res.json(updatedResource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// DELETE RESOURCE
// DELETE /api/resources/:id
// ============================================
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Only owner or admin can delete
    if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// SAVE / UNSAVE RESOURCE (bookmark)
// POST /api/resources/:id/save
// ============================================
const saveResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const userId = req.user._id;
    const isSaved = resource.saves.includes(userId);

    if (isSaved) {
      // Remove from resource saves
      resource.saves = resource.saves.filter(id => id.toString() !== userId.toString());
      // Remove from user savedResources
      user.savedResources = user.savedResources.filter(id => id.toString() !== resource._id.toString());
    } else {
      // Add to resource saves
      resource.saves.push(userId);
      // Add to user savedResources
      user.savedResources.push(resource._id);
    }

    await resource.save();
    await user.save();
    
    res.json({ saved: !isSaved, savesCount: resource.saves.length });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// GET FEATURED RESOURCES (for homepage)
// GET /api/resources/featured
// ============================================
const getFeaturedResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name avatar')
      .sort({ views: -1, saves: -1 })
      .limit(6);

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// DOWNLOAD RESOURCE FILE
// GET /api/resources/:id/download
// ============================================
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource || !resource.file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Resolve absolute path to the file
    // resource.file starts with /uploads/
    const filePath = path.join(__dirname, '..', resource.file);
    
    // Send file for download
    res.download(filePath, (err) => {
      if (err) {
        res.status(500).json({ message: 'Could not download the file', error: err.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  saveResource,
  getFeaturedResources,
  downloadResource
};
