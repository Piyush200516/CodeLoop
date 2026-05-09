const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

const {
  submitPayment,
  getMyStatus,
  emailApprovePayment,
  emailRejectPayment,
} = require('../controllers/paymentController');


// POST /api/payments/submit
router.post('/submit', protect, upload.single('screenshot'), submitPayment);

// GET /api/payments/my-status
router.get('/my-status', protect, getMyStatus);

// Email token based approval/rejection (public - token is security)
router.get('/email-approve/:token', emailApprovePayment);
router.get('/email-reject/:token', emailRejectPayment);

module.exports = router;


