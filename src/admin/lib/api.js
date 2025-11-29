/**
 * Admin API client for interacting with the backend.
 * All requests include Basic Auth credentials.
 */

const API_BASE = '/api/admin'

/**
 * Make an authenticated API request.
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
        },
    })

    if (response.status === 401) {
        // Browser will show auth prompt automatically
        throw new Error('Authentication required')
    }

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
}

// ============================================
// Stats
// ============================================

export async function getStats() {
    return request('/stats')
}

// ============================================
// Questions
// ============================================

export async function getQuestions(filters = {}) {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.difficulty) params.set('difficulty', filters.difficulty)
    if (filters.type) params.set('type', filters.type)
    if (filters.theme) params.set('theme', filters.theme)
    if (filters.search) params.set('search', filters.search)
    if (filters.page) params.set('page', filters.page.toString())
    if (filters.pageSize) params.set('pageSize', filters.pageSize.toString())

    const query = params.toString()
    return request(`/questions${query ? `?${query}` : ''}`)
}

export async function getQuestion(id) {
    return request(`/questions/${id}`)
}

export async function createQuestion(data) {
    return request('/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

export async function updateQuestion(id, data) {
    return request(`/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

export async function deleteQuestion(id) {
    return request(`/questions/${id}`, { method: 'DELETE' })
}

export async function bulkDeleteQuestions(ids) {
    return request('/questions/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
    })
}

// ============================================
// Themes
// ============================================

export async function getThemes() {
    return request('/themes')
}

export async function getTheme(id) {
    return request(`/themes/${id}`)
}

export async function createTheme(data) {
    return request('/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

export async function updateTheme(id, data) {
    return request(`/themes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

export async function deleteTheme(id) {
    return request(`/themes/${id}`, { method: 'DELETE' })
}

// ============================================
// Categories
// ============================================

export async function getCategories() {
    return request('/categories')
}

// ============================================
// Images
// ============================================

export async function uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)

    return request('/images/upload', {
        method: 'POST',
        body: formData,
    })
}

export async function getImages(options = {}) {
    const params = new URLSearchParams()
    if (options.limit) params.set('limit', options.limit.toString())
    if (options.cursor) params.set('cursor', options.cursor)

    const query = params.toString()
    return request(`/images${query ? `?${query}` : ''}`)
}

export async function deleteImage(key) {
    return request(`/images/${encodeURIComponent(key)}`, { method: 'DELETE' })
}
