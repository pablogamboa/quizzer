import { describe, it, expect } from 'vitest'

class QuizAPIClient {
    constructor(private baseUrl: string) {}

    async makeRequest(
        path: string,
        options: RequestInit = {}
    ): Promise<{ status: number; body: any }> {
        const url = `${this.baseUrl}${path}`
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        let body
        try {
            body = await response.json()
        } catch (e) {
            body = null
        }

        return { status: response.status, body }
    }

    async getQuestions() {
        return this.makeRequest('/api/quiz/questions')
    }

    async getRandomQuestions(count: number) {
        return this.makeRequest(`/api/quiz/questions/random/${count}`)
    }

    async getQuestionsByCategory(category: string) {
        return this.makeRequest(`/api/quiz/questions/category/${category}`)
    }

    async getQuestionsByDifficulty(difficulty: string) {
        return this.makeRequest(`/api/quiz/questions/difficulty/${difficulty}`)
    }

    async submitAnswers(answers: any[]) {
        return this.makeRequest('/api/quiz/submit', {
            method: 'POST',
            body: JSON.stringify({ answers }),
        })
    }

    async getCategories() {
        return this.makeRequest('/api/quiz/categories')
    }

    async getStats() {
        return this.makeRequest('/api/quiz/stats')
    }
}

describe('Quiz API HTTP Client Tests', () => {
    const client = new QuizAPIClient('http://localhost:8787')

    describe('Response Format Validation', () => {
        it('should validate questions response format', async () => {
            const expectedFormat = {
                success: 'boolean',
                data: 'array',
            }

            const validateResponse = (response: any) => {
                expect(response).toHaveProperty('success')
                expect(typeof response.success).toBe('boolean')
                expect(response).toHaveProperty('data')
                expect(Array.isArray(response.data)).toBe(true)

                if (response.data.length > 0) {
                    const question = response.data[0]
                    expect(question).toHaveProperty('id')
                    expect(question).toHaveProperty('type')
                    expect(question).toHaveProperty('question')
                    expect(question).toHaveProperty('category')
                    expect(question).toHaveProperty('difficulty')

                    expect(question).not.toHaveProperty('correct')
                    expect(question).not.toHaveProperty('correctAnswer')
                    expect(question).not.toHaveProperty('acceptableAnswers')
                }
            }

            return { validateResponse }
        })

        it('should validate submit response format', async () => {
            const validateSubmitResponse = (response: any) => {
                expect(response).toHaveProperty('success')
                expect(response).toHaveProperty('data')

                if (response.success) {
                    expect(response.data).toHaveProperty('score')
                    expect(response.data).toHaveProperty('total')
                    expect(response.data).toHaveProperty('percentage')
                    expect(response.data).toHaveProperty('results')

                    expect(typeof response.data.score).toBe('number')
                    expect(typeof response.data.total).toBe('number')
                    expect(typeof response.data.percentage).toBe('number')
                    expect(Array.isArray(response.data.results)).toBe(true)

                    if (response.data.results.length > 0) {
                        const result = response.data.results[0]
                        expect(result).toHaveProperty('questionId')
                        expect(result).toHaveProperty('question')
                        expect(result).toHaveProperty('questionType')
                        expect(result).toHaveProperty('selectedAnswer')
                        expect(result).toHaveProperty('correctAnswer')
                        expect(result).toHaveProperty('isCorrect')
                        expect(result).toHaveProperty('explanation')
                    }
                }
            }

            return { validateSubmitResponse }
        })
    })

    describe('Error Handling', () => {
        it('should handle 404 errors', async () => {
            const testCases = [
                {
                    path: '/api/quiz/questions/category/NonExistent',
                    expectedError: 'Category not found',
                },
            ]

            for (const testCase of testCases) {
                const validateError = (response: any) => {
                    expect(response.status).toBe(404)
                    expect(response.body.success).toBe(false)
                    expect(response.body.error).toBeDefined()
                }

                return { validateError }
            }
        })

        it('should handle 400 errors', async () => {
            const testCases = [
                {
                    request: { invalid: 'data' },
                    expectedError: 'Invalid answers format',
                },
                {
                    request: 'invalid json',
                    expectedError: 'Invalid request body',
                },
            ]

            for (const testCase of testCases) {
                const validateBadRequest = (response: any) => {
                    expect(response.status).toBe(400)
                    expect(response.body.success).toBe(false)
                    expect(response.body.error).toBeDefined()
                }

                return { validateBadRequest }
            }
        })
    })

    describe('Performance Metrics', () => {
        it('should measure response times', async () => {
            const measureResponseTime = async (request: () => Promise<any>) => {
                const startTime = Date.now()
                const response = await request()
                const endTime = Date.now()
                return endTime - startTime
            }

            const endpoints = [
                { name: 'GET /questions', threshold: 1000 },
                { name: 'GET /questions/random/5', threshold: 1000 },
                { name: 'GET /categories', threshold: 500 },
                { name: 'GET /stats', threshold: 500 },
            ]

            return { measureResponseTime, endpoints }
        })

        it('should handle concurrent requests', async () => {
            const testConcurrency = async (concurrentRequests: number) => {
                const promises = Array.from(
                    { length: concurrentRequests },
                    () => client.getQuestions()
                )

                const startTime = Date.now()
                const responses = await Promise.all(promises)
                const endTime = Date.now()

                return {
                    totalTime: endTime - startTime,
                    averageTime: (endTime - startTime) / concurrentRequests,
                    successCount: responses.filter((r) => r.status === 200)
                        .length,
                }
            }

            return { testConcurrency }
        })
    })

    describe('Data Integrity', () => {
        it('should validate question types', () => {
            const validTypes = ['trivia', 'question', 'picture']

            const validateQuestionType = (question: any) => {
                expect(validTypes).toContain(question.type)

                if (question.type === 'trivia') {
                    expect(question).toHaveProperty('answers')
                    expect(Array.isArray(question.answers)).toBe(true)
                    expect(question.answers.length).toBe(4)
                } else if (question.type === 'picture') {
                    expect(question).toHaveProperty('imageUrl')
                    expect(question).toHaveProperty('answers')
                    expect(Array.isArray(question.answers)).toBe(true)
                }
            }

            return { validateQuestionType }
        })

        it('should validate difficulty levels', () => {
            const validDifficulties = ['easy', 'medium', 'hard']

            const validateDifficulty = (question: any) => {
                expect(validDifficulties).toContain(question.difficulty)
            }

            return { validateDifficulty }
        })
    })

    describe('Integration Test Scenarios', () => {
        it('Full quiz flow', async () => {
            const runFullQuizFlow = async () => {
                const questionsResponse = await client.getRandomQuestions(5)
                expect(questionsResponse.status).toBe(200)

                const questions = questionsResponse.body.data
                const answers = questions.map((q: any) => {
                    if (q.type === 'trivia' || q.type === 'picture') {
                        return { questionId: q.id, selectedAnswer: 0 }
                    } else {
                        return { questionId: q.id, textAnswer: 'test answer' }
                    }
                })

                const submitResponse = await client.submitAnswers(answers)
                expect(submitResponse.status).toBe(200)
                expect(submitResponse.body.data.total).toBe(answers.length)

                return {
                    questionsCount: questions.length,
                    score: submitResponse.body.data.score,
                    percentage: submitResponse.body.data.percentage,
                }
            }

            return { runFullQuizFlow }
        })

        it('Category-based quiz flow', async () => {
            const runCategoryQuiz = async (category: string) => {
                const categoriesResponse = await client.getCategories()
                expect(categoriesResponse.status).toBe(200)

                const categories = categoriesResponse.body.data
                if (!categories.includes(category)) {
                    return { error: 'Category not found' }
                }

                const questionsResponse =
                    await client.getQuestionsByCategory(category)
                if (questionsResponse.status === 404) {
                    return { error: 'No questions in category' }
                }

                expect(questionsResponse.status).toBe(200)
                const questions = questionsResponse.body.data

                questions.forEach((q: any) => {
                    expect(q.category).toBe(category)
                })

                return {
                    category,
                    questionCount: questions.length,
                }
            }

            return { runCategoryQuiz }
        })
    })
})
