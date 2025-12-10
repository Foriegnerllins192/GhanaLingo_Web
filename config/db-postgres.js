const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool with PostgreSQL configuration
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DATABASE || 'ghana_lingo',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: process.env.POSTGRES_PORT || 5432,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 30000, // Return an error after 30 seconds if connection could not be established
});

// Add event listeners for debugging
pool.on('connect', (client) => {
    console.log('Database connection established');
});

pool.on('acquire', (client) => {
    console.log('Database connection acquired');
});

pool.on('remove', (client) => {
    console.log('Database connection removed');
});

// Handle connection errors
pool.on('error', (err) => {
    console.error('Database pool error:', err);
    process.exit(-1);
});

// Get connection
const getConnection = (callback) => {
    pool.connect((err, client, release) => {
        if (err) {
            console.error('Database connection error:', err);
            return callback(err);
        }
        console.log('Successfully obtained database connection');
        callback(null, client, release);
    });
};

module.exports = {
    pool,
    getConnection
};