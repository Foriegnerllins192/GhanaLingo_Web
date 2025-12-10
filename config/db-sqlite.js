const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open database file
const dbPath = path.join(__dirname, '..', 'ghanalingo.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
        
        // Create tables if they don't exist
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Create languages table
    db.run(`CREATE TABLE IF NOT EXISTS languages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Insert sample languages if they don't exist
    const languages = [
        ['Twi', 'tw', 'A dialect of the Akan language spoken in southern Ghana'],
        ['Ewe', 'ee', 'A Gbe language spoken in southeastern Ghana and southern Togo'],
        ['Ga', 'gaa', 'A Kwa language spoken in the Greater Accra region of Ghana']
    ];
    
    const stmt = db.prepare('INSERT OR IGNORE INTO languages (name, code, description) VALUES (?, ?, ?)');
    languages.forEach(lang => {
        stmt.run(lang[0], lang[1], lang[2]);
    });
    stmt.finalize();
    
    console.log('Database initialized successfully');
}

module.exports = db;