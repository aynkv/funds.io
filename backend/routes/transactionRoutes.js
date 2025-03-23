const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Get all transactions for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).populate('accountId', 'name');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new transaction
router.post('/', authMiddleware, async (req, res) => {
    const { accountId, type, amount, category, description } = req.body;
    try {
        const transaction = new Transaction({
            userId: req.user.id,
            accountId,
            type,
            amount,
            category,
            description,
        });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a transaction
router.put('/:transactionId', authMiddleware, async (req, res) => {
    const { accountId, type, amount, category, description } = req.body;
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.transactionId, userId: req.user.id },
            { accountId, type, amount, category, description },
            { new: true }
        );

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a transaction
router.delete('/:transactionId', authMiddleware, async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.transactionId,
            userId: req.user.id,
        });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;