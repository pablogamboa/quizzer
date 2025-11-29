import { testQuestions, testThemes } from './fixtures/questions'
import type {
    Question,
    TriviaQuestion,
    PictureQuestion,
    QuizTheme,
} from '../../src/data/questions'

export class MockPrismaAdapter {
    private questions: Question[] = [...testQuestions]
    private themes: QuizTheme[] = [...testThemes]
    private hallOfFame: any[] = []
    private createdAnswers: Map<number, any[]> = new Map()
    private createdTextAnswers: Map<number, any[]> = new Map()
    private lastId = {
        question: 9,
        answer: 100,
        textAnswer: 100,
        pictureMetadata: 100,
        hallOfFame: 4,
        quizTheme: 2,
    }

    // Reset state for testing
    reset() {
        this.questions = [...testQuestions]
        this.themes = [...testThemes]
        this.hallOfFame = []
        this.createdAnswers = new Map()
        this.createdTextAnswers = new Map()
        this.lastId = {
            question: 9,
            answer: 100,
            textAnswer: 100,
            pictureMetadata: 100,
            hallOfFame: 4,
            quizTheme: 2,
        }
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
            if (params.where.type) {
                filtered = filtered.filter((q) => q.type === params.where.type)
            }
            if (params.where.question?.contains) {
                const search = params.where.question.contains.toLowerCase()
                filtered = filtered.filter((q) =>
                    q.question.toLowerCase().includes(search)
                )
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
                const aVal = parseInt(a.id.replace('test-', ''))
                const bVal = parseInt(b.id.replace('test-', ''))
                if (orderKey === 'id') {
                    if (orderDir === 'asc') {
                        return aVal - bVal
                    } else {
                        return bVal - aVal
                    }
                }
                if (orderDir === 'asc') {
                    return (a as any)[orderKey] > (b as any)[orderKey] ? 1 : -1
                } else {
                    return (a as any)[orderKey] < (b as any)[orderKey] ? 1 : -1
                }
            })
        }

        // Apply pagination (skip/take)
        if (params.skip !== undefined || params.take !== undefined) {
            const skip = params.skip || 0
            const take =
                params.take !== undefined ? params.take : filtered.length
            filtered = filtered.slice(skip, skip + take)
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
            if (params.where.category) {
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
            if (params.where.type) {
                filtered = filtered.filter((q) => q.type === params.where.type)
            }
            if (params.where.theme) {
                filtered = filtered.filter(
                    (q) => q.theme === params.where.theme
                )
            }
            if (params.where.question?.contains) {
                const search = params.where.question.contains.toLowerCase()
                filtered = filtered.filter((q) =>
                    q.question.toLowerCase().includes(search)
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
        // Create a new question and add it to the questions array
        const newQuestion: any = {
            id: `test-${id}`,
            type: params.data.type,
            question: params.data.question,
            category: params.data.category,
            difficulty: params.data.difficulty,
            theme: params.data.theme || undefined,
        }
        // Store the question for later retrieval
        this.questions.push(newQuestion)

        // Return the basic question data - answers are added separately via createMany
        return {
            id,
            type: params.data.type,
            question: params.data.question,
            category: params.data.category,
            difficulty: params.data.difficulty,
            theme: params.data.theme || null,
            info: params.data.info || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }

    async questionFindUnique(params: any): Promise<any | null> {
        const id = params.where.id
        const question = this.questions.find(
            (q) => parseInt(q.id.replace('test-', '')) === id
        )
        if (!question) return null

        // Check if we have dynamically created answers for this question
        const createdAnswers = this.createdAnswers.get(id)
        const createdTextAnswers = this.createdTextAnswers.get(id)

        // If we have created answers/text answers, build a custom response
        if (createdAnswers || createdTextAnswers) {
            const base = this.questionToPrismaFormat(question, {})
            if (params.include?.answers && createdAnswers) {
                base.answers = createdAnswers.map((a: any, index: number) => ({
                    id: id * 10 + index,
                    questionId: id,
                    answerText: a.answerText,
                    isCorrect: a.isCorrect,
                    answerOrder: a.answerOrder,
                }))
            }
            if (params.include?.textAnswers && createdTextAnswers) {
                base.textAnswers = createdTextAnswers.map(
                    (a: any, index: number) => ({
                        id: id * 10 + index,
                        questionId: id,
                        correctAnswer: a.correctAnswer,
                        isPrimary: a.isPrimary,
                    })
                )
            }
            return base
        }

        return this.questionToPrismaFormat(question, params.include || {})
    }

    async questionUpdate(params: any): Promise<any> {
        const id = params.where.id
        const index = this.questions.findIndex(
            (q) => parseInt(q.id.replace('test-', '')) === id
        )
        if (index === -1) throw new Error('Question not found')

        // Update the question
        const existing = this.questions[index]
        this.questions[index] = {
            ...existing,
            ...params.data,
            id: existing.id, // Keep the original id
        } as Question

        return this.questionToPrismaFormat(this.questions[index], {
            answers: true,
            textAnswers: true,
        })
    }

    async questionDelete(params: any): Promise<any> {
        const id = params.where.id
        const index = this.questions.findIndex(
            (q) => parseInt(q.id.replace('test-', '')) === id
        )
        if (index === -1) throw new Error('Question not found')

        const deleted = this.questions.splice(index, 1)[0]
        return this.questionToPrismaFormat(deleted, {})
    }

    async questionDeleteMany(params: any): Promise<{ count: number }> {
        if (params.where?.id?.in) {
            const ids = params.where.id.in
            const initialCount = this.questions.length
            this.questions = this.questions.filter(
                (q) => !ids.includes(parseInt(q.id.replace('test-', '')))
            )
            return { count: initialCount - this.questions.length }
        }
        return { count: 0 }
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

    async hallOfFameCount(params: any = {}): Promise<number> {
        let filtered = [...this.hallOfFame]

        if (params?.where) {
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
        // Store answers keyed by questionId for retrieval in findUnique
        if (params.data && params.data.length > 0) {
            const questionId = params.data[0].questionId
            this.createdAnswers.set(questionId, params.data)
        }
        return { count: params.data.length }
    }

    async answerDeleteMany(params: any): Promise<{ count: number }> {
        if (params.where?.questionId) {
            this.createdAnswers.delete(params.where.questionId)
        }
        return { count: params.where?.questionId ? 4 : 0 }
    }

    async textAnswerCreate(params: any): Promise<any> {
        const questionId = params.data.questionId
        const existing = this.createdTextAnswers.get(questionId) || []
        existing.push({ id: ++this.lastId.textAnswer, ...params.data })
        this.createdTextAnswers.set(questionId, existing)
        return { id: this.lastId.textAnswer, ...params.data }
    }

    async textAnswerCreateMany(params: any): Promise<any> {
        // Store text answers keyed by questionId
        if (params.data && params.data.length > 0) {
            const questionId = params.data[0].questionId
            const existing = this.createdTextAnswers.get(questionId) || []
            existing.push(...params.data)
            this.createdTextAnswers.set(questionId, existing)
        }
        return { count: params.data.length }
    }

    async textAnswerDeleteMany(params: any): Promise<{ count: number }> {
        if (params.where?.questionId) {
            this.createdTextAnswers.delete(params.where.questionId)
        }
        return { count: params.where?.questionId ? 1 : 0 }
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

    async quizThemeFindUnique(params: any): Promise<any | null> {
        const id = params.where.id
        const theme = this.themes.find((t) => parseInt(t.id) === id)
        if (!theme) return null
        return this.themeToPrismaFormat(theme)
    }

    async quizThemeCount(params: any = {}): Promise<number> {
        let filtered = [...this.themes]
        if (params.where?.isActive !== undefined) {
            filtered = filtered.filter(
                (t) => t.isActive === params.where.isActive
            )
        }
        return filtered.length
    }

    async quizThemeCreate(params: any): Promise<any> {
        const id = ++this.lastId.quizTheme
        const newTheme: QuizTheme = {
            id: id.toString(),
            themeKey: params.data.themeKey,
            themeName: params.data.themeName,
            category: params.data.category,
            description: params.data.description || undefined,
            icon: params.data.icon || undefined,
            isActive:
                params.data.isActive !== undefined
                    ? params.data.isActive
                    : true,
        }
        this.themes.push(newTheme)
        return this.themeToPrismaFormat(newTheme)
    }

    async quizThemeUpdate(params: any): Promise<any> {
        const id = params.where.id
        const index = this.themes.findIndex((t) => parseInt(t.id) === id)
        if (index === -1) throw new Error('Theme not found')

        const existing = this.themes[index]
        this.themes[index] = {
            ...existing,
            ...params.data,
            id: existing.id, // Keep the original id
        }
        return this.themeToPrismaFormat(this.themes[index])
    }

    async quizThemeDelete(params: any): Promise<any> {
        const id = params.where.id
        const index = this.themes.findIndex((t) => parseInt(t.id) === id)
        if (index === -1) throw new Error('Theme not found')

        const deleted = this.themes.splice(index, 1)[0]
        return this.themeToPrismaFormat(deleted)
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
            findUnique: (params: any) => adapter.questionFindUnique(params),
            count: (params?: any) => adapter.questionCount(params),
            groupBy: (params: any) => adapter.questionGroupBy(params),
            create: (params: any) => adapter.questionCreate(params),
            update: (params: any) => adapter.questionUpdate(params),
            delete: (params: any) => adapter.questionDelete(params),
            deleteMany: (params: any) => adapter.questionDeleteMany(params),
        },
        answer: {
            createMany: (params: any) => adapter.answerCreateMany(params),
            deleteMany: (params: any) => adapter.answerDeleteMany(params),
        },
        textAnswer: {
            create: (params: any) => adapter.textAnswerCreate(params),
            createMany: (params: any) => adapter.textAnswerCreateMany(params),
            deleteMany: (params: any) => adapter.textAnswerDeleteMany(params),
        },
        hallOfFame: {
            create: (params: any) => adapter.hallOfFameCreate(params),
            findMany: (params?: any) => adapter.hallOfFameFindMany(params),
            findUnique: (params: any) => adapter.hallOfFameFindUnique(params),
            count: (params?: any) => adapter.hallOfFameCount(params),
        },
        quizTheme: {
            findMany: (params?: any) => adapter.quizThemeFindMany(params),
            findUnique: (params: any) => adapter.quizThemeFindUnique(params),
            count: (params?: any) => adapter.quizThemeCount(params),
            create: (params: any) => adapter.quizThemeCreate(params),
            update: (params: any) => adapter.quizThemeUpdate(params),
            delete: (params: any) => adapter.quizThemeDelete(params),
        },
        // Expose reset for testing
        _adapter: adapter,
    }
}

// Mock the D1 database for Prisma
export function createMockD1Database() {
    return {} as any // Prisma adapter won't actually use the D1 methods
}
