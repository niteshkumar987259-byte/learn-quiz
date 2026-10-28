const express = require('express');
const router = express.Router();
const { getProfile, createOrUpdateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProfile)
  .put(protect, createOrUpdateProfile);

module.exports = router;
