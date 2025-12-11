import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { quizRoutes } from './routes/quiz'
import { multiplayerRoutes } from './routes/multiplayer'
import { adminRoutes } from './routes/admin'

// Define the environment type
export type Env = {
    DB: D1Database
    ENVIRONMENT?: string
    GAME_SESSIONS_RPC: DurableObjectNamespace
    GAME_CODES: KVNamespace
    IMAGES?: R2Bucket
    R2_PUBLIC_URL?: string
    __mockPrisma?: any // For testing only
}

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())

// CORS configuration - allowing all origins since we're serving the frontend
app.use(
    '/api/*',
    cors({
        origin: '*',
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
    })
)

// API health check
app.get('/api', (c) => {
    return c.json({
        message: 'Quiz App API is running!',
        version: '1.0.0',
        environment: c.env?.ENVIRONMENT || 'development',
        endpoints: {
            frontend: '/',
            questions: '/api/quiz/questions',
            randomQuestions: '/api/quiz/questions/random/:count',
            categories: '/api/quiz/categories',
            stats: '/api/quiz/stats',
            submit: '/api/quiz/submit',
        },
    })
})

// Quiz API routes
app.route('/api/quiz', quizRoutes)

// Multiplayer API routes
app.route('/api/multiplayer', multiplayerRoutes)

// Admin API routes (protected by Cloudflare Access)
app.route('/api/admin', adminRoutes)

// 404 handler for API routes only
app.notFound((c) => {
    const url = new URL(c.req.url)

    // Only handle API routes in 404
    if (url.pathname.startsWith('/api/')) {
        return c.json(
            {
                success: false,
                error: 'API endpoint not found',
                path: url.pathname,
            },
            404
        )
    }

    // Let the static asset handler deal with other routes
    return c.text('Not Found', 404)
})

// Global error handler
app.onError((err, c) => {
    console.error('Error:', err)

    const url = new URL(c.req.url)

    // If it's an API route, return JSON error
    if (url.pathname.startsWith('/api/')) {
        return c.json(
            {
                success: false,
                error: 'Internal server error',
                message: err.message,
            },
            500
        )
    }

    // For non-API routes, serve an error page or fallback
    return c.text('Internal Server Error', 500)
})

export default app

// Export Durable Objects
export { GameSessionRpc } from './durable-objects/GameSessionRpc'
