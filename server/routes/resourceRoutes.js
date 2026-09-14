const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  saveResource,
  getFeaturedResources,
  downloadResource,
  viewResource
} = require('../controllers/resourceController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    // Double check that the folder exists right before saving
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and sanitized name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitized = file.originalname.replace(/\s+/g, '-');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|odt|rtf|ppt|pptx|odp|key|xls|xlsx|csv|ods|txt|md|json|py|js|ts|html|css|c|cpp|java|sh|xml|yaml|yml|png|jpg|jpeg|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) {
      cb(null, true);
    } else {
      cb(new Error('File format not supported. Allowed formats: PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), Excel (XLS/XLSX), Text, Code, Images'));
    }
  }
});

// ============================================
// ROUTES
// ============================================

// GET /api/resources/featured → get featured (must be before /:id)
router.get('/featured', getFeaturedResources);

// GET /api/resources → get all resources
router.get('/', getResources);

// GET /api/resources/:id/download → download file
router.get('/:id/download', downloadResource);

// GET /api/resources/:id/view → stream file inline for preview (public)
router.get('/:id/view', viewResource);

// GET /api/resources/:id → get single resource
router.get('/:id', getResourceById);

// POST /api/resources → create resource (protected)
router.post('/', protect, upload.single('file'), createResource);

// PUT /api/resources/:id → update resource (protected)
router.put('/:id', protect, upload.single('file'), updateResource);

// DELETE /api/resources/:id → delete resource (protected)
router.delete('/:id', protect, deleteResource);

// POST /api/resources/:id/save → save/like (supports users & guests)
router.post('/:id/save', optionalProtect, saveResource);

// POST /api/resources/:id/like → like alias (supports users & guests)
router.post('/:id/like', optionalProtect, saveResource);

module.exports = router;
