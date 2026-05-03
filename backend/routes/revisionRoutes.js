const express = require('express');
const router = express.Router();
const {
    getRecallProblems,
    saveRecallResult,
    getRecallStats,
} = require('../controllers/revisionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/recall', getRecallProblems);
router.get('/recall-stats', getRecallStats);
router.post('/recall-result', saveRecallResult);

module.exports = router;
