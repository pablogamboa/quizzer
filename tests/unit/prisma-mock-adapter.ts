import { testQuestions, testThemes } from './fixtures/questions'
import type {
    Question,
    TriviaQuestion,
    PictureQuestion,
    QuizTheme,
} from '../../src/data/questions'

export class MockPrismaAdapter {
    private questions: Question[] = testQuestions
    private themes: QuizTheme[] = testThemes
    private hallOfFame: any[] = []
    private lastId = {
        question: 9,
        answer: 100,
        textAnswer: 100,
        pictureMetadata: 100,
        hallOfFame: 4,
        quizTheme: 2,
    }

    // Question operations
    async questionFindMany(params: any = {}): Promise<any[]> {
        let filtered = [...this.questions]

        // Apply where filters
        if (params.where) {
            if (params.where.category) {
                // Handle both object format { equals: 'X' } and direct string 'X'
                const categoryFilter =
                    typeof params.where.category === 'string'
                        ? params.where.category
                        : params.where.category.equals
                filtered = filtered.filter((q) => q.category === categoryFilter)
            }
            if (params.where.difficulty) {
                filtered = filtered.filter(
                    (q) => q.difficulty === params.where.difficulty
                )
            }
            if (params.where.theme) {
                const themeFilter = params.where.theme
                filtered = filtered.filter((q) => q.theme === themeFilter)
            }
        }

        // Apply distinct
        if (params.distinct) {
            const seen = new Set()
            filtered = filtered.filter((q: any) => {
                const key = params.distinct[0]
                if (seen.has(q[key])) return false
                seen.add(q[key])
                return true
            })
        }

        // Apply orderBy
        if (params.orderBy) {
            const orderKey = Object.keys(params.orderBy)[0]
            const orderDir = params.orderBy[orderKey]
            filtered.sort((a: any, b: any) => {
                if (orderDir === 'asc') {
                    return a[orderKey] > b[orderKey] ? 1 : -1
                } else {
                    return a[orderKey] < b[orderKey] ? 1 : -1
                }
            })
        }

        // Apply select (for categories)
        if (params.select && params.select.category) {
            return filtered.map((q) => ({ category: q.category }))
        }

        // Convert to Prisma format with includes
        return filtered.map((q) =>
            this.questionToPrismaFormat(q, params.include)
        )
    }

    async questionCount(params: any = {}): Promise<number> {
        let filtered = [...this.questions]

        if (params.where) {
            if (params.where.difficulty) {
                filtered = filtered.filter(
                    (q) => q.difficulty === params.where.difficulty
                )
            }
        }

        return filtered.length
    }

    async questionGroupBy(params: any): Promise<any[]> {
        const groups: any = {}

        this.questions.forEach((q: any) => {
            const key = params.by[0]
            if (!groups[q[key]]) {
                groups[q[key]] = 0
            }
            groups[q[key]]++
        })

        return Object.entries(groups).map(([difficulty, count]) => ({
            difficulty,
            _count: { difficulty: count },
        }))
    }

    async questionCreate(params: any): Promise<any> {
        const id = ++this.lastId.question
        const newQuestion: any = {
            id: id.toString(),
            ...params.data,
        }
        this.questions.push(newQuestion as Question)
        return { id, ...params.data }
    }

    // Hall of Fame operations
    async hallOfFameCreate(params: any): Promise<any> {
        const id = ++this.lastId.hallOfFame
        const newEntry = {
            id,
            ...params.data,
            datePlayed: new Date(),
        }
        this.hallOfFame.push(newEntry)
        return newEntry
    }

    async hallOfFameFindMany(params: any = {}): Promise<any[]> {
        let filtered = [...this.hallOfFame]

        if (params.where) {
            if (params.where.category) {
                filtered = filtered.filter(
                    (e) => e.category === params.where.category
                )
            }
            if (params.where.difficulty) {
                filtered = filtered.filter(
                    (e) => e.difficulty === params.where.difficulty
                )
            }
        }

        // Sort
        if (params.orderBy) {
            filtered.sort((a, b) => {
                if (params.orderBy[0]?.score === 'desc') {
                    return b.score - a.score
                }
                if (params.orderBy[1]?.datePlayed === 'desc') {
                    return b.datePlayed.getTime() - a.datePlayed.getTime()
                }
                return 0
            })
        }

        // Pagination
        if (params.skip) {
            filtered = filtered.slice(params.skip)
        }
        if (params.take) {
            filtered = filtered.slice(0, params.take)
        }

        return filtered
    }

    async hallOfFameFindUnique(params: any): Promise<any | null> {
        const entry = this.hallOfFame.find((e) => e.id === params.where.id)
        return entry || null
    }

    async hallOfFameCount(params: any): Promise<number> {
        let filtered = [...this.hallOfFame]

        if (params.where) {
            if (params.where.score?.gt !== undefined) {
                filtered = filtered.filter(
                    (e) => e.score > params.where.score.gt
                )
            }
            if (params.where.category) {
                filtered = filtered.filter(
                    (e) => e.category === params.where.category
                )
            }
            if (params.where.difficulty) {
                filtered = filtered.filter(
                    (e) => e.difficulty === params.where.difficulty
                )
            }
        }

        return filtered.length
    }

    // Answer and metadata operations (used by createMany)
    async answerCreateMany(params: any): Promise<any> {
        return { count: params.data.length }
    }

    async textAnswerCreate(params: any): Promise<any> {
        return { id: ++this.lastId.textAnswer, ...params.data }
    }

    async textAnswerCreateMany(params: any): Promise<any> {
        return { count: params.data.length }
    }

    async pictureMetadataCreate(params: any): Promise<any> {
        return { id: ++this.lastId.pictureMetadata, ...params.data }
    }

    // Quiz Theme operations
    async quizThemeFindMany(params: any = {}): Promise<any[]> {
        let filtered = [...this.themes]

        if (params.where) {
            if (params.where.category) {
                const categoryFilter = params.where.category
                filtered = filtered.filter((t) => t.category === categoryFilter)
            }
            if (params.where.isActive !== undefined) {
                filtered = filtered.filter(
                    (t) => t.isActive === params.where.isActive
                )
            }
        }

        // Apply orderBy
        if (params.orderBy) {
            if (Array.isArray(params.orderBy)) {
                // Multiple orderBy
                params.orderBy.forEach((order: any) => {
                    const orderKey = Object.keys(order)[0]
                    const orderDir = order[orderKey]
                    filtered.sort((a: any, b: any) => {
                        if (orderDir === 'asc') {
                            return a[orderKey] > b[orderKey] ? 1 : -1
                        } else {
                            return a[orderKey] < b[orderKey] ? 1 : -1
                        }
                    })
                })
            } else {
                const orderKey = Object.keys(params.orderBy)[0]
                const orderDir = params.orderBy[orderKey]
                filtered.sort((a: any, b: any) => {
                    if (orderDir === 'asc') {
                        return a[orderKey] > b[orderKey] ? 1 : -1
                    } else {
                        return a[orderKey] < b[orderKey] ? 1 : -1
                    }
                })
            }
        }

        return filtered.map((t) => this.themeToPrismaFormat(t))
    }

    private themeToPrismaFormat(t: QuizTheme): any {
        return {
            id: parseInt(t.id),
            themeKey: t.themeKey,
            themeName: t.themeName,
            category: t.category,
            description: t.description || null,
            icon: t.icon || null,
            isActive: t.isActive,
            createdAt: new Date(),
        }
    }

    private questionToPrismaFormat(q: Question, include: any = {}): any {
        const numericId = parseInt(q.id.replace('test-', ''))
        const base: any = {
            id: numericId,
            type: q.type,
            question: q.question,
            category: q.category,
            difficulty: q.difficulty,
            theme: q.theme || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        // Add info JSON field for picture questions
        if (q.type === 'picture') {
            const picQ = q as PictureQuestion
            base.info = JSON.stringify({ imageUrl: picQ.imageUrl })
        } else {
            base.info = null
        }

        if (include?.answers) {
            if (q.type === 'trivia' || q.type === 'picture') {
                const typedQ = q as TriviaQuestion | PictureQuestion
                base.answers = typedQ.answers.map((answer, index) => ({
                    id: numericId * 10 + index,
                    questionId: numericId,
                    answerText: answer,
                    isCorrect: index === typedQ.correct,
                    answerOrder: index,
                }))
            } else {
                base.answers = []
            }
        }

        if (include?.textAnswers) {
            if (q.type === 'question') {
                const textQ = q as any
                base.textAnswers = [
                    {
                        id: numericId * 10,
                        questionId: numericId,
                        correctAnswer: textQ.correctAnswer,
                        isPrimary: true,
                    },
                    ...(textQ.acceptableAnswers || []).map(
                        (ans: string, idx: number) => ({
                            id: numericId * 10 + idx + 1,
                            questionId: numericId,
                            correctAnswer: ans,
                            isPrimary: false,
                        })
                    ),
                ]
            } else {
                base.textAnswers = []
            }
        }

        return base
    }
}

export function createMockPrismaClient() {
    const adapter = new MockPrismaAdapter()

    return {
        question: {
            findMany: (params?: any) => adapter.questionFindMany(params),
            count: (params?: any) => adapter.questionCount(params),
            groupBy: (params: any) => adapter.questionGroupBy(params),
            create: (params: any) => adapter.questionCreate(params),
        },
        answer: {
            createMany: (params: any) => adapter.answerCreateMany(params),
        },
        textAnswer: {
            create: (params: any) => adapter.textAnswerCreate(params),
            createMany: (params: any) => adapter.textAnswerCreateMany(params),
        },
        hallOfFame: {
            create: (params: any) => adapter.hallOfFameCreate(params),
            findMany: (params?: any) => adapter.hallOfFameFindMany(params),
            findUnique: (params: any) => adapter.hallOfFameFindUnique(params),
            count: (params?: any) => adapter.hallOfFameCount(params),
        },
        quizTheme: {
            findMany: (params?: any) => adapter.quizThemeFindMany(params),
        },
    }
}

// Mock the D1 database for Prisma
export function createMockD1Database() {
    return {} as any // Prisma adapter won't actually use the D1 methods
}
