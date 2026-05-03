const Suggestion = require('../models/Suggestion');

exports.createSuggestion = async (req, res) => {
    try {
        const { title, description } = req.body;
        const suggestion = new Suggestion({
            title,
            description,
            userEmail: req.user.email,
            userName: req.user.name
        });
        await suggestion.save();
        res.status(201).json({ message: 'Suggestion submitted successfully', suggestion });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit suggestion', error: error.message });
    }
};

exports.getSuggestions = async (req, res) => {
    try {
        const suggestions = await Suggestion.find().sort({ createdAt: -1 });
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch suggestions', error: error.message });
    }
};

exports.deleteSuggestion = async (req, res) => {
    try {
        const { id } = req.params;
        await Suggestion.findByIdAndDelete(id);
        res.json({ message: 'Suggestion deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete suggestion', error: error.message });
    }
};
