const express = require('express');
const path = require('path');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { db, query, execute } = require('./config/db-adapter');

// Test database connection on startup
console.log('Testing database connection...');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'ghanalingo_secret_key'; // Use environment variable in production

// Middleware - Fixed JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Enhanced session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'ghanalingo_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'lax'
    },
    rolling: true // Reset maxAge on every request
}));

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/languages', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'languages.html'));
});

app.get('/culture', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'culture.html'));
});

app.get('/translation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'translation.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/teachers', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teachers.html'));
});

app.get('/games', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'games.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/twi-level1-intro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'twi-level1-intro.html'));
});

app.get('/twi-level1-step1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'twi-level1-step1.html'));
});

app.get('/twi-level1-step2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'twi-level1-step2.html'));
});

app.get('/twi-level1-step3', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'twi-level1-step3.html'));
});

app.get('/twi-level1-step4', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'twi-level1-step4.html'));
});

app.get('/twi-level1-step5', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'twi-level1-step5.html'));
});

// Function to generate unique username
function generateUniqueUsername(firstName, lastName) {
  const base = (firstName + lastName).toLowerCase().replace(/\s+/g, "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return base + randomNum;
}

// API routes for authentication
app.post('/api/register', async (req, res) => {
    // Safety log before parsing
    console.log("Incoming raw body:", req.body);
    
    // Log incoming request data for debugging
    console.log('Raw registration request body:', req.body);
    
    const { firstName, lastName, email, password, preferredLanguage } = req.body;
    
    try {
        // Log parsed request data
        console.log('Registration request data:', { 
            firstName: firstName || '[MISSING]', 
            lastName: lastName || '[MISSING]', 
            email: email || '[MISSING]', 
            password: password ? '[HIDDEN]' : '[MISSING]', 
            preferredLanguage: preferredLanguage || '[MISSING]' 
        });
        
        // Validate required fields with more detailed checks
        if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
            console.log('First name validation failed:', firstName);
            return res.status(400).json({ error: 'First name is required and must be a valid string' });
        }
        
        if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
            console.log('Last name validation failed:', lastName);
            return res.status(400).json({ error: 'Last name is required and must be a valid string' });
        }
        
        if (!email || typeof email !== 'string' || email.trim() === '') {
            console.log('Email validation failed:', email);
            return res.status(400).json({ error: 'Email is required and must be a valid string' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        if (!password || typeof password !== 'string' || password.trim() === '') {
            console.log('Password validation failed:', password);
            return res.status(400).json({ error: 'Password is required and must be a valid string' });
        }
        
        // Check password length
        if (password.length < 6) {
            console.log('Password too short:', password.length);
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        
        // preferredLanguage is optional but if provided should be a string
        if (preferredLanguage && typeof preferredLanguage !== 'string') {
            console.log('Preferred language validation failed:', preferredLanguage);
            return res.status(400).json({ error: 'Preferred language must be a valid string' });
        }
        
        // Trim values to remove whitespace
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();
        const trimmedEmail = email.trim();
        const trimmedPreferredLanguage = preferredLanguage ? preferredLanguage.trim() : '';
        
        // Check if user already exists
        const checkQuery = 'SELECT id FROM users WHERE email = ?';
        query(checkQuery, [trimmedEmail], async (err, results) => {
            if (err) {
                console.error('Database error checking existing user:', err);
                return res.status(500).json({ error: 'Registration failed', details: err.message });
            }
            
            if (results.rows.length > 0) {
                console.log('User already exists with email:', trimmedEmail);
                return res.status(400).json({ error: 'User already exists with this email' });
            }
            
            try {
                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                console.log('Password hashed successfully');
                
                // Function to generate a unique username and insert user
                function generateAndInsertUser(attempts = 0) {
                    // Limit the number of attempts to prevent infinite loops
                    if (attempts > 5) {
                        return res.status(500).json({ error: 'Unable to generate unique username after multiple attempts' });
                    }
                    
                    // Generate unique username
                    let username = generateUniqueUsername(trimmedFirstName, trimmedLastName);
                    console.log('Generated username (attempt ' + (attempts + 1) + '):', username);
                    
                    // Check if username already exists
                    const checkUsernameQuery = "SELECT id FROM users WHERE username = ?";
                    query(checkUsernameQuery, [username], (err, results) => {
                        if (err) {
                            console.error('Database error checking username:', err);
                            return res.status(500).json({ error: 'Registration failed', details: err.message });
                        }
                        
                        // If username exists, try again with a new username
                        if (rows.rows.length > 0) {
                            console.log('Username already exists, regenerating...');
                            return generateAndInsertUser(attempts + 1);
                        }
                        
                        // Username is unique, proceed with insertion
                        const insertQuery = 'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)';
                        execute(insertQuery, [username, trimmedEmail, hashedPassword, trimmedFirstName, trimmedLastName], (err, result) => {
                            if (err) {
                                console.error('Database error inserting user:', err);
                                return res.status(500).json({ error: 'Registration failed', details: err.message });
                            }
                            
                            // Get the inserted user ID
                            const getUserIdQuery = 'SELECT id FROM users WHERE username = ?';
                            query(getUserIdQuery, [username], (err, userResults) => {
                            if (err) {
                                console.error('Database error inserting user:', err);
                                return res.status(500).json({ error: 'Registration failed', details: err.message });
                            }
                            
                            // Get the inserted user ID
                            const getUserIdQuery = 'SELECT id FROM users WHERE username = ?';
                            query(getUserIdQuery, [username], (err, userResults) => {
                            req.session.username = username;
                            req.session.firstName = trimmedFirstName;
                            req.session.lastName = trimmedLastName;
                            req.session.email = trimmedEmail;
                            // Store preferred language in session
                            req.session.preferredLanguage = trimmedPreferredLanguage;
                            
                            // Create JWT token
                            const token = jwt.sign(
                                { 
                                    userId: result.rows[0].id, 
                                    username, 
                                    firstName: trimmedFirstName, 
                                    lastName: trimmedLastName,
                                    preferredLanguage: trimmedPreferredLanguage
                                },
                                SECRET_KEY,
                                { expiresIn: '24h' }
                            );
                            
                            // Log session and token creation
                            console.log('Session created for user:', {
                                userId: req.session.userId,
                                username: req.session.username,
                                firstName: req.session.firstName,
                                lastName: req.session.lastName,
                                preferredLanguage: req.session.preferredLanguage
                            });
                            console.log('JWT token created:', token);
                            
                            res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
                            res.json({ 
                                message: 'Registration successful', 
                                token,
                                user: {
                                    id: result.rows[0].id,
                                    username,
                                    firstName: trimmedFirstName,
                                    lastName: trimmedLastName,
                                    email: trimmedEmail,
                                    preferredLanguage: trimmedPreferredLanguage,
                                    createdAt: new Date() // Set to current date for new users
                                }
                            });
                        });
                    });
                }
                
                // Start the username generation and insertion process
                generateAndInsertUser();
            } catch (hashError) {
                console.error('Password hashing error:', hashError);
                return res.status(500).json({ error: 'Registration failed', details: hashError.message });
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Log incoming request data
        console.log('Login request data:', { email, password: password ? '[HIDDEN]' : null });
        
        // Validate required fields
        if (!email || !password) {
            console.log('Missing required fields for login');
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Find user in database
        const query = 'SELECT id, username, password_hash, first_name, last_name, email, created_at FROM users WHERE email = $1';
        pool.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Database error during login:', err);
                return res.status(500).json({ error: 'Login failed', details: err.message });
            }
            
            // Log query results
            console.log('Database query results for login:', results);
            
            if (results.rows.length === 0) {
                console.log('No user found with email:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            const user = results.rows[0];
            console.log('User found for login:', {
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email
            });
            
            try {
                // Compare passwords
                const isMatch = await bcrypt.compare(password, user.password_hash);
                console.log('Password match result:', isMatch);
                
                if (!isMatch) {
                    console.log('Password mismatch for user:', email);
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                
                // Create session
                req.session.userId = user.id;
                req.session.username = user.username;
                req.session.firstName = user.first_name;
                req.session.lastName = user.last_name;
                req.session.email = user.email;
                // Note: preferredLanguage is not stored in DB, so it won't be available on subsequent logins
                // unless we add a column to the users table
                
                // Log session creation
                console.log('Session created for user:', {
                    userId: req.session.userId,
                    username: req.session.username,
                    firstName: req.session.firstName,
                    lastName: req.session.lastName,
                    email: req.session.email
                });
                
                // Create JWT token
                const token = jwt.sign(
                    { 
                        userId: user.id, 
                        username: user.username, 
                        firstName: user.first_name, 
                        lastName: user.last_name
                        // preferredLanguage not available here either
                    },
                    SECRET_KEY,
                    { expiresIn: '24h' }
                );
                
                // Log token creation
                console.log('JWT token created for login:', token);
                
                res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
                res.json({ 
                    message: 'Login successful', 
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        email: user.email,
                        createdAt: user.created_at
                    }
                });
            } catch (compareError) {
                console.error('Password comparison error:', compareError);
                return res.status(500).json({ error: 'Login failed', details: compareError.message });
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// API route to get user info
app.get('/api/user', (req, res) => {
    console.log('User info request received. Session:', req.session);
    
    // Check session first
    if (req.session && req.session.userId) {
        console.log('Fetching user data from database using session ID:', req.session.userId);
        
        // Query database for complete user information
        const query = 'SELECT id, username, first_name, last_name, email, created_at FROM users WHERE id = $1';
        pool.query(query, [req.session.userId], (err, results) => {
            if (err) {
                console.error('Database error fetching user:', err);
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            
            console.log('Database query results for user info:', results);
            
            if (results.rows.length === 0) {
                console.log('No user found with ID:', req.session.userId);
                return res.status(401).json({ error: 'Not authenticated' });
            }
            
            const user = results.rows[0];
            console.log('User data fetched from database for session user:', user); // Debug log
            
            // Prepare user response with session data
            const userResponse = {
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                createdAt: user.created_at
            };
            
            // Add preferredLanguage if available in session
            if (req.session.preferredLanguage) {
                userResponse.preferredLanguage = req.session.preferredLanguage;
            }
            
            return res.json(userResponse);
        });
        return;
    }
    
    // Check JWT token
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    console.log('Checking JWT token:', token);
    
    
    if (!token) {
        console.log('No token found in request');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('Decoded JWT token:', decoded);
        
        // Query database for complete user information
        const query = 'SELECT id, username, first_name, last_name, email, created_at FROM users WHERE id = $1';
        pool.query(query, [decoded.userId], (err, results) => {
            if (err) {
                console.error('Database error fetching user:', err);
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            
            console.log('Database query results for JWT user:', results);
            
            if (results.rows.length === 0) {
                console.log('No user found with ID:', decoded.userId);
                return res.status(401).json({ error: 'Not authenticated' });
            }
            
            const user = results.rows[0];
            console.log('User data fetched from database for JWT user:', user); // Debug log
            
            // Prepare user response with token data
            const userResponse = {
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                createdAt: user.created_at
            };
            
            // Add preferredLanguage if available in token
            if (decoded.preferredLanguage) {
                userResponse.preferredLanguage = decoded.preferredLanguage;
            }
            
            res.json(userResponse);
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token', details: error.message });
    }
});

// API route for logout
app.post('/api/logout', (req, res) => {
    console.log('Logout request received. Current session:', req.session);
    
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ error: 'Could not log out' });
        }
        
        // Clear token cookie
        res.clearCookie('token');
        
        // Send success response
        res.json({ message: 'Logged out successfully' });
    });
});

// Debug API route to get all users
app.get('/api/test-users', (req, res) => {
    console.log('Test users request received');
    
    // Query database for all users
    const query = 'SELECT id, username, email, first_name, last_name, created_at FROM users';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Database error fetching users:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        console.log('Database query results for all users:', results.rows);
        res.json({ users: results.rows });
    });
});

// Export the app for Vercel
module.exports = app;