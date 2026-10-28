const express = require('express');
const router = express.Router();
const { getQuestions, submitAssessment, getAssessmentResults } = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/questions', protect, getQuestions);
router.post('/submit', protect, submitAssessment);
router.get('/results', protect, getAssessmentResults);

module.exports = router;
