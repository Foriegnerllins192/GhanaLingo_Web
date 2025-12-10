// Universal database adapter that works with both MySQL and SQLite
class UniversalDB {
    constructor() {
        this.db = null;
        this.isMySQL = false;
        this.isSQLite = false;
        this.init();
    }

    init() {
        try {
            // Try MySQL first
            const mysql = require('mysql2');
            this.db = mysql.createPool({
                connectionLimit: 10,
                host: process.env.MYSQL_HOST || 'localhost',
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'ghana_lingo',
                port: process.env.MYSQL_PORT || 3306,
                charset: 'utf8mb4'
            });
            this.isMySQL = true;
            console.log('Using MySQL database');
        } catch (mysqlError) {
            try {
                // Fall back to SQLite
                const sqlite3 = require('sqlite3').verbose();
                const path = require('path');
                const dbPath = path.join(__dirname, '..', 'ghanalingo.db');
                this.db = new sqlite3.Database(dbPath);
                this.isSQLite = true;
                console.log('Using SQLite database');
                
                // Initialize database tables
                this.initializeSQLite();
            } catch (sqliteError) {
                console.error('Failed to initialize any database:');
                console.error('MySQL error:', mysqlError.message);
                console.error('SQLite error:', sqliteError.message);
                process.exit(1);
            }
        }
    }

    initializeSQLite() {
        // Enable foreign keys for SQLite
        this.db.run('PRAGMA foreign_keys = ON');
        
        // Create tables if they don't exist
        this.db.serialize(() => {
            // Users table
            this.db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // Languages table
            this.db.run(`CREATE TABLE IF NOT EXISTS languages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                code TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // Insert sample languages if they don't exist
            const insertLang = this.db.prepare('INSERT OR IGNORE INTO languages (name, code, description) VALUES (?, ?, ?)');
            insertLang.run('Twi', 'tw', 'A dialect of the Akan language spoken in southern Ghana');
            insertLang.run('Ewe', 'ee', 'A Gbe language spoken in southeastern Ghana and southern Togo');
            insertLang.run('Ga', 'gaa', 'A Kwa language spoken in the Greater Accra region of Ghana');
            insertLang.finalize();
        });
    }

    // Universal query method that works with both MySQL and SQLite
    query(sql, params = [], callback) {
        if (this.isMySQL) {
            this.db.execute(sql, params, callback);
        } else if (this.isSQLite) {
            // Convert PostgreSQL-style placeholders to SQLite style
            const sqliteSql = sql.replace(/\$(\d+)/g, '?');
            this.db.all(sqliteSql, params, callback);
        }
    }

    // Universal execute method for INSERT/UPDATE/DELETE
    execute(sql, params = [], callback) {
        if (this.isMySQL) {
            this.db.execute(sql, params, callback);
        } else if (this.isSQLite) {
            // Convert PostgreSQL-style placeholders to SQLite style
            const sqliteSql = sql.replace(/\$(\d+)/g, '?');
            this.db.run(sqliteSql, params, callback);
        }
    }

    // Method to get last insert ID for SQLite
    getLastInsertId(callback) {
        if (this.isMySQL) {
            // MySQL returns insertId directly
            callback(null, null); // Not needed for MySQL
        } else if (this.isSQLite) {
            this.db.get('SELECT last_insert_rowid() as id', [], (err, row) => {
                callback(err, row ? row.id : null);
            });
        }
    }
}

// Export singleton instance
module.exports = new UniversalDB();