const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  listPendingPayments,
  approvePayment,
  rejectPayment,
} = require('../controllers/adminController');

// GET /api/admin/payments (pending only)
router.get('/payments', protect, listPendingPayments);

// POST /api/admin/payments/approve/:id
router.post('/payments/approve/:id', protect, approvePayment);

// POST /api/admin/payments/reject/:id
router.post('/payments/reject/:id', protect, rejectPayment);

module.exports = router;

