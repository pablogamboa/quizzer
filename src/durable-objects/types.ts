/**
 * Shared type definitions for multiplayer game sessions
 */

// Game status values
export type GameStatus =
    | 'lobby' // Waiting for players
    | 'playing' // Game in progress
    | 'question-active' // Showing a question
    | 'question-results' // Showing question results
    | 'finished' // Game completed

// Quiz configuration
export interface QuizConfig {
    questionCount: number
    difficulty: 'all' | 'easy' | 'medium' | 'hard'
    category: string
    theme: string | null
}

// Player information
export interface PlayerInfo {
    id: string
    name: string
    connected: boolean
    joinedAt: number
}

// Complete game state snapshot
export interface GameStateSnapshot {
    gameId: string
    status: GameStatus
    players: PlayerInfo[]
    currentQuestionIndex: number
    totalQuestions: number
    scores: Record<string, number>
    hostPlayerId: string
    questionStartTime: number | null
}

// Question without the correct answer (safe to send to clients)
export interface QuestionWithoutAnswer {
    id: string
    question: string
    category: string
    difficulty: string
    type: 'trivia' | 'question' | 'picture'
    answers?: string[] // For trivia/picture questions
    imageUrl?: string // For picture questions
    answerType?: 'text' | 'number' // For free text questions
}

// Results for a single question
export interface QuestionResultsSnapshot {
    questionId: string
    question: string
    correctAnswer: string | number
    playerAnswers: Array<{
        playerId: string
        playerName: string
        answer: string | number
        isCorrect: boolean
        timestamp: number
    }>
    firstCorrectPlayer: {
        playerId: string
        playerName: string
    } | null
    newScores: Record<string, number>
}

// Final scoreboard
export interface ScoreBoard {
    scores: Array<{
        playerId: string
        playerName: string
        score: number
    }>
    totalQuestions: number
}
