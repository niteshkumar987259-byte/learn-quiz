const express = require('express');
const router = express.Router();
const { getTopicByIdentifier, getAllTopics } = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllTopics);
router.get('/:identifier', protect, getTopicByIdentifier);

module.exports = router;
