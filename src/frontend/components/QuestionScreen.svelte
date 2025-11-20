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
    import { submitQuizz } from '../lib/api.js'

    let textInput = $state('')
    let isSubmitting = $state(false)
    let playerName = $state('')
    let showNameInput = $state(false)

    $effect(() => {
        if (!quiz.startTime) {
            quiz.startTime = Date.now()
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

    async function handleSubmitQuizz() {
        try {
            isSubmitting = true
            const timeTaken = quiz.startTime
                ? Math.floor((Date.now() - quiz.startTime) / 1000)
                : null
            const category =
                quiz.config.category === 'all' ? null : quiz.config.category
            const difficulty =
                quiz.config.difficulty === 'all' ? null : quiz.config.difficulty

            const results = await submitQuizz(
                quiz.userAnswers,
                playerName.trim() || null,
                category,
                difficulty,
                timeTaken
            )

            if (results.hallOfFameId) {
                quiz.hallOfFameId = results.hallOfFameId
            }

            quiz.results = results
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
        handleSubmitQuizz()
    }
</script>

<div class="question-screen" in:scale={{ duration: 500, start: 0.95 }}>
    <div class="glass-card question-card">
        <!-- Progress Bar -->
        <div class="progress-container" in:fly={{ y: -10, duration: 400 }}>
            <div class="progress-header">
                <span class="progress-label">
                    Question <span class="highlight"
                        >{quiz.currentQuestionIndex + 1}</span
                    >
                    <span class="separator">/</span>
                    {quiz.questions.length}
                </span>
                {#if quiz.gameMode === 'group'}
                    <span class="player-badge">{currentPlayer()}'s Turn</span>
                {/if}
            </div>
            <div class="progress-track">
                <div class="progress-fill" style="width: {progress()}%"></div>
            </div>
        </div>

        <!-- Question Content -->
        <div class="question-content">
            <div class="meta-tags">
                <span class="tag category"
                    >{currentDisplayQuestion?.category}</span
                >
                <span
                    class="tag difficulty {currentDisplayQuestion?.difficulty}"
                >
                    {currentDisplayQuestion?.difficulty}
                </span>
            </div>

            <h2
                class="question-text"
                in:fly={{ y: 10, duration: 300, delay: 50 }}
            >
                {currentDisplayQuestion?.question}
            </h2>

            {#if currentDisplayQuestion?.type === 'picture' && currentDisplayQuestion?.imageUrl}
                <div
                    class="image-container"
                    in:scale={{ duration: 300, delay: 100 }}
                >
                    <img
                        src={currentDisplayQuestion.imageUrl}
                        alt="Question context"
                        class="question-image"
                    />
                </div>
            {/if}
        </div>

        <!-- Answers -->
        <div class="answers-section">
            {#if currentDisplayQuestion?.type === 'trivia' || currentDisplayQuestion?.type === 'picture'}
                <div class="answer-grid">
                    {#each currentDisplayQuestion.answers as answer, index}
                        <button
                            class="answer-option"
                            class:selected={quiz.selectedAnswer === index}
                            onclick={() => handleAnswerSelect(index)}
                            in:fly={{
                                y: 10,
                                duration: 300,
                                delay: 150 + index * 50,
                            }}
                        >
                            <span class="answer-key"
                                >{String.fromCharCode(65 + index)}</span
                            >
                            <span class="answer-text">{answer}</span>
                        </button>
                    {/each}
                </div>
            {:else if currentDisplayQuestion?.type === 'question'}
                <div
                    class="text-answer-wrapper"
                    in:scale={{ duration: 300, delay: 150 }}
                >
                    <input
                        type={inputType}
                        class="text-input"
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

        <!-- Actions -->
        <div class="action-section">
            <button
                class="btn-modern btn-next"
                onclick={handleNextQuestion}
                disabled={!canProceed || isSubmitting}
            >
                {#if isSubmitting}
                    Processing...
                {:else}
                    {nextButtonText}
                {/if}
            </button>
        </div>
    </div>
</div>

<!-- Name Modal -->
{#if showNameInput}
    <div
        class="modal-backdrop"
        in:fade={{ duration: 200 }}
        onclick={handleSkipName}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Escape' && handleSkipName()}
    >
        <div
            class="glass-card modal-content"
            in:scale={{ duration: 300, start: 0.95 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            tabindex="-1"
            onkeydown={(e) => e.stopPropagation()}
        >
            <h2>Quiz Complete!</h2>
            <p>Join the Hall of Fame</p>

            <input
                type="text"
                class="modal-input"
                placeholder="Enter your name"
                bind:value={playerName}
                maxlength="30"
                onkeypress={(e) =>
                    e.key === 'Enter' &&
                    playerName.trim() &&
                    handleSubmitQuizz()}
            />

            <div class="modal-actions">
                <button
                    class="btn-modern w-full"
                    onclick={handleSubmitQuizz}
                    disabled={isSubmitting || !playerName.trim()}
                >
                    {isSubmitting ? 'Saving...' : 'Save Score'}
                </button>
                <button
                    class="btn-secondary w-full"
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
        max-width: 800px;
        margin: 0 auto;
        padding: var(--spacing-md);
    }

    .question-card {
        padding: var(--spacing-xl);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    /* Progress */
    .progress-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .progress-header {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        color: var(--text-muted);
        font-weight: 500;
    }

    .highlight {
        color: var(--text-main);
        font-weight: 700;
    }
    .separator {
        margin: 0 2px;
        opacity: 0.5;
    }

    .player-badge {
        color: var(--accent);
        font-weight: 600;
    }

    .progress-track {
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: var(--gradient-brand);
        transition: width 0.5s var(--ease-out);
        border-radius: var(--radius-full);
    }

    /* Content */
    .meta-tags {
        display: flex;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
    }

    .tag {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-full);
        font-weight: 600;
    }

    .tag.category {
        background: rgba(99, 102, 241, 0.1);
        color: var(--primary-light);
    }

    .tag.difficulty {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-muted);
    }
    .tag.difficulty.easy {
        color: var(--success);
    }
    .tag.difficulty.medium {
        color: var(--warning);
    }
    .tag.difficulty.hard {
        color: var(--error);
    }

    .question-text {
        font-size: clamp(1.5rem, 4vw, 2rem);
        line-height: 1.3;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
    }

    .image-container {
        border-radius: var(--radius-lg);
        overflow: hidden;
        margin-top: var(--spacing-md);
        border: 1px solid var(--glass-border);
    }

    .question-image {
        width: 100%;
        display: block;
    }

    /* Answers */
    .answer-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
    }

    .answer-option {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        color: var(--text-main);
        text-align: left;
        cursor: pointer;
        transition: all var(--duration-fast);
    }

    .answer-option:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--text-muted);
    }

    .answer-option.selected {
        background: var(--primary);
        border-color: var(--primary);
        box-shadow: var(--shadow-glow);
    }

    .answer-key {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-sm);
        font-weight: 600;
        font-size: 0.9rem;
    }

    .answer-option.selected .answer-key {
        background: rgba(255, 255, 255, 0.2);
    }

    .answer-text {
        font-size: 1rem;
        line-height: 1.4;
    }

    /* Text Input */
    .text-input {
        width: 100%;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--glass-border);
        padding: var(--spacing-md);
        border-radius: var(--radius-lg);
        color: var(--text-main);
        font-size: 1.1rem;
        text-align: center;
    }

    .text-input:focus {
        border-color: var(--primary);
        outline: none;
    }

    /* Actions */
    .action-section {
        display: flex;
        justify-content: flex-end;
    }

    .btn-next {
        min-width: 160px;
    }

    /* Modal */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-md);
    }

    .modal-content {
        width: 100%;
        max-width: 400px;
        text-align: center;
        padding: var(--spacing-xl);
    }

    .modal-content h2 {
        margin-bottom: var(--spacing-xs);
    }

    .modal-content p {
        color: var(--text-muted);
        margin-bottom: var(--spacing-lg);
    }

    .modal-input {
        width: 100%;
        padding: var(--spacing-sm) var(--spacing-md);
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: white;
        text-align: center;
        margin-bottom: var(--spacing-lg);
    }

    .modal-actions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    @media (min-width: 768px) {
        .answer-grid {
            grid-template-columns: 1fr 1fr;
        }
    }
</style>
