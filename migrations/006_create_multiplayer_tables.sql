-- Migration 006: Create multiplayer game tables
-- This migration adds tables for tracking networked multiplayer games

-- Store multiplayer game sessions
CREATE TABLE IF NOT EXISTS multiplayer_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_code TEXT NOT NULL UNIQUE,
    host_player_name TEXT NOT NULL,
    player_count INTEGER NOT NULL DEFAULT 0,
    question_count INTEGER NOT NULL,
    category TEXT,
    difficulty TEXT,
    theme TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    duration_seconds INTEGER
);

-- Store individual player results from multiplayer games
CREATE TABLE IF NOT EXISTS multiplayer_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    average_answer_time_ms INTEGER,
    first_correct_answers INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES multiplayer_games(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_code ON multiplayer_games(game_code);
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_created ON multiplayer_games(created_at);
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_finished ON multiplayer_games(finished_at);
CREATE INDEX IF NOT EXISTS idx_multiplayer_results_game ON multiplayer_results(game_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_results_player ON multiplayer_results(player_name);
