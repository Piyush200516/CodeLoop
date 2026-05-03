const { pool } = require('../config/db');

// SM-2 Algorithm
const calculateSM2 = (ease_factor, interval_days, repetition, rating) => {
    let quality = rating; // 0-5
  
    let new_ease_factor = ease_factor;
    let new_repetition = repetition;
    let new_interval_days;
  
    if (quality < 3) {
      new_repetition = 0;
      new_interval_days = 1;
      new_ease_factor = Math.max(1.3, ease_factor - 0.2);
    } else {
      new_repetition = repetition + 1;
      if (new_repetition === 1) {
        new_interval_days = 1;
      } else if (new_repetition === 2) {
        new_interval_days = 6;
      } else {
        new_interval_days = Math.round(interval_days * ease_factor);
      }
      new_ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    }
  
    const next_review_date = new Date();
    next_review_date.setDate(next_review_date.getDate() + new_interval_days);
  
    return {
      ease_factor: Math.round(new_ease_factor * 10) / 10,
      interval_days: new_interval_days,
      repetition: new_repetition,
      next_review_date: next_review_date.toISOString().split('T')[0]
    };
  };

// @desc Get user problems
// @route GET /api/problems
const getProblems = async (req, res) => {
    try {
      const userId = req.user.id;
      const { topic, difficulty, search } = req.query;
  
      let query = 'SELECT * FROM problems WHERE user_id = ?';
      let params = [userId];
  
      if (topic) {
        query += ' AND topic LIKE ?';
        params.push(`%${topic}%`);
      }
      if (difficulty) {
        query += ' AND difficulty = ?';
        params.push(difficulty);
      }
      if (search) {
        query += ' AND (title LIKE ? OR notes LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
  
      query += ' ORDER BY created_at DESC';
  
      const [problems] = await pool.execute(query, params);
  
      // Map for frontend
      const mappedProblems = problems.map(p => ({
        ...p,
        leetcodeUrl: p.leetcode_url
      }));
  
      res.json(mappedProblems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // @desc Get due problems
  // @route GET /api/problems/due
  const getDueProblems = async (req, res) => {
    try {
      const userId = req.user.id;
      const [problems] = await pool.execute(
        `SELECT * FROM problems 
         WHERE user_id = ? AND next_review_date <= CURDATE()
         ORDER BY next_review_date ASC`,
        [userId]
      );
  
      const mappedProblems = problems.map(p => ({
        ...p,
        leetcodeUrl: p.leetcode_url
      }));
  
      res.json(mappedProblems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // @desc Add problem
  // @route POST /api/problems
  const addProblem = async (req, res) => {
    try {
      const userId = req.user.id;
      const { title, leetcode_url, topic, difficulty, notes } = req.body;
  
      if (!title || !difficulty) {
        return res.status(400).json({ message: 'Title and difficulty required' });
      }
  
      const [result] = await pool.execute(
        `INSERT INTO problems (user_id, title, leetcode_url, topic, difficulty, notes, ease_factor, interval_days, repetition, next_review_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 2.5, 1, 0, CURDATE(), NOW())`,
        [userId, title, leetcode_url || '', topic || '', difficulty, notes || '']
      );
  
      const [newProblem] = await pool.execute(
        'SELECT * FROM problems WHERE id = ?',
        [result.insertId]
      );
  
      const mappedProblem = {
        ...newProblem[0],
        leetcodeUrl: newProblem[0].leetcode_url
      };
  
      res.status(201).json(mappedProblem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // @desc Update problem
  // @route PUT /api/problems/:id
  const updateProblem = async (req, res) => {
    try {
      const userId = req.user.id;
      const problemId = req.params.id;
      const { title, leetcode_url, topic, difficulty, notes } = req.body;
  
      const [result] = await pool.execute(
        `UPDATE problems 
         SET title = ?, leetcode_url = ?, topic = ?, difficulty = ?, notes = ?, updated_at = NOW()
         WHERE id = ? AND user_id = ?`,
        [title, leetcode_url || '', topic || '', difficulty, notes || '', problemId, userId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Problem not found or not authorized' });
      }
  
      const [updated] = await pool.execute(
        'SELECT * FROM problems WHERE id = ? AND user_id = ?',
        [problemId, userId]
      );
  
      res.json({
        ...updated[0],
        leetcodeUrl: updated[0].leetcode_url
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // @desc Delete problem
  // @route DELETE /api/problems/:id
  const deleteProblem = async (req, res) => {
    try {
      const userId = req.user.id;
      const problemId = req.params.id;
  
      const [result] = await pool.execute(
        'DELETE FROM problems WHERE id = ? AND user_id = ?',
        [problemId, userId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Problem not found or not authorized' });
      }
  
      res.json({ message: 'Problem deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // @desc Review problem (SM-2)
  // @route POST /api/problems/:id/review
  const reviewProblem = async (req, res) => {
    try {
      const userId = req.user.id;
      const problemId = req.params.id;
      const { rating } = req.body; // 0-5
  
      if (!rating || rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'Rating 0-5 required' });
      }
  
      // Get current problem
      const [problems] = await pool.execute(
        'SELECT * FROM problems WHERE id = ? AND user_id = ? FOR UPDATE',
        [problemId, userId]
      );
      const problem = problems[0];
  
      if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
      }
  
      // Calculate SM-2
      const sm2 = calculateSM2(
        parseFloat(problem.ease_factor),
        parseInt(problem.interval_days),
        parseInt(problem.repetition),
        rating
      );
  
      // Update problem
      await pool.execute(
        `UPDATE problems SET 
          ease_factor = ?, interval_days = ?, repetition = ?, next_review_date = ?, updated_at = NOW()
          WHERE id = ?`,
        [sm2.ease_factor, sm2.interval_days, sm2.repetition, sm2.next_review_date, problemId]
      );
  
      // Insert review history
      await pool.execute(
        `INSERT INTO review_history (problem_id, user_id, rating, reviewed_at, next_review_date)
         VALUES (?, ?, ?, NOW(), ?)`,
        [problemId, userId, rating, sm2.next_review_date]
      );
  
      // Return updated problem
      const [updated] = await pool.execute('SELECT * FROM problems WHERE id = ?', [problemId]);
      res.json({
        ...updated[0],
        leetcodeUrl: updated[0].leetcode_url,
        message: 'Review completed successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports = {
    getProblems,
    getDueProblems,
    addProblem,
    updateProblem,
    deleteProblem,
    reviewProblem
  };

