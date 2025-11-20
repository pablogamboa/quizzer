import { testQuestions } from './fixtures/questions'
import type { Question } from '../../src/data/questions'
import {
    createMockPrismaClient,
    createMockD1Database,
} from './prisma-mock-adapter'
import { QuestionService } from '../../src/services/database'

export class MockQuestionService {
    private questions: Question[] = testQuestions

    async getAllQuestions(): Promise<Question[]> {
        return this.questions
    }

    async getRandomQuestions(count: number): Promise<Question[]> {
        const shuffled = [...this.questions].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, Math.min(count, shuffled.length))
    }

    async getQuestionsByCategory(category: string): Promise<Question[]> {
        return this.questions.filter(
            (q) => q.category.toLowerCase() === category.toLowerCase()
        )
    }

    async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
        return this.questions.filter((q) => q.difficulty === difficulty)
    }

    async getCategories(): Promise<string[]> {
        const categories = new Set(this.questions.map((q) => q.category))
        return Array.from(categories).sort()
    }

    async getStats(): Promise<any> {
        const byCategory: Record<string, number> = {}
        const byDifficulty: Record<string, number> = {
            easy: 0,
            medium: 0,
            hard: 0,
        }
        const byType: Record<string, number> = {
            trivia: 0,
            question: 0,
            picture: 0,
        }

        this.questions.forEach((q) => {
            byCategory[q.category] = (byCategory[q.category] || 0) + 1
            byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1
            byType[q.type] = (byType[q.type] || 0) + 1
        })

        return {
            totalQuestions: this.questions.length,
            byCategory,
            byDifficulty,
            byType,
        }
    }
}

export const setupMockDatabase = () => {
    const db: any = {
        hall_of_fame: [],
        failHallOfFame: false,
        lastHallOfFameId: 4,
    }
    return db
}

// Create a mock service factory that returns a PrismaQuestionService with mock data
export const createMockQuestionService = (): QuestionService => {
    const mockDb = createMockD1Database()
    const mockPrisma = createMockPrismaClient()
    return new QuestionService(mockDb, mockPrisma)
}

export const createMockDB = () => {
    const mockService = new MockQuestionService()
    const hallOfFame = setupMockDatabase()

    return {
        prepare: (query: string) => ({
            bind: (...args: any[]) => ({
                all: async () => {
                    // Handle hall of fame queries
                    if (query.includes('FROM hall_of_fame')) {
                        let results = [...hallOfFame.hall_of_fame]

                        // Apply filters
                        if (query.includes('WHERE')) {
                            let paramIndex = 0
                            if (query.includes('category = ?')) {
                                results = results.filter(
                                    (r) => r.category === args[paramIndex++]
                                )
                            }
                            if (query.includes('difficulty = ?')) {
                                results = results.filter(
                                    (r) => r.difficulty === args[paramIndex++]
                                )
                            }
                        }

                        // Sort by percentage
                        if (
                            query.includes('ORDER BY percentage_correct DESC')
                        ) {
                            results.sort(
                                (a, b) =>
                                    b.percentage_correct - a.percentage_correct
                            )
                        }

                        // Apply limit and offset
                        const limitMatch = query.match(/LIMIT \?/)
                        const offsetMatch = query.match(/OFFSET \?/)
                        if (limitMatch || offsetMatch) {
                            const limit = args[args.length - 2] || 20
                            const offset = args[args.length - 1] || 0
                            results = results.slice(offset, offset + limit)
                        }

                        return { results }
                    }

                    // Handle similar attempts query
                    if (query.includes('SELECT COUNT(*) + 1 as rank')) {
                        const percentage = args[0]
                        const higherScores = hallOfFame.hall_of_fame.filter(
                            (e: any) => e.percentage_correct > percentage
                        )
                        return { results: [{ rank: higherScores.length + 1 }] }
                    }

                    // Handle categories query
                    if (query.includes('SELECT DISTINCT category')) {
                        const categories = await mockService.getCategories()
                        return {
                            results: categories.map((c) => ({ category: c })),
                        }
                    }

                    // Handle main questions query
                    if (query.includes('questions q')) {
                        let questions: Question[] = []

                        if (query.includes('ORDER BY RANDOM()')) {
                            const count = args[0] || 10
                            questions =
                                await mockService.getRandomQuestions(count)
                        } else if (query.includes('WHERE LOWER(q.category)')) {
                            const category = args[0]
                            questions =
                                await mockService.getQuestionsByCategory(
                                    category
                                )
                        } else if (query.includes('WHERE q.difficulty')) {
                            const difficulty = args[0]
                            questions =
                                await mockService.getQuestionsByDifficulty(
                                    difficulty
                                )
                        } else {
                            questions = await mockService.getAllQuestions()
                        }

                        // Convert questions to DB format (with numeric IDs)
                        return {
                            results: questions.map((q) => {
                                const numericId = parseInt(
                                    q.id.replace('test-', '')
                                )
                                const dbRow: any = {
                                    id: numericId,
                                    type: q.type,
                                    question: q.question,
                                    category: q.category,
                                    difficulty: q.difficulty,
                                }
                                if (q.type === 'picture') {
                                    dbRow.image_url = (q as any).imageUrl
                                }
                                return dbRow
                            }),
                        }
                    }

                    // Handle answers query for trivia/picture questions
                    if (query.includes('FROM answers')) {
                        const questionId = args[0]
                        const question = testQuestions.find(
                            (q) => q.id === `test-${questionId}`
                        )

                        if (
                            question &&
                            (question.type === 'trivia' ||
                                question.type === 'picture')
                        ) {
                            return {
                                results: question.answers.map(
                                    (answer, index) => ({
                                        answer_text: answer,
                                        is_correct: index === question.correct,
                                    })
                                ),
                            }
                        }
                        return { results: [] }
                    }

                    // Handle text answers query for free text questions
                    if (query.includes('FROM text_answers')) {
                        const questionId = args[0]
                        const question = testQuestions.find(
                            (q) => q.id === `test-${questionId}`
                        )

                        if (question && question.type === 'question') {
                            const results = [
                                {
                                    correct_answer: question.correctAnswer,
                                    is_primary: true,
                                },
                                ...(question.acceptableAnswers || []).map(
                                    (a) => ({
                                        correct_answer: a,
                                        is_primary: false,
                                    })
                                ),
                            ]
                            return { results }
                        }
                        return { results: [] }
                    }

                    return { results: [] }
                },
                first: async () => {
                    // Handle hall of fame SELECT by ID
                    if (
                        query.includes('FROM hall_of_fame') &&
                        query.includes('WHERE id = ?')
                    ) {
                        const id = args[0]
                        const entry = hallOfFame.hall_of_fame.find(
                            (e: any) => e.id === id
                        )
                        return entry || null
                    }

                    // Handle rank query
                    if (query.includes('SELECT COUNT(*) + 1 as rank')) {
                        const percentage = args[0]
                        const higherScores = hallOfFame.hall_of_fame.filter(
                            (e: any) => e.percentage_correct > percentage
                        )
                        return { rank: higherScores.length + 1 }
                    }

                    if (query.includes('COUNT(*) as total')) {
                        return { total: testQuestions.length }
                    }
                    if (query.includes('COUNT(DISTINCT category)')) {
                        const categories = await mockService.getCategories()
                        return { categories: categories.length }
                    }
                    return null
                },
                run: async () => {
                    // Handle hall of fame INSERT
                    if (query.includes('INSERT INTO hall_of_fame')) {
                        if (hallOfFame.failHallOfFame) {
                            throw new Error('Hall of Fame save failed')
                        }

                        const newId = ++hallOfFame.lastHallOfFameId
                        const newEntry = {
                            id: newId,
                            player_name: args[0],
                            score: args[1],
                            total_questions: args[2],
                            category: args[3],
                            difficulty: args[4],
                            time_taken_seconds: args[5],
                            percentage_correct: (args[1] / args[2]) * 100,
                            date_played: new Date().toISOString(),
                        }
                        hallOfFame.hall_of_fame.push(newEntry)
                        return { meta: { last_row_id: newId } }
                    }
                    return { meta: { last_row_id: 1 } }
                },
            }),
            all: async () => {
                // Handle difficulty stats query
                if (query.includes('SELECT difficulty, COUNT(*)')) {
                    const stats = await mockService.getStats()
                    return {
                        results: Object.entries(stats.byDifficulty).map(
                            ([difficulty, count]) => ({
                                difficulty,
                                count,
                            })
                        ),
                    }
                }

                // Handle main questions query (without bind)
                if (query.includes('questions q')) {
                    const questions = await mockService.getAllQuestions()
                    return {
                        results: questions.map((q) => {
                            const numericId = parseInt(
                                q.id.replace('test-', '')
                            )
                            const dbRow: any = {
                                id: numericId,
                                type: q.type,
                                question: q.question,
                                category: q.category,
                                difficulty: q.difficulty,
                            }
                            if (q.type === 'picture') {
                                dbRow.image_url = (q as any).imageUrl
                            }
                            return dbRow
                        }),
                    }
                }

                // Handle categories query
                if (query.includes('SELECT DISTINCT category')) {
                    const categories = await mockService.getCategories()
                    return { results: categories.map((c) => ({ category: c })) }
                }

                return { results: [] }
            },
            first: async () => {
                if (query.includes('COUNT(*) as total')) {
                    return { total: testQuestions.length }
                }
                if (query.includes('COUNT(DISTINCT category)')) {
                    const categories = await mockService.getCategories()
                    return { categories: categories.length }
                }
                return null
            },
        }),
    }
}
