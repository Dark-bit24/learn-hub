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

    // Safely delete physical file on disk if exists
    if (resource.file) {
      const fs = require('fs');
      const cleanPath = resource.file.startsWith('/') ? resource.file.slice(1) : resource.file;
      const filePath = path.resolve(__dirname, '..', cleanPath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileErr) {
          console.error('Failed to unlink deleted resource file:', fileErr);
        }
      }
    }

    await resource.deleteOne();
    res.json({ message: 'Resource and file deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// SAVE / UNSAVE / LIKE RESOURCE (supports both users & guests)
// POST /api/resources/:id/save
// ============================================
const saveResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.guestLikes) {
      resource.guestLikes = [];
    }

    // Authenticated user path
    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id);
      const userId = req.user._id;
      const isSaved = resource.saves.some(id => id.toString() === userId.toString());

      if (isSaved) {
        resource.saves = resource.saves.filter(id => id.toString() !== userId.toString());
        if (user) {
          user.savedResources = user.savedResources.filter(id => id.toString() !== resource._id.toString());
        }
      } else {
        resource.saves.push(userId);
        if (user) {
          user.savedResources.push(resource._id);
        }
      }

      await resource.save();
      if (user) await user.save();

      const totalCount = (resource.saves?.length || 0) + (resource.guestLikes?.length || 0);
      return res.json({
        saved: !isSaved,
        savesCount: totalCount,
        isGuest: false
      });
    }

    // Guest user path: track via guestId passed in body/header or IP fallback
    const guestId = req.body?.guestId || req.headers['x-guest-id'] || `guest_${req.ip || 'anon'}`;
    const isGuestSaved = resource.guestLikes.includes(guestId);

    if (isGuestSaved) {
      resource.guestLikes = resource.guestLikes.filter(id => id !== guestId);
    } else {
      resource.guestLikes.push(guestId);
    }

    await resource.save();
    const totalCount = (resource.saves?.length || 0) + (resource.guestLikes?.length || 0);

    return res.json({
      saved: !isGuestSaved,
      savesCount: totalCount,
      isGuest: true
    });

  } catch (error) {
    console.error('SAVE/LIKE RESOURCE ERROR:', error);
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
      return res.status(404).json({ message: 'No file associated with this resource' });
    }

    // Resolve absolute path to the file cleanly and robustly
    const cleanRelativePath = resource.file.startsWith('/') ? resource.file.slice(1) : resource.file;
    const filePath = path.resolve(__dirname, '..', cleanRelativePath);
    
    // Check file on disk
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'The requested file could not be found on the server' });
    }

    // Formulate a clean, professional download name from title + original extension
    const ext = path.extname(cleanRelativePath) || '.pdf';
    const cleanBaseName = (resource.title || 'resource')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const downloadFilename = `${cleanBaseName}${ext}`;

    // Increment view / download count
    resource.views = (resource.views || 0) + 1;
    await resource.save();

    // Send file for download with sanitized filename
    res.download(filePath, downloadFilename, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).json({ message: 'Could not download the file', error: err.message });
        }
      }
    });
  } catch (error) {
    console.error('Download Resource Error:', error);
// ============================================
// VIEW / STREAM RESOURCE INLINE
// GET /api/resources/:id/view
// ============================================
const viewResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource || !resource.file) {
      return res.status(404).json({ message: 'No file associated with this resource' });
    }

    const cleanRelativePath = resource.file.startsWith('/') ? resource.file.slice(1) : resource.file;
    const filePath = path.resolve(__dirname, '..', cleanRelativePath);

    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'The requested file could not be found on the server' });
    }

    const ext = path.extname(cleanRelativePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.html': 'text/html'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const cleanBaseName = (resource.title || 'document')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const downloadFilename = `${cleanBaseName}${ext}`;

    // Set headers that permit iframe embedding across origins
    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${downloadFilename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Content-Security-Policy', "frame-ancestors *");

    // Increment view count
    resource.views = (resource.views || 0) + 1;
    await resource.save();

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    console.error('View Resource Error:', error);
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
  downloadResource,
  viewResource
};
