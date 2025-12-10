-- Example PostgreSQL queries for Ghana Lingo application

-- 1. Create database (run this as a superuser)
CREATE DATABASE ghana_lingo;

-- 2. Connect to the database
-- \c ghana_lingo;

-- 3. Create tables (this is already in the schema file, but showing examples here)

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create languages table
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert sample data

-- Insert sample languages
INSERT INTO languages (name, code, description) VALUES
('Twi', 'tw', 'A dialect of the Akan language spoken in southern Ghana'),
('Ewe', 'ee', 'A Gbe language spoken in southeastern Ghana and southern Togo');

-- Insert a sample user (in practice, the password would be hashed)
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('demo_user', 'demo@example.com', 'hashed_password_here', 'Demo', 'User');

-- 5. Query examples

-- Get all users
SELECT * FROM users;

-- Get a specific user by email
SELECT id, username, first_name, last_name, email FROM users WHERE email = $1;

-- Get all languages
SELECT * FROM languages;

-- Get a specific language by code
SELECT * FROM languages WHERE code = $1;

-- Update a user's information
UPDATE users SET first_name = $1, last_name = $2, updated_at = NOW() WHERE id = $3;

-- Delete a user (be careful with this!)
-- DELETE FROM users WHERE id = $1;

-- 6. Advanced queries that might be used in the application

-- Get user with their progress (assuming user_progress table exists)
SELECT u.id, u.username, u.email, up.completed, up.xp_earned
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
WHERE u.id = $1;

-- Get lessons for a specific language
SELECT l.id, l.title, l.description, l.level
FROM lessons l
WHERE l.language_id = $1
ORDER BY l.order_num;

-- Get questions for a specific lesson
SELECT q.id, q.question_text, q.question_type, q.options, q.correct_answer
FROM questions q
WHERE q.lesson_id = $1;