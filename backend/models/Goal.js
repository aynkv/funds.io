const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    deadline: { type: Date },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    constraintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Constraint' },
    progress: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Goal', goalSchema);