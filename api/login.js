const express = require('express');
const serverless = require('serverless-http');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db-postgres-vercel');

// Use environment variables for secrets
const SECRET_KEY = process.env.JWT_SECRET || 'ghanalingo_secret_key';

const app = express();
const router = express.Router();

// Middleware
router.use(express.json());

// Login endpoint
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Get database pool
        const pool = getPool();
        
        // Find user in database
        const { rows } = await pool.query(
            'SELECT id, username, password_hash, first_name, last_name, email FROM users WHERE email = $1',
            [email]
        );
        const users = rows;
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        try {
            // Compare passwords
            // Convert Buffer to string if needed
            const passwordHash = user.password_hash instanceof Buffer ? user.password_hash.toString() : user.password_hash;
            const isMatch = await bcrypt.compare(password, passwordHash);
            
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // Create JWT token
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    username: user.username, 
                    firstName: user.first_name, 
                    lastName: user.last_name
                },
                SECRET_KEY,
                { expiresIn: '24h' }
            );
            
            res.json({ 
                message: 'Login successful', 
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email
                }
            });
        } catch (compareError) {
            console.error('Password comparison error:', compareError);
            return res.status(500).json({ error: 'Login failed', details: compareError.message });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

app.use('/api/login', router);

module.exports = app;
module.exports.handler = serverless(app);