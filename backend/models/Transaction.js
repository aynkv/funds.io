const mongoose = require("mongoose");

/**
 * Transaction Schema
 * 
 * This schema represents a transaction in the system.
 * 
 * @typedef {Object} Transaction
 * @property {mongoose.Schema.Types.ObjectId} userId - The ID of the user associated with the transaction.
 * @property {mongoose.Schema.Types.ObjectId} accountId - The ID of the account associated with the transaction.
 * @property {string} type - The type of transaction, either 'income' or 'expense'.
 * @property {number} amount - The amount of the transaction.
 * @property {string} [category] - The category of the transaction.
 * @property {string} [description] - The description of the transaction.
 * @property {Date} [date] - The date of the transaction, defaults to the current date.
 */
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    category: { type: String },
    description: { type: String },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);