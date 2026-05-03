const express = require('express');
const router = express.Router();
const { getUsers, getPayments, getDashboardStats, deleteUser, deletePayment } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/users', protect, adminOnly, getUsers);
router.get('/payments', protect, adminOnly, getPayments);
router.get('/stats', protect, adminOnly, getDashboardStats);
router.delete('/user/:id', protect, adminOnly, deleteUser);
router.delete('/payment/:id', protect, adminOnly, deletePayment);

module.exports = router;
