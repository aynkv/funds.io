const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const Goal = require('../models/Goal');
const Constraint = require('../models/Constraint');

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
        let filterBy = account.type === 'credit' ? 'expense' : 'income';
        const calculateBalance = transactions
            .filter((tx) => tx.type === filterBy)
            .reduce((sum, tx) => sum + tx.amount, 0);

        if (account.budget && calculateBalance > account.budget) {
            const notification = new Notification({
                userId: req.user.id,
                message: `Budget exceeded for ${account.name}! Total: $${calculateBalance}, Budget: $${account.budget}`,
                type: 'budget',
                relatedId: accountId
            });

            await notification.save();
            io.to(req.user.id).emit('newNotification', notification);
        }

        account.balance = calculateBalance;
        await account.save();

        const goals = await Goal.find({ userId: req.user.id, accountId });
        for (const goal of goals) {
            const progress = await recalculateGoalProgress(goal);

            const constraintId = goal.constraintId;
            const constraint = await Constraint.findById(constraintId);
            if (constraint) {
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
                        userId: req.user.id,
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


async function recalculateGoalProgress(goal) {
    const incomeTransactions = await Transaction.find({
        userId: goal.userId,
        accountId: goal.accountId,
        type: 'income',
    });

    const progress = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    goal.progress = progress;
    await goal.save();

    return progress;
}

module.exports = router;