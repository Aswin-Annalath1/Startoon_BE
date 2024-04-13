// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../model/user.js');
const bcrypt = require('bcrypt');

const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;

    // Check if token exists
    if (token) {
        jwt.verify(token.split(" ")[1], 'Aswinannalath', async (err, decodedToken) => {
            if (err) {
                res.status(401).json({ message: 'Token is invalid or expired' });
            } else {
                // Attach user data to the request object
                req.user = await User.findById(decodedToken.userId);
                next();
            }
        });
    } else {
        res.status(401).json({ message: 'Token is required' });
    }
};

const requireAdmin = async (req, res, next) => {
    try {
        // Check if user is admin
        const adminUser = await User.findOne({ email: 'admin@email.com' });

        if (!adminUser) {
            return res.status(403).json({ message: 'Admin not found' });
        }

        // Compare hashed passwords
        const isMatch = await bcrypt.compare('Admin@123', adminUser.password);
        if (!isMatch) {
            return res.status(403).json({ message: 'Invalid admin credentials' });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { requireAuth, requireAdmin };