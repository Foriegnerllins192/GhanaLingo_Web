const mysql = require('mysql2/promise');

// Database configuration for Vercel - uses environment variables
const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'ghana_lingo',
    port: process.env.MYSQL_PORT || 3306,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : false,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
};

// Create a connection pool
let pool;

function getPool() {
    if (!pool) {
        try {
            pool = mysql.createPool(config);
            console.log('Database pool created successfully');
        } catch (error) {
            console.error('Error creating database pool:', error);
            throw error;
        }
    }
    return pool;
}

// Test database connection
async function testConnection() {
    try {
        const pool = getPool();
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

module.exports = {
    getPool,
    testConnection
};