// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../model/user');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Signup route
router.post('/signup', async (req, res) => {
    const { name, email, password, gender } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        user = new User({ name, email, password, gender });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Update user count and last login date
        user.count++;
        user.lastLoginDate = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'Aswinannalath', { expiresIn: '1h' });
        res.json({ token });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user details
router.get('/user/:id', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all user details (accessible only by admin)
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password field
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET user count data for graph
router.get('/user-count', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Aggregate user count based on dates or months
        const userCountData = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastLoginDate" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort by date in ascending order
        ]);

        // Convert the data to an object with dates as keys and counts as values
        const userCountMap = userCountData.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
        }, {});

        res.json(userCountMap);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
