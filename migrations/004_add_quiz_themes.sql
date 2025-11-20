-- Create quiz_themes table for specialized themed quizzes
CREATE TABLE IF NOT EXISTS quiz_themes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_key TEXT NOT NULL UNIQUE,        -- e.g., 'country-shapes', 'city-skylines'
  theme_name TEXT NOT NULL,               -- e.g., 'Country Shapes', 'City Skylines'
  category TEXT NOT NULL,                 -- e.g., 'Geography'
  description TEXT,                       -- Short description of the theme
  icon TEXT,                              -- Optional icon/emoji for the theme
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add theme field to questions table
ALTER TABLE questions ADD COLUMN theme TEXT;

-- Create indexes for better performance
CREATE INDEX idx_quiz_themes_category ON quiz_themes(category);
CREATE INDEX idx_quiz_themes_active ON quiz_themes(is_active);
CREATE INDEX idx_questions_theme ON questions(theme);
