const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const SECRET_KEY = 'ghanalingo_secret_key';

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    // Check session first
    if (req.session && req.session.userId) {
        req.user = {
            id: req.session.userId,
            username: req.session.username,
            firstName: req.session.firstName,
            lastName: req.session.lastName
        };
        return next();
    }
    
    // Check JWT token
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            firstName: decoded.firstName,
            lastName: decoded.lastName
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware to get user info for template rendering
const getUserInfo = (req, res, next) => {
    // Check session first
    if (req.session && req.session.userId) {
        req.user = {
            id: req.session.userId,
            username: req.session.username,
            firstName: req.session.firstName,
            lastName: req.session.lastName
        };
        return next();
    }
    
    // Check JWT token
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = {
                id: decoded.userId,
                username: decoded.username,
                firstName: decoded.firstName,
                lastName: decoded.lastName
            };
        } catch (error) {
            // Token invalid, continue without user info
            req.user = null;
        }
    } else {
        req.user = null;
    }
    
    next();
};

module.exports = {
    isAuthenticated,
    getUserInfo
};