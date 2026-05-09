const path = require('path');
const { pool } = require('../config/db');


// POST /api/payments/submit
// body: user_id (ignored; taken from auth token), amount, utr_number
// file: screenshot
const submitPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, utr_number } = req.body;
    const screenshot = req.file;

    if (!utr_number) {
      return res.status(400).json({ message: 'utr_number is required' });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }

    // Expected premium manual UPI amount
    if (parsedAmount !== 30) {
      return res.status(400).json({ message: 'Invalid amount. Expected ₹30.' });
    }


    if (!screenshot) {
      return res.status(400).json({ message: 'screenshot is required' });
    }

    // screenshot_url should be a URL path client can access
    // We serve /uploads statically from backend/server.js
    const screenshotUrl = `/uploads/upi/${path.basename(screenshot.path)}`;

    // Insert into MySQL payments table
    const [result] = await pool.execute(
      'INSERT INTO payments (user_id, amount, utr_number, screenshot_url, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, parsedAmount, utr_number, screenshotUrl, 'pending']
    );

    return res.status(201).json({
      message: 'Payment submitted successfully',
      paymentId: result.insertId,
    });
  } catch (err) {
    console.error('submitPayment error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/payments/my-status
const getMyStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // users: is_premium, premium_plan, premium_expiry
    const [userRows] = await pool.execute(
      'SELECT id, is_premium, premium_plan, premium_expiry FROM users WHERE id = ?',
      [userId]
    );

    if (!userRows.length) return res.status(404).json({ message: 'User not found' });

    // Current payment status (most recent)
    const [paymentRows] = await pool.execute(
      'SELECT id, amount, utr_number, screenshot_url, status, created_at, approved_at FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    return res.json({
      user: {
        is_premium: userRows[0].is_premium,
        premium_plan: userRows[0].premium_plan,
        premium_expiry: userRows[0].premium_expiry,
      },
      payment: paymentRows[0] || null,
    });
  } catch (err) {
    console.error('getMyStatus error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitPayment,
  getMyStatus,
};

