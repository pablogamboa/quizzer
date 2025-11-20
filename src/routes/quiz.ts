import { Hono } from 'hono'
import { Env } from '../index'
import { QuestionService } from '../services/database'
import {
    TriviaQuestion,
    FreeTextQuestion,
    PictureQuestion,
} from '../data/questions'

export const quizRoutes = new Hono<{ Bindings: Env }>()

// Get all questions (without correct answers for security)
quizRoutes.get('/questions', async (c) => {
    try {
        const service = new QuestionService(c.env.DB)
        const questions = await service.getAllQuestions()

        const questionsWithoutAnswers = questions.map((q) => {
            if (q.type === 'trivia' || q.type === 'picture') {
                const { correct, ...rest } = q
                return rest
            } else if (q.type === 'question') {
                const { correctAnswer, acceptableAnswers, ...rest } = q
                // Add answerType hint based on the correctAnswer
                const answerType =
                    !isNaN(Number(correctAnswer)) && correctAnswer.trim() !== ''
                        ? 'number'
                        : 'text'
                return { ...rest, answerType }
            }
            return q
        })

        return c.json({
            success: true,
            data: questionsWithoutAnswers,
        })
    } catch (error) {
        console.error('Error fetching questions:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch questions',
            },
            500
        )
    }
})

// Get a random set of questions
quizRoutes.get('/questions/random/:count', async (c) => {
    try {
        const count = parseInt(c.req.param('count')) || 10
        const service = new QuestionService(c.env.DB)
        const selectedQuestions = await service.getRandomQuestions(count)

        // Remove correct answers from response
        const questionsWithoutAnswers = selectedQuestions.map((q) => {
            if (q.type === 'trivia' || q.type === 'picture') {
                const { correct, ...rest } = q
                return rest
            } else if (q.type === 'question') {
                const { correctAnswer, acceptableAnswers, ...rest } = q
                // Add answerType hint based on the correctAnswer
                const answerType =
                    !isNaN(Number(correctAnswer)) && correctAnswer.trim() !== ''
                        ? 'number'
                        : 'text'
                return { ...rest, answerType }
            }
            return q
        })

        return c.json({
            success: true,
            data: questionsWithoutAnswers,
            total: selectedQuestions.length,
        })
    } catch (error) {
        console.error('Error fetching random questions:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch questions',
            },
            500
        )
    }
})

// Get questions by category
quizRoutes.get('/questions/category/:category', async (c) => {
    try {
        const category = c.req.param('category')
        const service = new QuestionService(c.env.DB)
        const filteredQuestions = await service.getQuestionsByCategory(category)

        if (filteredQuestions.length === 0) {
            return c.json(
                {
                    success: false,
                    error: 'Category not found',
                },
                404
            )
        }

        const questionsWithoutAnswers = filteredQuestions.map((q) => {
            if (q.type === 'trivia' || q.type === 'picture') {
                const { correct, ...rest } = q
                return rest
            } else if (q.type === 'question') {
                const { correctAnswer, acceptableAnswers, ...rest } = q
                // Add answerType hint based on the correctAnswer
                const answerType =
                    !isNaN(Number(correctAnswer)) && correctAnswer.trim() !== ''
                        ? 'number'
                        : 'text'
                return { ...rest, answerType }
            }
            return q
        })

        return c.json({
            success: true,
            data: questionsWithoutAnswers,
            category: category,
        })
    } catch (error) {
        console.error('Error fetching questions by category:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch questions',
            },
            500
        )
    }
})

// Get questions by difficulty
quizRoutes.get('/questions/difficulty/:level', async (c) => {
    try {
        const level = c.req.param('level') as 'easy' | 'medium' | 'hard'
        const service = new QuestionService(c.env.DB)
        const filteredQuestions = await service.getQuestionsByDifficulty(level)

        if (filteredQuestions.length === 0) {
            return c.json(
                {
                    success: false,
                    error: 'Difficulty level not found',
                },
                404
            )
        }

        const questionsWithoutAnswers = filteredQuestions.map((q) => {
            if (q.type === 'trivia' || q.type === 'picture') {
                const { correct, ...rest } = q
                return rest
            } else if (q.type === 'question') {
                const { correctAnswer, acceptableAnswers, ...rest } = q
                // Add answerType hint based on the correctAnswer
                const answerType =
                    !isNaN(Number(correctAnswer)) && correctAnswer.trim() !== ''
                        ? 'number'
                        : 'text'
                return { ...rest, answerType }
            }
            return q
        })

        return c.json({
            success: true,
            data: questionsWithoutAnswers,
            difficulty: level,
        })
    } catch (error) {
        console.error('Error fetching questions by difficulty:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch questions',
            },
            500
        )
    }
})

// Submit answers and get score
quizRoutes.post('/submit', async (c) => {
    try {
        const body = await c.req.json()
        const { answers, playerName, category, difficulty, timeTaken } = body // Expected format: [{ questionId: string, selectedAnswer?: number, textAnswer?: string }]

        if (!Array.isArray(answers)) {
            return c.json(
                {
                    success: false,
                    error: 'Invalid answers format',
                },
                400
            )
        }

        let score = 0
        const results = []

        const service = new QuestionService(c.env.DB)
        const allQuestions = await service.getAllQuestions()

        for (const answer of answers) {
            const question = allQuestions.find(
                (q) => q.id === answer.questionId
            )
            if (question) {
                let isCorrect = false
                let explanation = ''
                let correctAnswer: string | number = ''

                if (question.type === 'trivia' || question.type === 'picture') {
                    const triviaQuestion = question as
                        | TriviaQuestion
                        | PictureQuestion
                    isCorrect = triviaQuestion.correct === answer.selectedAnswer
                    correctAnswer = triviaQuestion.correct
                    explanation = `The correct answer is: ${triviaQuestion.answers[triviaQuestion.correct]}`
                } else if (question.type === 'question') {
                    const textQuestion = question as FreeTextQuestion
                    const userAnswer = (answer.textAnswer || '')
                        .trim()
                        .toLowerCase()
                    const correctAnswerLower =
                        textQuestion.correctAnswer.toLowerCase()
                    const acceptableAnswers =
                        textQuestion.acceptableAnswers?.map((a) =>
                            a.toLowerCase()
                        ) || []

                    isCorrect =
                        userAnswer === correctAnswerLower ||
                        acceptableAnswers.includes(userAnswer)
                    correctAnswer = textQuestion.correctAnswer
                    explanation = `The correct answer is: ${textQuestion.correctAnswer}`
                }

                if (isCorrect) score++

                results.push({
                    questionId: answer.questionId,
                    question: question.question,
                    questionType: question.type,
                    selectedAnswer: answer.selectedAnswer ?? answer.textAnswer,
                    correctAnswer,
                    isCorrect,
                    explanation,
                })
            }
        }

        const percentage = Math.round((score / answers.length) * 100)

        // Save to hall of fame if player name is provided
        let hallOfFameId = null
        if (playerName) {
            try {
                hallOfFameId = await service.saveHallOfFameEntry({
                    playerName,
                    score,
                    totalQuestions: answers.length,
                    category: category || null,
                    difficulty: difficulty || null,
                    timeTakenSeconds: timeTaken || null,
                })
            } catch (error) {
                console.error('Error saving to hall of fame:', error)
                // Don't fail the whole request if hall of fame save fails
            }
        }

        return c.json({
            success: true,
            data: {
                score,
                total: answers.length,
                percentage,
                results,
                hallOfFameId,
            },
        })
    } catch (error) {
        return c.json(
            {
                success: false,
                error: 'Invalid request body',
            },
            400
        )
    }
})

// Get available categories
quizRoutes.get('/categories', async (c) => {
    try {
        const service = new QuestionService(c.env.DB)
        const categories = await service.getCategories()
        return c.json({
            success: true,
            data: categories,
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch categories',
            },
            500
        )
    }
})

// Get quiz statistics
quizRoutes.get('/stats', async (c) => {
    try {
        const service = new QuestionService(c.env.DB)
        const stats = await service.getStats()
        return c.json({
            success: true,
            data: stats,
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch statistics',
            },
            500
        )
    }
})

// Get hall of fame entries
quizRoutes.get('/hall-of-fame', async (c) => {
    try {
        const url = new URL(c.req.url)
        const category = url.searchParams.get('category')
        const difficulty = url.searchParams.get('difficulty')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        const service = new QuestionService(c.env.DB)
        const results = await service.getHallOfFame({
            category,
            difficulty,
            limit,
            offset,
        })

        return c.json({
            success: true,
            data: results,
            meta: {
                limit,
                offset,
                total: results.length,
            },
        })
    } catch (error) {
        console.error('Error fetching hall of fame:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch hall of fame entries',
            },
            500
        )
    }
})

// Get a specific hall of fame entry
quizRoutes.get('/hall-of-fame/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))

        const service = new QuestionService(c.env.DB)
        const result = await service.getHallOfFameEntry(id)

        if (!result) {
            return c.json(
                {
                    success: false,
                    error: 'Entry not found',
                },
                404
            )
        }

        return c.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('Error fetching hall of fame entry:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch hall of fame entry',
            },
            500
        )
    }
})

// Get all active themes
quizRoutes.get('/themes', async (c) => {
    try {
        const service = new QuestionService(c.env.DB)
        const themes = await service.getActiveThemes()
        return c.json({
            success: true,
            data: themes,
        })
    } catch (error) {
        console.error('Error fetching themes:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch themes',
            },
            500
        )
    }
})

// Get themes for a specific category
quizRoutes.get('/themes/category/:category', async (c) => {
    try {
        const category = c.req.param('category')
        const service = new QuestionService(c.env.DB)
        const themes = await service.getThemesByCategory(category)
        return c.json({
            success: true,
            data: themes,
            category: category,
        })
    } catch (error) {
        console.error('Error fetching themes by category:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch themes',
            },
            500
        )
    }
})

// Get random questions for a specific theme
quizRoutes.get('/questions/theme/:theme/random/:count', async (c) => {
    try {
        const theme = c.req.param('theme')
        const count = parseInt(c.req.param('count')) || 10
        const service = new QuestionService(c.env.DB)
        const questions = await service.getRandomQuestionsByTheme(theme, count)

        if (questions.length === 0) {
            return c.json(
                {
                    success: false,
                    error: 'No questions found for this theme',
                },
                404
            )
        }

        // Remove correct answers from response
        const questionsWithoutAnswers = questions.map((q) => {
            if (q.type === 'trivia' || q.type === 'picture') {
                const { correct, ...rest } = q
                return rest
            } else if (q.type === 'question') {
                const { correctAnswer, acceptableAnswers, ...rest } = q
                // Add answerType hint based on the correctAnswer
                const answerType =
                    !isNaN(Number(correctAnswer)) && correctAnswer.trim() !== ''
                        ? 'number'
                        : 'text'
                return { ...rest, answerType }
            }
            return q
        })

        return c.json({
            success: true,
            data: questionsWithoutAnswers,
            theme: theme,
            total: questions.length,
        })
    } catch (error) {
        console.error('Error fetching questions by theme:', error)
        return c.json(
            {
                success: false,
                error: 'Failed to fetch questions',
            },
            500
        )
    }
})
