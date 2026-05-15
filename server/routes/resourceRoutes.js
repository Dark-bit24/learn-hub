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
  downloadResource
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|txt|png|jpg|jpeg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, images allowed'));
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

// GET /api/resources/:id → get single resource
router.get('/:id', getResourceById);

// GET /api/resources/:id/download → download file
router.get('/:id/download', downloadResource);

// POST /api/resources → create resource (protected)
router.post('/', protect, upload.single('file'), createResource);

// PUT /api/resources/:id → update resource (protected)
router.put('/:id', protect, updateResource);

// DELETE /api/resources/:id → delete resource (protected)
router.delete('/:id', protect, deleteResource);

// POST /api/resources/:id/save → save/unsave (protected)
router.post('/:id/save', protect, saveResource);

module.exports = router;
