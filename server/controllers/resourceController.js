// ============================================
// RESOURCE CONTROLLER - full CRUD operations
// ============================================

const Resource = require('../models/Resource');
const User = require('../models/User');
const path = require('path');
const { extractResourceContent } = require('../utils/textExtractor');
const { validateMeaningfulDescription, analyzeAndBreakdownResource } = require('../utils/contentAnalyzer');
const { chunkText, generateChunkSummary } = require('../utils/chunker');

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

    // Get uploaded file path & binary buffer if exists
    let file = '';
    let fileData = null;
    let fileContentType = '';
    let fileOriginalName = '';

    if (req.file) {
      file = `/uploads/${req.file.filename}`;
      fileContentType = req.file.mimetype || 'application/octet-stream';
      fileOriginalName = req.file.originalname || req.file.filename;
      try {
        const fs = require('fs');
        fileData = await fs.promises.readFile(req.file.path);
      } catch (readErr) {
        console.warn('Could not cache file data buffer to MongoDB:', readErr.message);
      }
    }

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

    // Create resource in database with persistent binary fileData
    const resource = await Resource.create({
      title,
      description,
      subject,
      type,
      url: url || '',
      file,
      fileData,
      fileContentType,
      fileOriginalName,
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

    // Chunk content for RAG retrieval
    if (content && content.trim().length > 0) {
      const chunks = chunkText(content);
      resource.chunks = chunks;
      const chunkSummary = await generateChunkSummary(chunks, resource.title, resource.subject);
      resource.chunkSummary = chunkSummary;
    }

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
      resource.fileContentType = req.file.mimetype || 'application/octet-stream';
      resource.fileOriginalName = req.file.originalname || req.file.filename;
      try {
        const fs = require('fs');
        resource.fileData = await fs.promises.readFile(req.file.path);
      } catch (readErr) {
        console.warn('Could not update file data buffer:', readErr.message);
      }
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
      resource.fileData = null;
      resource.fileContentType = '';
      resource.fileOriginalName = '';
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

    // Re-chunk content for RAG retrieval
    if (content && content.trim().length > 0) {
      const chunks = chunkText(content);
      resource.chunks = chunks;
      const chunkSummary = await generateChunkSummary(chunks, resource.title, resource.subject);
      resource.chunkSummary = chunkSummary;
    } else {
      resource.chunks = [];
      resource.chunkSummary = '';
    }

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

    const uploaderId = resource.uploadedBy ? (resource.uploadedBy._id ? resource.uploadedBy._id.toString() : resource.uploadedBy.toString()) : '';
    const userId = req.user && req.user._id ? req.user._id.toString() : '';
    const isOwner = Boolean(uploaderId && userId && uploaderId === userId);
    const isAdminUser = Boolean(req.user && (req.user.role === 'admin' || req.user.email === 'admin@gmail.com'));

    // Only owner or admin can delete
    if (!isOwner && !isAdminUser) {
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
    const resource = await Resource.findById(req.params.id).select('+fileData +fileContentType +fileOriginalName');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const cleanRelativePath = resource.file ? (resource.file.startsWith('/') ? resource.file.slice(1) : resource.file) : '';
    const filePath = cleanRelativePath ? path.resolve(__dirname, '..', cleanRelativePath) : '';
    const ext = path.extname(resource.fileOriginalName || cleanRelativePath || '').toLowerCase() || (resource.type === 'PDF' ? '.pdf' : '.pdf');
    const cleanBaseName = (resource.title || 'resource')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const downloadFilename = resource.fileOriginalName || `${cleanBaseName}${ext.startsWith('.') ? ext : '.' + ext}`;

    const fs = require('fs');

    // 1. If physical file exists on disk, stream it
    if (filePath && fs.existsSync(filePath)) {
      resource.views = (resource.views || 0) + 1;
      await resource.save();

      return res.download(filePath, downloadFilename, (err) => {
        if (err && !res.headersSent) {
          res.status(500).json({ message: 'Could not download the file', error: err.message });
        }
      });
    }

    // 2. If persistent binary file data exists in MongoDB, stream it directly
    if (resource.fileData && resource.fileData.length > 0) {
      res.setHeader('Content-Type', resource.fileContentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      resource.views = (resource.views || 0) + 1;
      await resource.save();
      return res.send(resource.fileData);
    }

    // 3. Fallback: Generate an authentic PDF document using PDFKit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 45, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const generatedPdf = Buffer.concat(buffers);
      try {
        resource.fileData = generatedPdf;
        resource.fileContentType = 'application/pdf';
        await resource.save();
      } catch (cacheErr) {
        console.warn('Could not cache generated PDF buffer:', cacheErr.message);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanBaseName}.pdf"`);
      return res.send(generatedPdf);
    });

    // Build PDF content
    doc.fillColor('#0063cf').fontSize(11).font('Helvetica-Bold').text('LEARNHUB ACADEMIC REPOSITORY', { align: 'left' });
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(`Subject: ${resource.subject || 'Academic'} | Level: Curriculum Verified`, { align: 'left' });
    doc.moveDown(0.6);
    doc.strokeColor('#0063cf').lineWidth(2).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    doc.fillColor('#090e40').fontSize(18).font('Helvetica-Bold').text(resource.title || 'Study Material');
    doc.moveDown(0.5);

    if (resource.keyTopics && resource.keyTopics.length > 0) {
      doc.fillColor('#0063cf').fontSize(10).font('Helvetica-Bold').text('Topics: ' + resource.keyTopics.map(t => '#' + t).join('  '));
      doc.moveDown(0.6);
    }

    if (resource.shortDescription) {
      doc.rect(45, doc.y, 505, 45).fillAndStroke('#eff6ff', '#bfdbfe');
      doc.fillColor('#1e40af').fontSize(9.5).font('Helvetica-Bold').text('VERIFIED CURRICULUM ABSTRACT:', 55, doc.y - 38);
      doc.fillColor('#334155').fontSize(9).font('Helvetica').text(resource.shortDescription, 55, doc.y + 2, { width: 485 });
      doc.moveDown(1.5);
    }

    doc.fillColor('#090e40').fontSize(12).font('Helvetica-Bold').text('Document Notes & Study Content:');
    doc.moveDown(0.5);
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica').lineGap(3).text(resource.content || resource.description || 'No additional content recorded.', { width: 505 });

    doc.moveDown(2);
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fillColor('#94a3b8').fontSize(8.5).font('Helvetica').text('Republic of Rwanda National Learning Repository • © 2026 LearnHub', { align: 'center' });

    doc.end();

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
    const resource = await Resource.findById(req.params.id).select('+fileData +fileContentType +fileOriginalName');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const cleanRelativePath = resource.file ? (resource.file.startsWith('/') ? resource.file.slice(1) : resource.file) : '';
    const filePath = cleanRelativePath ? path.resolve(__dirname, '..', cleanRelativePath) : '';
    const ext = path.extname(resource.fileOriginalName || cleanRelativePath || '').toLowerCase() || (resource.type === 'PDF' ? '.pdf' : '.pdf');
    const cleanBaseName = (resource.title || 'document')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const downloadFilename = resource.fileOriginalName || `${cleanBaseName}${ext.startsWith('.') ? ext : '.' + ext}`;

    const fs = require('fs');

    // 1. If physical file exists on disk, stream it directly with proper MIME type
    if (filePath && fs.existsSync(filePath)) {
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.html': 'text/html',
        '.json': 'application/json',
        '.csv': 'text/csv',
        '.py': 'text/plain',
        '.js': 'text/plain',
        '.ts': 'text/plain',
        '.css': 'text/css',
        '.c': 'text/plain',
        '.cpp': 'text/plain',
        '.java': 'text/plain',
        '.sh': 'text/plain',
        '.xml': 'application/xml',
        '.yaml': 'text/plain',
        '.yml': 'text/plain',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.rtf': 'application/rtf',
        '.odt': 'application/vnd.oasis.opendocument.text',
        '.odp': 'application/vnd.oasis.opendocument.presentation',
        '.ods': 'application/vnd.oasis.opendocument.spreadsheet'
      };

      const contentType = mimeTypes[ext] || 'application/pdf';

      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${downloadFilename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");

      // Non-blocking view increment
      Resource.updateOne({ _id: req.params.id }, { $inc: { views: 1 } }).catch(err => console.warn('View count update error:', err.message));

      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    }

    // 2. If persistent binary file data exists in MongoDB (survives container redeployments!)
    if (resource.fileData && resource.fileData.length > 0) {
      const contentType = resource.fileContentType || (ext === '.pdf' ? 'application/pdf' : 'application/octet-stream');

      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${downloadFilename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");

      // Non-blocking view increment
      Resource.updateOne({ _id: req.params.id }, { $inc: { views: 1 } }).catch(err => console.warn('View count update error:', err.message));

      // Write to disk cache asynchronously
      if (filePath && !fs.existsSync(filePath)) {
        try {
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFile(filePath, resource.fileData, () => {});
        } catch (cacheErr) {
          console.warn('Could not cache file to disk:', cacheErr.message);
        }
      }

      return res.send(resource.fileData);
    }

    // 3. Fallback: Generate an authentic, real PDF file using PDFKit
    // This guarantees that all PDF resources render directly inside the browser's PDF viewer
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 45, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const generatedPdf = Buffer.concat(buffers);
      
      // Save generated PDF into MongoDB so future views don't re-generate
      try {
        resource.fileData = generatedPdf;
        resource.fileContentType = 'application/pdf';
        await resource.save();
      } catch (dbErr) {
        console.warn('Could not cache generated PDF to DB:', dbErr.message);
      }

      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${cleanBaseName}.pdf"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");

      resource.views = (resource.views || 0) + 1;
      await resource.save();

      return res.send(generatedPdf);
    });

    // Build PDF content
    doc.fillColor('#0063cf').fontSize(11).font('Helvetica-Bold').text('LEARNHUB ACADEMIC REPOSITORY', { align: 'left' });
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(`Subject: ${resource.subject || 'Academic'} | Format: Official Curriculum Document`, { align: 'left' });
    doc.moveDown(0.6);
    doc.strokeColor('#0063cf').lineWidth(2).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    doc.fillColor('#090e40').fontSize(18).font('Helvetica-Bold').text(resource.title || 'Curriculum Material');
    doc.moveDown(0.5);

    if (resource.keyTopics && resource.keyTopics.length > 0) {
      doc.fillColor('#0063cf').fontSize(10).font('Helvetica-Bold').text('Topics: ' + resource.keyTopics.map(t => '#' + t).join('  '));
      doc.moveDown(0.6);
    }

    if (resource.shortDescription) {
      doc.rect(45, doc.y, 505, 45).fillAndStroke('#eff6ff', '#bfdbfe');
      doc.fillColor('#1e40af').fontSize(9.5).font('Helvetica-Bold').text('VERIFIED CURRICULUM ABSTRACT:', 55, doc.y - 38);
      doc.fillColor('#334155').fontSize(9).font('Helvetica').text(resource.shortDescription, 55, doc.y + 2, { width: 485 });
      doc.moveDown(1.5);
    }

    doc.fillColor('#090e40').fontSize(12).font('Helvetica-Bold').text('Document Study Content:');
    doc.moveDown(0.5);
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica').lineGap(3).text(resource.content || resource.description || 'No additional text recorded.', { width: 505 });

    doc.moveDown(2);
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fillColor('#94a3b8').fontSize(8.5).font('Helvetica').text('Republic of Rwanda National Learning Repository • © 2026 LearnHub', { align: 'center' });

    doc.end();

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
