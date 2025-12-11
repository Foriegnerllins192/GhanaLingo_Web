const express = require('express');
const path = require('path');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const db = require('./config/universal-db');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'ghanalingo_secret_key';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'ghanalingo_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
    },
    rolling: true
}));

// Simple homepage route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API route for registration
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    
    try {
        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if user already exists
        db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Registration failed' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }
            
            // Hash password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Hash error:', err);
                    return res.status(500).json({ error: 'Registration failed' });
                }
                
                // Generate username
                const username = (firstName + lastName).toLowerCase().replace(/\s+/g, "") + Math.floor(1000 + Math.random() * 9000);
                
                // Insert user
                db.execute(
                    'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
                    [username, email, hashedPassword, firstName, lastName],
                    (err, result) => {
                        if (err) {
                            console.error('Insert error:', err);
                            return res.status(500).json({ error: 'Registration failed' });
                        }
                        
                        // Get user ID
                        db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
                            if (err || results.length === 0) {
                                console.error('Get user ID error:', err);
                                return res.status(500).json({ error: 'Registration failed' });
                            }
                            
                            const userId = results[0].id;
                            
                            // Create session
                            req.session.userId = userId;
                            req.session.username = username;
                            req.session.firstName = firstName;
                            req.session.lastName = lastName;
                            
                            // Create JWT token
                            const token = jwt.sign(
                                { userId, username, firstName, lastName },
                                SECRET_KEY,
                                { expiresIn: '24h' }
                            );
                            
                            res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
                            res.json({ 
                                message: 'Registration successful', 
                                token,
                                user: {
                                    id: userId,
                                    username,
                                    firstName,
                                    lastName,
                                    email
                                }
                            });
                        });
                    }
                );
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// API route for login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user
        db.query(
            'SELECT id, username, password_hash, first_name, last_name, email FROM users WHERE email = ?',
            [email],
            (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Login failed' });
                }
                
                if (results.length === 0) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                
                const user = results[0];
                
                // Compare passwords
                bcrypt.compare(password, user.password_hash, (err, isMatch) => {
                    if (err || !isMatch) {
                        return res.status(401).json({ error: 'Invalid credentials' });
                    }
                    
                    // Create session
                    req.session.userId = user.id;
                    req.session.username = user.username;
                    req.session.firstName = user.first_name;
                    req.session.lastName = user.last_name;
                    
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
                    
                    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
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
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// API route to get user info
app.get('/api/user', (req, res) => {
    // Check session first
    if (req.session && req.session.userId) {
        db.query(
            'SELECT id, username, first_name, last_name, email FROM users WHERE id = ?',
            [req.session.userId],
            (err, results) => {
                if (err || results.length === 0) {
                    return res.status(401).json({ error: 'Not authenticated' });
                }
                
                const user = results[0];
                res.json(user);
            }
        );
        return;
    }
    
    // Check JWT token
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        
        db.query(
            'SELECT id, username, first_name, last_name, email FROM users WHERE id = ?',
            [decoded.userId],
            (err, results) => {
                if (err || results.length === 0) {
                    return res.status(401).json({ error: 'Not authenticated' });
                }
                
                const user = results[0];
                res.json(user);
            }
        );
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// API route for logout
app.post('/api/logout', (req, res) => {
    // Destroy session
    req.session.destroy(() => {
        // Clear token cookie
        res.clearCookie('token');
        // Send success response
        res.json({ message: 'Logged out successfully' });
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Database status:', db.isMySQL ? 'MySQL' : db.isSQLite ? 'SQLite' : 'None');
});

// Handle port in use error gracefully
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use.`);
        // Try the next available port
        const newPort = parseInt(PORT) + 1;
        console.log(`Trying port ${newPort} instead...`);
        process.env.PORT = newPort;
        setTimeout(() => {
            server.close();
            app.listen(newPort, () => {
                console.log(`Server is now running on http://localhost:${newPort}`);
                console.log('Database status:', db.isMySQL ? 'MySQL' : db.isSQLite ? 'SQLite' : 'None');
            });
        }, 1000);
    } else {
        console.error('Server error:', e);
    }
});