const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const payments = await Payment.find({ status: 'paid' });
        
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);
        const totalTransactions = payments.length;

        res.json({
            totalUsers,
            totalRevenue,
            totalTransactions
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete payment
// @route   DELETE /api/admin/payment/:id
// @access  Private/Admin
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optional: Also clean up related datasets like their Payments
        await Payment.deleteMany({ userId: req.params.id });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    getPayments,
    getDashboardStats,
    deleteUser,
    deletePayment
};
