import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import {
    Question,
    TriviaQuestion,
    FreeTextQuestion,
    PictureQuestion,
    QuizTheme,
} from '../data/questions'

export class QuestionService {
    private prisma: any

    constructor(db: D1Database | any, mockPrisma?: any) {
        // Check if we have a mock Prisma client (for testing)
        if (mockPrisma) {
            this.prisma = mockPrisma
        } else if (db && (db as any).__mockPrisma) {
            // Use mock Prisma attached to DB object (for testing)
            this.prisma = (db as any).__mockPrisma
        } else {
            // Production: use real Prisma with D1 adapter
            try {
                const adapter = new PrismaD1(db as D1Database)
                this.prisma = new PrismaClient({ adapter: adapter as any })
            } catch (error) {
                console.error(
                    'Error initializing Prisma with D1 adapter:',
                    error
                )
                throw error
            }
        }
    }

    async getAllQuestions(): Promise<Question[]> {
        const questions = await this.prisma.question.findMany({
            include: {
                answers: {
                    orderBy: {
                        answerOrder: 'asc',
                    },
                },
                textAnswers: true,
            },
            orderBy: {
                id: 'asc',
            },
        })

        return questions.map((q: any) => this.buildQuestion(q))
    }

    async getRandomQuestions(count: number): Promise<Question[]> {
        // SQLite doesn't support RANDOM() in Prisma's orderBy yet, so we'll fetch all and shuffle
        const allQuestions = await this.prisma.question.findMany({
            include: {
                answers: {
                    orderBy: {
                        answerOrder: 'asc',
                    },
                },
                textAnswers: true,
            },
        })

        // Shuffle using Fisher-Yates algorithm
        const shuffled = [...allQuestions]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        return shuffled.slice(0, count).map((q) => this.buildQuestion(q))
    }

    async getQuestionsByCategory(category: string): Promise<Question[]> {
        const questions = await this.prisma.question.findMany({
            where: {
                category: {
                    equals: category,
                    mode: 'insensitive',
                },
            },
            include: {
                answers: {
                    orderBy: {
                        answerOrder: 'asc',
                    },
                },
                textAnswers: true,
            },
            orderBy: {
                id: 'asc',
            },
        })

        return questions.map((q: any) => this.buildQuestion(q))
    }

    async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
        const questions = await this.prisma.question.findMany({
            where: {
                difficulty,
            },
            include: {
                answers: {
                    orderBy: {
                        answerOrder: 'asc',
                    },
                },
                textAnswers: true,
            },
            orderBy: {
                id: 'asc',
            },
        })

        return questions.map((q: any) => this.buildQuestion(q))
    }

    async getCategories(): Promise<string[]> {
        const categories = await this.prisma.question.findMany({
            select: {
                category: true,
            },
            distinct: ['category'],
            orderBy: {
                category: 'asc',
            },
        })

        return categories.map((c: { category: any }) => c.category)
    }

    async getStats(): Promise<any> {
        const [total, categoryCount, difficultyStats] = await Promise.all([
            this.prisma.question.count(),
            this.prisma.question.findMany({
                select: {
                    category: true,
                },
                distinct: ['category'],
            }),
            this.prisma.question.groupBy({
                by: ['difficulty'],
                _count: {
                    difficulty: true,
                },
            }),
        ])

        const difficulties: any = {
            easy: 0,
            medium: 0,
            hard: 0,
        }

        for (const stat of difficultyStats) {
            difficulties[stat.difficulty] = stat._count.difficulty
        }

        return {
            totalQuestions: total,
            categories: categoryCount.length,
            difficulties,
        }
    }

    private buildQuestion(row: any): Question {
        const baseQuestion = {
            id: row.id.toString(),
            question: row.question,
            category: row.category,
            difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
            theme: row.theme || undefined,
        }

        if (row.type === 'trivia') {
            const correctIndex = row.answers.findIndex((a: any) => a.isCorrect)

            return {
                ...baseQuestion,
                type: 'trivia',
                answers: row.answers.map((a: any) => a.answerText),
                correct: correctIndex >= 0 ? correctIndex : 0,
            } as TriviaQuestion
        } else if (row.type === 'question') {
            const primary = row.textAnswers.find((a: any) => a.isPrimary)
            const acceptable = row.textAnswers.filter((a: any) => !a.isPrimary)

            return {
                ...baseQuestion,
                type: 'question',
                correctAnswer: primary?.correctAnswer || '',
                acceptableAnswers: acceptable.map((a: any) => a.correctAnswer),
            } as FreeTextQuestion
        } else if (row.type === 'picture') {
            const correctIndex = row.answers.findIndex((a: any) => a.isCorrect)

            // Parse info JSON field to get imageUrl
            let imageUrl = ''
            if (row.info) {
                try {
                    const info = JSON.parse(row.info)
                    imageUrl = info.imageUrl || ''
                } catch (e) {
                    console.error('Error parsing question info JSON:', e)
                }
            }

            return {
                ...baseQuestion,
                type: 'picture',
                imageUrl,
                answers: row.answers.map((a: any) => a.answerText),
                correct: correctIndex >= 0 ? correctIndex : 0,
            } as PictureQuestion
        }

        throw new Error(`Unknown question type: ${row.type}`)
    }

    async addQuestion(question: Omit<Question, 'id'>): Promise<number> {
        // Prepare info JSON for picture questions
        let info: string | undefined = undefined
        if (question.type === 'picture') {
            const pq = question as PictureQuestion
            info = JSON.stringify({ imageUrl: pq.imageUrl })
        }

        const createdQuestion = await this.prisma.question.create({
            data: {
                type: question.type,
                question: question.question,
                category: question.category,
                difficulty: question.difficulty,
                info,
            },
        })

        const questionId = createdQuestion.id

        // Handle different question types
        if (question.type === 'trivia' || question.type === 'picture') {
            const q = question as TriviaQuestion | PictureQuestion

            // Insert answers
            await this.prisma.answer.createMany({
                data: q.answers.map((answer, i) => ({
                    questionId,
                    answerText: answer,
                    isCorrect: i === q.correct,
                    answerOrder: i,
                })),
            })
        } else if (question.type === 'question') {
            const q = question as FreeTextQuestion

            // Insert primary answer
            await this.prisma.textAnswer.create({
                data: {
                    questionId,
                    correctAnswer: q.correctAnswer,
                    isPrimary: true,
                },
            })

            // Insert acceptable answers
            if (q.acceptableAnswers && q.acceptableAnswers.length > 0) {
                await this.prisma.textAnswer.createMany({
                    data: q.acceptableAnswers.map((answer) => ({
                        questionId,
                        correctAnswer: answer,
                        isPrimary: false,
                    })),
                })
            }
        }

        return questionId
    }

    async saveHallOfFameEntry(data: {
        playerName: string
        score: number
        totalQuestions: number
        category?: string | null
        difficulty?: string | null
        timeTakenSeconds?: number | null
    }): Promise<number> {
        const entry = await this.prisma.hallOfFame.create({
            data: {
                playerName: data.playerName,
                score: data.score,
                totalQuestions: data.totalQuestions,
                category: data.category || null,
                difficulty: data.difficulty || null,
                timeTakenSeconds: data.timeTakenSeconds || null,
            },
        })

        return entry.id
    }

    async getHallOfFame(params: {
        category?: string | null
        difficulty?: string | null
        limit?: number
        offset?: number
    }): Promise<any[]> {
        const { category, difficulty, limit = 20, offset = 0 } = params

        const where: any = {}
        if (category) where.category = category
        if (difficulty) where.difficulty = difficulty

        const entries = await this.prisma.hallOfFame.findMany({
            where,
            orderBy: [
                {
                    score: 'desc',
                },
                {
                    datePlayed: 'desc',
                },
            ],
            take: limit,
            skip: offset,
        })

        // Calculate percentage_correct manually since it's a computed column in SQL
        // Transform to snake_case for frontend compatibility
        return entries.map((entry) => ({
            id: entry.id,
            player_name: entry.playerName,
            score: entry.score,
            total_questions: entry.totalQuestions,
            category: entry.category,
            difficulty: entry.difficulty,
            date_played: entry.datePlayed,
            time_taken_seconds: entry.timeTakenSeconds,
            percentage_correct: (entry.score / entry.totalQuestions) * 100,
        }))
    }

    async getActiveThemes(): Promise<QuizTheme[]> {
        const themes = await this.prisma.quizTheme.findMany({
            where: {
                isActive: true,
            },
            orderBy: [
                {
                    category: 'asc',
                },
                {
                    themeName: 'asc',
                },
            ],
        })

        return themes.map((t: any) => ({
            id: t.id.toString(),
            themeKey: t.themeKey,
            themeName: t.themeName,
            category: t.category,
            description: t.description || undefined,
            icon: t.icon || undefined,
            isActive: t.isActive,
        }))
    }

    async getThemesByCategory(category: string): Promise<QuizTheme[]> {
        const themes = await this.prisma.quizTheme.findMany({
            where: {
                category: category,
                isActive: true,
            },
            orderBy: {
                themeName: 'asc',
            },
        })

        return themes.map((t: any) => ({
            id: t.id.toString(),
            themeKey: t.themeKey,
            themeName: t.themeName,
            category: t.category,
            description: t.description || undefined,
            icon: t.icon || undefined,
            isActive: t.isActive,
        }))
    }

    async getQuestionsByTheme(theme: string): Promise<Question[]> {
        const questions = await this.prisma.question.findMany({
            where: {
                theme: theme,
            },
            include: {
                answers: {
                    orderBy: {
                        answerOrder: 'asc',
                    },
                },
                textAnswers: true,
            },
            orderBy: {
                id: 'asc',
            },
        })

        return questions.map((q: any) => this.buildQuestion(q))
    }

    async getRandomQuestionsByTheme(
        theme: string,
        count: number
    ): Promise<Question[]> {
        const allQuestions = await this.prisma.question.findMany({
            where: {
                theme: theme,
            },
            include: {
                answers: {
                    orderBy: {
                        answerOrder: 'asc',
                    },
                },
                textAnswers: true,
            },
        })

        // Shuffle using Fisher-Yates algorithm
        const shuffled = [...allQuestions]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        return shuffled.slice(0, count).map((q) => this.buildQuestion(q))
    }

    async getHallOfFameEntry(
        id: number
    ): Promise<{ entry: any; rank: number; similarAttempts: any[] } | null> {
        const entry = await this.prisma.hallOfFame.findUnique({
            where: { id },
        })

        if (!entry) {
            return null
        }

        const percentageCorrect = (entry.score / entry.totalQuestions) * 100

        // Get similar attempts
        const where: any = {
            id: {
                not: id,
            },
            totalQuestions: entry.totalQuestions,
        }

        if (entry.category) where.category = entry.category
        if (entry.difficulty) where.difficulty = entry.difficulty

        const similarAttempts = await this.prisma.hallOfFame.findMany({
            where,
            orderBy: {
                score: 'desc',
            },
            take: 10,
        })

        // Calculate rank
        const rankWhere: any = {}
        if (entry.category) rankWhere.category = entry.category
        if (entry.difficulty) rankWhere.difficulty = entry.difficulty

        const betterScores = await this.prisma.hallOfFame.count({
            where: {
                ...rankWhere,
                score: {
                    gt: entry.score,
                },
            },
        })

        const rank = betterScores + 1

        return {
            entry: {
                id: entry.id,
                player_name: entry.playerName,
                score: entry.score,
                total_questions: entry.totalQuestions,
                category: entry.category,
                difficulty: entry.difficulty,
                date_played: entry.datePlayed,
                time_taken_seconds: entry.timeTakenSeconds,
                percentage_correct: percentageCorrect,
            },
            rank,
            similarAttempts: similarAttempts.map((a) => ({
                id: a.id,
                player_name: a.playerName,
                score: a.score,
                total_questions: a.totalQuestions,
                category: a.category,
                difficulty: a.difficulty,
                date_played: a.datePlayed,
                time_taken_seconds: a.timeTakenSeconds,
                percentage_correct: (a.score / a.totalQuestions) * 100,
            })),
        }
    }
}
