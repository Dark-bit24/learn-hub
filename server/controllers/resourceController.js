// ============================================
// RESOURCE CONTROLLER - full CRUD operations
// ============================================

const Resource = require('../models/Resource');
const User = require('../models/User');
const path = require('path');
const { extractResourceContent } = require('../utils/textExtractor');
const { validateMeaningfulDescription, analyzeAndBreakdownResource } = require('../utils/contentAnalyzer');

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
      .populate('uploadedBy', 'username avatar')
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
      .populate('uploadedBy', 'username avatar email');

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

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate meaningful description provided by the user
    const validation = validateMeaningfulDescription(description);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.reason
      });
    }

    // Create resource in database
    const resource = await Resource.create({
      title,
      description,
      subject,
      type,
      url: url || '',
      file,
      uploadedBy: req.user._id
    });

    // Extract text content from file/url and save
    const content = await extractResourceContent(resource);
    resource.content = content;

    // Analyze content and generate verified breakdown / short description
    const breakdown = await analyzeAndBreakdownResource({
      title: resource.title,
      subject: resource.subject,
      type: resource.type,
      content: resource.content,
      description: resource.description
    });
    resource.shortDescription = breakdown.shortDescription;
    resource.keyTopics = breakdown.keyTopics;

    await resource.save();

    // Return created resource with uploader info
    const populated = await resource.populate('uploadedBy', 'username avatar');
    res.status(201).json(populated);

  } catch (error) {
    console.error('CREATE RESOURCE ERROR:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
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

    // If description is being updated, validate it is meaningful
    if (req.body.description !== undefined) {
      const validation = validateMeaningfulDescription(req.body.description);
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.reason });
      }
    }

    // Update text fields
    const fields = ['title', 'description', 'subject', 'type', 'url'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    });

    // Handle file update
    if (req.file) {
      // Delete old file if it exists
      if (resource.file) {
        const fs = require('fs');
        const oldFilePath = path.join(__dirname, '..', resource.file.startsWith('/') ? resource.file.slice(1) : resource.file);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error('Failed to delete old file:', err);
          }
        }
      }
      resource.file = `/uploads/${req.file.filename}`;
    } else if (req.body.removeFile === 'true') {
      // Delete file if user requested removal
      if (resource.file) {
        const fs = require('fs');
        const oldFilePath = path.join(__dirname, '..', resource.file.startsWith('/') ? resource.file.slice(1) : resource.file);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error('Failed to delete file:', err);
          }
        }
      }
      resource.file = '';
    }

    // Run text extractor to update content
    const content = await extractResourceContent(resource);
    resource.content = content;

    // Refresh breakdown and short description
    const breakdown = await analyzeAndBreakdownResource({
      title: resource.title,
      subject: resource.subject,
      type: resource.type,
      content: resource.content,
      description: resource.description
    });
    resource.shortDescription = breakdown.shortDescription;
    resource.keyTopics = breakdown.keyTopics;

    await resource.save();

    const populated = await resource.populate('uploadedBy', 'username avatar');
    res.json(populated);
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
      .populate('uploadedBy', 'username avatar')
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

    // Resolve absolute path to the file cleanly and robustly
    const cleanRelativePath = resource.file.startsWith('/') ? resource.file.slice(1) : resource.file;
    const filePath = path.resolve(__dirname, '..', cleanRelativePath);
    
    // Send file for download
    res.download(filePath, (err) => {
      if (err) {
        // Prevent setting headers if they have already been sent
        if (!res.headersSent) {
          res.status(500).json({ message: 'Could not download the file', error: err.message });
        }
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
