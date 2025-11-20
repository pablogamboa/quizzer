import { describe, it, expect, beforeAll } from 'vitest'
import { Hono } from 'hono'
import { quizRoutes } from '../../src/routes/quiz'
import type { Env } from '../../src/index'
import { createMockDB } from './mock-database-new'
import {
    testQuestions,
    expectedQuestionsWithoutAnswers,
} from './fixtures/questions'

describe('Quiz API Integration Tests', () => {
    let app: Hono<{ Bindings: Env }>

    beforeAll(() => {
        app = new Hono<{ Bindings: Env }>()
        app.route('/api/quiz', quizRoutes)
    })

    describe('GET /api/quiz/questions', () => {
        it('should return all questions without correct answers', async () => {
            const request = new Request('http://localhost/api/quiz/questions')
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data).toBeDefined()
            expect(Array.isArray(body.data)).toBe(true)
            expect(body.data.length).toBe(testQuestions.length)

            body.data.forEach((question: any, index: number) => {
                expect(question).not.toHaveProperty('correct')
                expect(question).not.toHaveProperty('correctAnswer')
                expect(question).not.toHaveProperty('acceptableAnswers')

                expect(question).toHaveProperty('id')
                expect(question).toHaveProperty('question')
                expect(question).toHaveProperty('category')
                expect(question).toHaveProperty('difficulty')
                expect(question).toHaveProperty('type')

                const originalQuestion = testQuestions.find(
                    (q) => q.id === `test-${question.id}`
                )
                expect(question.question).toBe(originalQuestion?.question)
                expect(question.category).toBe(originalQuestion?.category)
                expect(question.difficulty).toBe(originalQuestion?.difficulty)
                expect(question.type).toBe(originalQuestion?.type)

                if (question.type === 'trivia' || question.type === 'picture') {
                    expect(question.answers).toEqual(originalQuestion?.answers)
                }

                if (question.type === 'picture') {
                    expect(question.imageUrl).toBe(originalQuestion?.imageUrl)
                }
            })
        })

        it('should properly strip answers for trivia questions', async () => {
            const request = new Request('http://localhost/api/quiz/questions')
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            const triviaQuestion = body.data.find(
                (q: any) => q.type === 'trivia'
            )
            expect(triviaQuestion).toBeDefined()
            expect(triviaQuestion).not.toHaveProperty('correct')
            expect(triviaQuestion.answers).toBeDefined()
            expect(triviaQuestion.answers.length).toBe(4)
        })

        it('should properly strip answers for text questions', async () => {
            const request = new Request('http://localhost/api/quiz/questions')
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            const textQuestion = body.data.find(
                (q: any) => q.type === 'question'
            )
            expect(textQuestion).toBeDefined()
            expect(textQuestion).not.toHaveProperty('correctAnswer')
            expect(textQuestion).not.toHaveProperty('acceptableAnswers')
            expect(textQuestion.question).toBe('What is 2 + 2?')
        })
    })

    describe('GET /api/quiz/questions/random/:count', () => {
        it('should return exactly the requested number of questions', async () => {
            const count = 3
            const request = new Request(
                `http://localhost/api/quiz/questions/random/${count}`
            )
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data).toBeDefined()
            expect(body.data.length).toBe(count)
            expect(body.total).toBe(count)

            body.data.forEach((question: any) => {
                expect(question).not.toHaveProperty('correct')
                expect(question).not.toHaveProperty('correctAnswer')

                const originalQuestion = testQuestions.find(
                    (q) => q.id === `test-${question.id}`
                )
                expect(originalQuestion).toBeDefined()
            })
        })

        it('should return all questions when count exceeds total', async () => {
            const count = 100
            const request = new Request(
                `http://localhost/api/quiz/questions/random/${count}`
            )
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data.length).toBe(testQuestions.length)
            expect(body.total).toBe(testQuestions.length)
        })
    })

    describe('GET /api/quiz/questions/category/:category', () => {
        it('should return questions for existing category', async () => {
            const response = await app.fetch(
                new Request(
                    'http://localhost/api/quiz/questions/category/Test Category'
                ),
                { DB: createMockDB() as any }
            )
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.category).toBe('Test Category')
            expect(body.data.length).toBe(2)

            body.data.forEach((question: any) => {
                expect(question.category).toBe('Test Category')
                expect(question).not.toHaveProperty('correct')
            })
        })

        it('should return questions for Mathematics category', async () => {
            const response = await app.fetch(
                new Request(
                    'http://localhost/api/quiz/questions/category/Mathematics'
                ),
                { DB: createMockDB() as any }
            )
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data.length).toBe(1)
            expect(body.data[0].question).toBe('What is 2 + 2?')
            expect(body.data[0].type).toBe('question')
        })

        it('should return 404 for non-existent category', async () => {
            const response = await app.fetch(
                new Request(
                    'http://localhost/api/quiz/questions/category/NonExistent'
                ),
                { DB: createMockDB() as any }
            )
            const body = (await response.json()) as any

            expect(response.status).toBe(404)
            expect(body.success).toBe(false)
            expect(body.error).toBe('Category not found')
        })
    })

    describe('GET /api/quiz/questions/difficulty/:level', () => {
        it('should return only easy questions', async () => {
            const response = await app.fetch(
                new Request(
                    'http://localhost/api/quiz/questions/difficulty/easy'
                ),
                { DB: createMockDB() as any }
            )
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.difficulty).toBe('easy')
            expect(body.data.length).toBe(4)

            body.data.forEach((question: any) => {
                expect(question.difficulty).toBe('easy')
            })
        })

        it('should return only hard questions', async () => {
            const response = await app.fetch(
                new Request(
                    'http://localhost/api/quiz/questions/difficulty/hard'
                ),
                { DB: createMockDB() as any }
            )
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.difficulty).toBe('hard')
            expect(body.data.length).toBe(2)

            body.data.forEach((question: any) => {
                expect(question.difficulty).toBe('hard')
            })
        })
    })

    describe('POST /api/quiz/submit', () => {
        it('should correctly score trivia questions', async () => {
            const answers = [
                { questionId: '1', selectedAnswer: 1 }, // Correct
                { questionId: '2', selectedAnswer: 1 }, // Wrong (correct is 0)
            ]

            const request = new Request('http://localhost/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            })
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data.score).toBe(1)
            expect(body.data.total).toBe(2)
            expect(body.data.percentage).toBe(50)
            expect(body.data.results).toHaveLength(2)

            const firstResult = body.data.results[0]
            expect(firstResult.questionId).toBe('1')
            expect(firstResult.isCorrect).toBe(true)
            expect(firstResult.correctAnswer).toBe(1)
            expect(firstResult.selectedAnswer).toBe(1)

            const secondResult = body.data.results[1]
            expect(secondResult.questionId).toBe('2')
            expect(secondResult.isCorrect).toBe(false)
            expect(secondResult.correctAnswer).toBe(0)
            expect(secondResult.selectedAnswer).toBe(1)
        })

        it('should correctly score text questions', async () => {
            const answers = [
                { questionId: '3', textAnswer: '4' }, // Correct
                { questionId: '3', textAnswer: 'four' }, // Also correct
                { questionId: '3', textAnswer: '5' }, // Wrong
                { questionId: '4', textAnswer: 'paris' }, // Correct (case insensitive)
            ]

            const request = new Request('http://localhost/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            })
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data.score).toBe(3)
            expect(body.data.total).toBe(4)
            expect(body.data.percentage).toBe(75)

            expect(body.data.results[0].isCorrect).toBe(true)
            expect(body.data.results[1].isCorrect).toBe(true)
            expect(body.data.results[2].isCorrect).toBe(false)
            expect(body.data.results[3].isCorrect).toBe(true)
        })

        it('should correctly score picture questions', async () => {
            const answers = [
                { questionId: '5', selectedAnswer: 2 }, // Correct
                { questionId: '5', selectedAnswer: 0 }, // Wrong
            ]

            const request = new Request('http://localhost/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            })
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.data.score).toBe(1)
            expect(body.data.total).toBe(2)

            const firstResult = body.data.results[0]
            expect(firstResult.questionType).toBe('picture')
            expect(firstResult.isCorrect).toBe(true)
            expect(firstResult.correctAnswer).toBe(2)
        })

        it('should handle mixed question types in a single submission', async () => {
            const answers = [
                { questionId: '1', selectedAnswer: 1 }, // Trivia - correct
                { questionId: '3', textAnswer: '4' }, // Text - correct
                { questionId: '5', selectedAnswer: 2 }, // Picture - correct
            ]

            const request = new Request('http://localhost/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            })
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.data.score).toBe(3)
            expect(body.data.total).toBe(3)
            expect(body.data.percentage).toBe(100)

            const types = body.data.results.map((r: any) => r.questionType)
            expect(types).toContain('trivia')
            expect(types).toContain('question')
            expect(types).toContain('picture')
        })

        it('should handle invalid question IDs gracefully', async () => {
            const answers = [
                { questionId: 'invalid-id', selectedAnswer: 0 },
                { questionId: '1', selectedAnswer: 1 },
            ]

            const request = new Request('http://localhost/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            })
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data.results).toHaveLength(1)
            expect(body.data.results[0].questionId).toBe('1')
        })
    })

    describe('GET /api/quiz/categories', () => {
        it('should return all unique categories from fixture data', async () => {
            const request = new Request('http://localhost/api/quiz/categories')
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data).toBeDefined()
            expect(Array.isArray(body.data)).toBe(true)

            const expectedCategories = [
                'Another Category',
                'Geography',
                'Mathematics',
                'Test Category',
                'Visual',
            ]
            expect(body.data).toEqual(expectedCategories)
        })
    })

    describe('GET /api/quiz/stats', () => {
        it('should return correct statistics from fixture data', async () => {
            const request = new Request('http://localhost/api/quiz/stats')
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data).toBeDefined()

            expect(body.data.totalQuestions).toBe(9)
            expect(body.data.categories).toBe(5)

            expect(body.data.difficulties).toEqual({
                easy: 4,
                medium: 3,
                hard: 2,
            })
        })
    })

    describe('GET /api/quiz/themes', () => {
        it('should return all active themes', async () => {
            const request = new Request('http://localhost/api/quiz/themes')
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data).toBeDefined()
            expect(Array.isArray(body.data)).toBe(true)
            expect(body.data.length).toBe(2)

            const theme = body.data[0]
            expect(theme).toHaveProperty('id')
            expect(theme).toHaveProperty('themeKey')
            expect(theme).toHaveProperty('themeName')
            expect(theme).toHaveProperty('category')
            expect(theme).toHaveProperty('description')
            expect(theme).toHaveProperty('icon')
            expect(theme).toHaveProperty('isActive')
        })
    })

    describe('GET /api/quiz/themes/category/:category', () => {
        it('should return themes for a specific category', async () => {
            const request = new Request(
                'http://localhost/api/quiz/themes/category/Geography'
            )
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data).toBeDefined()
            expect(body.data.length).toBe(2)
            expect(body.category).toBe('Geography')

            body.data.forEach((theme: any) => {
                expect(theme.category).toBe('Geography')
            })
        })

        it('should return empty array for category with no themes', async () => {
            const request = new Request(
                'http://localhost/api/quiz/themes/category/Mathematics'
            )
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data).toEqual([])
        })
    })

    describe('GET /api/quiz/questions/theme/:theme/random/:count', () => {
        it('should return random questions for a specific theme', async () => {
            const count = 2
            const request = new Request(
                `http://localhost/api/quiz/questions/theme/test-theme-1/random/${count}`
            )
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.data).toBeDefined()
            expect(body.data.length).toBe(count)
            expect(body.theme).toBe('test-theme-1')

            body.data.forEach((question: any) => {
                expect(question).not.toHaveProperty('correct')
                expect(question).not.toHaveProperty('correctAnswer')
            })
        })

        it('should return 404 for theme with no questions', async () => {
            const request = new Request(
                'http://localhost/api/quiz/questions/theme/nonexistent-theme/random/5'
            )
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(404)
            expect(body.success).toBe(false)
            expect(body.error).toBe('No questions found for this theme')
        })

        it('should respect the requested count for themed questions', async () => {
            const count = 1
            const request = new Request(
                `http://localhost/api/quiz/questions/theme/test-theme-1/random/${count}`
            )
            const env = { DB: createMockDB() as any }
            const response = await app.fetch(request, env)
            const body = (await response.json()) as any

            expect(response.status).toBe(200)
            expect(body.data.length).toBe(count)
        })
    })
})
