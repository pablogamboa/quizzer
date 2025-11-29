<script>
    import { onMount } from 'svelte'
    import {
        getQuestions,
        getCategories,
        getThemes,
        deleteQuestion,
        bulkDeleteQuestions,
    } from '../lib/api.js'
    import { showSuccess, showError } from '../lib/toast.js'
    import Pagination from '../components/Pagination.svelte'
    import Modal from '../components/Modal.svelte'

    let { onEdit = () => {} } = $props()

    let questions = $state([])
    let categories = $state([])
    let themes = $state([])
    let loading = $state(true)
    let pagination = $state({ page: 1, pageSize: 25, total: 0, totalPages: 1 })
    let selectedIds = $state(new Set())
    let deleteModalOpen = $state(false)
    let questionToDelete = $state(null)

    let filters = $state({
        category: '',
        difficulty: '',
        type: '',
        theme: '',
        search: '',
    })

    async function loadData() {
        try {
            loading = true
            const [questionsResult, categoriesResult, themesResult] =
                await Promise.all([
                    getQuestions({
                        ...filters,
                        page: pagination.page,
                        pageSize: pagination.pageSize,
                    }),
                    getCategories(),
                    getThemes(),
                ])
            questions = questionsResult.items
            pagination = {
                page: questionsResult.page,
                pageSize: questionsResult.pageSize,
                total: questionsResult.total,
                totalPages: questionsResult.totalPages,
            }
            categories = categoriesResult
            themes = themesResult
        } catch (err) {
            showError('Failed to load questions: ' + err.message)
        } finally {
            loading = false
        }
    }

    function handleFilterChange() {
        pagination.page = 1
        selectedIds = new Set()
        loadData()
    }

    function handlePageChange(newPage) {
        pagination.page = newPage
        selectedIds = new Set()
        loadData()
    }

    function toggleSelectAll() {
        if (selectedIds.size === questions.length) {
            selectedIds = new Set()
        } else {
            selectedIds = new Set(questions.map((q) => q.id))
        }
    }

    function toggleSelect(id) {
        if (selectedIds.has(id)) {
            selectedIds.delete(id)
            selectedIds = new Set(selectedIds)
        } else {
            selectedIds.add(id)
            selectedIds = new Set(selectedIds)
        }
    }

    function confirmDelete(question) {
        questionToDelete = question
        deleteModalOpen = true
    }

    async function handleDelete() {
        if (!questionToDelete) return

        try {
            await deleteQuestion(questionToDelete.id)
            showSuccess('Question deleted successfully')
            deleteModalOpen = false
            questionToDelete = null
            loadData()
        } catch (err) {
            showError('Failed to delete question: ' + err.message)
        }
    }

    async function handleBulkDelete() {
        if (selectedIds.size === 0) return

        if (
            !confirm(
                `Are you sure you want to delete ${selectedIds.size} questions?`
            )
        ) {
            return
        }

        try {
            await bulkDeleteQuestions(Array.from(selectedIds))
            showSuccess(`${selectedIds.size} questions deleted successfully`)
            selectedIds = new Set()
            loadData()
        } catch (err) {
            showError('Failed to delete questions: ' + err.message)
        }
    }

    function getDifficultyBadgeClass(difficulty) {
        switch (difficulty) {
            case 'easy':
                return 'admin-badge-success'
            case 'medium':
                return 'admin-badge-warning'
            case 'hard':
                return 'admin-badge-danger'
            default:
                return 'admin-badge-secondary'
        }
    }

    function getTypeBadgeClass(type) {
        switch (type) {
            case 'trivia':
                return 'admin-badge-primary'
            case 'question':
                return 'admin-badge-secondary'
            case 'picture':
                return 'admin-badge-warning'
            default:
                return 'admin-badge-secondary'
        }
    }

    function truncate(text, length = 60) {
        if (text.length <= length) return text
        return text.slice(0, length) + '...'
    }

    onMount(() => {
        loadData()
    })
</script>

<div class="admin-page-header">
    <h1 class="admin-page-title">Questions</h1>
    <div style="display: flex; gap: 0.5rem;">
        {#if selectedIds.size > 0}
            <button
                class="admin-btn admin-btn-danger"
                onclick={handleBulkDelete}
            >
                Delete Selected ({selectedIds.size})
            </button>
        {/if}
        <button
            class="admin-btn admin-btn-primary"
            onclick={() => onEdit(null)}
        >
            + Add Question
        </button>
    </div>
</div>

<div class="admin-filters">
    <div class="admin-filter-item">
        <label for="filter-search">Search</label>
        <input
            id="filter-search"
            type="text"
            class="admin-input"
            placeholder="Search questions..."
            bind:value={filters.search}
            onchange={handleFilterChange}
        />
    </div>
    <div class="admin-filter-item">
        <label for="filter-category">Category</label>
        <select
            id="filter-category"
            class="admin-select"
            bind:value={filters.category}
            onchange={handleFilterChange}
        >
            <option value="">All Categories</option>
            {#each categories as category}
                <option value={category}>{category}</option>
            {/each}
        </select>
    </div>
    <div class="admin-filter-item">
        <label for="filter-difficulty">Difficulty</label>
        <select
            id="filter-difficulty"
            class="admin-select"
            bind:value={filters.difficulty}
            onchange={handleFilterChange}
        >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
        </select>
    </div>
    <div class="admin-filter-item">
        <label for="filter-type">Type</label>
        <select
            id="filter-type"
            class="admin-select"
            bind:value={filters.type}
            onchange={handleFilterChange}
        >
            <option value="">All Types</option>
            <option value="trivia">Trivia</option>
            <option value="question">Text</option>
            <option value="picture">Picture</option>
        </select>
    </div>
    <div class="admin-filter-item">
        <label for="filter-theme">Theme</label>
        <select
            id="filter-theme"
            class="admin-select"
            bind:value={filters.theme}
            onchange={handleFilterChange}
        >
            <option value="">All Themes</option>
            {#each themes as theme}
                <option value={theme.themeKey}
                    >{theme.icon || ''} {theme.themeName}</option
                >
            {/each}
        </select>
    </div>
</div>

<div class="admin-card">
    {#if loading}
        <div class="admin-loading">
            <div class="admin-spinner"></div>
        </div>
    {:else if questions.length === 0}
        <div class="admin-empty-state">
            <div class="admin-empty-icon">❓</div>
            <p>No questions found</p>
            <button
                class="admin-btn admin-btn-primary"
                style="margin-top: 1rem;"
                onclick={() => onEdit(null)}
            >
                Add Your First Question
            </button>
        </div>
    {:else}
        <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">
                            <input
                                type="checkbox"
                                checked={selectedIds.size ===
                                    questions.length && questions.length > 0}
                                onchange={toggleSelectAll}
                            />
                        </th>
                        <th style="width: 60px;">ID</th>
                        <th>Question</th>
                        <th style="width: 120px;">Category</th>
                        <th style="width: 100px;">Difficulty</th>
                        <th style="width: 80px;">Type</th>
                        <th style="width: 120px;">Theme</th>
                        <th style="width: 100px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each questions as question}
                        <tr>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(question.id)}
                                    onchange={() => toggleSelect(question.id)}
                                />
                            </td>
                            <td>{question.id}</td>
                            <td title={question.question}
                                >{truncate(question.question)}</td
                            >
                            <td>{question.category}</td>
                            <td>
                                <span
                                    class="admin-badge {getDifficultyBadgeClass(
                                        question.difficulty
                                    )}"
                                >
                                    {question.difficulty}
                                </span>
                            </td>
                            <td>
                                <span
                                    class="admin-badge {getTypeBadgeClass(
                                        question.type
                                    )}"
                                >
                                    {question.type}
                                </span>
                            </td>
                            <td>{question.theme || '-'}</td>
                            <td class="admin-table-actions">
                                <button
                                    class="admin-btn admin-btn-outline admin-btn-sm"
                                    onclick={() => onEdit(question)}
                                >
                                    Edit
                                </button>
                                <button
                                    class="admin-btn admin-btn-danger admin-btn-sm"
                                    onclick={() => confirmDelete(question)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
        />
    {/if}
</div>

<Modal
    show={deleteModalOpen}
    title="Delete Question"
    onclose={() => (deleteModalOpen = false)}
>
    <p>Are you sure you want to delete this question?</p>
    {#if questionToDelete}
        <p
            style="margin-top: 0.5rem; color: var(--admin-text-muted); font-size: 0.875rem;"
        >
            "{truncate(questionToDelete.question, 100)}"
        </p>
    {/if}
    <div
        class="admin-modal-footer"
        style="margin-top: 1.5rem; padding: 0; border: none;"
    >
        <button
            class="admin-btn admin-btn-outline"
            onclick={() => (deleteModalOpen = false)}
        >
            Cancel
        </button>
        <button class="admin-btn admin-btn-danger" onclick={handleDelete}>
            Delete
        </button>
    </div>
</Modal>
