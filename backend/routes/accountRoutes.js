const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Account = require('../models/Account');
const Notification = require('../models/Notification')

// Get all accounts for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const accounts = await Account.find({ userId: req.user.id });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new account
router.post('/', authMiddleware, async (req, res) => {
    const { name, type, budget } = req.body;
    const io = req.app.get('io');
    try {
        const existingAccount = await Account.findOne({ userId: req.user.id, name });
        if (existingAccount) {
            const notification = new Notification({
                userId: req.user.id,
                message: `Account "${name}" already exists for your profile`,
                type: 'general',
                relatedId: existingAccount._id,
            });
            await notification.save();
            io.to(req.user.id.toString()).emit('newNotification', notification);
            return res.status(400).json({ message: `Account "${name}" already exists` });
        }
        
        const account = new Account({
            userId: req.user.id,
            name,
            type,
            budget,
        });
        await account.save();
        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update an account
router.put('/:accountId', authMiddleware, async (req, res) => {
    const { name, budget } = req.body;
    try {
        const account = await Account.findOneAndUpdate(
            { _id: req.params.accountId, userId: req.user.id },
            { name, budget },
            { new: true }
        );

        if (!account) return res.status(404).json({ message: 'Account not found' });
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete an account
router.delete('/:accountId', authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOneAndDelete({
            _id: req.params.accountId,
            userId: req.user.id,
        });
        if (!account) return res.status(404).json({ message: 'Account not found' });
        res.json({ message: 'Account deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;