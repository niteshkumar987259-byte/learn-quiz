const express = require('express');
const router = express.Router();
const { tutorChat, analyzeSkillsEndpoint } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/tutor', protect, tutorChat);
router.post('/analyze-skills', protect, analyzeSkillsEndpoint);

module.exports = router;
