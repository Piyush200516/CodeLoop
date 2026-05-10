const path = require('path');
const { pool } = require('../config/db');


// POST /api/payments/submit
// body: user_id (ignored; taken from auth token), amount, utr_number
// file: screenshot
const crypto = require('crypto');

// For email admin approve/reject links
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'piyushmishra21052003@gmail.com';
const UPI_ID = process.env.UPI_ID || 'piyushmishra21052003@okhdfcbank';

const generateApprovalToken = () => crypto.randomBytes(32).toString('hex');

const getPaymentsColumnMap = async () => {
  // columns used for compatibility with different MySQL schemas
  const [cols] = await pool.execute(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments'",
  );

  const set = new Set((cols || []).map((r) => r.COLUMN_NAME));
  return {
    hasApprovalToken: set.has('approval_token'),
    // insert currently doesn't set reviewed_at, but keep for future safety
    hasReviewedAt: set.has('reviewed_at'),
  };
};

const submitPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, utr_number } = req.body;
    const screenshot = req.file;


    // Prevent multiple pending payment proofs for same user
    const [pendingRows] = await pool.execute(
      "SELECT id FROM payments WHERE user_id = ? AND status = 'pending' LIMIT 1",
      [userId]
    );

    if (pendingRows.length) {
      return res.status(409).json({
        message: 'Your payment proof is already submitted and pending verification.',
      });
    }

    // user premium check (done after pending guard)
    const [userRowsForPremium] = await pool.execute(
      'SELECT id, is_premium FROM users WHERE id = ?',
      [userId]
    );

    if (userRowsForPremium.length && userRowsForPremium[0].is_premium === 1) {
      return res.status(400).json({ message: 'You already have premium access.' });
    }



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

    // Insert into MySQL payments table (support schemas with/without approval_token)
    const { hasApprovalToken } = await getPaymentsColumnMap();

    const approvalToken = hasApprovalToken ? generateApprovalToken() : null;

    let result;
    if (hasApprovalToken) {
      const insertSql =
        'INSERT INTO payments (user_id, amount, utr_number, screenshot_url, status, approval_token, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())';
      [result] = await pool.execute(insertSql, [
        userId,
        parsedAmount,
        utr_number,
        screenshotUrl,
        'pending',
        approvalToken,
      ]);
    } else {
      const insertSql =
        'INSERT INTO payments (user_id, amount, utr_number, screenshot_url, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
      [result] = await pool.execute(insertSql, [
        userId,
        parsedAmount,
        utr_number,
        screenshotUrl,
        'pending',
      ]);
    }


    // Fetch user details for admin email
    const [userRows] = await pool.execute(
      'SELECT name, email FROM users WHERE id = ?',
      [userId]
    );

    const userName = userRows[0]?.name;
    const userEmail = userRows[0]?.email;

    const baseUrl = (process.env.FRONTEND_BASE_URL || process.env.BACKEND_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

    // Only generate token-based admin links when schema supports it
    const approveUrl = approvalToken ? `${baseUrl}/api/payments/email-approve/${approvalToken}` : null;
    const rejectUrl = approvalToken ? `${baseUrl}/api/payments/email-reject/${approvalToken}` : null;


    const screenshotLink = `${baseUrl}${screenshotUrl}`;

    const amountINR = 30; // Must be ₹30

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="margin:0 0 10px;">Manual UPI Payment Approval Request</h2>
        <p style="color:#555;">A user submitted a manual UPI payment for verification.</p>

        <div style="background:#f8fafc; border:1px solid #e5e7eb; padding:16px; border-radius:12px;">
          <p><b>User name:</b> ${userName || ''}</p>
          <p><b>User email:</b> ${userEmail || ''}</p>
          <p><b>Amount:</b> ₹${amountINR}</p>
          <p><b>UPI ID:</b> ${UPI_ID}</p>
          <p><b>UTR / Transaction ID:</b> ${utr_number}</p>
          <p><b>Screenshot:</b> <a href="${screenshotLink}" target="_blank" rel="noopener noreferrer">View screenshot</a></p>
        </div>

        ${approveUrl && rejectUrl ? `
        <div style="margin-top:16px; display:flex; gap:12px; flex-wrap:wrap;">
          <a href="${approveUrl}" style="display:inline-block; padding:12px 18px; background:#16a34a; color:#fff; text-decoration:none; border-radius:10px; font-weight:bold;">Approve Payment</a>
          <a href="${rejectUrl}" style="display:inline-block; padding:12px 18px; background:#dc2626; color:#fff; text-decoration:none; border-radius:10px; font-weight:bold;">Reject Payment</a>
        </div>

        <p style="color:#777; font-size:12px; margin-top:12px;">Token-based links: no admin login required.</p>
        ` : `
        <p style="color:#777; font-size:12px; margin-top:12px;">Admin approval links are unavailable because approval_token column is missing in the payments table.</p>
        `}

      </div>
    `;

    // Send admin email (non-fatal)
    try {
      await require('../utils/sendEmail')({
        email: ADMIN_EMAIL,
        subject: 'UPI Manual Payment Verification Required',
        html,
      });
    } catch (emailErr) {
      console.error('Admin email send failed (non-fatal):', emailErr);
      console.error('Admin email send failed exact message:', emailErr?.message);
      // Do not crash payment submit
    }


    return res.status(201).json({
      message: 'Payment submitted successfully',
      paymentId: result.insertId,
    });

  } catch (err) {
    console.error('submitPayment error:', err);
    console.error('submitPayment exact error message:', err?.message);
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

const emailApprovePayment = async (req, res) => {
  try {
    const { token } = req.params;

    const [rows] = await pool.execute(
      'SELECT id, user_id, status FROM payments WHERE approval_token = ? LIMIT 1',
      [token]
    );

    if (!rows.length) {
      return res.status(404).send('Invalid or expired token');
    }

    const payment = rows[0];
    if (payment.status === 'approved' || payment.status === 'rejected') {
      return res.status(200).send('Payment already processed');
    }

    const userId = payment.user_id;

    await pool.execute('START TRANSACTION');
    try {
      await pool.execute(
        "UPDATE payments SET status = 'approved', approved_at = NOW() WHERE id = ?",
        [payment.id]
      );

      await pool.execute(
        "UPDATE users SET is_premium = 1, premium_plan = 'lifetime', premium_expiry = NULL WHERE id = ?",
        [userId]
      );

      // Optional consistency: reviewed_at for both approve/reject
      await pool.execute(
        "UPDATE payments SET reviewed_at = NOW() WHERE id = ?",
        [payment.id]
      );

      await pool.execute('COMMIT');
    } catch (e) {
      await pool.execute('ROLLBACK');
      throw e;
    }

    return res.status(200).send('Payment approved successfully. Premium activated.');
  } catch (err) {
    console.error('emailApprovePayment error:', err);
    return res.status(500).send('Server error');
  }
};

const emailRejectPayment = async (req, res) => {
  try {
    const { token } = req.params;

    const [rows] = await pool.execute(
      'SELECT id, status FROM payments WHERE approval_token = ? LIMIT 1',
      [token]
    );

    if (!rows.length) {
      return res.status(404).send('Invalid or expired token');
    }

    const payment = rows[0];

    if (payment.status === 'approved' || payment.status === 'rejected') {
      return res.status(200).send('Payment already processed');
    }

    await pool.execute(
      "UPDATE payments SET status = 'rejected', reviewed_at = NOW() WHERE id = ?",
      [payment.id]
    );

    return res.status(200).send('Payment rejected successfully.');
  } catch (err) {
    console.error('emailRejectPayment error:', err);
    return res.status(500).send('Server error');
  }
};

module.exports = {
  submitPayment,
  getMyStatus,
  emailApprovePayment,
  emailRejectPayment,
};


