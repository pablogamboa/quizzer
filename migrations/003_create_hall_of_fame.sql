-- Create hall of fame table to track quiz attempts
CREATE TABLE IF NOT EXISTS hall_of_fame (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    category TEXT,
    difficulty TEXT,
    date_played DATETIME DEFAULT CURRENT_TIMESTAMP,
    time_taken_seconds INTEGER,
    percentage_correct REAL GENERATED ALWAYS AS (CAST(score AS REAL) / CAST(total_questions AS REAL) * 100) STORED
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hall_of_fame_category ON hall_of_fame(category);
CREATE INDEX IF NOT EXISTS idx_hall_of_fame_difficulty ON hall_of_fame(difficulty);
CREATE INDEX IF NOT EXISTS idx_hall_of_fame_date ON hall_of_fame(date_played DESC);
CREATE INDEX IF NOT EXISTS idx_hall_of_fame_score ON hall_of_fame(percentage_correct DESC);