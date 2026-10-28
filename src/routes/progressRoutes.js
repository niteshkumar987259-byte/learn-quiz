const express = require('express');
const router = express.Router();
const { getProgress, updateProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProgress)
  .post(protect, updateProgress);

module.exports = router;
