const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using JSON Web Tokens (JWT).
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.

 * @example
 * // Use this middleware in your routes to protect them
 * const authMiddleware = require('./middleware/auth');
 * app.use('/protected-route', authMiddleware, (req, res) => {
 *   res.send('This is a protected route');
 * });
 */
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id: decoded.id, role: decoded.role};
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;