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
        quiz.config.category === 'all' ? null : quiz.config.category
    )
    const difficulty = $derived(
        quiz.config.difficulty === 'all' ? null : quiz.config.difficulty
    )

    $effect(() => {
        if (quiz.results) {
            const { percentage, hallOfFameId: id } = quiz.results
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
                text: 'Outstanding! Masterful performance!',
                color: 'var(--success)',
            }
        if (percentage >= 70)
            return {
                emoji: '👏',
                text: 'Great job! You know your stuff.',
                color: 'var(--primary-light)',
            }
        if (percentage >= 50)
            return {
                emoji: '👍',
                text: 'Good effort! Keep practicing.',
                color: 'var(--warning)',
            }
        return {
            emoji: '📚',
            text: 'Keep learning! Every quiz counts.',
            color: 'var(--text-muted)',
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
        getScoreMessage(quiz.results?.percentage || 0)
    )
</script>

<div class="result-screen" in:scale={{ duration: 500, start: 0.95 }}>
    {#if !showHallOfFame}
        <div class="glass-card result-container">
            <!-- Header -->
            <div class="brand-header" in:fly={{ y: -10, duration: 400 }}>
                <h1 class="logo-text gradient-text">{APP_CONFIG.name}</h1>
            </div>

            <!-- Score Section -->
            <div class="score-section" in:scale={{ duration: 500, delay: 100 }}>
                <div class="score-ring-container">
                    <svg class="score-ring" viewBox="0 0 200 200">
                        <circle
                            class="ring-bg"
                            cx="100"
                            cy="100"
                            r="88"
                            fill="none"
                            stroke-width="8"
                        />
                        <circle
                            class="ring-progress"
                            cx="100"
                            cy="100"
                            r="88"
                            fill="none"
                            stroke-width="8"
                            stroke-linecap="round"
                            stroke-dasharray="{(quiz.results.percentage / 100) *
                                552.9} 552.9"
                            transform="rotate(-90 100 100)"
                        />
                    </svg>
                    <div class="score-content">
                        <div class="score-value">
                            {quiz.results.score}
                        </div>
                        <div class="score-label">
                            of {quiz.results.total}
                        </div>
                    </div>
                </div>

                <div class="message-container">
                    <div class="celebration-emoji">{scoreMessage.emoji}</div>
                    <h2 class="gradient-text">
                        {quiz.results.percentage}%
                    </h2>
                    <p style="color: {scoreMessage.color}">
                        {scoreMessage.text}
                    </p>
                </div>
            </div>

            <!-- Stats Grid -->
            <div
                class="stats-grid"
                in:fly={{ y: 20, duration: 500, delay: 200 }}
            >
                <div class="stat-card">
                    <span class="stat-label">Correct</span>
                    <span class="stat-value success">{quiz.results.score}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Incorrect</span>
                    <span class="stat-value error">
                        {quiz.results.total - quiz.results.score}
                    </span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Accuracy</span>
                    <span class="stat-value primary"
                        >{quiz.results.percentage}%</span
                    >
                </div>
            </div>

            <!-- Answer Review -->
            <div
                class="review-section"
                in:fly={{ y: 20, duration: 500, delay: 300 }}
            >
                <h3>Answer Review</h3>
                <div class="review-list">
                    {#each quiz.results.results as result, index}
                        <div
                            class="review-item"
                            class:correct={result.isCorrect}
                        >
                            <div class="review-header">
                                <span class="q-num">Q{index + 1}</span>
                                <p class="q-text">{result.question}</p>
                                <span class="status-icon"
                                    >{result.isCorrect ? '✓' : '✗'}</span
                                >
                            </div>
                            <div class="review-details">
                                <div class="detail-row">
                                    <span class="label">You:</span>
                                    <span
                                        class="value {result.isCorrect
                                            ? 'success'
                                            : 'error'}"
                                    >
                                        {getAnswerText(
                                            result,
                                            quiz.questions[index]
                                        )}
                                    </span>
                                </div>
                                {#if !result.isCorrect}
                                    <div class="detail-row">
                                        <span class="label">Correct:</span>
                                        <span class="value success">
                                            {getCorrectAnswerText(
                                                result,
                                                quiz.questions[index]
                                            )}
                                        </span>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Actions -->
            <div
                class="action-section"
                in:fly={{ y: 20, duration: 500, delay: 400 }}
            >
                <button class="btn-modern" onclick={handlePlayAgain}>
                    Play Again
                </button>
                <button class="btn-secondary" onclick={handleViewHallOfFame}>
                    Hall of Fame
                </button>
            </div>
        </div>
    {:else}
        <HallOfFame
            hallOfFameId={savedHallOfFameId}
            {category}
            {difficulty}
            onplayagain={handlePlayAgain}
        />
    {/if}
</div>

<style>
    .result-screen {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: var(--spacing-md);
    }

    .result-container {
        padding: var(--spacing-xl);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
    }

    .brand-header {
        text-align: center;
        border-bottom: 1px solid var(--glass-border);
        padding-bottom: var(--spacing-lg);
    }

    .logo-text {
        font-size: 2rem;
        margin: 0;
    }

    /* Score Section */
    .score-section {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xl);
        flex-wrap: wrap;
    }

    .score-ring-container {
        position: relative;
        width: 180px;
        height: 180px;
    }

    .score-ring {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }

    .ring-bg {
        stroke: rgba(255, 255, 255, 0.1);
    }

    .ring-progress {
        stroke: var(--primary);
        stroke-linecap: round;
        transition: stroke-dasharray 1.5s ease-out;
    }

    .score-content {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .score-value {
        font-size: 3.5rem;
        font-weight: 700;
        line-height: 1;
        color: var(--text-main);
    }

    .score-label {
        font-size: 1rem;
        color: var(--text-muted);
    }

    .message-container {
        text-align: center;
        flex: 1;
        min-width: 200px;
    }

    .celebration-emoji {
        font-size: 3rem;
        margin-bottom: var(--spacing-xs);
    }

    .message-container h2 {
        font-size: 3rem;
        margin-bottom: var(--spacing-xs);
    }

    .message-container p {
        font-size: 1.1rem;
        font-weight: 500;
    }

    /* Stats Grid */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-md);
    }

    .stat-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .stat-label {
        font-size: 0.85rem;
        text-transform: uppercase;
        color: var(--text-muted);
        letter-spacing: 0.05em;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
    }
    .stat-value.success {
        color: var(--success);
    }
    .stat-value.error {
        color: var(--error);
    }
    .stat-value.primary {
        color: var(--primary-light);
    }

    /* Review Section */
    .review-section h3 {
        text-align: center;
        font-size: 1rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--spacing-md);
    }

    .review-list {
        max-height: 300px;
        overflow-y: auto;
        padding-right: var(--spacing-xs);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .review-item {
        background: rgba(255, 255, 255, 0.02);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        border-left: 3px solid transparent;
    }

    .review-item.correct {
        border-left-color: var(--success);
    }
    .review-item:not(.correct) {
        border-left-color: var(--error);
    }

    .review-header {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
    }

    .q-num {
        font-weight: 600;
        color: var(--text-muted);
        font-size: 0.9rem;
    }

    .q-text {
        flex: 1;
        font-weight: 500;
        font-size: 0.95rem;
    }

    .status-icon {
        font-weight: 700;
    }

    .review-details {
        font-size: 0.9rem;
        padding-left: calc(var(--spacing-md) + 20px);
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .detail-row {
        display: flex;
        gap: var(--spacing-sm);
    }

    .label {
        color: var(--text-muted);
        min-width: 60px;
    }
    .value.success {
        color: var(--success);
    }
    .value.error {
        color: var(--error);
    }

    /* Actions */
    .action-section {
        display: flex;
        gap: var(--spacing-md);
    }

    .action-section > button {
        flex: 1;
    }

    @media (max-width: 600px) {
        .score-section {
            flex-direction: column;
            gap: var(--spacing-lg);
        }
        .stats-grid {
            grid-template-columns: 1fr;
        }
        .action-section {
            flex-direction: column;
        }
    }
</style>
