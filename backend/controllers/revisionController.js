const Problem = require('../models/Problem');
const RecallResult = require('../models/RecallResult');
const generateRecallAnswer = require('../utils/generateRecallAnswer');

// @desc    Get all solved problems for recall
// @route   GET /api/revision/recall
// @access  Private
const getRecallProblems = async (req, res) => {
    try {
        const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'coderecallapp@gmail.com').toLowerCase().trim();
        const isAdmin = req.user.email.toLowerCase().trim() === ADMIN_EMAIL;
        
        let problems = await Problem.find({ user: req.user._id });
        
        if (!isAdmin && !req.user.isPremium && !req.user.isPaid) {
            problems = problems.slice(0, 2);
        }

        // Check for missing flashcard data and suggest/save it
        const updatedProblems = await Promise.all(problems.map(async (problem) => {
            if (!problem.dataStructure || !problem.timeComplexity || !problem.keyAlgorithmIdea) {
                const results = generateRecallAnswer(problem);
                
                // Only update fields that are actually empty
                if (!problem.dataStructure) problem.dataStructure = results.ds;
                if (!problem.timeComplexity) problem.timeComplexity = results.tc;
                if (!problem.keyAlgorithmIdea) problem.keyAlgorithmIdea = results.idea;

                await problem.save();
            }
            return problem;
        }));

        res.json(updatedProblems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save recall session result
// @route   POST /api/revision/recall-result
// @access  Private
const saveRecallResult = async (req, res) => {
    try {
        const { problemId, rememberedCount, forgotCount } = req.body;

        const recallResult = await RecallResult.create({
            user: req.user.id,
            problem: problemId,
            rememberedCount,
            forgotCount,
        });

        res.status(201).json(recallResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recall stats/analytics
// @route   GET /api/revision/recall-stats
// @access  Private
const getRecallStats = async (req, res) => {
    try {
        const stats = await RecallResult.find({ user: req.user.id }).populate('problem');
        
        // Basic analytics: identify weak patterns
        const patternStats = {};
        stats.forEach(result => {
            if (result.problem && result.problem.topics) {
                result.problem.topics.forEach(topic => {
                    if (!patternStats[topic]) {
                        patternStats[topic] = { remembered: 0, forgot: 0 };
                    }
                    patternStats[topic].remembered += result.rememberedCount;
                    patternStats[topic].forgot += result.forgotCount;
                });
            }
        });

        res.json({ patternStats, totalSessions: stats.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRecallProblems,
    saveRecallResult,
    getRecallStats,
};
