const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');
const Constraint = require('../models/Constraint');

// Create a new constraint
router.get('/constraints', authMiddleware, async (req, res) => {
    try {
        const constraints = await Constraint.find({ userId: req.user.id }).populate('accountId', 'name');
        res.json(constraints);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new constraint
router.post('/constraints', authMiddleware, async (req, res) => {
    const { type, value, accountId } = req.body;
    try {
        if (!['min', 'max', 'percentage'].includes(type)) {
            return res.status(400).json({ message: 'Invalid constraint type' });
        }
        if (typeof value !== 'number' || value < 0) {
            return res.status(400).json({ message: 'Invalid constraint value' });
        }
        if (accountId) {
            const account = await Account.findOne({ _id: accountId, userId: req.user.id });
            if (!account) {
                return res.status(400).json({ message: 'Invalid account selected' });
            }
        }

        const constraint = new Constraint({
            userId: req.user.id,
            accountId,
            type,
            value,
        });
        await constraint.save();
        res.status(201).json(constraint);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id })
            .populate('accountId', 'name')
            .populate('constraintId')
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    const {
        name,
        accountId,
        targetAmount,
        constraintId,
        deadline,
    } = req.body;
    const io = req.app.get('io');
    try {
        const constraint = await Constraint.findOne({
            _id: constraintId,
            userId: req.user.id,
        });

        if (!constraint) {
            return res.status(404).json({ message: `Constraint not found` });
        }

        // const targetAmount = await calculateTargetAmount(account, constraint);

        const existingGoal = await Goal.findOne({
            userId: req.user.id,
            name,
            targetAmount
        });

        if (existingGoal) {
            const notification = new Notification({
                userId: req.user.id,
                message: `Goal "${name}" with target $${targetAmount} already exists.`,
                type: 'goal',
                relatedId: existingGoal._id,
            });
            await notification.save();
            io.to(req.user.id.toString()).emit('newNotification', notification);
            return res.status(400).json({ message: `Goal "${name}" with target $${targetAmount} already exists.` });
        }

        const goal = new Goal({
            userId: req.user.id,
            name,
            deadline,
            accountId,
            constraintId,
            targetAmount,
            progress: 0,
        });
        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:goalId', authMiddleware, async (req, res) => {
    const {
        name,
        deadline,
        accountId,
        constraintId,
        createNewConstraint,
        newConstraint
    } = req.body;
    try {
        let constraint;

        if (createNewConstraint) {
            constraint = new Constraint({
                userId: req.user.id,
                accountId,
                type: newConstraint.type,
                value: newConstraint.value,
            });
            await constraint.save();
        } else {
            constraint = await Constraint.findOne({
                _id: constraintId,
                userId: req.user.id
            });
            if (!constraint) return res.status(404).json({ message: 'Constraint not found' });
        }

        const account = await Transaction.db.model('Account').findById(accountId);
        if (!account) return res.status(404).json({ message: 'Account not found' });

        const targetAmount = await calculateTargetAmount(account, constraint);

        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.goalId, userId: req.user.id },
            {
                name,
                deadline,
                accountId,
                constraintId: constraint._id,
                targetAmount
            },
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

async function calculateTargetAmount(account, constraint) {
    const currentBalance = account.balance;

    switch (constraint.type) {
        case "percentage":
            return currentBalance + (currentBalance * constraint.value / 100);
        case "min":
        case "max":
            return constraint.value;
        default:
            throw new Error('Invalid constraint type');
    }
}

module.exports = router;