const mongoose = require('mongoose');

const recallResultSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem',
            required: true,
        },
        rememberedCount: {
            type: Number,
            default: 0,
        },
        forgotCount: {
            type: Number,
            default: 0,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('RecallResult', recallResultSchema);
