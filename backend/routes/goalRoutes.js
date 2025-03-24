const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id }).populate('accountId', 'name');
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const { name, targetAmount, deadline, accountId, constraints } = req.body;
    try {
        const goal = new Goal({
            userId: req.user.id,
            name,
            targetAmount,
            deadline,
            accountId,
            constraints
        });
        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:goalId', authMiddleware, async (req, res) => {
    const { name, targetAmount, deadline, accountId, constraints } = req.body;
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.goalId, userId: req.user.id },
            { name, targetAmount, deadline, accountId, constraints },
            { new: true }
        );

        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:goalId', authMiddleware, async (req, res) => {
    try {
        const goal = Goal.findOneAndDelete({
            _id: req.params.goalId,
            userId: req.user.id,
        });

        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Goal deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:goalId/progress', authMiddleware, async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.goalId, userId: req.user.id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        const transactions = await Transaction.find({
            userId: req.user.id,
            accountId: goal.accountId,
            type: 'income'
        });

        const progress = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        goal.progress = progress;
        await goal.save();
        res.json({ goal, progress });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;