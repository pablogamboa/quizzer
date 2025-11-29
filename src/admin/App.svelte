<script>
    import { onMount } from 'svelte'
    import Layout from './components/Layout.svelte'
    import Dashboard from './pages/Dashboard.svelte'
    import Questions from './pages/Questions.svelte'
    import QuestionEdit from './pages/QuestionEdit.svelte'
    import Themes from './pages/Themes.svelte'
    import ThemeEdit from './pages/ThemeEdit.svelte'

    // Simple hash-based router
    let currentPage = $state('dashboard')
    let editingQuestion = $state(null)
    let editingTheme = $state(null)
    let isCreatingQuestion = $state(false)
    let isCreatingTheme = $state(false)

    function handleHashChange() {
        const hash = window.location.hash.slice(2) || 'dashboard' // Remove '#/'
        currentPage = hash
        // Reset edit states when navigating
        if (hash !== 'questions') {
            editingQuestion = null
            isCreatingQuestion = false
        }
        if (hash !== 'themes') {
            editingTheme = null
            isCreatingTheme = false
        }
    }

    function navigateTo(page) {
        window.location.hash = '#/' + page
    }

    // Question editing handlers
    function handleEditQuestion(question) {
        if (question === null) {
            isCreatingQuestion = true
            editingQuestion = null
        } else {
            isCreatingQuestion = false
            editingQuestion = question
        }
    }

    function handleQuestionSaved() {
        editingQuestion = null
        isCreatingQuestion = false
    }

    function handleQuestionCancelled() {
        editingQuestion = null
        isCreatingQuestion = false
    }

    // Theme editing handlers
    function handleEditTheme(theme) {
        if (theme === null) {
            isCreatingTheme = true
            editingTheme = null
        } else {
            isCreatingTheme = false
            editingTheme = theme
        }
    }

    function handleThemeSaved() {
        editingTheme = null
        isCreatingTheme = false
    }

    function handleThemeCancelled() {
        editingTheme = null
        isCreatingTheme = false
    }

    // Initialize on mount and listen for hash changes
    onMount(() => {
        handleHashChange()
        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    })
</script>

<Layout {currentPage}>
    {#snippet children()}
        {#if currentPage === 'dashboard'}
            <Dashboard />
        {:else if currentPage === 'questions'}
            {#if editingQuestion !== null || isCreatingQuestion}
                <QuestionEdit
                    question={editingQuestion}
                    onSave={handleQuestionSaved}
                    onCancel={handleQuestionCancelled}
                />
            {:else}
                <Questions onEdit={handleEditQuestion} />
            {/if}
        {:else if currentPage === 'themes'}
            {#if editingTheme !== null || isCreatingTheme}
                <ThemeEdit
                    theme={editingTheme}
                    onSave={handleThemeSaved}
                    onCancel={handleThemeCancelled}
                />
            {:else}
                <Themes onEdit={handleEditTheme} />
            {/if}
        {:else}
            <div class="admin-card">
                <div class="admin-empty-state">
                    <div class="admin-empty-icon">🔍</div>
                    <p>Page not found</p>
                    <button
                        class="admin-btn admin-btn-primary"
                        style="margin-top: 1rem;"
                        onclick={() => navigateTo('dashboard')}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        {/if}
    {/snippet}
</Layout>
