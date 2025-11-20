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
            const questions = await loadQuestions(quiz.config)

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
                    config: quiz.config,
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
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >
            <path
                d="M15 18L9 12L15 6"
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

    <div class="glass-card form-container">
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
                class="glass-input"
            />
        </div>

        <div class="config-summary">
            <h3>Quiz Configuration</h3>
            <div class="config-details">
                <div class="config-item">
                    <span class="label">Questions</span>
                    <span class="value">{quiz.config.questionCount}</span>
                </div>
                <div class="config-item">
                    <span class="label">Category</span>
                    <span class="value">
                        {quiz.config.category === 'all'
                            ? 'All Categories'
                            : quiz.config.category}
                    </span>
                </div>
                <div class="config-item">
                    <span class="label">Difficulty</span>
                    <span class="value">
                        {quiz.config.difficulty.charAt(0).toUpperCase() +
                            quiz.config.difficulty.slice(1)}
                    </span>
                </div>
            </div>
            <button class="btn-secondary btn-small" onclick={goBack}>
                Edit Settings
            </button>
        </div>

        {#if errorMessage}
            <div class="error-message">
                {errorMessage}
            </div>
        {/if}

        <button
            class="btn-modern w-full"
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

    .config-header h2 {
        font-size: 2rem;
        margin-bottom: var(--spacing-xs);
    }

    .config-header p {
        font-size: 1rem;
        color: var(--text-muted);
    }

    .form-container {
        padding: var(--spacing-xl);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .form-group label {
        font-weight: 500;
        color: var(--text-muted);
        font-size: 0.9rem;
        margin-left: 4px;
    }

    .glass-input {
        width: 100%;
        padding: var(--spacing-md);
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: var(--text-main);
        font-size: 1rem;
        transition: all var(--duration-fast);
    }

    .glass-input:focus {
        outline: none;
        border-color: var(--primary);
        background: rgba(0, 0, 0, 0.3);
    }

    .config-summary {
        background: rgba(255, 255, 255, 0.03);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
        border: 1px solid var(--glass-border);
    }

    .config-summary h3 {
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
        text-transform: uppercase;
        color: var(--text-muted);
        letter-spacing: 0.05em;
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
        font-size: 0.95rem;
    }

    .config-item .label {
        color: var(--text-muted);
    }

    .config-item .value {
        font-weight: 500;
        color: var(--text-main);
    }

    .btn-small {
        width: 100%;
        padding: 0.5rem;
        font-size: 0.9rem;
    }

    .error-message {
        padding: var(--spacing-md);
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid var(--error);
        border-radius: var(--radius-md);
        color: #fca5a5;
        text-align: center;
        font-size: 0.9rem;
    }

    .loading-dots {
        display: inline-flex;
        gap: 4px;
    }

    .loading-dots span {
        width: 6px;
        height: 6px;
        background: currentColor;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;
    }

    .loading-dots span:nth-child(1) {
        animation-delay: -0.32s;
    }
    .loading-dots span:nth-child(2) {
        animation-delay: -0.16s;
    }

    @keyframes bounce {
        0%,
        80%,
        100% {
            transform: scale(0);
        }
        40% {
            transform: scale(1);
        }
    }
</style>
