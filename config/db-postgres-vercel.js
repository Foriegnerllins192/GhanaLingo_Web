const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Database configuration for Vercel - uses environment variables
const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DATABASE || 'ghana_lingo',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: process.env.POSTGRES_PORT || 5432,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 30000, // Return an error after 30 seconds if connection could not be established
};

// Create a connection pool
let pool;

function getPool() {
    if (!pool) {
        try {
            pool = new Pool(config);
            console.log('PostgreSQL database pool created successfully');
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
        const client = await pool.connect();
        console.log('PostgreSQL database connection successful');
        client.release();
        return true;
    } catch (error) {
        console.error('PostgreSQL database connection failed:', error);
        return false;
    }
}

module.exports = {
    getPool,
    testConnection
};