import { DurableObject } from 'cloudflare:workers'
import { RpcTarget, newWorkersRpcResponse, type RpcStub } from 'capnweb'
import {
    Question,
    TriviaQuestion,
    FreeTextQuestion,
    PictureQuestion,
} from '../data/questions'
import type {
    GameSessionApi,
    PlayerSessionApi,
    GameClientApi,
} from '../lib/rpc-api'
import type {
    GameStatus,
    QuizConfig,
    PlayerInfo,
    GameStateSnapshot,
    QuestionWithoutAnswer,
    QuestionResultsSnapshot,
    ScoreBoard,
} from './types'

interface Answer {
    answer: string | number
    timestamp: number
    isCorrect: boolean
}

interface QuestionResult {
    questionId: string
    question: string
    correctAnswer: string | number
    playerAnswers: Map<string, Answer>
    firstCorrectPlayerId: string | null
}

interface GameState {
    gameId: string
    hostPlayerId: string
    config: QuizConfig
    status: GameStatus
    players: Map<string, PlayerInfo>
    questions: Question[]
    currentQuestionIndex: number
    questionStartTime: number | null
    scores: Map<string, number>
    currentQuestionAnswers: Map<string, Answer>
    questionResults: QuestionResult[]
    createdAt: number
    startedAt: number | null
    finishedAt: number | null
}

/**
 * PlayerSession - Capability object for a specific player
 * Having a reference to this object proves you are that player
 *
 * IMPORTANT: This class must have NO instance properties to be serializable by Cap'n Web!
 * All state is accessed through closures.
 */
function createPlayerSession(
    playerId: string,
    gameSession: GameSessionRpc,
    client: GameClientApi
): PlayerSessionApi {
    class PlayerSession extends RpcTarget implements PlayerSessionApi {
        async getPlayerId(): Promise<string> {
            return playerId
        }

        async getGameState(): Promise<GameStateSnapshot> {
            return gameSession.getGameStateSnapshot()
        }

        async startGame(): Promise<void> {
            await gameSession.startGameByPlayer(playerId)
        }

        async submitAnswer(
            answer: string | number
        ): Promise<{ accepted: boolean }> {
            return await gameSession.submitAnswerByPlayer(playerId, answer)
        }

        async leaveGame(): Promise<void> {
            await gameSession.leaveGameByPlayer(playerId)
            gameSession.removeClient(playerId)
        }

        async ping(): Promise<number> {
            return Date.now()
        }

        // Internal method for the session to call client callbacks
        getClient(): GameClientApi {
            return client
        }
    }

    return new PlayerSession()
}

/**
 * GameSessionApiImpl - RpcTarget wrapper around GameSessionRpc
 * This is the RPC API surface that clients interact with
 */
class GameSessionApiImpl extends RpcTarget implements GameSessionApi {
    constructor(private durableObject: GameSessionRpc) {
        super()
    }

    async joinGame(
        playerName: string,
        client: GameClientApi
    ): Promise<PlayerSessionApi> {
        return this.durableObject.joinGame(playerName, client)
    }
}

/**
 * GameSessionRpc Durable Object with Cap'n Web RPC
 */
export class GameSessionRpc extends DurableObject {
    private state: GameState
    private sessions: Map<string, PlayerSessionApi> = new Map() // Player ID -> PlayerSession
    private clients: Map<string, GameClientApi> = new Map() // Player ID -> Client callbacks
    private questionTimer: number | null = null
    private readonly QUESTION_TIME_LIMIT = 20000 // 20 seconds
    private readonly RESULTS_DISPLAY_TIME = 5000 // 5 seconds

    constructor(ctx: DurableObjectState, env: any) {
        super(ctx, env)

        // Initialize default state
        this.state = {
            gameId: ctx.id.toString(),
            hostPlayerId: '',
            config: {
                questionCount: 10,
                difficulty: 'all',
                category: 'all',
                theme: null,
            },
            status: 'lobby',
            players: new Map(),
            questions: [],
            currentQuestionIndex: 0,
            questionStartTime: null,
            scores: new Map(),
            currentQuestionAnswers: new Map(),
            questionResults: [],
            createdAt: Date.now(),
            startedAt: null,
            finishedAt: null,
        }

        // Load persisted state
        this.ctx.blockConcurrencyWhile(async () => {
            const stored = await this.ctx.storage.get<any>('gameState')

            if (stored) {
                console.log('[GameSessionRpc] Loading persisted state')
                console.log(
                    '[GameSessionRpc] Stored questions count:',
                    stored.questions?.length || 0
                )
                this.state = {
                    ...stored,
                    players: new Map(Object.entries(stored.players || {})),
                    scores: new Map(Object.entries(stored.scores || {})),
                    currentQuestionAnswers: new Map(),
                    questionResults: stored.questionResults || [],
                    questions: stored.questions || [],
                }
            }
        })
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url)

        // Handle RPC over WebSocket
        if (request.headers.get('Upgrade') === 'websocket') {
            const apiImpl = new GameSessionApiImpl(this)
            return newWorkersRpcResponse(request, apiImpl)
        }

        // Handle HTTP initialization
        if (url.pathname.endsWith('/initialize')) {
            return this.handleInitialize(request)
        }

        if (url.pathname.endsWith('/state')) {
            return this.handleGetState()
        }

        return new Response('Not found', { status: 404 })
    }

    // ========================
    // RPC API Implementation
    // ========================

    /**
     * Join the game - returns a PlayerSession capability
     */
    async joinGame(
        playerName: string,
        client: GameClientApi
    ): Promise<PlayerSessionApi> {
        console.log('[GameSessionRpc] Player joining:', playerName)

        if (this.state.status !== 'lobby') {
            throw new Error('Game has already started')
        }

        // IMPORTANT: Duplicate the client stub FIRST, before any other use!
        // Cap'n Web auto-disposes parameter stubs when the call completes,
        // but we need to keep this stub alive for broadcasting.
        // The dup() must happen before the client is captured in any closures.
        const dupedClient = (client as any).dup() as GameClientApi

        console.log(
            '[GameSessionRpc] Duplicated client stub, type:',
            typeof dupedClient,
            'has onGameStateUpdated:',
            typeof dupedClient?.onGameStateUpdated
        )

        // Check for reconnecting player (e.g., host connecting after game creation)
        let playerId: string | null = null
        let isReconnecting = false
        for (const [pid, player] of this.state.players.entries()) {
            if (player.name === playerName && !player.connected) {
                playerId = pid
                isReconnecting = true
                break
            }
        }

        // Create new player
        if (!playerId) {
            playerId = crypto.randomUUID()
            console.log('[GameSessionRpc] New player:', playerId, playerName)
            this.state.players.set(playerId, {
                id: playerId,
                name: playerName,
                connected: true,
                joinedAt: Date.now(),
            })
            this.state.scores.set(playerId, 0)
        } else {
            console.log('[GameSessionRpc] Reconnecting:', playerId, playerName)
            const player = this.state.players.get(playerId)!
            player.connected = true
        }

        // Create PlayerSession capability using the DUPED client
        // This ensures the closure captures a reference that won't be auto-disposed
        const session = createPlayerSession(playerId, this, dupedClient)
        this.sessions.set(playerId, session as any)

        // Store the duped client for broadcasting
        this.clients.set(playerId, dupedClient)

        console.log(
            '[GameSessionRpc] Stored duplicated client for player:',
            playerId
        )

        console.log(
            '[GameSessionRpc] Players:',
            this.state.players.size,
            'Clients:',
            this.clients.size
        )
        console.log(
            '[GameSessionRpc] All client IDs in map:',
            Array.from(this.clients.keys())
        )

        await this.persistState()

        const gameState = this.getGameStateSnapshot()

        // Send initial game state to the joining player using the DUPED client
        // This ensures we're using the same preserved reference everywhere
        console.log(
            '[GameSessionRpc] Sending initial state to joining player:',
            playerId
        )
        try {
            await dupedClient.onGameStateUpdated(gameState)
            console.log('[GameSessionRpc] Successfully sent initial state')
        } catch (error) {
            console.error(
                '[GameSessionRpc] Error sending initial state:',
                error
            )
        }

        // Broadcast to ALL players (including the one who just joined)
        // This ensures everyone has a consistent view, especially important when:
        // - The host reconnects after other players have joined
        // - A player's connection status changes
        // We broadcast to everyone because other players may have joined while
        // this player was connecting, and those players need to know about this player
        console.log(
            '[GameSessionRpc] Broadcasting game state update to all players'
        )
        await this.broadcast(async (c) => {
            console.log('[GameSessionRpc] Calling onGameStateUpdated on client')
            await c.onGameStateUpdated(gameState)
        })

        return session
    }

    // ========================
    // Internal Player Methods (called by PlayerSession)
    // ========================

    async startGameByPlayer(playerId: string): Promise<void> {
        if (playerId !== this.state.hostPlayerId) {
            throw new Error('Only the host can start the game')
        }

        if (this.state.players.size < 2) {
            throw new Error('Need at least 2 players to start')
        }

        if (this.state.status !== 'lobby') {
            throw new Error('Game already started')
        }

        this.state.status = 'playing'
        this.state.startedAt = Date.now()
        this.state.currentQuestionIndex = 0

        await this.persistState()

        console.log(
            '[GameSessionRpc] Broadcasting onGameStarted to all clients'
        )
        await this.broadcast(async (c) => {
            console.log('[GameSessionRpc] Calling onGameStarted on client')
            await c.onGameStarted()
        })
        console.log(
            '[GameSessionRpc] onGameStarted broadcast complete, starting first question'
        )
        await this.startQuestion()
    }

    async submitAnswerByPlayer(
        playerId: string,
        answer: string | number
    ): Promise<{ accepted: boolean }> {
        if (this.state.status !== 'question-active') {
            throw new Error('No active question')
        }

        if (this.state.currentQuestionAnswers.has(playerId)) {
            return { accepted: false } // Already answered
        }

        const currentQuestion =
            this.state.questions[this.state.currentQuestionIndex]
        const isCorrect = this.checkAnswer(currentQuestion, answer)

        const answerData: Answer = {
            answer,
            timestamp: Date.now(),
            isCorrect,
        }

        this.state.currentQuestionAnswers.set(playerId, answerData)

        const player = this.state.players.get(playerId)!
        await this.broadcast(
            async (c) => await c.onAnswerSubmitted(playerId, player.name)
        )

        // Check if all players answered
        const connectedPlayers = Array.from(this.state.players.values()).filter(
            (p) => p.connected
        )
        if (
            this.state.currentQuestionAnswers.size === connectedPlayers.length
        ) {
            if (this.questionTimer) {
                clearTimeout(this.questionTimer)
            }
            await this.endQuestion()
        }

        return { accepted: true }
    }

    async leaveGameByPlayer(playerId: string): Promise<void> {
        const player = this.state.players.get(playerId)
        if (player) {
            player.connected = false
            await this.persistState()
            const gameState = this.getGameStateSnapshot()

            await this.broadcast(
                async (c) => await c.onGameStateUpdated(gameState)
            )
        }
    }

    removeClient(playerId: string): void {
        this.sessions.delete(playerId)

        // Dispose the duplicated client stub
        const client = this.clients.get(playerId)
        if (client) {
            ;(client as any)[Symbol.dispose]?.()
            this.clients.delete(playerId)
        }
    }

    getGameStateSnapshot(): GameStateSnapshot {
        return {
            gameId: this.state.gameId,
            status: this.state.status,
            players: Array.from(this.state.players.values()),
            currentQuestionIndex: this.state.currentQuestionIndex,
            totalQuestions: this.state.questions.length,
            scores: Object.fromEntries(this.state.scores),
            hostPlayerId: this.state.hostPlayerId,
            questionStartTime: this.state.questionStartTime,
        }
    }

    // ========================
    // Game Logic
    // ========================

    private async persistState(): Promise<void> {
        const stateToPersist = {
            ...this.state,
            players: Object.fromEntries(this.state.players),
            scores: Object.fromEntries(this.state.scores),
        }
        await this.ctx.storage.put('gameState', stateToPersist)
    }

    private async handleInitialize(request: Request): Promise<Response> {
        try {
            const body = (await request.json()) as {
                config: QuizConfig
                hostName: string
                questions: Question[]
            }

            this.state.config = body.config
            this.state.questions = body.questions

            const hostId = crypto.randomUUID()
            this.state.hostPlayerId = hostId
            this.state.players.set(hostId, {
                id: hostId,
                name: body.hostName,
                connected: false,
                joinedAt: Date.now(),
            })
            this.state.scores.set(hostId, 0)

            await this.persistState()

            return Response.json({
                success: true,
                gameId: this.state.gameId,
                hostPlayerId: hostId,
            })
        } catch (error) {
            console.error('[GameSessionRpc] Initialize error:', error)
            return Response.json(
                { success: false, error: 'Failed to initialize game' },
                { status: 400 }
            )
        }
    }

    private async handleGetState(): Promise<Response> {
        return Response.json({
            success: true,
            state: this.getGameStateSnapshot(),
        })
    }

    private async startQuestion(): Promise<void> {
        if (this.state.currentQuestionIndex >= this.state.questions.length) {
            await this.finishGame()
            return
        }

        this.state.status = 'question-active'
        this.state.questionStartTime = Date.now()
        this.state.currentQuestionAnswers.clear()

        const currentQuestion =
            this.state.questions[this.state.currentQuestionIndex]
        const questionWithoutAnswer = this.stripAnswer(currentQuestion)

        await this.broadcast(
            async (c) =>
                await c.onQuestionStarted(
                    questionWithoutAnswer,
                    this.state.currentQuestionIndex + 1,
                    this.state.questions.length
                )
        )

        this.questionTimer = setTimeout(() => {
            this.endQuestion()
        }, this.QUESTION_TIME_LIMIT) as any
    }

    private checkAnswer(question: Question, answer: string | number): boolean {
        if (question.type === 'trivia' || question.type === 'picture') {
            const triviaQ = question as TriviaQuestion | PictureQuestion
            return triviaQ.correct === answer
        } else if (question.type === 'question') {
            const textQ = question as FreeTextQuestion
            const userAnswer = String(answer).trim().toLowerCase()
            const correctAnswer = textQ.correctAnswer.toLowerCase()
            const acceptableAnswers =
                textQ.acceptableAnswers?.map((a) => a.toLowerCase()) || []
            return (
                userAnswer === correctAnswer ||
                acceptableAnswers.includes(userAnswer)
            )
        }
        return false
    }

    private async endQuestion(): Promise<void> {
        this.state.status = 'question-results'

        const currentQuestion =
            this.state.questions[this.state.currentQuestionIndex]
        let firstCorrectPlayerId: string | null = null
        let earliestCorrectTime = Infinity

        for (const [
            playerId,
            answerData,
        ] of this.state.currentQuestionAnswers.entries()) {
            if (
                answerData.isCorrect &&
                answerData.timestamp < earliestCorrectTime
            ) {
                earliestCorrectTime = answerData.timestamp
                firstCorrectPlayerId = playerId
            }
        }

        if (firstCorrectPlayerId) {
            const currentScore =
                this.state.scores.get(firstCorrectPlayerId) || 0
            this.state.scores.set(firstCorrectPlayerId, currentScore + 1)
        }

        const playerAnswers: Array<{
            playerId: string
            playerName: string
            answer: string | number
            isCorrect: boolean
            timestamp: number
        }> = []
        for (const [
            playerId,
            answerData,
        ] of this.state.currentQuestionAnswers.entries()) {
            const player = this.state.players.get(playerId)!
            playerAnswers.push({
                playerId,
                playerName: player.name,
                answer: answerData.answer,
                isCorrect: answerData.isCorrect,
                timestamp: answerData.timestamp,
            })
        }

        const correctAnswer = this.getCorrectAnswer(currentQuestion)
        const firstCorrectPlayer = firstCorrectPlayerId
            ? {
                  playerId: firstCorrectPlayerId,
                  playerName:
                      this.state.players.get(firstCorrectPlayerId)!.name,
              }
            : null

        const results: QuestionResultsSnapshot = {
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            correctAnswer,
            playerAnswers,
            firstCorrectPlayer,
            newScores: Object.fromEntries(this.state.scores),
        }

        this.state.questionResults.push({
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            correctAnswer,
            playerAnswers: this.state.currentQuestionAnswers,
            firstCorrectPlayerId,
        })

        await this.broadcast(async (c) => await c.onQuestionEnded(results))

        setTimeout(() => {
            this.state.currentQuestionIndex++
            this.startQuestion()
        }, this.RESULTS_DISPLAY_TIME)
    }

    private getCorrectAnswer(question: Question): string | number {
        if (question.type === 'trivia' || question.type === 'picture') {
            const triviaQ = question as TriviaQuestion | PictureQuestion
            return triviaQ.correct
        } else if (question.type === 'question') {
            const textQ = question as FreeTextQuestion
            return textQ.correctAnswer
        }
        return ''
    }

    private async finishGame(): Promise<void> {
        this.state.status = 'finished'
        this.state.finishedAt = Date.now()

        const scores: Array<{
            playerId: string
            playerName: string
            score: number
        }> = []
        for (const [playerId, score] of this.state.scores.entries()) {
            const player = this.state.players.get(playerId)!
            scores.push({
                playerId,
                playerName: player.name,
                score,
            })
        }

        scores.sort((a, b) => b.score - a.score)

        await this.broadcast(
            async (c) =>
                await c.onGameFinished({
                    scores,
                    totalQuestions: this.state.questions.length,
                })
        )
    }

    private stripAnswer(question: Question): QuestionWithoutAnswer {
        const base = {
            id: question.id,
            question: question.question,
            category: question.category,
            difficulty: question.difficulty,
            type: question.type,
        }

        if (question.type === 'trivia') {
            return {
                ...base,
                answers: (question as TriviaQuestion).answers,
            }
        } else if (question.type === 'picture') {
            return {
                ...base,
                imageUrl: (question as PictureQuestion).imageUrl,
                answers: (question as PictureQuestion).answers,
            }
        } else if (question.type === 'question') {
            const textQ = question as FreeTextQuestion
            const answerType =
                !isNaN(Number(textQ.correctAnswer)) &&
                textQ.correctAnswer.trim() !== ''
                    ? 'number'
                    : 'text'
            return {
                ...base,
                answerType,
            }
        }

        return base
    }

    private async broadcast(
        fn: (client: GameClientApi) => Promise<void>,
        excludePlayerId?: string
    ): Promise<void> {
        console.log(
            '[GameSessionRpc] broadcast() called. Total clients:',
            this.clients.size,
            'Excluding:',
            excludePlayerId
        )
        console.log(
            '[GameSessionRpc] All client IDs:',
            Array.from(this.clients.keys())
        )

        const promises: Promise<void>[] = []
        let broadcastCount = 0

        for (const [playerId, client] of this.clients.entries()) {
            console.log(
                '[GameSessionRpc] Checking player:',
                playerId,
                'exclude?',
                playerId === excludePlayerId
            )
            if (playerId !== excludePlayerId) {
                console.log(
                    '[GameSessionRpc] Broadcasting to player:',
                    playerId,
                    'client type:',
                    typeof client
                )
                broadcastCount++

                // Call the function and collect the promise
                const promise = fn(client).catch((error) => {
                    console.error(
                        `[GameSessionRpc] Error calling client ${playerId}:`,
                        error
                    )
                })
                promises.push(promise)
            } else {
                console.log(
                    '[GameSessionRpc] Skipping excluded player:',
                    playerId
                )
            }
        }

        console.log(
            '[GameSessionRpc] Waiting for',
            promises.length,
            'broadcast calls to complete'
        )
        await Promise.all(promises)
        console.log(
            '[GameSessionRpc] Broadcast completed. Called',
            broadcastCount,
            'clients'
        )
    }
}
