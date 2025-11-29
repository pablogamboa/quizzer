<script>
    import { onMount } from 'svelte'
    import {
        createQuestion,
        updateQuestion,
        getCategories,
        getThemes,
    } from '../lib/api.js'
    import { showSuccess, showError } from '../lib/toast.js'
    import ImageUpload from '../components/ImageUpload.svelte'

    let { question = null, onSave = () => {}, onCancel = () => {} } = $props()

    const isEditing = $derived(question !== null)

    let categories = $state([])
    let themes = $state([])
    let filteredThemes = $state([])
    let loading = $state(false)
    let saving = $state(false)

    // Form state
    let form = $state({
        type: question?.type || 'trivia',
        question: question?.question || '',
        category: question?.category || '',
        newCategory: '',
        difficulty: question?.difficulty || 'medium',
        theme: question?.theme || '',
        // Trivia/Picture answers
        answers: question?.answers || ['', '', '', ''],
        correct: question?.correct ?? 0,
        // Text question
        correctAnswer: question?.correctAnswer || '',
        acceptableAnswers: question?.acceptableAnswers || [],
        // Picture
        imageUrl: question?.imageUrl || '',
    })

    let useNewCategory = $state(false)
    let newAcceptableAnswer = $state('')

    async function loadData() {
        try {
            loading = true
            const [categoriesResult, themesResult] = await Promise.all([
                getCategories(),
                getThemes(),
            ])
            categories = categoriesResult
            themes = themesResult
            updateFilteredThemes()
        } catch (err) {
            showError('Failed to load data: ' + err.message)
        } finally {
            loading = false
        }
    }

    function updateFilteredThemes() {
        const category = useNewCategory ? form.newCategory : form.category
        filteredThemes = themes.filter((t) => t.category === category)
    }

    function handleCategoryChange() {
        form.theme = ''
        updateFilteredThemes()
    }

    function addAcceptableAnswer() {
        if (newAcceptableAnswer.trim()) {
            form.acceptableAnswers = [
                ...form.acceptableAnswers,
                newAcceptableAnswer.trim(),
            ]
            newAcceptableAnswer = ''
        }
    }

    function removeAcceptableAnswer(index) {
        form.acceptableAnswers = form.acceptableAnswers.filter(
            (_, i) => i !== index
        )
    }

    function handleImageUploaded(url) {
        form.imageUrl = url
    }

    async function handleSubmit(e) {
        e.preventDefault()

        // Validation
        if (!form.question.trim()) {
            showError('Question text is required')
            return
        }

        const category = useNewCategory
            ? form.newCategory.trim()
            : form.category
        if (!category) {
            showError('Category is required')
            return
        }

        if (
            (form.type === 'trivia' || form.type === 'picture') &&
            form.answers.some((a) => !a.trim())
        ) {
            showError('All 4 answers are required')
            return
        }

        if (form.type === 'picture' && !form.imageUrl.trim()) {
            showError('Image URL is required for picture questions')
            return
        }

        if (form.type === 'question' && !form.correctAnswer.trim()) {
            showError('Correct answer is required')
            return
        }

        const data = {
            type: form.type,
            question: form.question.trim(),
            category,
            difficulty: form.difficulty,
            theme: form.theme || undefined,
        }

        if (form.type === 'trivia' || form.type === 'picture') {
            data.answers = form.answers.map((a) => a.trim())
            data.correct = form.correct
        }

        if (form.type === 'picture') {
            data.imageUrl = form.imageUrl.trim()
        }

        if (form.type === 'question') {
            data.correctAnswer = form.correctAnswer.trim()
            data.acceptableAnswers = form.acceptableAnswers.filter((a) =>
                a.trim()
            )
        }

        try {
            saving = true
            if (isEditing) {
                await updateQuestion(question.id, data)
                showSuccess('Question updated successfully')
            } else {
                await createQuestion(data)
                showSuccess('Question created successfully')
            }
            onSave()
        } catch (err) {
            showError('Failed to save question: ' + err.message)
        } finally {
            saving = false
        }
    }

    onMount(() => {
        loadData()
    })
</script>

<div class="admin-page-header">
    <h1 class="admin-page-title">
        {isEditing ? 'Edit Question' : 'Add Question'}
    </h1>
    <button class="admin-btn admin-btn-outline" onclick={onCancel}>
        Cancel
    </button>
</div>

{#if loading}
    <div class="admin-loading">
        <div class="admin-spinner"></div>
    </div>
{:else}
    <form onsubmit={handleSubmit}>
        <div class="admin-card">
            <div class="admin-card-header">
                <h2 class="admin-card-title">Question Details</h2>
            </div>

            <div class="admin-form-group">
                <label class="admin-label">Question Type</label>
                <div class="admin-radio-group">
                    <label class="admin-radio-label">
                        <input
                            type="radio"
                            name="type"
                            value="trivia"
                            bind:group={form.type}
                        />
                        Trivia (Multiple Choice)
                    </label>
                    <label class="admin-radio-label">
                        <input
                            type="radio"
                            name="type"
                            value="question"
                            bind:group={form.type}
                        />
                        Text (Free Input)
                    </label>
                    <label class="admin-radio-label">
                        <input
                            type="radio"
                            name="type"
                            value="picture"
                            bind:group={form.type}
                        />
                        Picture (Image + Multiple Choice)
                    </label>
                </div>
            </div>

            <div class="admin-form-group">
                <label class="admin-label" for="question">Question Text</label>
                <textarea
                    id="question"
                    class="admin-textarea"
                    bind:value={form.question}
                    placeholder="Enter your question..."
                    rows="3"
                ></textarea>
            </div>

            <div
                style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;"
            >
                <div class="admin-form-group">
                    <label class="admin-label" for="category">Category</label>
                    {#if useNewCategory}
                        <div class="admin-input-group">
                            <input
                                id="category"
                                type="text"
                                class="admin-input"
                                bind:value={form.newCategory}
                                placeholder="New category name..."
                                oninput={handleCategoryChange}
                            />
                            <button
                                type="button"
                                class="admin-btn admin-btn-outline"
                                onclick={() => {
                                    useNewCategory = false
                                    form.newCategory = ''
                                    handleCategoryChange()
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    {:else}
                        <div class="admin-input-group">
                            <select
                                id="category"
                                class="admin-select"
                                bind:value={form.category}
                                onchange={handleCategoryChange}
                            >
                                <option value="">Select category...</option>
                                {#each categories as category}
                                    <option value={category}>{category}</option>
                                {/each}
                            </select>
                            <button
                                type="button"
                                class="admin-btn admin-btn-outline"
                                onclick={() => (useNewCategory = true)}
                            >
                                + New
                            </button>
                        </div>
                    {/if}
                </div>

                <div class="admin-form-group">
                    <label class="admin-label" for="difficulty"
                        >Difficulty</label
                    >
                    <select
                        id="difficulty"
                        class="admin-select"
                        bind:value={form.difficulty}
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            <div class="admin-form-group">
                <label class="admin-label" for="theme">Theme (Optional)</label>
                <select id="theme" class="admin-select" bind:value={form.theme}>
                    <option value="">No theme</option>
                    {#each filteredThemes as theme}
                        <option value={theme.themeKey}
                            >{theme.icon || ''} {theme.themeName}</option
                        >
                    {/each}
                </select>
                {#if filteredThemes.length === 0 && (form.category || form.newCategory)}
                    <p
                        style="font-size: 0.75rem; color: var(--admin-text-muted); margin-top: 0.25rem;"
                    >
                        No themes available for this category
                    </p>
                {/if}
            </div>
        </div>

        {#if form.type === 'picture'}
            <div class="admin-card">
                <div class="admin-card-header">
                    <h2 class="admin-card-title">Image</h2>
                </div>
                <ImageUpload
                    currentUrl={form.imageUrl}
                    onUploaded={handleImageUploaded}
                />
            </div>
        {/if}

        {#if form.type === 'trivia' || form.type === 'picture'}
            <div class="admin-card">
                <div class="admin-card-header">
                    <h2 class="admin-card-title">Answers</h2>
                </div>
                <p
                    style="font-size: 0.875rem; color: var(--admin-text-muted); margin-bottom: 1rem;"
                >
                    Enter 4 answers and select the correct one.
                </p>
                <div class="admin-answer-inputs">
                    {#each [0, 1, 2, 3] as index}
                        <div class="admin-answer-row">
                            <input
                                type="radio"
                                name="correct"
                                value={index}
                                bind:group={form.correct}
                                title="Mark as correct"
                            />
                            <input
                                type="text"
                                class="admin-input"
                                bind:value={form.answers[index]}
                                placeholder="Answer {index + 1}"
                            />
                            {#if form.correct === index}
                                <span class="admin-badge admin-badge-success"
                                    >Correct</span
                                >
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if form.type === 'question'}
            <div class="admin-card">
                <div class="admin-card-header">
                    <h2 class="admin-card-title">Answer</h2>
                </div>

                <div class="admin-form-group">
                    <label class="admin-label" for="correctAnswer"
                        >Correct Answer</label
                    >
                    <input
                        id="correctAnswer"
                        type="text"
                        class="admin-input"
                        bind:value={form.correctAnswer}
                        placeholder="The primary correct answer..."
                    />
                </div>

                <div class="admin-form-group">
                    <label class="admin-label"
                        >Alternative Acceptable Answers (Optional)</label
                    >
                    <p
                        style="font-size: 0.75rem; color: var(--admin-text-muted); margin-bottom: 0.5rem;"
                    >
                        Add alternative spellings or phrasings that should be
                        accepted.
                    </p>

                    {#if form.acceptableAnswers.length > 0}
                        <div
                            style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;"
                        >
                            {#each form.acceptableAnswers as answer, index}
                                <span
                                    class="admin-badge admin-badge-secondary"
                                    style="padding-right: 0.25rem;"
                                >
                                    {answer}
                                    <button
                                        type="button"
                                        style="background: none; border: none; cursor: pointer; margin-left: 0.25rem; color: inherit;"
                                        onclick={() =>
                                            removeAcceptableAnswer(index)}
                                    >
                                        ×
                                    </button>
                                </span>
                            {/each}
                        </div>
                    {/if}

                    <div class="admin-input-group">
                        <input
                            type="text"
                            class="admin-input"
                            bind:value={newAcceptableAnswer}
                            placeholder="Add alternative answer..."
                            onkeydown={(e) =>
                                e.key === 'Enter' &&
                                (e.preventDefault(), addAcceptableAnswer())}
                        />
                        <button
                            type="button"
                            class="admin-btn admin-btn-outline"
                            onclick={addAcceptableAnswer}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        {/if}

        <div
            style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;"
        >
            <button
                type="button"
                class="admin-btn admin-btn-outline"
                onclick={onCancel}
            >
                Cancel
            </button>
            <button
                type="submit"
                class="admin-btn admin-btn-primary"
                disabled={saving}
            >
                {saving
                    ? 'Saving...'
                    : isEditing
                      ? 'Save Changes'
                      : 'Create Question'}
            </button>
        </div>
    </form>
{/if}
