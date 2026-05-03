const User = require('../models/User');

// @desc    Check and log code execution usage
// @route   POST /api/usage/code-execution
// @access  Private
const logCodeExecution = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Admin/Premium bypass
        const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'coderecallapp@gmail.com').toLowerCase().trim();
        const isAdmin = user.email.toLowerCase().trim() === ADMIN_EMAIL;
        
        if (isAdmin || user.isPremium || user.isPaid) {
            return res.json({ 
                success: true, 
                message: 'Premium access: Unlimited executions',
                remaining: -1 
            });
        }

        // Logic for free users: 1 execution per day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastExecDate = user.lastCodeExecutionDate ? new Date(user.lastCodeExecutionDate) : null;
        if (lastExecDate) {
            lastExecDate.setHours(0, 0, 0, 0);
        }

        // Reset if it's a new day
        if (!lastExecDate || lastExecDate < today) {
            user.dailyCodeExecutions = 0;
            user.lastCodeExecutionDate = new Date();
        }

        if (user.dailyCodeExecutions >= 2) {
            return res.status(403).json({ 
                message: 'Daily limit reached (2/day)', 
                requirePremium: true,
                limitReached: true
            });
        }

        // Increment usage
        user.dailyCodeExecutions += 1;
        user.lastCodeExecutionDate = new Date();
        await user.save();

        res.json({ 
            success: true, 
            message: 'Execution logged',
            remaining: 0 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current usage stats
// @route   GET /api/usage/stats
// @access  Private
const getUsageStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // This could return a summary of all limits
        // For now, just code execution
        res.json({
            isPremium: user.isPremium || user.isPaid,
            codeExecutionsToday: user.dailyCodeExecutions,
            codeExecutionLimit: 2
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    logCodeExecution,
    getUsageStats
};
