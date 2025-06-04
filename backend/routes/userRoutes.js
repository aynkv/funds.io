const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ email, name, password });
        await user.save();

        const token = jwt.sign({ id: user._id, email, name, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ token, user: { id: user._id, email, name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ token, user: { id: user._id, email, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout (invalidated client-side)
router.post('/logout', authMiddleware, (req, res) => {
    res.json({ message: 'Logout successful' });
})

// Extract all users (admin-only)
router.get('/users', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    const users = await User.find().select('-password');
    res.json(users);
});

// Get active user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update active user profile
router.put('/me', authMiddleware, async (req, res) => {
    const { email, name, password } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        };

        if (email) {
            user.email = email
        };
        
        if (name) {
            user.name = name
        };
        
        if (password) {
            user.password = password
        };

        await user.save();
        res.json({ message: 'Profile updated', user: { _id: user._id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a user (admin-only)
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (!user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete own account' })
        }
        await user.deleteOne();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;