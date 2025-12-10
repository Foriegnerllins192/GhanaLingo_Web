-- Create database
CREATE DATABASE IF NOT EXISTS ghana_lingo;
USE ghana_lingo;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Languages table
CREATE TABLE languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language_id INT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    order_num INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (language_id) REFERENCES languages(id)
);

-- Questions table
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'fill_blank', 'audio_recognition') DEFAULT 'multiple_choice',
    options JSON,
    correct_answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Teacher profiles table
CREATE TABLE teacher_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    bio TEXT,
    languages_spoken JSON,
    hourly_rate DECIMAL(10, 2),
    availability JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    teacher_id INT,
    booking_date DATE,
    start_time TIME,
    end_time TIME,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id)
);

-- Translations table
CREATE TABLE translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_language_id INT,
    target_language_id INT,
    source_text TEXT,
    translated_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_language_id) REFERENCES languages(id),
    FOREIGN KEY (target_language_id) REFERENCES languages(id)
);

-- Cultural articles table
CREATE TABLE cultural_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    category ENUM('tribes', 'values', 'festivals', 'proverbs', 'clothing', 'food', 'history'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service requests table
CREATE TABLE service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    language VARCHAR(50),
    service_type ENUM('voiceover', 'transcription', 'subtitling', 'tribute_writing'),
    file_path VARCHAR(255),
    notes TEXT,
    status ENUM('pending', 'processing', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game scores table
CREATE TABLE game_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    game_type ENUM('flashcards', 'memory_match', 'word_scramble', 'audio_guess'),
    score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User progress table
CREATE TABLE user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    lesson_id INT,
    completed BOOLEAN DEFAULT FALSE,
    xp_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

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