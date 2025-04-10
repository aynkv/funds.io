const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const Goal = require('../models/Goal');

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
    const io = req.app.get('io');
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

        io.to(req.user.id).emit('newTransaction', transaction);

        const account = await Account.findById(accountId);
        const transactions = await Transaction.find({ accountId, userId: req.user.id });
        const totalSpent = transactions
            .filter((tx) => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        if (account.budget && totalSpent > account.budget) {
            const notification = new Notification({
                userId: req.user.id,
                message: `Budget exceeded for ${account.name}! Total: $${totalSpent}, Budget: $${account.budget}`,
                type: 'budget',
                relatedId: accountId
            });

            await notification.save();
            io.to(req.user.id).emit('newNotification', notification);
        }

        const goals = await Goal.find({ userId: req.user.id, accountId });
        for (const goal of goals) {
            const progress = await calculateGoalProgress(goal);
            goal.progress = progress;
            await goal.save();

            for (const constraint of goal.constraints) {
                let violation = false;
                let message = '';
                if (constraint.type === 'min' && progress < constraint.value) {
                    violation = true;
                    message = `${goal.name} progress ($${progress}) below min constraint ($${constraint.value})`;
                } else if (constraint.type === 'max' && progress > constraint.value) {
                    violation = true;
                    message = `${goal.name} progress ($${progress}) exceeds max constraint ($${constraint.value})`;
                } else if (constraint.type === 'percentage') {
                    const accountTotal = transactions.reduce((sum, tx) => sum + tx.amount, 0);
                    const percentage = (progress / accountTotal) * 100;
                    if (percentage > constraint.value) {
                        violation = true;
                        message = `${goal.name} progress (${percentage.toFixed(2)}%) exceeds (${constraint.value}% of ${account.name})`; 
                    }
                }

                if (violation) {
                    const notification = new Notification({
                        userId: req.user_id,
                        message,
                        type: 'goal',
                        relatedId: goal._id
                    });
                    await notification.save();
                    io.to(req.user.id).emit('newNotification', notification);
                }
            }
        }

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


async function calculateGoalProgress(goal) {
    const transactions = await Transaction.find({
        userId: goal.userId,
        accountId: goal.accountId,
        type: 'income',
    });

    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

module.exports = router;