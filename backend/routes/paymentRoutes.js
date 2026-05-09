const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

const {
  submitPayment,
  getMyStatus,
} = require('../controllers/paymentController');

// POST /api/payments/submit
router.post('/submit', protect, upload.single('screenshot'), submitPayment);

// GET /api/payments/my-status
router.get('/my-status', protect, getMyStatus);

module.exports = router;

