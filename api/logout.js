const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

// Middleware
router.use(express.json());

// Logout endpoint
router.post('/', (req, res) => {
    // Clear token cookie
    res.clearCookie('token');
    
    // Send success response
    res.json({ message: 'Logged out successfully' });
});

app.use('/api/logout', router);

module.exports = app;
module.exports.handler = serverless(app);