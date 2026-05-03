const Problem = require('../models/Problem');

// @desc  Get weekly performance report
// @route GET /api/analytics/weekly
const getWeeklyReport = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Calculate the date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // Fetch all problems for the user
        const allProblems = await Problem.find({ user: userId });

        // Calculate "solved this week": problems where solvedDate is within the last 7 days
        const solvedThisWeekCount = allProblems.filter(p => 
            p.solvedDate >= sevenDaysAgo
        ).length;

        // Calculate "revisions this week": problems where lastReviewed is within the last 7 days
        const revisionsThisWeekCount = allProblems.filter(p => 
            p.lastReviewed && p.lastReviewed >= sevenDaysAgo
        ).length;

        // Calculate Topic Strengths
        // Strongest = Highest total revisionCount
        // Weakest = Lowest average revisionCount among started topics
        const topicStats = {};

        allProblems.forEach(p => {
            p.topics.forEach(t => {
                if (!topicStats[t]) {
                    topicStats[t] = { count: 0, totalRevisions: 0 };
                }
                topicStats[t].count += 1;
                topicStats[t].totalRevisions += p.revisionCount;
            });
        });

        let strongestTopic = "N/A";
        let weakestTopic = "N/A";

        if (Object.keys(topicStats).length > 0) {
            let maxRevisions = -1;
            let minAvgRevisions = Infinity;

            for (const [topic, stats] of Object.entries(topicStats)) {
                // Determine strongest primarily by pure volume of practice (total revisions)
                if (stats.totalRevisions > maxRevisions) {
                    maxRevisions = stats.totalRevisions;
                    strongestTopic = topic;
                }

                // Determine weakest by lowest average revisions
                const avgRevisions = stats.totalRevisions / stats.count;
                if (avgRevisions < minAvgRevisions) {
                    minAvgRevisions = avgRevisions;
                    weakestTopic = topic;
                }
            }
        }

        res.json({
            solved: solvedThisWeekCount,
            revisions: revisionsThisWeekCount,
            strongestTopic,
            weakestTopic
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get topic recommendations based on least solved topic
// @route GET /api/analytics/recommendations
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Default set of LeetCode topics to track
        const ALL_TOPICS = [
            'Arrays', 'Strings', 'Linked List', 'Stacks', 'Queues', 
            'Trees', 'Graphs', 'Heaps', 'Hash Table', 'Binary Search', 
            'Recursion', 'Backtracking', 'Dynamic Programming', 
            'Greedy', 'Sliding Window', 'Two Pointers', 'Bit Manipulation'
        ];

        // Fetch all problems for the user
        const allProblems = await Problem.find({ user: userId });

        // Initialize counts for all topics at zero
        const counters = {};
        ALL_TOPICS.forEach(t => {
            counters[t] = 0;
        });

        // Populate counts
        allProblems.forEach(p => {
            p.topics.forEach(t => {
                // If it's a known topic, increment it
                if (counters.hasOwnProperty(t)) {
                    counters[t]++;
                } else {
                    // If it's a custom topic, initialize it or increment
                    counters[t] = (counters[t] || 0) + 1;
                }
            });
        });

        // Find the topic(s) with the minimum count
        let recommendedTopic = null;
        let minCount = Infinity;

        // Sort keys to ensure deterministic results if counts are equal
        const topicsList = Object.keys(counters).sort();

        for (const topic of topicsList) {
            if (counters[topic] < minCount) {
                minCount = counters[topic];
                recommendedTopic = topic;
            }
        }

        if (!recommendedTopic) {
            return res.json({
                recommendedTopic: "N/A",
                reason: "Add more problems to get personalized recommendations"
            });
        }

        res.json({
            recommendedTopic,
            reason: minCount === 0 
                ? `You haven't solved any ${recommendedTopic.toLowerCase()} problems yet`
                : `You solved only ${minCount} ${minCount === 1 ? 'problem' : 'problems'} in ${recommendedTopic}`
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Interaction = require('../models/Interaction');

// @desc  Track a paywall hit or locked feature interaction
// @route POST /api/analytics/track-interaction
const trackInteraction = async (req, res) => {
    try {
        const { featureName, interactionType } = req.body;
        const interaction = new Interaction({
            userId: req.user._id,
            featureName,
            interactionType
        });
        await interaction.save();
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWeeklyReport,
    getRecommendations,
    trackInteraction
};
