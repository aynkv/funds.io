const mongoose = require('mongoose');

/**
 * Account Schema
 * 
 * This schema represents an account in the system.
 * 
 * @typedef {Object} Account
 * @property {mongoose.Schema.Types.ObjectId} userId - The ID of the user associated with the account. 
 * References the User model.
 * @property {string} name - The name of the account.
 * @property {number} budget - The budget associated with the account. Defaults to 0.
 * @property {Date} createdAt - The date when the account was created. Defaults to the current date.
 */
const accountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    budget: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Account', accountSchema);