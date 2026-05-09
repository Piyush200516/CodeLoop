const { pool } = require('../config/db');

const isAdminUser = async (userId) => {
  const [adminRows] = await pool.execute(
    'SELECT email FROM users WHERE id = ?',
    [userId]
  );
  const currentEmail = adminRows[0]?.email;
  return process.env.ADMIN_EMAIL && currentEmail === process.env.ADMIN_EMAIL;
};

const listPendingPayments = async (req, res) => {
  try {
    if (!(await isAdminUser(req.user.id))) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const [rows] = await pool.execute(
      `SELECT p.id, p.user_id, p.amount, p.utr_number, p.screenshot_url, p.status, p.created_at, p.approved_at, u.email
       FROM payments p
       JOIN users u ON u.id = p.user_id
       WHERE p.status = 'pending'
       ORDER BY p.created_at DESC`
    );

    return res.json(rows);
  } catch (err) {
    console.error('listPendingPayments error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/payments/approve/:id
const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!(await isAdminUser(req.user.id))) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Ensure this is still pending
    const [paymentRows] = await pool.execute(
      'SELECT user_id FROM payments WHERE id = ? AND status = "pending"',
      [id]
    );

    if (!paymentRows.length) {
      return res.status(404).json({ message: 'Pending payment not found' });
    }

    const userId = paymentRows[0].user_id;

    // Transaction: approve payment + unlock premium
    await pool.execute('START TRANSACTION');
    try {
      await pool.execute(
        'UPDATE payments SET status = "approved", approved_at = NOW() WHERE id = ?',
        [id]
      );

      await pool.execute(
        "UPDATE users SET is_premium = 1, premium_plan = 'lifetime', premium_expiry = NULL WHERE id = ?",
        [userId]
      );

      await pool.execute('COMMIT');
    } catch (e) {
      await pool.execute('ROLLBACK');
      throw e;
    }

    return res.json({ message: 'Payment approved successfully' });
  } catch (err) {
    console.error('approvePayment error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/payments/reject/:id
const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!(await isAdminUser(req.user.id))) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const [result] = await pool.execute(
      'UPDATE payments SET status = "rejected" WHERE id = ? AND status = "pending"',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pending payment not found' });
    }

    return res.json({ message: 'Payment rejected successfully' });
  } catch (err) {
    console.error('rejectPayment error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  listPendingPayments,
  approvePayment,
  rejectPayment,
};


