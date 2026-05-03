const express = require('express');
const router = express.Router();
const { getWeeklyReport, getRecommendations, trackInteraction } = require('../controllers/analyticsController');
const { protect, requirePremium } = require('../middleware/authMiddleware');

// All analytics routes require auth
router.use(protect);

router.get('/weekly', requirePremium, getWeeklyReport);
router.get('/recommendations', requirePremium, getRecommendations);
router.post('/track-interaction', trackInteraction);

module.exports = router;
