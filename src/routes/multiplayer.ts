import { Hono } from 'hono'
import { Env } from '../index'
import { GameCodeService } from '../services/game-codes'
import { QuestionService } from '../services/database'
import { QuizConfig } from '../durable-objects/types'

export const multiplayerRoutes = new Hono<{ Bindings: Env }>()

// POST /api/multiplayer/create
// Create a new multiplayer game
multiplayerRoutes.post('/create', async (c) => {
    try {
        const body = await c.req.json()
        const { config, hostName } = body as {
            config: QuizConfig
            hostName: string
        }

        if (!hostName || !config) {
            return c.json(
                {
                    success: false,
                    error: 'Missing required fields',
                },
                400
            )
        }

        // Validate config
        if (
            !config.questionCount ||
            config.questionCount < 1 ||
            config.questionCount > 50
        ) {
            return c.json(
                {
                    success: false,
                    error: 'Invalid question count (1-50)',
                },
                400
            )
        }

        // Load questions from database
        const questionService = new QuestionService(c.env.DB)
        let questions

        if (config.theme) {
            // Load questions for specific theme
            questions = await questionService.getRandomQuestionsByTheme(
                config.theme,
                config.questionCount
            )
        } else if (
            config.category &&
            config.category !== 'all' &&
            config.difficulty &&
            config.difficulty !== 'all'
        ) {
            // Load by category and difficulty
            const allQuestions = await questionService.getAllQuestions()
            const filtered = allQuestions.filter(
                (q) =>
                    q.category === config.category &&
                    q.difficulty === config.difficulty
            )
            const shuffled = [...filtered]
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
            }
            questions = shuffled.slice(0, config.questionCount)
        } else if (config.category && config.category !== 'all') {
            // Load by category only
            const allQuestions = await questionService.getQuestionsByCategory(
                config.category
            )
            const shuffled = [...allQuestions]
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
            }
            questions = shuffled.slice(0, config.questionCount)
        } else if (config.difficulty && config.difficulty !== 'all') {
            // Load by difficulty only
            const allQuestions = await questionService.getQuestionsByDifficulty(
                config.difficulty
            )
            const shuffled = [...allQuestions]
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
            }
            questions = shuffled.slice(0, config.questionCount)
        } else {
            // Random questions
            questions = await questionService.getRandomQuestions(
                config.questionCount
            )
        }

        if (questions.length === 0) {
            return c.json(
                {
                    success: false,
                    error: 'No questions available for the selected criteria',
                },
                404
            )
        }

        // Generate unique game code
        const codeService = new GameCodeService(c.env.GAME_CODES)
        const gameCode = await codeService.generateUniqueCode()

        // Create Durable Object instance (using RPC version)
        const doId = c.env.GAME_SESSIONS_RPC.idFromName(gameCode)
        const stub = c.env.GAME_SESSIONS_RPC.get(doId)

        // Initialize game session
        const initResponse = await stub.fetch(
            new Request('http://fake-host/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config,
                    hostName,
                    questions,
                }),
            })
        )

        const initResult = await initResponse.json()
        if (!initResult.success) {
            return c.json(
                {
                    success: false,
                    error: 'Failed to initialize game session',
                },
                500
            )
        }

        const gameId = initResult.gameId

        // Store game code in KV
        await codeService.storeGameCode(gameCode, gameId)

        // Build join URL
        const url = new URL(c.req.url)
        const baseUrl = `${url.protocol}//${url.host}`
        const joinUrl = `${baseUrl}/game/${gameCode}`

        return c.json({
            success: true,
            data: {
                gameId,
                gameCode,
                joinUrl,
                hostPlayerId: initResult.hostPlayerId,
            },
        })
    } catch (error) {
        console.error('Error creating multiplayer game:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to create game',
            },
            500
        )
    }
})

// GET /api/multiplayer/game/:code
// Get game information by code
multiplayerRoutes.get('/game/:code', async (c) => {
    try {
        const code = c.req.param('code').toUpperCase()

        // Validate code format
        const codeService = new GameCodeService(c.env.GAME_CODES)
        if (!codeService.validateCode(code)) {
            return c.json(
                {
                    success: false,
                    error: 'Invalid game code format',
                },
                400
            )
        }

        // Get game ID from KV
        const gameId = await codeService.getGameIdFromCode(code)
        if (!gameId) {
            return c.json(
                {
                    success: false,
                    error: 'Game not found',
                },
                404
            )
        }

        // Get Durable Object instance (using RPC version)
        const doId = c.env.GAME_SESSIONS_RPC.idFromName(code)
        const stub = c.env.GAME_SESSIONS_RPC.get(doId)

        // Get game state
        const stateResponse = await stub.fetch('http://fake-host/state')
        const stateResult = await stateResponse.json()

        if (!stateResult.success) {
            return c.json(
                {
                    success: false,
                    error: 'Failed to get game state',
                },
                500
            )
        }

        return c.json({
            success: true,
            data: {
                gameId,
                gameCode: code,
                status: stateResult.state.status,
                playerCount: stateResult.state.players.length,
                config: {
                    questionCount: stateResult.state.totalQuestions,
                },
            },
        })
    } catch (error) {
        console.error('Error getting game info:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to get game info',
            },
            500
        )
    }
})

// GET /api/multiplayer/ws/:code
// Upgrade to WebSocket connection for game
multiplayerRoutes.get('/ws/:code', async (c) => {
    try {
        const code = c.req.param('code').toUpperCase()

        // Validate code format
        const codeService = new GameCodeService(c.env.GAME_CODES)
        if (!codeService.validateCode(code)) {
            return c.text('Invalid game code', 400)
        }

        // Check if game exists
        const gameId = await codeService.getGameIdFromCode(code)
        if (!gameId) {
            return c.text('Game not found', 404)
        }

        // Get Durable Object instance (using RPC version)
        const doId = c.env.GAME_SESSIONS_RPC.idFromName(code)
        const stub = c.env.GAME_SESSIONS_RPC.get(doId)

        // Forward WebSocket upgrade to Durable Object (Cap'n Web RPC)
        return stub.fetch(c.req.raw)
    } catch (error) {
        console.error('Error establishing WebSocket connection:', error)
        return c.text('Failed to connect', 500)
    }
})

// DELETE /api/multiplayer/game/:code
// Delete a game (host only - validation happens in DO)
multiplayerRoutes.delete('/game/:code', async (c) => {
    try {
        const code = c.req.param('code').toUpperCase()

        // Delete from KV
        const codeService = new GameCodeService(c.env.GAME_CODES)
        await codeService.deleteGameCode(code)

        // Note: Durable Object will clean itself up on inactivity

        return c.json({
            success: true,
            message: 'Game deleted',
        })
    } catch (error) {
        console.error('Error deleting game:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to delete game',
            },
            500
        )
    }
})
