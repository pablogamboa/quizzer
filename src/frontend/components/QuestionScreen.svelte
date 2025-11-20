<script>
    import { fly, scale, fade } from 'svelte/transition'
    import {
        quiz,
        nextQuestion,
        selectAnswer,
        currentQuestion,
        currentPlayer,
        progress,
    } from '../stores/quiz.svelte.js'
    import { submitQuiz } from '../lib/api.js'

    let textInput = $state('')
    let isSubmitting = $state(false)
    let playerName = $state('')
    let showNameInput = $state(false)

    $effect(() => {
        if (!quiz.quizStartTime) {
            quiz.quizStartTime = Date.now()
        }
    })

    const currentDisplayQuestion = $derived(
        quiz.gameMode === 'group'
            ? quiz.questions[
                  quiz.currentQuestionIndex * quiz.players.length +
                      quiz.currentPlayerIndex
              ]
            : currentQuestion()
    )

    const inputType = $derived(currentDisplayQuestion?.answerType || 'text')

    const isLastQuestion = $derived(
        quiz.gameMode === 'group'
            ? quiz.currentQuestionIndex * quiz.players.length +
                  quiz.currentPlayerIndex ===
                  quiz.questions.length - 1
            : quiz.currentQuestionIndex === quiz.questions.length - 1
    )
    const nextButtonText = $derived(
        isLastQuestion ? 'Finish Quiz' : 'Next Question'
    )
    const canProceed = $derived(quiz.selectedAnswer !== null)

    function handleAnswerSelect(index) {
        selectAnswer(index)
        if ('vibrate' in navigator) {
            navigator.vibrate(50)
        }
    }

    function handleTextInput() {
        const stringValue = String(textInput)
        const trimmedValue = stringValue.trim()
        if (inputType === 'number') {
            const isValidNumber =
                trimmedValue !== '' && !isNaN(Number(trimmedValue))
            selectAnswer(isValidNumber ? trimmedValue : null)
        } else {
            selectAnswer(trimmedValue.length > 0 ? trimmedValue : null)
        }
    }

    async function handleNextQuestion() {
        if (quiz.selectedAnswer === null || isSubmitting) return

        isSubmitting = true
        const question = currentDisplayQuestion

        if (quiz.gameMode === 'group') {
            const answer =
                question.type === 'question'
                    ? {
                          questionId: question.id,
                          textAnswer: quiz.selectedAnswer,
                          player: currentPlayer(),
                      }
                    : {
                          questionId: question.id,
                          selectedAnswer: quiz.selectedAnswer,
                          player: currentPlayer(),
                      }

            const currentPlayerData = quiz.playerScores[currentPlayer()] || {
                answers: [],
                score: 0,
            }
            const updatedAnswers = [...currentPlayerData.answers, answer]

            quiz.playerScores[currentPlayer()] = {
                ...currentPlayerData,
                answers: updatedAnswers,
            }
        } else {
            const answer =
                question.type === 'question'
                    ? {
                          questionId: question.id,
                          textAnswer: quiz.selectedAnswer,
                      }
                    : {
                          questionId: question.id,
                          selectedAnswer: quiz.selectedAnswer,
                      }
            quiz.userAnswers.push(answer)
        }

        if (quiz.gameMode === 'group') {
            let totalAnswers = 0
            for (const p of quiz.players) {
                totalAnswers += (quiz.playerScores[p]?.answers || []).length
            }
            if (totalAnswers >= quiz.questions.length) {
                quiz.currentScreen = 'groupResult'
            } else {
                const nextPlayerIndex =
                    (quiz.currentPlayerIndex + 1) % quiz.players.length
                quiz.currentPlayerIndex = nextPlayerIndex
                if (nextPlayerIndex === 0) {
                    quiz.currentQuestionIndex++
                }
                quiz.selectedAnswer = null
            }
        } else {
            if (quiz.currentQuestionIndex === quiz.questions.length - 1) {
                showNameInput = true
            } else {
                nextQuestion()
            }
        }

        textInput = ''
        isSubmitting = false
    }

    async function handleSubmitQuiz() {
        try {
            isSubmitting = true
            const timeTaken = quiz.quizStartTime
                ? Math.floor((Date.now() - quiz.quizStartTime) / 1000)
                : null
            const category =
                quiz.quizConfig.category === 'all'
                    ? null
                    : quiz.quizConfig.category
            const difficulty =
                quiz.quizConfig.difficulty === 'all'
                    ? null
                    : quiz.quizConfig.difficulty

            const results = await submitQuiz(
                quiz.userAnswers,
                playerName.trim() || null,
                category,
                difficulty,
                timeTaken
            )

            if (results.hallOfFameId) {
                quiz.hallOfFameId = results.hallOfFameId
            }

            quiz.quizResults = results
            quiz.currentScreen = 'result'
        } catch (error) {
            quiz.currentScreen = 'error'
        } finally {
            isSubmitting = false
            showNameInput = false
        }
    }

    function handleSkipName() {
        playerName = ''
        handleSubmitQuiz()
    }
</script>

<div class="question-screen" in:scale={{ duration: 500, start: 0.9 }}>
    <div class="question-card">
        <!-- Enhanced Progress Bar -->
        <div class="progress-container" in:fly={{ y: -20, duration: 400 }}>
            <div class="progress-header">
                <span class="progress-label">
                    Question <strong>{quiz.currentQuestionIndex + 1}</strong> of
                    <strong>{quiz.questions.length}</strong>
                </span>
                {#if quiz.gameMode === 'group'}
                    <span class="player-indicator"
                        >{currentPlayer()}'s Turn</span
                    >
                {/if}
            </div>
            <div class="progress-track">
                <div class="progress-fill" style="width: {progress()}%">
                    <div class="progress-glow"></div>
                </div>
            </div>
        </div>

        <!-- Question Content -->
        <div
            class="question-content"
            in:fly={{ y: 20, duration: 500, delay: 100 }}
        >
            <div class="badge-row">
                <span class="category-badge">
                    {currentDisplayQuestion?.category}
                </span>
                <span
                    class="difficulty-badge {currentDisplayQuestion?.difficulty}"
                >
                    {currentDisplayQuestion?.difficulty}
                </span>
            </div>

            <h2 class="question-text">{currentDisplayQuestion?.question}</h2>

            {#if currentDisplayQuestion?.type === 'picture' && currentDisplayQuestion?.imageUrl}
                <div
                    class="image-container"
                    in:scale={{ duration: 500, delay: 200 }}
                >
                    <img
                        src={currentDisplayQuestion.imageUrl}
                        alt="Question context"
                        class="question-image"
                    />
                </div>
            {/if}
        </div>

        <!-- Answer Options -->
        <div class="answers-section">
            {#if currentDisplayQuestion?.type === 'trivia' || currentDisplayQuestion?.type === 'picture'}
                <div class="answer-grid">
                    {#each currentDisplayQuestion.answers as answer, index}
                        <button
                            class="answer-option"
                            class:selected={quiz.selectedAnswer === index}
                            onclick={() => handleAnswerSelect(index)}
                            in:fly={{
                                x: index % 2 === 0 ? -30 : 30,
                                duration: 400,
                                delay: 300 + index * 80,
                            }}
                        >
                            <span class="answer-marker"
                                >{String.fromCharCode(65 + index)}</span
                            >
                            <span class="answer-content">{answer}</span>
                            <div class="answer-glow"></div>
                        </button>
                    {/each}
                </div>
            {:else if currentDisplayQuestion?.type === 'question'}
                <div
                    class="text-answer-wrapper"
                    in:scale={{ duration: 400, delay: 300 }}
                >
                    <input
                        type={inputType}
                        class="text-answer-input"
                        placeholder={inputType === 'number'
                            ? 'Enter a number...'
                            : 'Type your answer...'}
                        bind:value={textInput}
                        oninput={handleTextInput}
                        autocomplete="off"
                        autocorrect={inputType === 'number' ? 'off' : 'on'}
                        spellcheck="false"
                        inputmode={inputType === 'number' ? 'numeric' : 'text'}
                    />
                </div>
            {/if}
        </div>

        <!-- Action Button -->
        <div
            class="action-section"
            in:fly={{ y: 20, duration: 400, delay: 500 }}
        >
            <button
                class="btn-modern btn-next"
                onclick={handleNextQuestion}
                disabled={!canProceed || isSubmitting}
            >
                {#if isSubmitting}
                    <span class="loading-dots">
                        <span></span><span></span><span></span>
                    </span>
                {:else}
                    {nextButtonText} →
                {/if}
            </button>
        </div>
    </div>
</div>

<!-- Name Input Modal -->
{#if showNameInput}
    <div
        class="modal-overlay"
        in:fade={{ duration: 300 }}
        onclick={handleSkipName}
        onkeydown={(e) => e.key === 'Escape' && handleSkipName()}
        role="button"
        tabindex="0"
    >
        <div
            class="modal-card"
            in:scale={{ duration: 400, start: 0.9 }}
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            role="dialog"
            tabindex="-1"
        >
            <div class="modal-icon">🎉</div>
            <h2>Quiz Complete!</h2>
            <p>Enter your name to save your score to the Hall of Fame.</p>
            <input
                type="text"
                class="modal-input"
                placeholder="Your Name"
                bind:value={playerName}
                maxlength="30"
                onkeypress={(e) =>
                    e.key === 'Enter' &&
                    playerName.trim() &&
                    handleSubmitQuiz()}
            />
            <div class="modal-actions">
                <button
                    class="btn-modern"
                    onclick={handleSubmitQuiz}
                    disabled={isSubmitting || !playerName.trim()}
                >
                    {isSubmitting ? 'Saving...' : 'Save Score'}
                </button>
                <button
                    class="btn-secondary"
                    onclick={handleSkipName}
                    disabled={isSubmitting}
                >
                    Skip
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .question-screen {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        padding: var(--spacing-md);
    }

    .question-card {
        background: var(--bg-card);
        border-radius: var(--radius-2xl);
        padding: var(--spacing-xl);
        box-shadow: var(--shadow-2xl);
        border: 2px solid rgba(139, 92, 246, 0.2);
    }

    /* ============================================
       PROGRESS BAR
       ============================================ */

    .progress-container {
        margin-bottom: var(--spacing-xl);
    }

    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);
        font-size: 0.95rem;
        color: var(--text-secondary);
    }

    .progress-label strong {
        color: var(--text-primary);
        font-family: var(--font-mono);
    }

    .player-indicator {
        padding: var(--spacing-xs) var(--spacing-sm);
        background: var(--gradient-primary);
        color: var(--text-white);
        border-radius: var(--radius-full);
        font-weight: 700;
        font-size: 0.9rem;
    }

    .progress-track {
        height: 14px;
        background: rgba(139, 92, 246, 0.1);
        border-radius: var(--radius-full);
        overflow: hidden;
        position: relative;
    }

    .progress-fill {
        height: 100%;
        background: var(--gradient-primary);
        border-radius: var(--radius-full);
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        box-shadow: var(--glow-purple);
    }

    .progress-glow {
        position: absolute;
        top: 0;
        right: 0;
        width: 40px;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.5)
        );
        animation: progressGlow 2s ease-in-out infinite;
    }

    @keyframes progressGlow {
        0%,
        100% {
            opacity: 0.5;
        }
        50% {
            opacity: 1;
        }
    }

    /* ============================================
       QUESTION CONTENT
       ============================================ */

    .question-content {
        margin-bottom: var(--spacing-xl);
    }

    .badge-row {
        display: flex;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
        flex-wrap: wrap;
    }

    .category-badge,
    .difficulty-badge {
        font-size: 0.85rem;
        font-weight: 700;
        padding: 0.4rem 0.9rem;
        border-radius: var(--radius-full);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .category-badge {
        background: linear-gradient(
            135deg,
            rgba(0, 206, 201, 0.2),
            rgba(0, 206, 201, 0.1)
        );
        color: var(--ocean-teal-light);
        border: 1px solid var(--ocean-teal);
    }

    .difficulty-badge.easy {
        background: linear-gradient(
            135deg,
            rgba(0, 210, 160, 0.2),
            rgba(0, 210, 160, 0.1)
        );
        color: var(--victory-green-light);
        border: 1px solid var(--victory-green);
    }

    .difficulty-badge.medium {
        background: linear-gradient(
            135deg,
            rgba(249, 115, 22, 0.2),
            rgba(249, 115, 22, 0.1)
        );
        color: var(--sunset-orange-light);
        border: 1px solid var(--sunset-orange);
    }

    .difficulty-badge.hard {
        background: linear-gradient(
            135deg,
            rgba(239, 68, 68, 0.2),
            rgba(239, 68, 68, 0.1)
        );
        color: #fca5a5;
        border: 1px solid var(--color-error);
    }

    .question-text {
        font-size: clamp(1.4rem, 4vw, 2rem);
        font-weight: 700;
        line-height: 1.4;
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
    }

    .image-container {
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        margin-top: var(--spacing-md);
    }

    .question-image {
        width: 100%;
        height: auto;
        display: block;
    }

    /* ============================================
       ANSWER OPTIONS
       ============================================ */

    .answers-section {
        margin-bottom: var(--spacing-xl);
    }

    .answer-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--spacing-md);
    }

    .answer-option {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: rgba(139, 92, 246, 0.05);
        border: 2px solid rgba(139, 92, 246, 0.2);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-base);
        text-align: left;
        overflow: hidden;
    }

    .answer-option:hover {
        transform: translateY(-4px) scale(1.02);
        border-color: var(--coral-energy);
        box-shadow: var(--shadow-md);
    }

    .answer-option.selected {
        background: var(--gradient-primary);
        border-color: transparent;
        box-shadow: var(--glow-purple);
        color: var(--text-white);
    }

    .answer-marker {
        width: 48px;
        height: 48px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(139, 92, 246, 0.1);
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 1.25rem;
        transition: all var(--transition-base);
    }

    .answer-option.selected .answer-marker {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.1);
    }

    .answer-content {
        flex: 1;
        font-size: 1.05rem;
        font-weight: 600;
        line-height: 1.4;
    }

    .answer-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(
            circle at 50% 50%,
            var(--coral-energy-light),
            transparent 70%
        );
        opacity: 0;
        transition: opacity var(--transition-base);
        pointer-events: none;
    }

    .answer-option:hover .answer-glow {
        opacity: 0.15;
    }

    /* Text Answer */
    .text-answer-wrapper {
        max-width: 600px;
        margin: 0 auto;
    }

    .text-answer-input {
        width: 100%;
        padding: var(--spacing-md) var(--spacing-lg);
        font-size: 1.2rem;
        font-weight: 600;
        border: 3px solid rgba(139, 92, 246, 0.3);
        border-radius: var(--radius-lg);
        background: rgba(255, 255, 255, 0.95);
        transition: all var(--transition-base);
        text-align: center;
        font-family: var(--font-body);
    }

    .text-answer-input:focus {
        outline: none;
        border-color: var(--coral-energy);
        box-shadow:
            0 0 0 4px rgba(139, 92, 246, 0.2),
            var(--shadow-lg);
        transform: scale(1.02);
    }

    /* ============================================
       ACTION SECTION
       ============================================ */

    .action-section {
        display: flex;
        justify-content: flex-end;
        padding-top: var(--spacing-md);
        border-top: 2px solid rgba(139, 92, 246, 0.1);
    }

    .btn-next {
        min-width: 200px;
        font-size: 1.15rem;
    }

    /* ============================================
       MODAL
       ============================================ */

    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--z-modal-backdrop);
        padding: var(--spacing-lg);
    }

    .modal-card {
        background: var(--bg-card);
        padding: var(--spacing-2xl);
        border-radius: var(--radius-2xl);
        max-width: 500px;
        width: 100%;
        text-align: center;
        box-shadow: var(--shadow-2xl), var(--glow-purple);
        border: 2px solid rgba(139, 92, 246, 0.3);
    }

    .modal-icon {
        font-size: 4rem;
        margin-bottom: var(--spacing-md);
        animation: bounce 2s ease-in-out infinite;
    }

    .modal-card h2 {
        font-size: 2.5rem;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: var(--spacing-sm);
    }

    .modal-card p {
        color: var(--text-secondary);
        font-size: 1.1rem;
        margin-bottom: var(--spacing-lg);
    }

    .modal-input {
        width: 100%;
        padding: var(--spacing-md);
        font-size: 1.2rem;
        font-weight: 600;
        border: 2px solid rgba(139, 92, 246, 0.3);
        border-radius: var(--radius-lg);
        margin-bottom: var(--spacing-lg);
        text-align: center;
        transition: all var(--transition-base);
    }

    .modal-input:focus {
        outline: none;
        border-color: var(--coral-energy);
        box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
    }

    .modal-actions {
        display: flex;
        gap: var(--spacing-md);
    }

    .modal-actions > button {
        flex: 1;
    }

    /* ============================================
       RESPONSIVE
       ============================================ */

    @media (max-width: 768px) {
        .question-card {
            padding: var(--spacing-lg);
        }

        .answer-grid {
            grid-template-columns: 1fr;
        }

        .modal-card {
            padding: var(--spacing-xl);
        }

        .modal-actions {
            flex-direction: column;
        }
    }

    @media (max-width: 480px) {
        .question-card {
            padding: var(--spacing-md);
        }

        .badge-row {
            font-size: 0.75rem;
        }

        .question-text {
            font-size: 1.3rem;
        }
    }
</style>
