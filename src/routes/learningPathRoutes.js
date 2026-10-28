const express = require('express');
const router = express.Router();
const { generatePath, getLearningPath, updateTopicStatus } = require('../controllers/learningPathController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generatePath);
router.get('/', protect, getLearningPath);
router.put('/update-topic-status', protect, updateTopicStatus);

module.exports = router;
