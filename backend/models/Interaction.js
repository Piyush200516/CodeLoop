const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    featureName: {
        type: String,
        required: true
    },
    interactionType: {
        type: String,
        enum: ['click_locked', 'paywall_view', 'usage_limit_hit'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Interaction', interactionSchema);
