<script>
    import { onDestroy } from 'svelte'
    import { quiz } from '../stores/quiz.svelte.js'
    import { loadQuestions } from '../lib/api.js'
    import { createGameRpcClient } from '../lib/rpc-client.ts'

    let playerName = ''
    let creatingGame = false
    let errorMessage = ''
    let rpcClient = null
    let unsubscribeHandlers = []

    async function createGame() {
        if (!playerName.trim()) {
            errorMessage = 'Please enter your name'
            return
        }

        creatingGame = true
        errorMessage = ''

        try {
            // Load questions based on config
            const questions = await loadQuestions(quiz.quizConfig)

            if (questions.length === 0) {
                throw new Error(
                    'No questions available for the selected criteria'
                )
            }

            // Create game via API
            const response = await fetch('/api/multiplayer/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: quiz.quizConfig,
                    hostName: playerName.trim(),
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create game')
            }

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Failed to create game')
            }

            // Store game info
            quiz.gameCode = result.data.gameCode
            quiz.isHost = true
            quiz.hostPlayerId = result.data.hostPlayerId
            quiz.localPlayerName = playerName.trim()
            quiz.multiplayerMode = true

            // Create RPC client and connect
            rpcClient = createGameRpcClient()

            // Set up temporary event handlers for initial connection
            const unsubGameState = rpcClient.on('gameState', (state) => {
                console.log('[CreateGame] Received initial game state')
                quiz.connectedPlayers = state.players || []
                // Navigate to lobby after successful connection
                quiz.currentScreen = 'multiplayerLobby'
            })

            const unsubError = rpcClient.on('error', (error) => {
                console.error('[CreateGame] Error:', error)
                errorMessage = error.message || 'Connection error'
                creatingGame = false
            })

            // Store unsubscribe functions
            unsubscribeHandlers.push(unsubGameState, unsubError)

            // Connect to game (joins automatically with RPC)
            await rpcClient.connect(result.data.gameCode, playerName.trim())

            console.log(
                '[CreateGame] Connected via RPC, player ID:',
                rpcClient.getPlayerId()
            )
        } catch (error) {
            console.error('Error creating game:', error)
            errorMessage =
                error.message || 'Failed to create game. Please try again.'
            creatingGame = false
        }
    }

    function goBack() {
        quiz.currentScreen = 'networkedConfig'
    }

    onDestroy(() => {
        // Clean up event handlers when component is destroyed
        for (const unsub of unsubscribeHandlers) {
            unsub()
        }
    })
</script>

<div class="config-section">
    <button class="back-button" onclick={goBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
        Back
    </button>

    <div class="config-header">
        <h2 class="gradient-text">Create Online Game</h2>
        <p>Host a game and share the code with your friends</p>
    </div>

    <div class="form-container">
        <div class="form-group">
            <label for="player-name">Your Name</label>
            <input
                id="player-name"
                type="text"
                bind:value={playerName}
                placeholder="Enter your name..."
                maxlength="20"
                onkeypress={(e) => e.key === 'Enter' && createGame()}
                disabled={creatingGame}
            />
        </div>

        <div class="config-card">
            <h3>Quiz Configuration</h3>
            <div class="config-details">
                <div class="config-item">
                    <span class="label">Questions:</span>
                    <span class="value">{quiz.quizConfig.questionCount}</span>
                </div>
                <div class="config-item">
                    <span class="label">Category:</span>
                    <span class="value">
                        {quiz.quizConfig.category === 'all'
                            ? 'All Categories'
                            : quiz.quizConfig.category}
                    </span>
                </div>
                <div class="config-item">
                    <span class="label">Difficulty:</span>
                    <span class="value">
                        {quiz.quizConfig.difficulty.charAt(0).toUpperCase() +
                            quiz.quizConfig.difficulty.slice(1)}
                    </span>
                </div>
            </div>
            <button class="change-config-btn" onclick={goBack}>
                Change Configuration
            </button>
        </div>

        {#if errorMessage}
            <div class="error-message">
                {errorMessage}
            </div>
        {/if}

        <button
            class="btn-modern"
            onclick={createGame}
            disabled={creatingGame || !playerName.trim()}
        >
            {#if creatingGame}
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                </div>
                Creating...
            {:else}
                Create Game
            {/if}
        </button>
    </div>
</div>

<style>
    .config-section {
        max-width: 500px;
        width: 100%;
        margin: 0 auto;
        padding: var(--spacing-lg);
    }

    .back-button {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        background: transparent;
        border: none;
        color: var(--text-secondary);
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: var(--spacing-lg);
        transition: color var(--transition-fast);
    }

    .back-button:hover {
        color: var(--color-coral);
    }

    .config-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
    }

    .config-header h2 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 2.5rem;
        margin-bottom: var(--spacing-xs);
    }

    .config-header p {
        font-size: 1.1rem;
        color: var(--text-secondary);
    }

    .form-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .form-group label {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 1.1rem;
        margin-bottom: var(--spacing-xs);
    }

    .form-group input {
        width: 100%;
        padding: var(--spacing-md);
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: 1rem;
        transition: all var(--transition-fast);
    }

    .form-group input:focus {
        outline: none;
        border-color: var(--color-coral);
        box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
    }

    .config-card {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        box-shadow: var(--shadow-sm);
        border: 1px solid #e2e8f0;
    }

    .config-card h3 {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: var(--spacing-md);
        text-align: center;
    }

    .config-details {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
    }

    .config-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1rem;
    }

    .config-item .label {
        color: var(--text-secondary);
    }

    .config-item .value {
        font-weight: 600;
        color: var(--text-primary);
    }

    .change-config-btn {
        width: 100%;
        padding: var(--spacing-sm);
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .change-config-btn:hover {
        background: #e2e8f0;
        color: var(--text-primary);
    }

    .btn-modern {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
    }

    .error-message {
        padding: var(--spacing-md);
        background: #ff6b6b22;
        border: 1px solid var(--color-coral);
        border-radius: var(--radius-md);
        color: var(--color-coral);
        text-align: center;
        font-weight: 600;
    }
</style>
