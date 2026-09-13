const express = require('express');
const router = express.Router();
const { askTutor } = require('../controllers/aiController');
const { optionalProtect } = require('../middleware/authMiddleware');

// POST /api/ai/ask → Interact with AI Tutor & Navigator (supports both guests and logged-in users)
router.post('/ask', optionalProtect, askTutor);

module.exports = router;
