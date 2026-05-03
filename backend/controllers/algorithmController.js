const Algorithm = require('../models/Algorithm');

// @desc  Get all algorithms
// @route GET /api/algorithms
const getAlgorithms = async (req, res) => {
    try {
        const algorithms = await Algorithm.find();
        res.json(algorithms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const FREE_ALGS = ['binary-search', 'bubble-sort', 'insertion-sort', 'linear-search', 'stack', 'queue', 'two-pointer', 'monotonic-stack', 'binary-tree-traversal'];

// @desc  Get algorithm by name
// @route GET /api/algorithms/:name
const getAlgorithmByName = async (req, res) => {
    try {
        const algorithm = await Algorithm.findOne({ name: req.params.name });
        if (!algorithm) return res.status(404).json({ message: 'Algorithm not found' });

        // Check premium status for non-free algorithms
        const isFree = FREE_ALGS.includes(algorithm.name);
        const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'coderecallapp@gmail.com').toLowerCase().trim();
        const isPremium = req.user.isPremium || req.user.isPaid || req.user.email?.toLowerCase().trim() === ADMIN_EMAIL;

        if (!isFree && !isPremium) {
            return res.status(403).json({ 
                message: 'Premium access required to view this algorithm visualizer.',
                requirePayment: true 
            });
        }

        res.json(algorithm);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAlgorithms,
    getAlgorithmByName
};
