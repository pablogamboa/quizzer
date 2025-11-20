const API_BASE_URL = '/api/quiz'

export async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.error || 'API request failed')
        }

        return data
    } catch (error) {
        console.error('API Error:', error)
        throw error
    }
}

export async function loadCategories() {
    try {
        const response = await apiRequest('/categories')
        return response.data
    } catch (error) {
        console.error('Failed to load categories:', error)
        return []
    }
}

export async function loadThemesByCategory(category) {
    try {
        const response = await apiRequest(`/themes/category/${category}`)
        return response.data
    } catch (error) {
        console.error('Failed to load themes:', error)
        return []
    }
}

export async function loadAllThemes() {
    try {
        const response = await apiRequest('/themes')
        return response.data
    } catch (error) {
        console.error('Failed to load themes:', error)
        return []
    }
}

export async function loadQuestions(config) {
    let {
        questionCount,
        difficulty,
        category,
        theme
    } = config

    // Ensure questionCount is a valid number
    questionCount = parseInt(questionCount, 10)
    if (isNaN(questionCount) || questionCount < 1) {
        questionCount = 10
    }

    try {
        // If theme is selected, use theme endpoint
        if (theme) {
            const response = await apiRequest(
                `/questions/theme/${theme}/random/${questionCount}`
            )
            return response.data
        }

        let endpoint = `/questions/random/${questionCount}`

        // If specific filters are selected, we need to get all questions and filter client-side
        // since the API doesn't support combined filters
        if (difficulty !== 'all' || category !== 'all') {
            // Get all questions first
            const response = await apiRequest('/questions')
            let allQuestions = response.data

            // Apply difficulty filter
            if (difficulty !== 'all') {
                allQuestions = allQuestions.filter(
                    (q) => q.difficulty === difficulty
                )
            }

            // Apply category filter
            if (category !== 'all') {
                allQuestions = allQuestions.filter(
                    (q) => q.category === category
                )
            }

            if (allQuestions.length === 0) {
                throw new Error('No questions found for the selected criteria')
            }

            // Shuffle and take the requested count
            const shuffled = allQuestions.sort(() => 0.5 - Math.random())
            return shuffled.slice(0, Math.min(questionCount, shuffled.length))
        } else {
            // Use the optimized random endpoint when no filters are applied
            const response = await apiRequest(endpoint)
            return response.data
        }
    } catch (error) {
        console.error('Load questions error:', error)
        throw new Error(`Failed to load questions: ${error.message}`)
    }
}

export async function submitQuiz(
    answers,
    playerName = null,
    category = null,
    difficulty = null,
    timeTaken = null
) {
    try {
        const response = await apiRequest('/submit', {
            method: 'POST',
            body: JSON.stringify({
                answers,
                playerName,
                category,
                difficulty,
                timeTaken,
            }),
        })

        return response.data
    } catch (error) {
        throw new Error(`Failed to submit quiz: ${error.message}`)
    }
}