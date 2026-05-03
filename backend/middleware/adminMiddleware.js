const isAdmin = (req, res, next) => {
    if (req.user && req.user.email === process.env.ADMIN_EMAIL) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

module.exports = { isAdmin };
