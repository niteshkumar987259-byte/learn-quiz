const express = require('express');
const router = express.Router();
const { getQuizByTopic, submitQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:topicName', protect, getQuizByTopic);
router.post('/:topicName/submit', protect, submitQuiz);

module.exports = router;
