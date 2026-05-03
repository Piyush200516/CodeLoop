const express = require('express');
const router = express.Router();
const { getAlgorithms, getAlgorithmByName } = require('../controllers/algorithmController');
const { protect, requirePremium } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAlgorithms);
router.get('/:name', getAlgorithmByName);

module.exports = router;
