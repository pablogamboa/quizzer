<script>
    import { fade, fly, scale } from 'svelte/transition'
    import { quiz, resetQuiz } from '../stores/quiz.svelte.js'
    import {
        loadCategories,
        loadQuestions,
        loadThemesByCategory,
    } from '../lib/api.js'
    import ThemeSelection from './ThemeSelection.svelte'
    import { APP_CONFIG } from '../lib/constants.js'

    let selectedMode = $state(null)
    let showConfig = $state(false)
    let showThemeSelection = $state(false)
    let mounted = $state(false)

    const categoryIcons = {
        'General Knowledge': '🌍',
        'Entertainment: Books': '📚',
        'Entertainment: Film': '🎬',
        'Entertainment: Music': '🎵',
        'Entertainment: Musicals & Theatres': '🎭',
        'Entertainment: Television': '📺',
        'Entertainment: Video Games': '🎮',
        'Entertainment: Board Games': '🎲',
        'Science & Nature': '🔬',
        'Science: Computers': '💻',
        'Science: Mathematics': '🧮',
        Mythology: '🔱',
        Sports: '⚽',
        Geography: '🗺️',
        History: '📜',
        Politics: '🏛️',
        Art: '🎨',
        Celebrities: '🌟',
        Animals: '🐾',
        Vehicles: '🚗',
        'Entertainment: Comics': '💥',
        'Science: Gadgets': '📱',
        'Entertainment: Japanese Anime & Manga': '🎌',
        'Entertainment: Cartoon & Animations': '✏️',
        all: '🌐',
    }

    $effect(() => {
        mounted = true

        if (
            quiz.gameMode === 'networked' &&
            quiz.currentScreen === 'networkedConfig'
        ) {
            selectedMode = quiz.gameMode
            showConfig = true
        } else if (
            quiz.gameMode &&
            quiz.gameMode !== 'individual' &&
            quiz.gameMode !== 'networked'
        ) {
            selectedMode = quiz.gameMode
            showConfig = true
        } else {
            resetQuiz()
        }

        async function fetchCategories() {
            try {
                const fetchedCategories = await loadCategories()
                quiz.categories = ['all', ...fetchedCategories]
            } catch (err) {
                console.error('Failed to fetch categories:', err)
                quiz.categories = ['all']
            }
        }
        fetchCategories()
    })

    function selectGameMode(mode) {
        selectedMode = mode
        quiz.gameMode = mode

        if (mode === 'networked') {
            quiz.currentScreen = 'networkedModeSelection'
        } else {
            showConfig = true
        }
    }

    async function startQuiz() {
        if (quiz.gameMode === 'networked') {
            quiz.currentScreen = 'createNetworkedGame'
            return
        }

        quiz.loading = true
        quiz.error = null

        try {
            const fetchedQuestions = await loadQuestions(quiz.config)
            if (fetchedQuestions.length === 0) {
                throw new Error('No questions available for this selection.')
            }
            quiz.questions = fetchedQuestions
            quiz.currentScreen =
                quiz.gameMode === 'group' ? 'playerSetup' : 'question'
        } catch (err) {
            console.error('Failed to fetch questions:', err)
            quiz.error =
                err.message || 'Failed to load questions. Please try again.'
        } finally {
            quiz.loading = false
        }
    }

    function goBack() {
        if (quiz.gameMode === 'networked') {
            quiz.currentScreen = 'networkedModeSelection'
        } else {
            showConfig = false
            selectedMode = null
            showThemeSelection = false
            quiz.availableThemes = []
            quiz.config.theme = null
        }
    }

    async function handleCategoryChange(newCategory) {
        quiz.config.category = newCategory
        quiz.config.theme = null

        if (newCategory !== 'all') {
            try {
                const themes = await loadThemesByCategory(newCategory)
                if (themes.length > 0) {
                    quiz.availableThemes = themes
                    showThemeSelection = true
                } else {
                    quiz.availableThemes = []
                    showThemeSelection = false
                    startQuiz()
                }
            } catch (err) {
                console.error('Failed to load themes:', err)
                quiz.availableThemes = []
                showThemeSelection = false
                startQuiz()
            }
        } else {
            quiz.availableThemes = []
            showThemeSelection = false
            startQuiz()
        }
    }

    function handleSelectTheme(event) {
        quiz.config.theme = event.detail
        showThemeSelection = false
        startQuiz()
    }

    function handleSkipTheme() {
        quiz.config.theme = null
        showThemeSelection = false
        startQuiz()
    }
</script>

<div class="start-screen-container" class:mounted>
    {#if showThemeSelection}
        <ThemeSelection
            themes={quiz.availableThemes}
            selectedTheme={quiz.config.theme}
            on:selectTheme={handleSelectTheme}
            on:skip={handleSkipTheme}
        />
    {/if}

    {#if !showConfig}
        <!-- Hero Section -->
        <div class="hero-section" in:fade={{ duration: 600 }}>
            <div class="logo-wrapper">
                <div class="logo">
                    <h1
                        class="logo-text gradient-text"
                        in:fly={{ y: 30, duration: 600, delay: 300 }}
                    >
                        {APP_CONFIG.name}
                    </h1>
                </div>
                <p
                    class="hero-subtitle"
                    in:fly={{ y: 20, duration: 600, delay: 400 }}
                >
                    {APP_CONFIG.tagline}
                </p>
            </div>

            <div class="mode-selection">
                <button
                    class="glass-card mode-card"
                    onclick={() => selectGameMode('individual')}
                    in:scale={{ duration: 500, delay: 500, start: 0.9 }}
                >
                    <div class="mode-icon">👤</div>
                    <h3>Solo Quest</h3>
                    <p>Challenge yourself</p>
                </button>

                <button
                    class="glass-card mode-card"
                    onclick={() => selectGameMode('group')}
                    in:scale={{ duration: 500, delay: 600, start: 0.9 }}
                >
                    <div class="mode-icon">👥</div>
                    <h3>Pass & Play</h3>
                    <p>Local multiplayer fun</p>
                </button>

                <button
                    class="glass-card mode-card"
                    onclick={() => selectGameMode('networked')}
                    in:scale={{ duration: 500, delay: 700, start: 0.9 }}
                >
                    <div class="mode-icon">🌐</div>
                    <h3>Online Battle</h3>
                    <p>Compete with the world</p>
                </button>
            </div>
        </div>
    {:else}
        <!-- Configuration Section -->
        <div class="config-section" in:fly={{ x: 30, duration: 500 }}>
            <button class="back-button" onclick={goBack}>
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        d="M19 12H5M12 19l-7-7 7-7"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
                Back
            </button>

            <div class="config-header">
                <h2 class="gradient-text">Setup Your Quiz</h2>
            </div>

            <div class="config-grid">
                <!-- Difficulty Selector -->
                <div
                    class="glass-card config-card"
                    in:scale={{ duration: 400, delay: 100 }}
                >
                    <h3>Target Difficulty</h3>
                    <div class="difficulty-selector">
                        {#each ['all', 'easy', 'medium', 'hard'] as level}
                            <button
                                class="difficulty-option"
                                class:active={quiz.config.difficulty === level}
                                onclick={() => (quiz.config.difficulty = level)}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Question Count -->
                <div
                    class="glass-card config-card"
                    in:scale={{ duration: 400, delay: 200 }}
                >
                    <h3>Question Count</h3>
                    <div class="number-selector">
                        <button
                            class="number-btn"
                            onclick={() =>
                                (quiz.config.questionCount = Math.max(
                                    5,
                                    quiz.config.questionCount - 5
                                ))}
                        >
                            −
                        </button>
                        <span class="number-value"
                            >{quiz.config.questionCount}</span
                        >
                        <button
                            class="number-btn"
                            onclick={() =>
                                (quiz.config.questionCount = Math.min(
                                    50,
                                    quiz.config.questionCount + 5
                                ))}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <!-- Category Selection -->
            <div
                class="category-section"
                in:scale={{ duration: 400, delay: 300 }}
            >
                <h3>Select Category</h3>
                <div class="category-grid">
                    {#each quiz.categories as category, index}
                        <button
                            class="glass-card category-card"
                            onclick={() => handleCategoryChange(category)}
                            in:scale={{
                                duration: 300,
                                delay: 350 + index * 30,
                                start: 0.9,
                            }}
                        >
                            <span class="category-icon"
                                >{categoryIcons[category] || '❔'}</span
                            >
                            <span class="category-name">
                                {category === 'all'
                                    ? 'All Categories'
                                    : category}
                            </span>
                        </button>
                    {/each}
                </div>
            </div>

            {#if quiz.error}
                <div class="error-message" in:scale={{ start: 0.9 }}>
                    {quiz.error}
                </div>
            {/if}

            {#if quiz.loading}
                <div class="loading-container" in:fade>
                    <div class="loading-spinner"></div>
                    <p>Preparing your quiz...</p>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .start-screen-container {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        padding: var(--spacing-lg);
    }

    /* Hero Section */
    .hero-section {
        text-align: center;
        padding: var(--spacing-xl) 0;
    }

    .logo-wrapper {
        margin-bottom: var(--spacing-2xl);
    }

    .logo-text {
        font-size: clamp(3.5rem, 10vw, 6rem);
        margin-bottom: var(--spacing-xs);
    }

    .hero-subtitle {
        font-size: 1.25rem;
        color: var(--text-muted);
        letter-spacing: 0.05em;
    }

    /* Mode Cards */
    .mode-selection {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: var(--spacing-lg);
    }

    .mode-card {
        padding: var(--spacing-xl);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        cursor: pointer;
        background: rgba(
            255,
            255,
            255,
            0.03
        ); /* Slightly lighter than default glass */
    }

    .mode-card:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--primary-light);
    }

    .mode-icon {
        font-size: 3rem;
        margin-bottom: var(--spacing-md);
        filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2));
        transition: transform var(--duration-normal) var(--ease-out);
    }

    .mode-card:hover .mode-icon {
        transform: scale(1.2);
    }

    .mode-card h3 {
        margin-bottom: var(--spacing-xs);
        color: var(--text-main);
    }

    .mode-card p {
        color: var(--text-muted);
        font-size: 0.95rem;
    }

    /* Config Section */
    .config-section {
        width: 100%;
    }

    .back-button {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: var(--spacing-lg);
        transition: color var(--duration-fast);
    }

    .back-button:hover {
        color: var(--text-main);
    }

    .config-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
    }

    .config-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
    }

    .config-card {
        padding: var(--spacing-lg);
    }

    .config-card h3 {
        font-size: 1.1rem;
        color: var(--text-muted);
        margin-bottom: var(--spacing-md);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 0.85rem;
    }

    /* Difficulty Selector */
    .difficulty-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
    }

    .difficulty-option {
        padding: var(--spacing-sm);
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: var(--text-muted);
        font-weight: 500;
        cursor: pointer;
        transition: all var(--duration-normal);
    }

    .difficulty-option:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-main);
    }

    .difficulty-option.active {
        background: var(--primary);
        border-color: var(--primary);
        color: white;
        box-shadow: var(--shadow-glow);
    }

    /* Number Selector */
    .number-selector {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-lg);
    }

    .number-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid var(--glass-border);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-main);
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--duration-fast);
    }

    .number-btn:hover {
        background: var(--primary);
        border-color: var(--primary);
    }

    .number-value {
        font-family: var(--font-mono);
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-main);
        min-width: 60px;
        text-align: center;
    }

    /* Category Grid */
    .category-section h3 {
        text-align: center;
        margin-bottom: var(--spacing-lg);
        color: var(--text-muted);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: var(--spacing-md);
    }

    .category-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-lg);
        cursor: pointer;
        text-align: center;
        transition: all var(--duration-normal);
        background: rgba(255, 255, 255, 0.02);
    }

    .category-card:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-4px);
        border-color: var(--accent);
    }

    .category-icon {
        font-size: 2rem;
        transition: transform var(--duration-normal);
    }

    .category-card:hover .category-icon {
        transform: scale(1.2);
    }

    .category-name {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-main);
        line-height: 1.3;
    }

    /* Loading & Error */
    .error-message {
        margin-top: var(--spacing-lg);
        padding: var(--spacing-md);
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid var(--error);
        border-radius: var(--radius-md);
        color: #fca5a5;
        text-align: center;
    }

    .loading-container {
        text-align: center;
        margin-top: var(--spacing-xl);
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        margin: 0 auto var(--spacing-md);
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 768px) {
        .mode-selection {
            grid-template-columns: 1fr;
        }
        .category-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>
