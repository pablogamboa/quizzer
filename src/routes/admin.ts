import { Hono } from 'hono'
import { QuestionService } from '../services/database'
import { ImageService } from '../services/images'
import type { Env } from '../index'

// Extend Env type with admin-specific bindings
type AdminEnv = Env & {
    IMAGES: R2Bucket
    R2_PUBLIC_URL?: string
    ADMIN_USERNAME?: string
    ADMIN_PASSWORD?: string
}

export const adminRoutes = new Hono<{ Bindings: AdminEnv }>()

// ============================================
// Stats
// ============================================

adminRoutes.get('/stats', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const stats = await questionService.getAdminStats()
        return c.json(stats)
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return c.json({ error: 'Failed to fetch stats' }, 500)
    }
})

// ============================================
// Questions CRUD
// ============================================

// List questions (paginated)
adminRoutes.get('/questions', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )

        const filters = {
            category: c.req.query('category'),
            difficulty: c.req.query('difficulty'),
            type: c.req.query('type'),
            theme: c.req.query('theme'),
            search: c.req.query('search'),
            page: parseInt(c.req.query('page') || '1'),
            pageSize: parseInt(c.req.query('pageSize') || '25'),
        }

        const result = await questionService.getPaginatedQuestions(filters)
        return c.json(result)
    } catch (error) {
        console.error('Error fetching questions:', error)
        return c.json({ error: 'Failed to fetch questions' }, 500)
    }
})

// Get single question
adminRoutes.get('/questions/:id', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const id = parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid question ID' }, 400)
        }

        const question = await questionService.getQuestionById(id)

        if (!question) {
            return c.json({ error: 'Question not found' }, 404)
        }

        return c.json(question)
    } catch (error) {
        console.error('Error fetching question:', error)
        return c.json({ error: 'Failed to fetch question' }, 500)
    }
})

// Create question
adminRoutes.post('/questions', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const data = await c.req.json()

        // Basic validation
        if (
            !data.type ||
            !data.question ||
            !data.category ||
            !data.difficulty
        ) {
            return c.json(
                {
                    error: 'Missing required fields: type, question, category, difficulty',
                },
                400
            )
        }

        if (!['trivia', 'question', 'picture'].includes(data.type)) {
            return c.json({ error: 'Invalid question type' }, 400)
        }

        if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
            return c.json({ error: 'Invalid difficulty level' }, 400)
        }

        // Type-specific validation
        if (data.type === 'trivia' || data.type === 'picture') {
            if (
                !data.answers ||
                !Array.isArray(data.answers) ||
                data.answers.length !== 4
            ) {
                return c.json(
                    {
                        error: 'Trivia/Picture questions require exactly 4 answers',
                    },
                    400
                )
            }
            if (
                typeof data.correct !== 'number' ||
                data.correct < 0 ||
                data.correct > 3
            ) {
                return c.json(
                    { error: 'Invalid correct answer index (must be 0-3)' },
                    400
                )
            }
            if (data.type === 'picture' && !data.imageUrl) {
                return c.json(
                    { error: 'Picture questions require an imageUrl' },
                    400
                )
            }
        } else if (data.type === 'question') {
            if (!data.correctAnswer) {
                return c.json(
                    { error: 'Text questions require a correctAnswer' },
                    400
                )
            }
        }

        const question = await questionService.createQuestion(data)
        return c.json(question, 201)
    } catch (error) {
        console.error('Error creating question:', error)
        return c.json({ error: 'Failed to create question' }, 500)
    }
})

// Update question
adminRoutes.put('/questions/:id', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const id = parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid question ID' }, 400)
        }

        const existing = await questionService.getQuestionById(id)
        if (!existing) {
            return c.json({ error: 'Question not found' }, 404)
        }

        const data = await c.req.json()

        // Validation
        if (
            data.type &&
            !['trivia', 'question', 'picture'].includes(data.type)
        ) {
            return c.json({ error: 'Invalid question type' }, 400)
        }

        if (
            data.difficulty &&
            !['easy', 'medium', 'hard'].includes(data.difficulty)
        ) {
            return c.json({ error: 'Invalid difficulty level' }, 400)
        }

        const question = await questionService.updateQuestion(id, data)
        return c.json(question)
    } catch (error) {
        console.error('Error updating question:', error)
        return c.json({ error: 'Failed to update question' }, 500)
    }
})

// Bulk delete questions (must be before :id route to avoid matching "bulk" as id)
adminRoutes.delete('/questions/bulk', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const { ids } = await c.req.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return c.json({ error: 'Missing or invalid ids array' }, 400)
        }

        const deletedCount = await questionService.bulkDeleteQuestions(ids)
        return c.json({ success: true, deletedCount })
    } catch (error) {
        console.error('Error bulk deleting questions:', error)
        return c.json({ error: 'Failed to bulk delete questions' }, 500)
    }
})

// Delete question
adminRoutes.delete('/questions/:id', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const id = parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid question ID' }, 400)
        }

        const existing = await questionService.getQuestionById(id)
        if (!existing) {
            return c.json({ error: 'Question not found' }, 404)
        }

        await questionService.deleteQuestion(id)
        return c.json({ success: true })
    } catch (error) {
        console.error('Error deleting question:', error)
        return c.json({ error: 'Failed to delete question' }, 500)
    }
})

// ============================================
// Themes CRUD
// ============================================

// List all themes
adminRoutes.get('/themes', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const themes = await questionService.getAllThemes()

        // Get question counts for each theme
        const themesWithCounts = await Promise.all(
            themes.map(async (theme) => {
                const questionCount =
                    await questionService.getThemeQuestionCount(theme.themeKey)
                return { ...theme, questionCount }
            })
        )

        return c.json(themesWithCounts)
    } catch (error) {
        console.error('Error fetching themes:', error)
        return c.json({ error: 'Failed to fetch themes' }, 500)
    }
})

// Get single theme
adminRoutes.get('/themes/:id', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const id = parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid theme ID' }, 400)
        }

        const theme = await questionService.getThemeById(id)

        if (!theme) {
            return c.json({ error: 'Theme not found' }, 404)
        }

        const questionCount = await questionService.getThemeQuestionCount(
            theme.themeKey
        )
        return c.json({ ...theme, questionCount })
    } catch (error) {
        console.error('Error fetching theme:', error)
        return c.json({ error: 'Failed to fetch theme' }, 500)
    }
})

// Create theme
adminRoutes.post('/themes', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const data = await c.req.json()

        // Validation
        if (!data.themeKey || !data.themeName || !data.category) {
            return c.json(
                {
                    error: 'Missing required fields: themeKey, themeName, category',
                },
                400
            )
        }

        // Default isActive to true if not provided
        if (data.isActive === undefined) {
            data.isActive = true
        }

        const theme = await questionService.createTheme(data)
        return c.json(theme, 201)
    } catch (error) {
        console.error('Error creating theme:', error)
        return c.json({ error: 'Failed to create theme' }, 500)
    }
})

// Update theme
adminRoutes.put('/themes/:id', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const id = parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid theme ID' }, 400)
        }

        const existing = await questionService.getThemeById(id)
        if (!existing) {
            return c.json({ error: 'Theme not found' }, 404)
        }

        const data = await c.req.json()
        const theme = await questionService.updateTheme(id, data)
        return c.json(theme)
    } catch (error) {
        console.error('Error updating theme:', error)
        return c.json({ error: 'Failed to update theme' }, 500)
    }
})

// Delete theme
adminRoutes.delete('/themes/:id', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const id = parseInt(c.req.param('id'))

        if (isNaN(id)) {
            return c.json({ error: 'Invalid theme ID' }, 400)
        }

        const existing = await questionService.getThemeById(id)
        if (!existing) {
            return c.json({ error: 'Theme not found' }, 404)
        }

        await questionService.deleteTheme(id)
        return c.json({ success: true })
    } catch (error) {
        console.error('Error deleting theme:', error)
        return c.json({ error: 'Failed to delete theme' }, 500)
    }
})

// ============================================
// Categories
// ============================================

adminRoutes.get('/categories', async (c) => {
    try {
        const questionService = new QuestionService(
            c.env.DB,
            c.env.__mockPrisma
        )
        const categories = await questionService.getCategories()
        return c.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return c.json({ error: 'Failed to fetch categories' }, 500)
    }
})

// ============================================
// Image Upload (R2)
// ============================================

// Upload image
adminRoutes.post('/images/upload', async (c) => {
    try {
        if (!c.env.IMAGES) {
            return c.json({ error: 'Image storage not configured' }, 503)
        }

        const imageService = new ImageService({
            IMAGES: c.env.IMAGES,
            R2_PUBLIC_URL: c.env.R2_PUBLIC_URL,
        })

        const formData = await c.req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return c.json({ error: 'No file provided' }, 400)
        }

        const result = await imageService.uploadImage(file)
        return c.json(result, 201)
    } catch (error: any) {
        console.error('Error uploading image:', error)
        return c.json({ error: error.message || 'Failed to upload image' }, 500)
    }
})

// List images
adminRoutes.get('/images', async (c) => {
    try {
        if (!c.env.IMAGES) {
            return c.json({ error: 'Image storage not configured' }, 503)
        }

        const imageService = new ImageService({
            IMAGES: c.env.IMAGES,
            R2_PUBLIC_URL: c.env.R2_PUBLIC_URL,
        })

        const limit = parseInt(c.req.query('limit') || '100')
        const cursor = c.req.query('cursor')

        const result = await imageService.listImages({ limit, cursor })
        return c.json(result)
    } catch (error) {
        console.error('Error listing images:', error)
        return c.json({ error: 'Failed to list images' }, 500)
    }
})

// Get/serve single image (fallback if no public R2 URL)
adminRoutes.get('/images/:key{.+}', async (c) => {
    try {
        if (!c.env.IMAGES) {
            return c.json({ error: 'Image storage not configured' }, 503)
        }

        const imageService = new ImageService({
            IMAGES: c.env.IMAGES,
            R2_PUBLIC_URL: c.env.R2_PUBLIC_URL,
        })

        const key = c.req.param('key')
        const imageData = await imageService.getImageData(key)

        if (!imageData) {
            return c.json({ error: 'Image not found' }, 404)
        }

        return new Response(imageData.body, {
            headers: {
                'Content-Type': imageData.contentType,
                'Cache-Control': 'public, max-age=31536000',
            },
        })
    } catch (error) {
        console.error('Error fetching image:', error)
        return c.json({ error: 'Failed to fetch image' }, 500)
    }
})

// Delete image
adminRoutes.delete('/images/:key{.+}', async (c) => {
    try {
        if (!c.env.IMAGES) {
            return c.json({ error: 'Image storage not configured' }, 503)
        }

        const imageService = new ImageService({
            IMAGES: c.env.IMAGES,
            R2_PUBLIC_URL: c.env.R2_PUBLIC_URL,
        })

        const key = c.req.param('key')
        await imageService.deleteImage(key)
        return c.json({ success: true })
    } catch (error) {
        console.error('Error deleting image:', error)
        return c.json({ error: 'Failed to delete image' }, 500)
    }
})
