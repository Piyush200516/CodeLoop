const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (id, email) => {
    return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc Register user
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
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        const userId = result.insertId;

        // Generate token
        const token = generateToken(userId, email);

        res.status(201).json({
            id: userId,
            name,
            email,
            token
        });
    } catch (error) {
        console.error(error);
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

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe
};

