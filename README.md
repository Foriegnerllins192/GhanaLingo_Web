# Ghana Lingo Learning Platform

A comprehensive platform for learning Ghanaian languages including Twi, Ewe, Ga, Fante, Dagbani, Hausa, Dagaare, Nzema, Gonja, and more.

## Features

1. **Twi Language - Level 1**
   - Complete learning flow with 5 steps
   - Interactive vocabulary lists with audio pronunciation
   - Quizzes and mini-activities
   - Circular and zig-zag layouts for visual engagement

2. **Homepage**
   - Modern Ghana-themed design with national colors (red, gold, green, black)
   - Sections for all major platform features

3. **Language Learning System**
   - Dashboard for language selection
   - Gamification with XP points, levels, and badges
   - Daily streak system

4. **Translation System**
   - Text translation between English and Ghanaian languages
   - Audio input capability
   - Pronunciation guides

5. **Voiceover, Subtitling & Transcription Services**
   - Service request form
   - File upload capability
   - Multiple service types

6. **Culture & History Section**
   - Content on Ghanaian tribes, values, festivals, proverbs, clothing, food, and history

7. **Online Teacher System**
   - Teacher profiles
   - Booking system
   - Video call integration

8. **Fun Learning Games**
   - Flashcards
   - Memory match
   - Word scramble
   - Audio guessing game

9. **User System**
   - Login/registration
   - Progress tracking
   - Saved lessons
   - Bookings management

## Folder Structure

```
/public
  /css
  /js
  /images
/routes
/controllers
/models
/views
/config
```

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MySQL (XAMPP)

## Database Schema

The platform uses the following tables:
- users
- languages
- lessons
- questions
- teacher_profiles
- bookings
- translations
- cultural_articles
- service_requests
- game_scores
- user_progress

## Installation

1. Clone the repository
2. Install Node.js dependencies:
   ```
   npm install
   ```
3. Set up MySQL database using the provided schema
4. Configure database connection in `config/db.js`
5. Start the server:
   ```
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register for an account or log in
3. Select a language to begin learning
4. Complete lessons and earn XP points
5. Use translation services or book online teachers as needed

## Deliverables

- Full website code (frontend + backend)
- SQL database schema
- Working Twi Level 1 learning flow
- All frontend pages with audio placeholders

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests.

## License

This project is licensed under the MIT License.