const mysql = require('mysql2'); // Use mysql2 for better performance and compatibility

// Create connection pool with enhanced configuration
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'ghana_lingo',
    port: process.env.MYSQL_PORT || 3306,
    charset: 'utf8mb4',
    timezone: 'local',
    connectTimeout: 30000,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : false
});

// Add event listeners for debugging
pool.on('connection', function (connection) {
    console.log('Database connection established with threadId ' + connection.threadId);
});

pool.on('enqueue', function () {
    console.log('Waiting for available database connection slot');
});

pool.on('release', function (connection) {
    console.log('Database connection ' + connection.threadId + ' released');
});

// Handle connection errors
pool.on('error', function(err) {
    console.error('Database pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection was closed, attempting to reconnect...');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
        console.log('Database has too many connections');
    } else if (err.code === 'ECONNREFUSED') {
        console.log('Database connection was refused');
    }
});

// Get connection
const getConnection = (callback) => {
    pool.getConnection((err, connection) => {
        if(err){
            console.error('Database connection error:', err);
            return callback(err);
        }
        console.log('Successfully obtained database connection with threadId ' + connection.threadId);
        callback(null, connection);
    });
};

// Promisify the pool for async/await usage
const promisePool = pool.promise();

module.exports = {
    pool,
    getConnection,
    promisePool
};