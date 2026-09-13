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
      // If disk file missing (e.g. after container redeploy), provide clean text download of resource content
      const cleanBaseName = (resource.title || 'study_notes')
        .replace(/[^a-zA-Z0-9_\-\s]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      
      const downloadText = `Title: ${resource.title}\n` +
        `Subject: ${resource.subject}\n` +
        `Type: ${resource.type}\n` +
        `Summary: ${resource.shortDescription || resource.description}\n\n` +
        `==================== STUDY MATERIAL ====================\n\n` +
        `${resource.content || resource.description || 'No additional content recorded.'}\n\n` +
        `========================================================\n` +
        `LearnHub Public Learning Repository • © 2026 LearnHub\n`;

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanBaseName}_notes.txt"`);
      resource.views = (resource.views || 0) + 1;
      await resource.save();
      return res.send(downloadText);
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// VIEW / STREAM RESOURCE INLINE
// GET /api/resources/:id/view
// ============================================
const viewResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const cleanRelativePath = resource.file ? (resource.file.startsWith('/') ? resource.file.slice(1) : resource.file) : '';
    const filePath = cleanRelativePath ? path.resolve(__dirname, '..', cleanRelativePath) : '';

    const fs = require('fs');

    // If file exists on disk, stream it with proper headers
    if (filePath && fs.existsSync(filePath)) {
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

      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${downloadFilename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");

      resource.views = (resource.views || 0) + 1;
      await resource.save();

      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    }

    // Fallback: If physical file is absent on this dyno (e.g. after redeploy),
    // generate an institutional HTML reading view from MongoDB preserved text
    const title = resource.title || 'Educational Document';
    const subject = resource.subject || 'Academic';
    const type = resource.type || 'Document';
    const summary = resource.shortDescription || resource.description || '';
    const topics = (resource.keyTopics && resource.keyTopics.length > 0) ? resource.keyTopics : [subject];
    const bodyContent = resource.content || resource.description || 'No additional text recorded.';
    
    const cleanTopicsHtml = topics.map(t => `<span style="display:inline-block;padding:3px 8px;margin:2px;background:#e0edff;color:#0051ab;border-radius:6px;font-size:11px;font-weight:600;">#${t}</span>`).join(' ');

    const safeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #1e293b; line-height: 1.6; }
    .card { max-width: 860px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 32px; }
    .badge { display: inline-block; padding: 4px 10px; background: #e0edff; color: #0063cf; border: 1px solid #b9d7fc; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-right: 8px; }
    .badge-sub { display: inline-block; padding: 4px 10px; background: #f1f5f9; color: #475569; border-radius: 6px; font-size: 11px; font-weight: 600; }
    h1 { font-size: 24px; font-weight: 800; color: #090e40; margin: 12px 0 16px 0; }
    .abstract { background: #eff6ff; border-left: 4px solid #0063cf; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px; }
    .abstract h3 { margin: 0 0 6px 0; font-size: 12px; color: #0063cf; text-transform: uppercase; letter-spacing: 0.5px; }
    .abstract p { margin: 0; font-size: 13px; color: #334155; }
    .content-box { white-space: pre-wrap; word-break: break-word; font-size: 14px; color: #1e293b; background: #fdfdfd; border: 1px solid #edf2f7; border-radius: 8px; padding: 20px; }
    .footer-note { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div>
      <span class="badge">${type}</span>
      <span class="badge-sub">${subject}</span>
    </div>
    <h1>${title}</h1>
    ${cleanTopicsHtml ? `<div style="margin-bottom:16px;">${cleanTopicsHtml}</div>` : ''}
    ${summary ? `
    <div class="abstract">
      <h3>Verified Curriculum Abstract</h3>
      <p>${summary}</p>
    </div>` : ''}
    <h3 style="font-size:14px;color:#090e40;margin-bottom:8px;">Document Study Content:</h3>
    <div class="content-box">${bodyContent}</div>
    <div class="footer-note">
      National Academic Repository • Republic of Rwanda © 2026 LearnHub
    </div>
  </div>
</body>
</html>`;

    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Content-Security-Policy', "frame-ancestors *");

    resource.views = (resource.views || 0) + 1;
    await resource.save();

    return res.send(safeHtml);
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
