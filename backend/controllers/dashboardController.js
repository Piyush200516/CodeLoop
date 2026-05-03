const { pool } = require('../config/db');

// @desc Get dashboard stats
// @route GET /api/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total problems
    const [totalResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM problems WHERE user_id = ?',
      [userId]
    );
    const totalSolved = totalResult[0].total;

    // Due today
    const [dueResult] = await pool.execute(
      'SELECT COUNT(*) as due FROM problems WHERE user_id = ? AND next_review_date <= CURDATE()',
      [userId]
    );
    const dueToday = dueResult[0].due;

    // Topic distribution
    const [topicResult] = await pool.execute(
      'SELECT topic, COUNT(*) as count FROM problems WHERE user_id = ? GROUP BY topic',
      [userId]
    );
    const topicDistribution = {};
    topicResult.forEach(row => {
      topicDistribution[row.topic] = row.count;
    });

    // Difficulty distribution
    const [difficultyResult] = await pool.execute(
      'SELECT difficulty, COUNT(*) as count FROM problems WHERE user_id = ? GROUP BY difficulty',
      [userId]
    );
    const difficultyDistribution = { Easy: 0, Medium: 0, Hard: 0 };
    difficultyResult.forEach(row => {
      difficultyDistribution[row.difficulty] = row.count;
    });

    // Recent problems (last 5)
    const [recentProblems] = await pool.execute(
      'SELECT id, title, leetcode_url, topic, difficulty, next_review_date, created_at FROM problems WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    const mappedRecent = recentProblems.map(p => ({
      ...p,
      leetcodeUrl: p.leetcode_url
    }));

    res.json({
      totalSolved,
      dueToday,
      topicDistribution,
      difficultyDistribution,
      recentProblems: mappedRecent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };

