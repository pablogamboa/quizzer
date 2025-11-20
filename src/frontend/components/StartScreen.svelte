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
            const fetchedQuestions = await loadQuestions(quiz.quizConfig)
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
            quiz.quizConfig.theme = null
        }
    }

    async function handleCategoryChange(newCategory) {
        quiz.quizConfig.category = newCategory
        quiz.quizConfig.theme = null

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
        quiz.quizConfig.theme = event.detail
        showThemeSelection = false
        startQuiz()
    }

    function handleSkipTheme() {
        quiz.quizConfig.theme = null
        showThemeSelection = false
        startQuiz()
    }
</script>

<div class="start-screen-container" class:mounted>
    {#if showThemeSelection}
        <ThemeSelection
            themes={quiz.availableThemes}
            selectedTheme={quiz.quizConfig.theme}
            on:selectTheme={handleSelectTheme}
            on:skip={handleSkipTheme}
        />
    {/if}

    {#if !showConfig}
        <!-- Hero Section with 3D Mode Cards -->
        <div class="hero-section" in:fade={{ duration: 600 }}>
            <div class="logo-wrapper">
                <div class="logo">
                    <span
                        class="logo-icon"
                        in:scale={{ duration: 800, delay: 200 }}>✨</span
                    >
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
                    class="mode-card mode-solo"
                    onclick={() => selectGameMode('individual')}
                    in:scale={{ duration: 500, delay: 500, start: 0.8 }}
                >
                    <div class="mode-glow"></div>
                    <div class="mode-icon">👤</div>
                    <h3>Solo Quest</h3>
                    <p>Challenge yourself</p>
                    <div class="mode-shine"></div>
                </button>

                <button
                    class="mode-card mode-group"
                    onclick={() => selectGameMode('group')}
                    in:scale={{ duration: 500, delay: 600, start: 0.8 }}
                >
                    <div class="mode-glow"></div>
                    <div class="mode-icon">👥</div>
                    <h3>Pass & Play</h3>
                    <p>Fun with friends locally</p>
                    <div class="mode-shine"></div>
                </button>

                <button
                    class="mode-card mode-online"
                    onclick={() => selectGameMode('networked')}
                    in:scale={{ duration: 500, delay: 700, start: 0.8 }}
                >
                    <div class="mode-glow"></div>
                    <div class="mode-icon">🌐</div>
                    <h3>Online Battle</h3>
                    <p>Compete across the web</p>
                    <div class="mode-shine"></div>
                </button>
            </div>
        </div>
    {:else}
        <!-- Configuration Section -->
        <div class="config-section" in:fly={{ x: 30, duration: 500 }}>
            <button class="back-button" onclick={goBack}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M15 18l-6-6 6-6"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
                Back
            </button>

            <div class="config-header">
                <h2 class="gradient-text">Customize Your Quiz</h2>
                <p>Select your challenge and dive in!</p>
            </div>

            <div class="config-grid">
                <!-- Difficulty Selector -->
                <div
                    class="config-card"
                    in:scale={{ duration: 400, delay: 100 }}
                >
                    <h3>🎯 Difficulty Level</h3>
                    <div class="difficulty-selector">
                        {#each ['all', 'easy', 'medium', 'hard'] as level}
                            <button
                                class="difficulty-option"
                                class:active={quiz.quizConfig.difficulty ===
                                    level}
                                onclick={() =>
                                    (quiz.quizConfig.difficulty = level)}
                            >
                                <span class="difficulty-label">
                                    {level.charAt(0).toUpperCase() +
                                        level.slice(1)}
                                </span>
                                {#if quiz.quizConfig.difficulty === level}
                                    <span class="difficulty-check">✓</span>
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Question Count -->
                <div
                    class="config-card"
                    in:scale={{ duration: 400, delay: 200 }}
                >
                    <h3>🔢 Number of Questions</h3>
                    <div class="number-selector">
                        <button
                            class="number-btn"
                            onclick={() =>
                                (quiz.quizConfig.questionCount = Math.max(
                                    5,
                                    quiz.quizConfig.questionCount - 5
                                ))}
                        >
                            −
                        </button>
                        <div class="number-display">
                            <span class="number-value"
                                >{quiz.quizConfig.questionCount}</span
                            >
                            <span class="number-label">questions</span>
                        </div>
                        <button
                            class="number-btn"
                            onclick={() =>
                                (quiz.quizConfig.questionCount = Math.min(
                                    50,
                                    quiz.quizConfig.questionCount + 5
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
                <h3>🎨 Choose Your Category</h3>
                <div class="category-grid">
                    {#each quiz.categories as category, index}
                        <button
                            class="category-card"
                            onclick={() => handleCategoryChange(category)}
                            in:scale={{
                                duration: 300,
                                delay: 350 + index * 30,
                                start: 0.8,
                            }}
                        >
                            <div class="category-icon-wrapper">
                                <span class="category-icon"
                                    >{categoryIcons[category] || '❔'}</span
                                >
                            </div>
                            <span class="category-name">
                                {category === 'all'
                                    ? 'All Categories'
                                    : category}
                            </span>
                            <div class="category-hover-glow"></div>
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
                    <p>Brewing up your questions...</p>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .start-screen-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--spacing-lg);
        opacity: 0;
        animation: fadeIn 0.8s ease forwards;
    }

    .start-screen-container.mounted {
        opacity: 1;
    }

    /* ============================================
       HERO SECTION
       ============================================ */

    .hero-section {
        text-align: center;
        padding: var(--spacing-2xl) 0;
    }

    .logo-wrapper {
        margin-bottom: var(--spacing-2xl);
    }

    .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
    }

    .logo-icon {
        font-size: 5rem;
        animation: float 3s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.6));
    }

    .logo-text {
        font-family: var(--font-display);
        font-size: clamp(4rem, 12vw, 7rem);
        font-weight: 700;
        letter-spacing: -0.03em;
        text-shadow: 0 0 60px rgba(139, 92, 246, 0.5);
    }

    .hero-subtitle {
        font-size: clamp(1.1rem, 3vw, 1.5rem);
        color: var(--text-white);
        font-weight: 600;
        opacity: 0.9;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        font-family: var(--font-display);
    }

    /* ============================================
       3D MODE CARDS
       ============================================ */

    .mode-selection {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--spacing-xl);
        perspective: 1000px;
    }

    .mode-card {
        position: relative;
        background: var(--bg-card);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-2xl);
        padding: var(--spacing-xl);
        text-align: center;
        cursor: pointer;
        transition: all var(--transition-base);
        box-shadow: var(--shadow-xl);
        transform-style: preserve-3d;
        overflow: hidden;
    }

    .mode-card::before {
        content: '';
        position: absolute;
        inset: -2px;
        background: var(--gradient-primary);
        border-radius: var(--radius-2xl);
        opacity: 0;
        transition: opacity var(--transition-base);
        z-index: -1;
    }

    .mode-card:hover {
        transform: translateY(-12px) rotateX(5deg);
        box-shadow: var(--shadow-2xl), var(--glow-purple);
        border-color: transparent;
    }

    .mode-card:hover::before {
        opacity: 1;
    }

    .mode-card:active {
        transform: translateY(-8px) rotateX(3deg) scale(0.98);
    }

    .mode-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(
            circle at 50% 0%,
            var(--electric-purple-light),
            transparent 70%
        );
        opacity: 0;
        transition: opacity var(--transition-base);
        pointer-events: none;
    }

    .mode-card:hover .mode-glow {
        opacity: 0.3;
    }

    .mode-icon {
        width: 100px;
        height: 100px;
        margin: 0 auto var(--spacing-lg);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        background: linear-gradient(
            135deg,
            var(--coral-energy-light),
            var(--ocean-teal-light)
        );
        box-shadow: var(--glow-coral);
        transition: all var(--transition-base);
        position: relative;
    }

    .mode-card:hover .mode-icon {
        transform: scale(1.1) rotate(5deg);
        box-shadow:
            var(--glow-coral),
            0 0 60px rgba(255, 107, 107, 0.8);
    }

    .mode-solo .mode-icon {
        background: linear-gradient(
            135deg,
            var(--coral-energy),
            var(--ocean-teal)
        );
    }

    .mode-group .mode-icon {
        background: linear-gradient(
            135deg,
            var(--sunshine-yellow),
            var(--hot-pink)
        );
    }

    .mode-online .mode-icon {
        background: linear-gradient(
            135deg,
            var(--ocean-teal),
            var(--victory-green)
        );
    }

    .mode-card h3 {
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: var(--spacing-xs);
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-family: var(--font-display);
    }

    .mode-card p {
        color: var(--text-secondary);
        font-size: 1.05rem;
    }

    .mode-shine {
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
        );
        transition: left 0.6s ease;
        pointer-events: none;
    }

    .mode-card:hover .mode-shine {
        left: 150%;
    }

    /* ============================================
       CONFIGURATION SECTION
       ============================================ */

    .config-section {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
    }

    .back-button {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        background: transparent;
        border: none;
        color: var(--text-white);
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        margin-bottom: var(--spacing-xl);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-full);
        transition: all var(--transition-fast);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-family: var(--font-display);
    }

    .back-button:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(-4px);
    }

    .config-header {
        text-align: center;
        margin-bottom: var(--spacing-2xl);
    }

    .config-header h2 {
        font-size: clamp(2.5rem, 6vw, 4rem);
        margin-bottom: var(--spacing-sm);
    }

    .config-header p {
        font-size: 1.2rem;
        color: var(--text-white);
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-family: var(--font-display);
        font-weight: 600;
    }

    .config-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-2xl);
    }

    .config-card {
        background: var(--bg-card);
        border-radius: var(--radius-xl);
        padding: var(--spacing-lg);
        box-shadow: var(--shadow-lg);
        border: 2px solid rgba(139, 92, 246, 0.2);
        transition: all var(--transition-base);
    }

    .config-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
        border-color: var(--coral-energy);
    }

    .config-card h3 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: var(--spacing-md);
        text-align: center;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-family: var(--font-display);
    }

    /* Difficulty Selector */
    .difficulty-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
    }

    .difficulty-option {
        position: relative;
        padding: var(--spacing-md);
        background: rgba(139, 92, 246, 0.05);
        border: 2px solid rgba(139, 92, 246, 0.2);
        border-radius: var(--radius-md);
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-family: var(--font-display);
    }

    .difficulty-option:hover {
        background: rgba(139, 92, 246, 0.1);
        transform: translateY(-2px);
    }

    .difficulty-option.active {
        background: var(--gradient-primary);
        color: var(--text-white);
        border-color: transparent;
        box-shadow: var(--glow-purple);
    }

    .difficulty-check {
        font-size: 1.2rem;
    }

    /* Number Selector */
    .number-selector {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-md);
    }

    .number-btn {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: var(--gradient-primary);
        color: var(--text-white);
        font-size: 2rem;
        font-weight: 700;
        cursor: pointer;
        transition: all var(--transition-fast);
        box-shadow: var(--shadow-md), var(--glow-purple);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .number-btn:hover {
        transform: scale(1.1) rotate(90deg);
        box-shadow:
            var(--shadow-lg),
            0 0 40px rgba(139, 92, 246, 0.8);
    }

    .number-btn:active {
        transform: scale(1.05) rotate(90deg);
    }

    .number-display {
        flex: 1;
        text-align: center;
    }

    .number-value {
        display: block;
        font-family: var(--font-mono);
        font-size: 3rem;
        font-weight: 700;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
    }

    .number-label {
        display: block;
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-top: var(--spacing-xs);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    /* Category Section */
    .category-section {
        margin-bottom: var(--spacing-xl);
    }

    .category-section h3 {
        font-size: 1.75rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: var(--spacing-lg);
        color: var(--text-white);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-family: var(--font-display);
    }

    .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--spacing-md);
    }

    .category-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        background: var(--bg-card);
        border: 2px solid rgba(139, 92, 246, 0.2);
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);
        font-size: 0.95rem;
        font-weight: 600;
        text-align: center;
        cursor: pointer;
        transition: all var(--transition-base);
        box-shadow: var(--shadow-md);
        overflow: hidden;
        color: var(--text-primary);
    }

    .category-card:hover {
        transform: translateY(-6px) scale(1.02);
        box-shadow: var(--shadow-xl);
        border-color: var(--coral-energy);
    }

    .category-icon-wrapper {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.1),
            rgba(236, 72, 153, 0.1)
        );
        border-radius: 50%;
        transition: all var(--transition-base);
    }

    .category-card:hover .category-icon-wrapper {
        transform: scale(1.15) rotate(-5deg);
        background: var(--gradient-primary);
        box-shadow: var(--glow-purple);
    }

    .category-icon {
        font-size: 2rem;
        transition: transform var(--transition-base);
    }

    .category-card:hover .category-icon {
        transform: scale(1.1);
    }

    .category-name {
        line-height: 1.3;
    }

    .category-hover-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(
            circle at 50% 50%,
            var(--coral-energy),
            transparent 70%
        );
        opacity: 0;
        transition: opacity var(--transition-base);
        pointer-events: none;
    }

    .category-card:hover .category-hover-glow {
        opacity: 0.15;
    }

    /* Error Message */
    .error-message {
        margin-top: var(--spacing-lg);
        padding: var(--spacing-md);
        background: rgba(239, 68, 68, 0.1);
        border: 2px solid var(--color-error);
        border-radius: var(--radius-md);
        color: var(--text-white);
        text-align: center;
        font-weight: 600;
    }

    /* Loading Container */
    .loading-container {
        text-align: center;
        margin-top: var(--spacing-xl);
        padding: var(--spacing-xl);
    }

    .loading-spinner {
        width: 60px;
        height: 60px;
        margin: 0 auto var(--spacing-md);
        border: 4px solid rgba(255, 107, 107, 0.2);
        border-top-color: var(--coral-energy);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loading-container p {
        font-weight: 600;
        color: var(--text-white);
        font-size: 1.1rem;
    }

    /* ============================================
       RESPONSIVE DESIGN
       ============================================ */

    @media (max-width: 768px) {
        .logo-text {
            font-size: clamp(3rem, 10vw, 5rem);
        }

        .mode-selection {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
        }

        .config-grid {
            grid-template-columns: 1fr;
        }

        .category-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
    }

    @media (max-width: 480px) {
        .logo-icon {
            font-size: 3.5rem;
        }

        .mode-icon {
            width: 80px;
            height: 80px;
            font-size: 2.5rem;
        }

        .category-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>
