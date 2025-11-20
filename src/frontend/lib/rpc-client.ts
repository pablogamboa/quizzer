/**
 * Cap'n Web RPC Client for Quiz Game
 * Replaces the old WebSocket implementation with typed RPC calls
 */

import { newWebSocketRpcSession, RpcTarget, type RpcStub } from 'capnweb'
import type {
    GameSessionApi,
    PlayerSessionApi,
    GameClientApi,
} from '../../lib/rpc-api'
import type {
    GameStateSnapshot,
    PlayerInfo,
    QuestionWithoutAnswer,
    QuestionResultsSnapshot,
    ScoreBoard,
} from '../../durable-objects/types'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * Client implementation for receiving server callbacks
 */
class GameClient extends RpcTarget implements GameClientApi {
    // Store handlers as instance properties instead of WeakMap
    // Cap'n Web won't serialize these since they're Functions
    private handlers: Record<string, Function[]> = {}

    async onGameStateUpdated(state: GameStateSnapshot): Promise<void> {
        console.log('[GameClient] onGameStateUpdated called:', state)
        this.emit('gameState', state)
    }

    async onPlayerJoined(player: PlayerInfo): Promise<void> {
        console.log('[GameClient] onPlayerJoined called:', player)
        this.emit('playerJoined', player)
    }

    async onPlayerLeft(playerId: string, playerName: string): Promise<void> {
        console.log('[GameClient] onPlayerLeft called:', playerId, playerName)
        this.emit('playerLeft', { playerId, playerName })
    }

    async onGameStarted(): Promise<void> {
        console.log('[GameClient] onGameStarted called')
        this.emit('gameStarted')
    }

    async onQuestionStarted(
        question: QuestionWithoutAnswer,
        questionNumber: number,
        totalQuestions: number
    ): Promise<void> {
        console.log('[GameClient] onQuestionStarted called')
        this.emit('questionStarted', {
            question,
            questionNumber,
            totalQuestions,
        })
    }

    async onAnswerSubmitted(
        playerId: string,
        playerName: string
    ): Promise<void> {
        console.log(
            '[GameClient] onAnswerSubmitted called:',
            playerId,
            playerName
        )
        this.emit('answerSubmitted', { playerId, playerName })
    }

    async onQuestionEnded(results: QuestionResultsSnapshot): Promise<void> {
        console.log('[GameClient] onQuestionEnded called')
        this.emit('questionEnded', results)
    }

    async onGameFinished(finalScores: ScoreBoard): Promise<void> {
        console.log('[GameClient] onGameFinished called')
        this.emit('gameFinished', finalScores)
    }

    async onError(message: string): Promise<void> {
        console.log('[GameClient] onError called:', message)
        this.emit('error', { message })
    }

    // Event emitter helpers
    on(event: string, handler: Function): () => void {
        if (!this.handlers[event]) {
            this.handlers[event] = []
        }
        this.handlers[event].push(handler)
        console.log(
            `[GameClient] Registered handler for '${event}', total:`,
            this.handlers[event].length
        )

        // Return unsubscribe function
        return () => {
            if (this.handlers[event]) {
                const index = this.handlers[event].indexOf(handler)
                if (index > -1) {
                    this.handlers[event].splice(index, 1)
                }
            }
        }
    }

    private emit(event: string, data?: any): void {
        const eventHandlers = this.handlers[event]
        console.log(
            `[GameClient] Emitting '${event}', handlers:`,
            eventHandlers?.length || 0,
            'data:',
            data
        )
        if (eventHandlers) {
            for (const handler of eventHandlers) {
                try {
                    handler(data)
                } catch (error) {
                    console.error(`Error in ${event} handler:`, error)
                }
            }
        }
    }
}

/**
 * Game RPC Client - manages connection and player session
 */
export class GameRpcClient {
    private gameSession: RpcStub<GameSessionApi> | null = null
    private playerSession: RpcStub<PlayerSessionApi> | null = null
    private client: GameClient
    private connectionStatus: ConnectionStatus = 'disconnected'
    private statusHandlers: Set<(status: ConnectionStatus) => void> = new Set()
    private playerId: string | null = null

    constructor() {
        this.client = new GameClient()
    }

    /**
     * Connect to a game session
     */
    async connect(gameCode: string, playerName: string): Promise<void> {
        try {
            this.setStatus('connecting')

            // Construct WebSocket URL
            const protocol =
                window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const host = window.location.host
            const url = `${protocol}//${host}/api/multiplayer/ws/${gameCode}`

            console.log('[RPC Client] Connecting to:', url)

            // Create RPC session over WebSocket with bidirectional RPC
            // Pass the client as localMain to enable server-to-client callbacks
            this.gameSession = newWebSocketRpcSession(url, this.client)
            console.log(
                '[RPC Client] WebSocket session created with client callbacks, calling joinGame...'
            )

            // Join the game and get player session capability
            // We still pass the client here for the server to store it
            this.playerSession = await this.gameSession.joinGame(
                playerName,
                this.client
            )
            console.log('[RPC Client] joinGame returned, getting player ID...')

            // Get player ID
            this.playerId = await this.playerSession.getPlayerId()

            console.log('[RPC Client] Connected as player:', this.playerId)

            this.setStatus('connected')
        } catch (error) {
            console.error('[RPC Client] Connection error:', error)
            this.setStatus('error')
            throw error
        }
    }

    /**
     * Start the game (host only)
     */
    async startGame(): Promise<void> {
        if (!this.playerSession) {
            throw new Error('Not connected')
        }
        await this.playerSession.startGame()
    }

    /**
     * Submit an answer
     */
    async submitAnswer(answer: string | number): Promise<boolean> {
        if (!this.playerSession) {
            throw new Error('Not connected')
        }
        const result = await this.playerSession.submitAnswer(answer)
        return result.accepted
    }

    /**
     * Leave the game
     */
    async leaveGame(): Promise<void> {
        if (!this.playerSession) {
            return
        }
        await this.playerSession.leaveGame()
        this.disconnect()
    }

    /**
     * Disconnect from the game
     */
    disconnect(): void {
        this.gameSession = null
        this.playerSession = null
        this.playerId = null
        this.setStatus('disconnected')
    }

    /**
     * Get current connection status
     */
    getStatus(): ConnectionStatus {
        return this.connectionStatus
    }

    /**
     * Get player ID
     */
    getPlayerId(): string | null {
        return this.playerId
    }

    /**
     * Register event handler
     */
    on(event: string, handler: Function): () => void {
        return this.client.on(event, handler)
    }

    /**
     * Register connection status change handler
     */
    onConnectionChange(
        handler: (status: ConnectionStatus) => void
    ): () => void {
        this.statusHandlers.add(handler)
        return () => {
            this.statusHandlers.delete(handler)
        }
    }

    private setStatus(status: ConnectionStatus): void {
        this.connectionStatus = status
        for (const handler of this.statusHandlers) {
            try {
                handler(status)
            } catch (error) {
                console.error('Error in status handler:', error)
            }
        }
    }
}

// Singleton instance
let currentClient: GameRpcClient | null = null

/**
 * Create a new game RPC client (closes existing one)
 */
export function createGameRpcClient(): GameRpcClient {
    if (currentClient) {
        currentClient.disconnect()
    }
    currentClient = new GameRpcClient()
    return currentClient
}

/**
 * Get current RPC client
 */
export function getGameRpcClient(): GameRpcClient | null {
    return currentClient
}

/**
 * Close current RPC client
 */
export function closeGameRpcClient(): void {
    if (currentClient) {
        currentClient.disconnect()
        currentClient = null
    }
}
