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

// Function to generate unique username
function generateUniqueUsername(firstName, lastName) {
  const base = (firstName + lastName).toLowerCase().replace(/\s+/g, "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return base + randomNum;
}

// Register endpoint
router.post('/', async (req, res) => {
    console.log("Registration request received");
    
    try {
        const { firstName, lastName, email, password, preferredLanguage } = req.body;
        
        // Validate required fields
        if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
            return res.status(400).json({ error: 'First name is required and must be a valid string' });
        }
        
        if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
            return res.status(400).json({ error: 'Last name is required and must be a valid string' });
        }
        
        if (!email || typeof email !== 'string' || email.trim() === '') {
            return res.status(400).json({ error: 'Email is required and must be a valid string' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        if (!password || typeof password !== 'string' || password.trim() === '') {
            return res.status(400).json({ error: 'Password is required and must be a valid string' });
        }
        
        // Check password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        
        // preferredLanguage is optional but if provided should be a string
        if (preferredLanguage && typeof preferredLanguage !== 'string') {
            return res.status(400).json({ error: 'Preferred language must be a valid string' });
        }
        
        // Trim values to remove whitespace
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();
        const trimmedEmail = email.trim();
        const trimmedPreferredLanguage = preferredLanguage ? preferredLanguage.trim() : '';
        
        // Get database pool
        const pool = getPool();
        
        // Check if user already exists
        const { rows: existingUsers } = await pool.query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        
        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Generate unique username
            let username = generateUniqueUsername(trimmedFirstName, trimmedLastName);
            let usernameAttempts = 0;
            
            // Check if username already exists and regenerate if needed
            while (usernameAttempts < 5) {
                const { rows: existingUsernames } = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
                
                if (existingUsernames.length === 0) {
                    break; // Username is unique
                }
                
                username = generateUniqueUsername(trimmedFirstName, trimmedLastName);
                usernameAttempts++;
            }
            
            if (usernameAttempts >= 5) {
                return res.status(500).json({ error: 'Unable to generate unique username after multiple attempts' });
            }
            
            // Insert user into database
            const result = await pool.query(
                'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [username, trimmedEmail, hashedPassword, trimmedFirstName, trimmedLastName]
            );
            
            // Create JWT token
            const token = jwt.sign(
                { 
                    userId: result.insertId, 
                    username, 
                    firstName: trimmedFirstName, 
                    lastName: trimmedLastName,
                    preferredLanguage: trimmedPreferredLanguage
                },
                SECRET_KEY,
                { expiresIn: '24h' }
            );
            
            res.status(201).json({ 
                message: 'Registration successful', 
                token,
                user: {
                    id: result.insertId,
                    username,
                    firstName: trimmedFirstName,
                    lastName: trimmedLastName,
                    email: trimmedEmail,
                    preferredLanguage: trimmedPreferredLanguage
                }
            });
        } catch (hashError) {
            console.error('Password hashing error:', hashError);
            return res.status(500).json({ error: 'Registration failed', details: hashError.message });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

app.use('/api/register', router);

module.exports = app;
module.exports.handler = serverless(app);