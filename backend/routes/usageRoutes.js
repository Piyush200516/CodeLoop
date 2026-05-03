const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { logCodeExecution, getUsageStats } = require('../controllers/usageController');

router.post('/code-execution', protect, logCodeExecution);
router.get('/stats', protect, getUsageStats);

module.exports = router;
