const mongoose = require('mongoose');

const constraintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['min', 'max', 'percentage'], required: true },
  value: { type: Number, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
});

module.exports = mongoose.model('Constraint', constraintSchema);
