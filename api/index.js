const express = require('express');
const serverless = require('serverless-http');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { getPool } = require('../config/db-vercel');

const app = express();
const router = express.Router();

// Use environment variables for secrets
const SECRET_KEY = process.env.JWT_SECRET || 'ghanalingo_secret_key';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware for serverless (simplified for Vercel)
app.use(session({
    secret: process.env.SESSION_SECRET || 'ghanalingo_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'lax'
    },
    rolling: true
}));

// Log all requests for debugging
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Function to generate unique username
function generateUniqueUsername(firstName, lastName) {
  const base = (firstName + lastName).toLowerCase().replace(/\s+/g, "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return base + randomNum;
}

// API route for registration
router.post('/register', async (req, res) => {
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
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
        
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
                const [existingUsernames] = await pool.execute("SELECT id FROM users WHERE username = ?", [username]);
                
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
            const [result] = await pool.execute(
                'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
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

// API route for login
router.post('/login', async (req, res) => {
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
        const [users] = await pool.execute(
            'SELECT id, username, password_hash, first_name, last_name, email FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        try {
            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password_hash);
            
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

// API route to get user info
router.get('/user', async (req, res) => {
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
        const [users] = await pool.execute(
            'SELECT id, username, first_name, last_name, email FROM users WHERE id = ?',
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

// API route for logout
router.post('/logout', (req, res) => {
    // Clear token cookie
    res.clearCookie('token');
    
    // Send success response
    res.json({ message: 'Logged out successfully' });
});

// Mount the router on /api
app.use('/api', router);

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);