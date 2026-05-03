const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userName: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'viewed', 'implemented'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Suggestion', suggestionSchema);
