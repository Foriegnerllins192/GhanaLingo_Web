const express = require('express');
const serverless = require('serverless-http');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db-postgres-vercel');

// Use environment variables for secrets
const SECRET_KEY = process.env.JWT_SECRET || 'ghanalingo_secret_key';

const app = express();
const router = express.Router();

// Middleware
router.use(express.json());

// Get user info endpoint
router.get('/', async (req, res) => {
    // Check JWT token
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        
        // Get database pool
        const pool = getPool();
        
        // Query database for complete user information
        const { rows: users } = await pool.query(
            'SELECT id, username, first_name, last_name, email FROM users WHERE id = $1',
            [decoded.userId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const user = users[0];
        
        // Prepare user response with token data
        const userResponse = {
            id: user.id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email
        };
        
        // Add preferredLanguage if available in token
        if (decoded.preferredLanguage) {
            userResponse.preferredLanguage = decoded.preferredLanguage;
        }
        
        res.json(userResponse);
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token', details: error.message });
    }
});

app.use('/api/user', router);

module.exports = app;
module.exports.handler = serverless(app);