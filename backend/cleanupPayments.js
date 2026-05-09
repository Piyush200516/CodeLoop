require('dotenv').config();

// MySQL-only cleanup script.
// Deletes payments that are still pending (optionally you can tune the state/age).

const { pool } = require('./config/db');

const cleanup = async () => {
  try {
    // Delete all payments that are still 'pending'
    // If you want to delete only older pending payments, change the WHERE clause.
    const [result] = await pool.execute(
      "DELETE FROM payments WHERE status = 'pending'"
    );

    console.log(
      `Cleanup complete. Successfully deleted pending payments. (affectedRows=${result.affectedRows})`
    );
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    // Avoid failing hard when DB credentials aren't set during local test runs.
    process.exit(1);
  }
};

cleanup();


