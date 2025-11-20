/**
 * Cap'n Web RPC API Definitions
 *
 * This file defines the RPC interfaces for the multiplayer quiz game.
 * These interfaces replace the WebSocket message-based communication.
 */

import type { RpcStub } from 'capnweb'
import type {
    GameStateSnapshot,
    PlayerInfo,
    QuestionWithoutAnswer,
    QuestionResultsSnapshot,
    ScoreBoard,
} from '../durable-objects/types'

/**
 * Server-side RPC API - Main game session
 * Methods that clients can call to join the game
 */
export interface GameSessionApi {
    /**
     * Join the game as a player
     * @param playerName - Name of the player joining
     * @param client - Client callback interface for server-to-client calls
     * @returns PlayerSession capability for this specific player
     */
    joinGame(
        playerName: string,
        client: GameClientApi
    ): Promise<PlayerSessionApi>
}

/**
 * Per-player session API
 * Each player gets their own session object with their identity baked in
 * This is a capability - having a reference to this object means you're authorized as that player
 */
export interface PlayerSessionApi {
    /**
     * Get player's ID
     */
    getPlayerId(): Promise<string>

    /**
     * Get current game state
     */
    getGameState(): Promise<GameStateSnapshot>

    /**
     * Start the game (host only)
     * @throws Error if not host or insufficient players
     */
    startGame(): Promise<void>

    /**
     * Submit an answer to the current question
     * @param answer - The answer (string for text, number for multiple choice)
     * @returns Whether the answer was accepted
     */
    submitAnswer(answer: string | number): Promise<{ accepted: boolean }>

    /**
     * Leave the game
     * Marks player as disconnected and notifies others
     */
    leaveGame(): Promise<void>

    /**
     * Ping to keep connection alive
     * @returns Current server timestamp
     */
    ping(): Promise<number>
}

/**
 * Client-side RPC API
 * Methods that the server can call on connected clients
 * Clients implement this interface to receive push notifications
 *
 * IMPORTANT: All methods return Promise<void> because they are RPC calls
 * that execute asynchronously across the network
 */
export interface GameClientApi {
    /**
     * Called when the full game state changes
     * @param state - Complete game state snapshot
     */
    onGameStateUpdated(state: GameStateSnapshot): Promise<void>

    /**
     * Called when a new player joins
     * @param player - Information about the player who joined
     */
    onPlayerJoined(player: PlayerInfo): Promise<void>

    /**
     * Called when a player leaves
     * @param playerId - ID of the player who left
     * @param playerName - Name of the player who left
     */
    onPlayerLeft(playerId: string, playerName: string): Promise<void>

    /**
     * Called when the host starts the game
     */
    onGameStarted(): Promise<void>

    /**
     * Called when a new question starts
     * @param question - Question data (without correct answer)
     * @param questionNumber - Current question number (1-indexed)
     * @param totalQuestions - Total number of questions in quiz
     */
    onQuestionStarted(
        question: QuestionWithoutAnswer,
        questionNumber: number,
        totalQuestions: number
    ): Promise<void>

    /**
     * Called when a player submits an answer
     * @param playerId - ID of player who answered
     * @param playerName - Name of player who answered
     */
    onAnswerSubmitted(playerId: string, playerName: string): Promise<void>

    /**
     * Called when a question ends with results
     * @param results - Question results including correct answer and scores
     */
    onQuestionEnded(results: QuestionResultsSnapshot): Promise<void>

    /**
     * Called when the game finishes
     * @param finalScores - Final scoreboard with all player scores
     */
    onGameFinished(finalScores: ScoreBoard): Promise<void>

    /**
     * Called when an error occurs
     * @param message - Error message
     */
    onError(message: string): Promise<void>
}
