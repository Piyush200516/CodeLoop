const express = require('express');
const router = express.Router();
const { createSuggestion, getSuggestions, deleteSuggestion } = require('../controllers/suggestionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Publicly accessible for logged in users
router.post('/', protect, createSuggestion);

// Admin only routes
router.get('/', protect, adminOnly, getSuggestions);
router.delete('/:id', protect, adminOnly, deleteSuggestion);

module.exports = router;
