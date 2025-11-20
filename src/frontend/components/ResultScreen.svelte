<script>
    import { quiz, resetQuiz } from '../stores/quiz.svelte.js'
    import { createConfetti } from '../lib/confetti.js'
    import { playApplauseSound, playBooSound } from '../lib/audio.js'
    import HallOfFame from './HallOfFame.svelte'
    import { scale, fly, fade } from 'svelte/transition'
    import { APP_CONFIG } from '../lib/constants.js'

    let showHallOfFame = $state(false)
    let savedHallOfFameId = $state(null)

    const category = $derived(
        quiz.quizConfig.category === 'all' ? null : quiz.quizConfig.category
    )
    const difficulty = $derived(
        quiz.quizConfig.difficulty === 'all' ? null : quiz.quizConfig.difficulty
    )

    $effect(() => {
        if (quiz.quizResults) {
            const { percentage, hallOfFameId: id } = quiz.quizResults
            if (id) {
                savedHallOfFameId = id
                quiz.hallOfFameId = id
            }
            if (percentage >= 70) {
                createConfetti()
                playApplauseSound(quiz.audioFiles)
            } else if (percentage < 40) {
                playBooSound(quiz.audioFiles)
            }
        }
    })

    function getScoreMessage(percentage) {
        if (percentage >= 90)
            return {
                emoji: '🎉',
                text: "Outstanding! You're a quiz master!",
                color: 'var(--laser-green)',
            }
        if (percentage >= 70)
            return {
                emoji: '👏',
                text: 'Great job! You really know your stuff!',
                color: 'var(--neon-blue)',
            }
        if (percentage >= 50)
            return {
                emoji: '👍',
                text: 'Good effort! A solid performance.',
                color: 'var(--sunset-orange)',
            }
        return {
            emoji: '📚',
            text: 'Keep learning! Every quiz is a new opportunity.',
            color: 'var(--cyber-pink)',
        }
    }

    function getAnswerText(result, question) {
        if (result.questionType === 'question') {
            return result.selectedAnswer || '(No answer)'
        }
        return (
            question.answers?.[result.selectedAnswer] ?? result.selectedAnswer
        )
    }

    function getCorrectAnswerText(result, question) {
        if (result.questionType === 'question') {
            return result.correctAnswer
        }
        return question.answers?.[result.correctAnswer] ?? result.correctAnswer
    }

    function handlePlayAgain() {
        resetQuiz()
    }

    function handleViewHallOfFame() {
        showHallOfFame = true
    }

    const scoreMessage = $derived(
        getScoreMessage(quiz.quizResults?.percentage || 0)
    )
</script>

<div class="result-screen" in:scale={{ duration: 500, start: 0.9 }}>
    {#if !showHallOfFame}
        <div class="result-container">
            <!-- Branding Header -->
            <div class="brand-header" in:fly={{ y: -20, duration: 400 }}>
                <h1 class="logo-text gradient-text">{APP_CONFIG.name}</h1>
            </div>

            <!-- Celebration Header -->
            <div
                class="result-header"
                in:fly={{ y: -30, duration: 500, delay: 100 }}
            >
                <div class="celebration-icon">{scoreMessage.emoji}</div>
                <h2 class="gradient-text">Quiz Complete!</h2>
                <p class="result-message" style="color: {scoreMessage.color}">
                    {scoreMessage.text}
                </p>
            </div>

            {#if quiz.quizResults}
                <!-- Score Circle -->
                <div
                    class="score-showcase"
                    in:scale={{ duration: 600, delay: 200 }}
                >
                    <div class="score-ring">
                        <svg class="ring-svg" viewBox="0 0 200 200">
                            <circle
                                class="ring-background"
                                cx="100"
                                cy="100"
                                r="90"
                                fill="none"
                                stroke="rgba(139, 92, 246, 0.1)"
                                stroke-width="12"
                            />
                            <circle
                                class="ring-progress"
                                cx="100"
                                cy="100"
                                r="90"
                                fill="none"
                                stroke="url(#gradient)"
                                stroke-width="12"
                                stroke-linecap="round"
                                stroke-dasharray="{(quiz.quizResults
                                    .percentage /
                                    100) *
                                    565.48} 565.48"
                                transform="rotate(-90 100 100)"
                            />
                            <defs>
                                <linearGradient
                                    id="gradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                >
                                    <stop
                                        offset="0%"
                                        stop-color="var(--electric-purple)"
                                    />
                                    <stop
                                        offset="100%"
                                        stop-color="var(--cyber-pink)"
                                    />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div class="score-content">
                            <div class="score-number">
                                {quiz.quizResults.score}
                            </div>
                            <div class="score-divider">/</div>
                            <div class="score-total">
                                {quiz.quizResults.total}
                            </div>
                        </div>
                    </div>
                    <div class="percentage-badge">
                        {quiz.quizResults.percentage}%
                    </div>
                </div>

                <!-- Stats Grid -->
                <div
                    class="stats-grid"
                    in:fly={{ y: 20, duration: 500, delay: 400 }}
                >
                    <div class="stat-card stat-correct">
                        <div class="stat-icon">✓</div>
                        <div class="stat-value">{quiz.quizResults.score}</div>
                        <div class="stat-label">Correct</div>
                    </div>
                    <div class="stat-card stat-incorrect">
                        <div class="stat-icon">✗</div>
                        <div class="stat-value">
                            {quiz.quizResults.total - quiz.quizResults.score}
                        </div>
                        <div class="stat-label">Incorrect</div>
                    </div>
                    <div class="stat-card stat-percentage">
                        <div class="stat-icon">%</div>
                        <div class="stat-value">
                            {quiz.quizResults.percentage}
                        </div>
                        <div class="stat-label">Accuracy</div>
                    </div>
                </div>

                <!-- Detailed Results -->
                <div
                    class="results-section"
                    in:fly={{ y: 20, duration: 500, delay: 600 }}
                >
                    <h3>Review Your Answers</h3>
                    <div class="results-list">
                        {#each quiz.quizResults.results as result, index}
                            <div
                                class="result-item"
                                class:correct={result.isCorrect}
                                in:fly={{
                                    x: -20,
                                    duration: 300,
                                    delay: 700 + index * 50,
                                }}
                            >
                                <div class="result-item-header">
                                    <span class="question-num"
                                        >Q{index + 1}</span
                                    >
                                    <p class="question-preview">
                                        {result.question}
                                    </p>
                                    <span
                                        class="result-badge"
                                        class:correct={result.isCorrect}
                                    >
                                        {result.isCorrect ? '✓' : '✗'}
                                    </span>
                                </div>
                                <div class="result-item-body">
                                    <div class="answer-row">
                                        <span class="answer-label"
                                            >Your answer:</span
                                        >
                                        <strong class="user-answer">
                                            {getAnswerText(
                                                result,
                                                quiz.questions[index]
                                            )}
                                        </strong>
                                    </div>
                                    {#if !result.isCorrect}
                                        <div class="answer-row correct-row">
                                            <span class="answer-label"
                                                >Correct:</span
                                            >
                                            <strong class="correct-answer">
                                                {getCorrectAnswerText(
                                                    result,
                                                    quiz.questions[index]
                                                )}
                                            </strong>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Action Buttons -->
            <div
                class="result-actions"
                in:fly={{ y: 20, duration: 500, delay: 800 }}
            >
                <button class="btn-modern" onclick={handlePlayAgain}>
                    Play Again →
                </button>
                <button class="btn-secondary" onclick={handleViewHallOfFame}>
                    Hall of Fame
                </button>
            </div>
        </div>
    {:else}
        <HallOfFame
            {savedHallOfFameId}
            {category}
            {difficulty}
            onplayagain={handlePlayAgain}
        />
    {/if}
</div>

<style>
    .result-screen {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        padding: var(--spacing-md);
    }

    .result-container {
        background: var(--bg-card);
        border-radius: var(--radius-2xl);
        padding: var(--spacing-2xl);
        box-shadow: var(--shadow-2xl);
        border: 2px solid rgba(139, 92, 246, 0.2);
    }

    /* ============================================
       BRANDING HEADER
       ============================================ */

    .brand-header {
        text-align: center;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-lg);
        border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    }

    .logo-text {
        font-family: var(--font-display);
        font-size: clamp(2.5rem, 8vw, 4rem);
        font-weight: 700;
        letter-spacing: -0.03em;
        text-shadow: 0 0 40px rgba(255, 107, 107, 0.5);
        margin: 0;
    }

    /* ============================================
       HEADER
       ============================================ */

    .result-header {
        text-align: center;
        margin-bottom: var(--spacing-2xl);
    }

    .celebration-icon {
        font-size: 5rem;
        margin-bottom: var(--spacing-md);
        animation: bounce 2s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.6));
    }

    .result-header h2 {
        font-size: clamp(2.5rem, 6vw, 4rem);
        margin-bottom: var(--spacing-sm);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-family: var(--font-display);
    }

    .result-message {
        font-size: 1.3rem;
        font-weight: 700;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-family: var(--font-display);
    }

    /* ============================================
       SCORE SHOWCASE
       ============================================ */

    .score-showcase {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: var(--spacing-2xl);
    }

    .score-ring {
        position: relative;
        width: 240px;
        height: 240px;
        margin-bottom: var(--spacing-lg);
    }

    .ring-svg {
        width: 100%;
        height: 100%;
        transform: rotate(0deg);
    }

    .ring-progress {
        transition: stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.8));
    }

    .score-content {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
    }

    .score-number {
        font-family: var(--font-mono);
        font-size: 4rem;
        font-weight: 900;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
    }

    .score-divider {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-secondary);
    }

    .score-total {
        font-family: var(--font-mono);
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-secondary);
        line-height: 1;
    }

    .percentage-badge {
        font-family: var(--font-mono);
        font-size: 2rem;
        font-weight: 900;
        padding: var(--spacing-sm) var(--spacing-lg);
        background: var(--gradient-primary);
        color: var(--text-white);
        border-radius: var(--radius-full);
        box-shadow: var(--glow-purple);
    }

    /* ============================================
       STATS GRID
       ============================================ */

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-2xl);
    }

    .stat-card {
        background: rgba(139, 92, 246, 0.05);
        border: 2px solid rgba(139, 92, 246, 0.2);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        text-align: center;
        transition: all var(--transition-base);
    }

    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
    }

    .stat-icon {
        width: 50px;
        height: 50px;
        margin: 0 auto var(--spacing-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 1.5rem;
        font-weight: 900;
    }

    .stat-correct .stat-icon {
        background: linear-gradient(
            135deg,
            var(--victory-green),
            var(--ocean-teal)
        );
        color: white;
    }

    .stat-incorrect .stat-icon {
        background: linear-gradient(
            135deg,
            var(--color-error),
            var(--coral-energy)
        );
        color: white;
    }

    .stat-percentage .stat-icon {
        background: linear-gradient(
            135deg,
            var(--coral-energy),
            var(--ocean-teal)
        );
        color: white;
    }

    .stat-value {
        font-family: var(--font-mono);
        font-size: 2rem;
        font-weight: 900;
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
    }

    .stat-label {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    /* ============================================
       RESULTS SECTION
       ============================================ */

    .results-section {
        margin-bottom: var(--spacing-2xl);
    }

    .results-section h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: var(--spacing-md);
        text-align: center;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-family: var(--font-display);
    }

    .results-list {
        max-height: 400px;
        overflow-y: auto;
        padding-right: var(--spacing-sm);
    }

    .result-item {
        background: rgba(139, 92, 246, 0.03);
        border: 2px solid rgba(139, 92, 246, 0.15);
        border-left-width: 6px;
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-md);
        transition: all var(--transition-base);
    }

    .result-item:hover {
        transform: translateX(4px);
        box-shadow: var(--shadow-sm);
    }

    .result-item.correct {
        border-left-color: var(--laser-green);
        background: rgba(16, 185, 129, 0.03);
    }

    .result-item:not(.correct) {
        border-left-color: var(--color-error);
        background: rgba(239, 68, 68, 0.03);
    }

    .result-item-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
    }

    .question-num {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(139, 92, 246, 0.1);
        border-radius: var(--radius-sm);
        font-weight: 900;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        color: var(--electric-purple);
    }

    .question-preview {
        flex: 1;
        font-weight: 600;
        font-size: 0.95rem;
        line-height: 1.4;
        color: var(--text-primary);
    }

    .result-badge {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: 900;
        font-size: 1.1rem;
    }

    .result-badge.correct {
        background: var(--laser-green);
        color: white;
    }

    .result-badge:not(.correct) {
        background: var(--color-error);
        color: white;
    }

    .result-item-body {
        padding-left: calc(40px + var(--spacing-sm));
    }

    .answer-row {
        display: flex;
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-xs);
        font-size: 0.9rem;
    }

    .answer-label {
        color: var(--text-secondary);
        font-weight: 600;
    }

    .user-answer {
        color: var(--text-primary);
    }

    .correct-row {
        color: var(--laser-green);
    }

    .correct-answer {
        color: var(--laser-green);
    }

    /* ============================================
       ACTIONS
       ============================================ */

    .result-actions {
        display: flex;
        gap: var(--spacing-md);
        padding-top: var(--spacing-lg);
        border-top: 2px solid rgba(139, 92, 246, 0.1);
    }

    .result-actions > button {
        flex: 1;
    }

    /* ============================================
       RESPONSIVE
       ============================================ */

    @media (max-width: 768px) {
        .result-container {
            padding: var(--spacing-xl);
        }

        .score-ring {
            width: 200px;
            height: 200px;
        }

        .score-number {
            font-size: 3rem;
        }

        .score-total {
            font-size: 2rem;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .result-actions {
            flex-direction: column;
        }
    }

    @media (max-width: 480px) {
        .result-container {
            padding: var(--spacing-lg);
        }

        .celebration-icon {
            font-size: 4rem;
        }

        .result-header h2 {
            font-size: 2.5rem;
        }
    }
</style>
