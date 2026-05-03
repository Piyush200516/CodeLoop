const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        dailyCodeExecutions: {
            type: Number,
            default: 0,
        },
        lastCodeExecutionDate: {
            type: Date,
            default: null,
        },
        otp: String,
        otpExpiry: Date,
        resetPasswordToken: String,
        tokenExpiry: Date,
        currentSessionToken: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
