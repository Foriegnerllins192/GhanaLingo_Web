-- Create database
CREATE DATABASE ghana_lingo;

-- Connect to the database (in PostgreSQL, you'd typically connect directly)
-- \c ghana_lingo;

-- Enable UUID extension for auto-generated IDs if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
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

-- Create trigger function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
ON users FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Languages table
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    language_id INTEGER,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    order_num INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (language_id) REFERENCES languages(id)
);

-- Questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'fill_blank', 'audio_recognition')),
    options JSONB,
    correct_answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Teacher profiles table
CREATE TABLE teacher_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    bio TEXT,
    languages_spoken JSONB,
    hourly_rate DECIMAL(10, 2),
    availability JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create trigger for teacher_profiles table
CREATE TRIGGER update_teacher_profiles_updated_at BEFORE UPDATE
ON teacher_profiles FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    teacher_id INTEGER,
    booking_date DATE,
    start_time TIME,
    end_time TIME,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id)
);

-- Translations table
CREATE TABLE translations (
    id SERIAL PRIMARY KEY,
    source_language_id INTEGER,
    target_language_id INTEGER,
    source_text TEXT,
    translated_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_language_id) REFERENCES languages(id),
    FOREIGN KEY (target_language_id) REFERENCES languages(id)
);

-- Cultural articles table
CREATE TABLE cultural_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    category VARCHAR(50) CHECK (category IN ('tribes', 'values', 'festivals', 'proverbs', 'clothing', 'food', 'history')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service requests table
CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    language VARCHAR(50),
    service_type VARCHAR(50) CHECK (service_type IN ('voiceover', 'transcription', 'subtitling', 'tribute_writing')),
    file_path VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game scores table
CREATE TABLE game_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    game_type VARCHAR(30) CHECK (game_type IN ('flashcards', 'memory_match', 'word_scramble', 'audio_guess')),
    score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User progress table
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    lesson_id INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Create trigger for user_progress table
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE
ON user_progress FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample languages
INSERT INTO languages (name, code, description) VALUES
('Twi', 'tw', 'A dialect of the Akan language spoken in southern Ghana'),
('Ewe', 'ee', 'A Gbe language spoken in southeastern Ghana and southern Togo'),
('Ga', 'gaa', 'A Kwa language spoken in the Greater Accra region of Ghana'),
('Fante', 'fat', 'A dialect of the Akan language spoken in central Ghana'),
('Dagbani', 'dag', 'A Gur language spoken in northern Ghana'),
('Hausa', 'ha', 'A Chadic language spoken in northern Ghana and across West Africa'),
('Dagaare', 'dga', 'A Gur language spoken in the Upper West Region of Ghana'),
('Nzema', 'nzi', 'A Kwa language spoken in western Ghana'),
('Gonja', 'gjn', 'A Gur language spoken in the Savannah Region of Ghana');

-- Sample user (password would be hashed in reality)
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('demo_user', 'demo@example.com', 'hashed_password_here', 'Demo', 'User');