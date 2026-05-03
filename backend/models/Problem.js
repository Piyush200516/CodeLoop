const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Problem title is required'],
            trim: true,
        },
        leetcodeUrl: {
            type: String,
            trim: true,
            default: '',
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            required: [true, 'Difficulty is required'],
        },
        category: {
            type: String,
            default: '',
        },
        topics: {
            type: [String],
            default: [],
        },
        notes: {
            type: String,
            default: '',
        },
        approach: {
            type: String,
            default: '',
        },
        bruteForce: {
            type: String,
            default: '',
        },
        optimizedApproach: {
            type: String,
            default: '',
        },
        mistakes: {
            type: String,
            default: '',
        },
        optimizedSolution: {
            type: String,
            default: '',
        },
        timeComplexity: {
            type: String,
            default: '',
        },
        dataStructure: {
            type: String,
            default: '',
        },
        keyAlgorithmIdea: {
            type: String,
            default: '',
        },
        // When the user first solved this problem
        solvedDate: {
            type: Date,
            default: Date.now,
        },
        // Fixed-interval spaced repetition fields
        nextRevisionDate: {
            type: Date,
            default: Date.now,
        },
        revisionCount: {
            type: Number,
            default: 0,
        },
        lastReviewed: {
            type: Date,
            default: null,
        },
        scheduledRevisions: {
            type: [Date],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Problem', problemSchema);
