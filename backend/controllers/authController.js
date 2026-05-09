const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id, email) => {
    return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc Register user & send OTP
// @route POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        // Check if user exists
        const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, is_verified) VALUES (?, ?, ?, 0)',
            [name, email, hashedPassword]
        );

        const userId = result.insertId;

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`🔑 Generated OTP for ${email}: ${otp}`);

        // Store OTP (10 min expiry)
        await pool.execute(
            'UPDATE users SET otp = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?',
            [otp, userId]
        );

        // Send OTP email
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Welcome to CodeRecall! 🎉</h2>
                <p>Your verification code is:</p>
                <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #6B7280;">This code expires in 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                <p style="color: #6B7280; font-size: 14px;">If you didn't request this, ignore this email.</p>
            </div>
        `;

        await sendEmail({
            email,
            subject: 'Your CodeRecall Verification Code',
            html
        });

        console.log(`✅ OTP sent to ${email}`);
        res.status(201).json({ message: 'User registered. OTP sent to your email!' });

    } catch (error) {
        console.error('❌ Register error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc Login user
// @route POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = generateToken(user.id, user.email);
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc Logout (client-side token clear)
// @route POST /api/auth/logout
const logoutUser = async (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

// @desc Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, name, email FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc Verify OTP
// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP required' });
        }

        // Find user & check OTP
        const [rows] = await pool.execute(
            'SELECT id, name, email, otp, otp_expiry, is_verified FROM users WHERE email = ?',
            [email]
        );
        const user = rows[0];

        if (!user || user.otp !== otp || new Date(user.otp_expiry) < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Mark verified & clear OTP
        await pool.execute(
            'UPDATE users SET is_verified = 1, otp = NULL, otp_expiry = NULL WHERE id = ?',
            [user.id]
        );

        // Generate token
        const token = generateToken(user.id, user.email);

        console.log(`✅ ${email} verified successfully`);
        res.json({
            message: 'Email verified successfully!',
            id: user.id,
            name: user.name,
            email: user.email,
            token
        });
    } catch (error) {
        console.error('❌ Verify OTP error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc Resend OTP
// @route POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const [rows] = await pool.execute('SELECT id FROM users WHERE email = ? AND is_verified = 0', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'User not found or already verified' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`🔄 Resend OTP for ${email}: ${otp}`);

        // Store new OTP
        await pool.execute(
            'UPDATE users SET otp = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE email = ?',
            [otp, email]
        );

        // Send email
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">CodeRecall - New Verification Code</h2>
                <p>Your new verification code is:</p>
                <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #6B7280;">Valid for 10 minutes.</p>
            </div>
        `;

        await sendEmail({
            email,
            subject: 'Your New CodeRecall Verification Code',
            html
        });

        console.log(`✅ New OTP sent to ${email}`);
        res.json({ message: 'New OTP sent to your email!' });
    } catch (error) {
        console.error('❌ Resend OTP error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc Google login
// @route POST /api/auth/google
// Frontend sends: { credential } (Google ID token)

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        // The token is a JWT-like string. We'll decode without verifying signature
        // to extract email/name. (If you want full verification, we'd add Google token verification later.)
        const decoded = jwt.decode(credential);
        const email = decoded?.email;
        const name = decoded?.name || decoded?.given_name || decoded?.family_name;

        if (!email) {
            return res.status(400).json({ message: 'Invalid Google credential (missing email)' });
        }

        // Check if user exists
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const existingUser = rows[0];

        if (existingUser) {
            const token = generateToken(existingUser.id, existingUser.email);
            return res.json({
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
                token
            });
        }

        // Create user (Google users)
        const insertName = name || 'Google User';

        // Generate secure random password (must be stored because `users.password` is NOT NULL)
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, is_verified) VALUES (?, ?, ?, 1)',
            [insertName, email, hashedPassword]
        );

        const userId = result.insertId;
        const token = generateToken(userId, email);

        return res.json({
            id: userId,
            name: insertName,
            email,
            token
        });
    } catch (error) {
        console.error('❌ Google login error:', error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    verifyOTP,
    resendOTP,
    googleLogin
};



