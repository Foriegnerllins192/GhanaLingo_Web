// Database adapter that tries MySQL first, falls back to SQLite
let db;
let isSQLite = false;

try {
    // Try to use MySQL first
    db = require('./db');
    console.log('Using MySQL database');
} catch (mysqlError) {
    try {
        // Fall back to SQLite
        db = require('./db-sqlite');
        isSQLite = true;
        console.log('Using SQLite database');
    } catch (sqliteError) {
        console.error('Failed to load any database driver');
        console.error('MySQL error:', mysqlError.message);
        console.error('SQLite error:', sqliteError.message);
        process.exit(1);
    }
}

// Adapter functions to handle differences between MySQL and SQLite
const query = (sql, params = [], callback) => {
    if (isSQLite) {
        // SQLite uses different parameter syntax
        const sqliteSql = sql.replace(/\$(\d+)/g, '?');
        db.all(sqliteSql, params, callback);
    } else {
        // MySQL
        db.query(sql, params, callback);
    }
};

const execute = (sql, params = [], callback) => {
    if (isSQLite) {
        // SQLite uses different parameter syntax
        const sqliteSql = sql.replace(/\$(\d+)/g, '?');
        db.run(sqliteSql, params, callback);
    } else {
        // MySQL
        db.execute(sql, params, callback);
    }
};

module.exports = {
    db,
    query,
    execute,
    isSQLite
};