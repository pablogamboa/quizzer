import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { adminRoutes } from '../../src/routes/admin'
import type { Env } from '../../src/index'
import { createMockPrismaClient } from './prisma-mock-adapter'

// Extend Env type with admin-specific bindings
type AdminEnv = Env & {
    IMAGES: R2Bucket
    R2_PUBLIC_URL?: string
}

describe('Admin API Integration Tests', () => {
    let app: Hono<{ Bindings: AdminEnv }>
    let mockPrisma: ReturnType<typeof createMockPrismaClient>

    // Helper to create request (no auth needed - protected by Cloudflare Access)
    const createRequest = (url: string, options: RequestInit = {}): Request => {
        return new Request(url, options)
    }

    // Helper to create env with mock Prisma
    const createEnv = () => ({
        DB: {} as any,
        __mockPrisma: mockPrisma,
    })

    beforeAll(() => {
        app = new Hono<{ Bindings: AdminEnv }>()
        app.route('/', adminRoutes)
    })

    beforeEach(() => {
        // Reset mock state before each test
        mockPrisma = createMockPrismaClient()
    })

    // Note: Authentication is now handled by Cloudflare Access at the infrastructure level

    describe('GET /stats', () => {
        it('should return admin statistics', async () => {
            const request = createRequest('http://localhost/stats')
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body).toHaveProperty('totalQuestions')
            expect(body).toHaveProperty('questionsByType')
            expect(body).toHaveProperty('questionsByCategory')
            expect(body).toHaveProperty('questionsByDifficulty')
            expect(body).toHaveProperty('totalThemes')
            expect(body).toHaveProperty('activeThemes')
        })
    })

    describe('GET /questions', () => {
        it('should return paginated questions', async () => {
            const request = createRequest('http://localhost/questions')
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body).toHaveProperty('items')
            expect(body).toHaveProperty('total')
            expect(body).toHaveProperty('page')
            expect(body).toHaveProperty('pageSize')
            expect(body).toHaveProperty('totalPages')
            expect(Array.isArray(body.items)).toBe(true)
        })

        it('should filter questions by category', async () => {
            const request = createRequest(
                'http://localhost/questions?category=Geography'
            )
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            body.items.forEach((q: any) => {
                expect(q.category).toBe('Geography')
            })
        })

        it('should filter questions by difficulty', async () => {
            const request = createRequest(
                'http://localhost/questions?difficulty=easy'
            )
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            body.items.forEach((q: any) => {
                expect(q.difficulty).toBe('easy')
            })
        })

        it('should respect pagination parameters', async () => {
            const request = createRequest(
                'http://localhost/questions?page=1&pageSize=2'
            )
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.page).toBe(1)
            expect(body.pageSize).toBe(2)
            expect(body.items.length).toBeLessThanOrEqual(2)
        })
    })

    describe('GET /questions/:id', () => {
        it('should return a single question', async () => {
            const request = createRequest('http://localhost/questions/1')
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body).toHaveProperty('id')
            expect(body).toHaveProperty('question')
            expect(body).toHaveProperty('type')
            expect(body).toHaveProperty('category')
            expect(body).toHaveProperty('difficulty')
        })

        it('should return 404 for non-existent question', async () => {
            const request = createRequest('http://localhost/questions/9999')
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(404)
            expect(body.error).toBe('Question not found')
        })

        it('should return 400 for invalid question ID', async () => {
            const request = createRequest('http://localhost/questions/abc')
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(400)
            expect(body.error).toBe('Invalid question ID')
        })
    })

    describe('POST /questions', () => {
        it('should create a trivia question', async () => {
            const questionData = {
                type: 'trivia',
                question: 'What is the capital of Germany?',
                category: 'Geography',
                difficulty: 'medium',
                answers: ['Munich', 'Berlin', 'Hamburg', 'Frankfurt'],
                correct: 1,
            }

            const request = createRequest('http://localhost/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questionData),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(201)
            expect(body.question).toBe(questionData.question)
            expect(body.type).toBe('trivia')
        })

        it('should create a text question', async () => {
            const questionData = {
                type: 'question',
                question: 'What is the largest ocean?',
                category: 'Geography',
                difficulty: 'easy',
                correctAnswer: 'Pacific',
            }

            const request = createRequest('http://localhost/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questionData),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(201)
            expect(body.question).toBe(questionData.question)
            expect(body.type).toBe('question')
        })

        it('should validate required fields', async () => {
            const request = createRequest('http://localhost/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: 'Missing fields' }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(400)
            expect(body.error).toContain('Missing required fields')
        })

        it('should validate question type', async () => {
            const request = createRequest('http://localhost/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'invalid',
                    question: 'Test',
                    category: 'Test',
                    difficulty: 'easy',
                }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(400)
            expect(body.error).toBe('Invalid question type')
        })

        it('should validate difficulty level', async () => {
            const request = createRequest('http://localhost/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'trivia',
                    question: 'Test',
                    category: 'Test',
                    difficulty: 'invalid',
                }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(400)
            expect(body.error).toBe('Invalid difficulty level')
        })

        it('should validate trivia questions have 4 answers', async () => {
            const request = createRequest('http://localhost/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'trivia',
                    question: 'Test',
                    category: 'Test',
                    difficulty: 'easy',
                    answers: ['A', 'B'], // Only 2 answers
                    correct: 0,
                }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(400)
            expect(body.error).toContain('exactly 4 answers')
        })

        it('should validate correct answer index for trivia', async () => {
            const request = createRequest('http://localhost/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'trivia',
                    question: 'Test',
                    category: 'Test',
                    difficulty: 'easy',
                    answers: ['A', 'B', 'C', 'D'],
                    correct: 5, // Invalid index
                }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(400)
            expect(body.error).toContain('Invalid correct answer index')
        })

        it('should validate picture questions require imageUrl', async () => {
            const request = createRequest('http://localhost/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'picture',
                    question: 'Test',
                    category: 'Test',
                    difficulty: 'easy',
                    answers: ['A', 'B', 'C', 'D'],
                    correct: 0,
                    // Missing imageUrl
                }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(400)
            expect(body.error).toContain('require an imageUrl')
        })
    })

    describe('PUT /questions/:id', () => {
        it('should update a question', async () => {
            const updateData = {
                question: 'Updated question text',
                type: 'trivia',
                answers: ['A', 'B', 'C', 'D'],
                correct: 2,
            }

            const request = createRequest('http://localhost/questions/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.question).toBe(updateData.question)
        })

        it('should return 404 for non-existent question', async () => {
            const request = createRequest('http://localhost/questions/9999', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: 'Updated' }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(404)
            expect(body.error).toBe('Question not found')
        })
    })

    describe('DELETE /questions/:id', () => {
        it('should delete a question', async () => {
            const request = createRequest('http://localhost/questions/1', {
                method: 'DELETE',
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
        })

        it('should return 404 for non-existent question', async () => {
            const request = createRequest('http://localhost/questions/9999', {
                method: 'DELETE',
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(404)
            expect(body.error).toBe('Question not found')
        })
    })

    describe('DELETE /questions/bulk', () => {
        it('should bulk delete questions', async () => {
            const request = createRequest('http://localhost/questions/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [1, 2, 3] }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.deletedCount).toBeDefined()
        })

        it('should validate ids array', async () => {
            const request = createRequest('http://localhost/questions/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [] }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(400)
            expect(body.error).toContain('Missing or invalid ids array')
        })
    })

    describe('GET /themes', () => {
        it('should return all themes with question counts', async () => {
            const request = createRequest('http://localhost/themes')
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(Array.isArray(body)).toBe(true)
            if (body.length > 0) {
                expect(body[0]).toHaveProperty('themeKey')
                expect(body[0]).toHaveProperty('themeName')
                expect(body[0]).toHaveProperty('category')
                expect(body[0]).toHaveProperty('questionCount')
            }
        })
    })

    describe('GET /themes/:id', () => {
        it('should return a single theme', async () => {
            const request = createRequest('http://localhost/themes/1')
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body).toHaveProperty('themeKey')
            expect(body).toHaveProperty('themeName')
            expect(body).toHaveProperty('questionCount')
        })

        it('should return 404 for non-existent theme', async () => {
            const request = createRequest('http://localhost/themes/9999')
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(404)
            expect(body.error).toBe('Theme not found')
        })
    })

    describe('POST /themes', () => {
        it('should create a theme', async () => {
            const themeData = {
                themeKey: 'new-theme',
                themeName: 'New Theme',
                category: 'Geography',
                description: 'A new test theme',
                icon: '🎯',
            }

            const request = createRequest('http://localhost/themes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(themeData),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(201)
            expect(body.themeKey).toBe(themeData.themeKey)
            expect(body.themeName).toBe(themeData.themeName)
        })

        it('should validate required fields', async () => {
            const request = createRequest('http://localhost/themes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeName: 'Missing fields' }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(400)
            expect(body.error).toContain('Missing required fields')
        })

        it('should default isActive to true', async () => {
            const themeData = {
                themeKey: 'active-theme',
                themeName: 'Active Theme',
                category: 'Test',
            }

            const request = createRequest('http://localhost/themes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(themeData),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(201)
            expect(body.isActive).toBe(true)
        })
    })

    describe('PUT /themes/:id', () => {
        it('should update a theme', async () => {
            const updateData = {
                themeName: 'Updated Theme Name',
            }

            const request = createRequest('http://localhost/themes/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.themeName).toBe(updateData.themeName)
        })

        it('should return 404 for non-existent theme', async () => {
            const request = createRequest('http://localhost/themes/9999', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeName: 'Updated' }),
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(404)
            expect(body.error).toBe('Theme not found')
        })
    })

    describe('DELETE /themes/:id', () => {
        it('should delete a theme', async () => {
            const request = createRequest('http://localhost/themes/1', {
                method: 'DELETE',
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
        })

        it('should return 404 for non-existent theme', async () => {
            const request = createRequest('http://localhost/themes/9999', {
                method: 'DELETE',
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(404)
            expect(body.error).toBe('Theme not found')
        })
    })

    describe('GET /categories', () => {
        it('should return all categories', async () => {
            const request = createRequest('http://localhost/categories')
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(Array.isArray(body)).toBe(true)
        })
    })

    describe('Image endpoints', () => {
        it('should return 503 when IMAGES bucket not configured', async () => {
            const request = createRequest('http://localhost/images/upload', {
                method: 'POST',
            })
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(503)
            expect(body.error).toBe('Image storage not configured')
        })

        it('should return 503 for list images when IMAGES not configured', async () => {
            const request = createRequest('http://localhost/images')
            const env = createEnv()
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(503)
            expect(body.error).toBe('Image storage not configured')
        })
    })
})
