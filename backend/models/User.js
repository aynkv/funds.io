const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * 
 * This schema represents a user in the system.
 * 
 * @typedef {Object} User
 * @property {string} email - User's email address, required and unique.
 * @property {string} password - User's password, required.
 * @property {string} firstName - User's first name, optional.
 * @property {string} lastName - User's last name, optional.
 * @property {string} role - User's role, either 'user' or 'admin', defaults to 'user'.
 * @property {Date} createdAt - Timestamp of user creation, defaults to current date.
 */
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

/**
 * Middleware to hash the password before saving the user document.
 * @param {function} next - Callback to the next middleware.
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Method to compare entered password with the hashed password.
 * @param {string} enteredPassword - The password entered by the user.
 * @returns {Promise<boolean>} - Returns true if passwords match, otherwise false.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', userSchema);