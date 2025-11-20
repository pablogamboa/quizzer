<script>
    import { onMount, onDestroy } from 'svelte'
    import { fly, scale } from 'svelte/transition'
    import { quiz } from '../stores/quiz.svelte.js'
    import { getGameRpcClient } from '../lib/rpc-client.ts'

    let rpcClient = null
    let currentQuestion = null
    let questionNumber = 0
    let totalQuestions = 0
    let selectedAnswer = null
    let textInput = ''
    let hasSubmitted = false
    let timeRemaining = 20
    let answeredPlayers = []
    let questionResult = null // Will hold who got it right/wrong
    let errorMessage = ''

    onMount(() => {
        rpcClient = getGameRpcClient()

        if (!rpcClient) {
            errorMessage = 'Not connected to game'
            return
        }

        // Set up event handlers
        const unsubscribeQuestionStarted = rpcClient.on(
            'questionStarted',
            (data) => {
                console.log('[NetworkedQuestion] Question started:', data)
                // New question received
                currentQuestion = data.question
                questionNumber = data.questionNumber
                totalQuestions = data.totalQuestions
                timeRemaining = 20 // Reset to full time

                // Reset state for new question
                selectedAnswer = null
                textInput = ''
                hasSubmitted = false
                answeredPlayers = []
                questionResult = null
                quiz.currentQuestionTimer = timeRemaining
            }
        )

        const unsubscribeAnswerSubmitted = rpcClient.on(
            'answerSubmitted',
            (data) => {
                console.log(
                    '[NetworkedQuestion] Answer submitted by:',
                    data.playerName
                )
                // Track who has answered
                if (!answeredPlayers.includes(data.playerName)) {
                    answeredPlayers = [...answeredPlayers, data.playerName]
                }
            }
        )

        const unsubscribeQuestionEnded = rpcClient.on(
            'questionEnded',
            (results) => {
                console.log('[NetworkedQuestion] Question ended:', results)
                // Show feedback for the answer results
                // Update scores from the results
                quiz.multiplayerScores = results.newScores

                // Determine if THIS local player was correct and who won
                const myAnswer = results.playerAnswers.find(
                    (pa) => pa.playerName === quiz.localPlayerName
                )

                questionResult = {
                    correct: myAnswer?.isCorrect || false,
                    correctAnswer: results.correctAnswer,
                    winner: results.firstCorrectPlayer?.playerName || null,
                }
            }
        )

        const unsubscribeGameState = rpcClient.on('gameState', (state) => {
            console.log('[NetworkedQuestion] Game state updated:', state)
            // Update player list and scores
            quiz.connectedPlayers = state.players || []
            if (state.scores) {
                quiz.multiplayerScores = state.scores
            }
        })

        const unsubscribeGameFinished = rpcClient.on(
            'gameFinished',
            (finalScores) => {
                console.log('[NetworkedQuestion] Game finished:', finalScores)
                // Store final results in the store
                quiz.multiplayerFinalResults = finalScores
                // Game is over, navigate to results
                quiz.currentScreen = 'networkedResult'
            }
        )

        const unsubscribeError = rpcClient.on('error', (error) => {
            console.error('[NetworkedQuestion] Error:', error)
            errorMessage = error.message || error
        })

        return () => {
            unsubscribeQuestionStarted()
            unsubscribeAnswerSubmitted()
            unsubscribeQuestionEnded()
            unsubscribeGameState()
            unsubscribeGameFinished()
            unsubscribeError()
        }
    })

    // Computed values
    $: inputType = currentQuestion?.answerType || 'text'
    $: progress =
        totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0
    $: timerPercentage = (timeRemaining / 20) * 100
    $: timerColor =
        timeRemaining > 10
            ? 'var(--color-green)'
            : timeRemaining > 5
              ? 'var(--color-yellow)'
              : 'var(--color-coral)'

    function handleAnswerSelect(index) {
        if (hasSubmitted) return
        selectedAnswer = index
        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(50)
        }
    }

    function handleTextInput() {
        if (hasSubmitted) return

        const stringValue = String(textInput)
        const trimmedValue = stringValue.trim()

        if (inputType === 'number') {
            const isValidNumber =
                trimmedValue !== '' && !isNaN(Number(trimmedValue))
            selectedAnswer = isValidNumber ? trimmedValue : null
        } else {
            selectedAnswer = trimmedValue.length > 0 ? trimmedValue : null
        }
    }

    async function submitAnswer() {
        if (!rpcClient || selectedAnswer === null || hasSubmitted) return

        hasSubmitted = true
        errorMessage = ''

        try {
            // Send answer to server
            const result = await rpcClient.submitAnswer(selectedAnswer)
            console.log('[NetworkedQuestion] Answer submitted:', result)
        } catch (error) {
            console.error('[NetworkedQuestion] Error submitting answer:', error)
            errorMessage = error.message || 'Failed to submit answer'
            hasSubmitted = false // Allow retry
        }
    }

    // Auto-submit when answer is selected (for multiple choice)
    $: if (
        selectedAnswer !== null &&
        currentQuestion?.type !== 'question' &&
        !hasSubmitted
    ) {
        setTimeout(() => submitAnswer(), 100)
    }

    onDestroy(() => {
        // Don't disconnect - we'll need the socket for results
    })
</script>

<div
    class="question-screen-container"
    in:scale={{ duration: 300, start: 0.95 }}
>
    {#if currentQuestion}
        <div class="header-info">
            <div class="progress-bar">
                <div class="progress-fill" style="width: {progress}%"></div>
            </div>
            <div class="stats">
                <span>Question {questionNumber} / {totalQuestions}</span>
                <div class="timer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        ><circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="2"
                        /><path
                            d="M12 6v6l4 2"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        /></svg
                    >
                    <span>{timeRemaining}s</span>
                </div>
            </div>
        </div>

        <div class="question-card">
            <p class="category-text">{currentQuestion.category}</p>
            <h2>{@html currentQuestion.question}</h2>

            {#if currentQuestion.type === 'picture'}
                <div class="image-container">
                    <img
                        src={currentQuestion.imageUrl}
                        alt="Question Hint"
                        class="question-image"
                    />
                </div>
            {/if}
        </div>

        <div class="answers-container">
            {#if currentQuestion.type === 'trivia' || currentQuestion.type === 'picture'}
                <div class="answer-grid">
                    {#each currentQuestion.answers as answer, i}
                        <button
                            class="answer-btn"
                            class:selected={selectedAnswer === i}
                            class:correct={questionResult &&
                                questionResult.correctAnswer === i}
                            class:incorrect={questionResult &&
                                selectedAnswer === i &&
                                !questionResult.correct}
                            onclick={() => handleAnswerSelect(i)}
                            disabled={hasSubmitted}
                        >
                            <span class="letter"
                                >{String.fromCharCode(65 + i)}</span
                            >
                            <span class="text">{@html answer}</span>
                        </button>
                    {/each}
                </div>
            {:else if currentQuestion.type === 'question'}
                <div class="text-input-wrapper">
                    <input
                        type={inputType}
                        placeholder={inputType === 'number'
                            ? 'Enter the number'
                            : 'Type your answer...'}
                        bind:value={textInput}
                        oninput={handleTextInput}
                        disabled={hasSubmitted}
                        autocomplete="off"
                        autocorrect={inputType === 'number' ? 'off' : 'on'}
                        autocapitalize={inputType === 'number'
                            ? 'off'
                            : 'sentences'}
                        spellcheck={inputType === 'number' ? 'false' : 'true'}
                        inputmode={inputType === 'number' ? 'numeric' : 'text'}
                        pattern={inputType === 'number' ? '[0-9]*' : null}
                    />
                    <button
                        class="btn-modern"
                        onclick={submitAnswer}
                        disabled={!selectedAnswer || hasSubmitted}
                    >
                        Submit
                    </button>
                </div>
            {/if}
        </div>

        <div class="players-status-card">
            <h4>
                Players ({answeredPlayers.length}/{quiz.connectedPlayers.length}
                answered)
            </h4>
            <div class="players-grid">
                {#each quiz.connectedPlayers as player}
                    <div
                        class="player-status-item"
                        class:answered={answeredPlayers.includes(player.name)}
                    >
                        <div class="avatar">
                            {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span class="name">{player.name}</span>
                        {#if answeredPlayers.includes(player.name)}
                            <span class="status-icon">✓</span>
                        {/if}
                        <span class="score"
                            >{quiz.multiplayerScores[player.id] || 0}</span
                        >
                    </div>
                {/each}
            </div>
        </div>

        {#if questionResult}
            <div
                class="result-feedback"
                class:correct={questionResult.correct}
                in:scale|local
            >
                {#if questionResult.correct}
                    <div class="icon">🎉</div>
                    <div class="text-content">
                        <strong>Correct!</strong>
                        {#if questionResult.winner}
                            <p>
                                {questionResult.winner} answered first! (+1 point)
                            </p>
                        {/if}
                    </div>
                {:else}
                    <div class="icon">😔</div>
                    <div class="text-content">
                        <strong>Incorrect!</strong>
                        <p>
                            Correct answer:
                            {@html currentQuestion.answers[
                                questionResult.correctAnswer
                            ]}
                        </p>
                    </div>
                {/if}
            </div>
        {/if}
    {:else}
        <div class="loading-container">
            <div class="loading-dots">
                <span></span><span></span><span></span>
            </div>
            <p>Waiting for next question...</p>
        </div>
    {/if}

    {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
    {/if}
</div>

<style>
    .question-screen-container {
        max-width: 800px;
        margin: auto;
        padding: var(--spacing-lg);
    }
    .header-info {
        margin-bottom: var(--spacing-md);
    }
    .progress-bar {
        height: 8px;
        background-color: #e2e8f0;
        border-radius: var(--radius-full);
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: var(--primary-gradient);
        transition: width 0.3s ease;
    }
    .stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--spacing-xs);
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 600;
    }
    .timer {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
    }

    .question-card {
        background: var(--bg-card);
        border: 1px solid #e2e8f0;
        border-radius: var(--radius-xl);
        padding: var(--spacing-xl);
        text-align: center;
        margin-bottom: var(--spacing-lg);
        box-shadow: var(--shadow-md);
    }
    .category-text {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-sm);
    }
    .question-card h2 {
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.4;
        margin-bottom: var(--spacing-md);
    }
    .image-container {
        margin-top: var(--spacing-md);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
    }
    .question-image {
        max-width: 100%;
        height: auto;
        display: block;
    }

    .answer-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
    }
    .answer-btn {
        display: flex;
        align-items: center;
        width: 100%;
        padding: var(--spacing-md);
        background-color: var(--bg-card);
        border: 2px solid #e2e8f0;
        border-radius: var(--radius-lg);
        text-align: left;
        cursor: pointer;
        transition: all var(--transition-base);
        box-shadow: var(--shadow-sm);
    }
    .answer-btn:hover:not(:disabled) {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
        border-color: var(--color-coral);
    }
    .answer-btn.selected {
        border-color: var(--color-coral);
        background: #ff6b6b11;
        box-shadow: var(--shadow-md);
    }
    .answer-btn .letter {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        margin-right: var(--spacing-md);
        background-color: #f1f5f9;
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .answer-btn.selected .letter {
        background: var(--primary-gradient);
        color: white;
    }
    .answer-btn .text {
        font-size: 1rem;
        font-weight: 600;
    }
    .answer-btn.correct {
        border-color: var(--color-green);
        background: #06ffa511;
    }
    .answer-btn.incorrect {
        border-color: var(--color-coral);
        background: #ff6b6b11;
        opacity: 0.7;
    }
    .answer-btn:disabled {
        cursor: not-allowed;
    }

    .text-input-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }
    .text-input-wrapper input {
        width: 100%;
        padding: var(--spacing-lg);
        font-size: 1.25rem;
        text-align: center;
        border: 2px solid #e2e8f0;
        border-radius: var(--radius-lg);
        transition: all var(--transition-fast);
    }
    .text-input-wrapper input:focus {
        outline: none;
        border-color: var(--color-coral);
        box-shadow: 0 0 0 3px #ff6b6b33;
    }

    .players-status-card {
        background: var(--bg-card);
        border: 1px solid #e2e8f0;
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);
        margin-top: var(--spacing-lg);
        box-shadow: var(--shadow-sm);
    }
    .players-status-card h4 {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: var(--spacing-md);
    }
    .players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--spacing-sm);
    }
    .player-status-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs);
        background-color: #f8fafc;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        transition: all var(--transition-fast);
    }
    .player-status-item.answered {
        background-color: #e0f8e9;
    }
    .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: var(--text-light);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
    }
    .name {
        flex-grow: 1;
        font-weight: 600;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .status-icon {
        color: var(--color-green);
        font-weight: 700;
    }
    .score {
        font-weight: 700;
        padding: 2px 6px;
        background: #e2e8f0;
        border-radius: var(--radius-sm);
    }

    .result-feedback {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        border-radius: var(--radius-lg);
        margin-top: var(--spacing-lg);
    }
    .result-feedback.correct {
        background: #e0f8e9;
        border: 2px solid var(--color-green);
    }
    .result-feedback .icon {
        font-size: 2rem;
    }
    .result-feedback .text-content strong {
        font-size: 1.25rem;
    }
    .result-feedback .text-content p {
        color: var(--text-secondary);
        margin-top: 2px;
    }

    .loading-container {
        padding: var(--spacing-xl);
        text-align: center;
    }
    .loading-container p {
        margin-top: var(--spacing-sm);
        font-weight: 600;
        color: var(--text-secondary);
    }

    .error-message {
        margin-top: 1rem;
        padding: 1rem;
        background: #ff6b6b33;
        border: 1px solid var(--color-coral);
        border-radius: var(--radius-md);
        color: var(--color-coral);
        text-align: center;
        font-weight: 600;
    }

    @media (max-width: 768px) {
        .answer-grid {
            grid-template-columns: 1fr;
        }
        .question-card h2 {
            font-size: 1.5rem;
        }
    }
</style>
