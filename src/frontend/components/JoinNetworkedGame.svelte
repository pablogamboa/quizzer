<script>
    import { onMount, onDestroy } from 'svelte'
    import { quiz } from '../stores/quiz.svelte.js'
    import { createGameRpcClient } from '../lib/rpc-client.ts'

    let playerName = ''
    let gameCodeInput = ''
    let joiningGame = false
    let errorMessage = ''
    let rpcClient = null
    let unsubscribeHandlers = []

    // Check for pending game code from URL deep link
    onMount(() => {
        if (window.pendingGameCode) {
            gameCodeInput = window.pendingGameCode
            delete window.pendingGameCode
        }
    })

    async function joinGame() {
        if (!playerName.trim()) {
            errorMessage = 'Please enter your name'
            return
        }

        if (!gameCodeInput.trim()) {
            errorMessage = 'Please enter a game code'
            return
        }

        // Validate game code format (6 characters, alphanumeric)
        const cleanCode = gameCodeInput.trim().toUpperCase()
        if (!/^[A-Z0-9]{6}$/.test(cleanCode)) {
            errorMessage =
                'Game code must be 6 characters (letters and numbers only)'
            return
        }

        joiningGame = true
        errorMessage = ''

        try {
            // Check if game exists
            const response = await fetch(`/api/multiplayer/game/${cleanCode}`)

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(
                        'Game not found. Please check the code and try again.'
                    )
                }
                throw new Error('Failed to join game')
            }

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Game not found')
            }

            // Check if game has already started
            if (result.data.status === 'in-progress') {
                throw new Error('This game has already started')
            }

            if (result.data.status === 'finished') {
                throw new Error('This game has already finished')
            }

            // Store game info
            quiz.gameCode = cleanCode
            quiz.isHost = false
            quiz.localPlayerName = playerName.trim()
            quiz.multiplayerMode = true

            // Create RPC client and connect
            rpcClient = createGameRpcClient()

            // Set up temporary event handlers for initial connection
            const unsubGameState = rpcClient.on('gameState', (state) => {
                console.log('[JoinGame] Received initial game state')
                quiz.connectedPlayers = state.players || []
                // Navigate to lobby after successful connection
                quiz.currentScreen = 'multiplayerLobby'
            })

            const unsubError = rpcClient.on('error', (error) => {
                console.error('[JoinGame] Error:', error)
                errorMessage = error.message || 'Connection error'
                joiningGame = false
            })

            // Store unsubscribe functions
            unsubscribeHandlers.push(unsubGameState, unsubError)

            // Connect to game (joins automatically with RPC)
            await rpcClient.connect(cleanCode, playerName.trim())

            console.log(
                '[JoinGame] Connected via RPC, player ID:',
                rpcClient.getPlayerId()
            )
        } catch (error) {
            console.error('Error joining game:', error)
            errorMessage =
                error.message || 'Failed to join game. Please try again.'
            joiningGame = false
        }
    }

    function goBack() {
        quiz.currentScreen = 'networkedModeSelection'
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
        <h2 class="gradient-text">Join Online Game</h2>
        <p>Enter the game code shared by your friend</p>
    </div>

    <div class="glass-card form-container">
        <div class="form-group">
            <label for="game-code">Game Code</label>
            <input
                id="game-code"
                type="text"
                bind:value={gameCodeInput}
                placeholder="CODE"
                maxlength="6"
                onkeypress={(e) =>
                    e.key === 'Enter' &&
                    document.getElementById('player-name').focus()}
                disabled={joiningGame}
                class="glass-input game-code-input"
                autocomplete="off"
            />
            <p class="input-hint">Enter the 6-character code</p>
        </div>

        <div class="form-group">
            <label for="player-name">Your Name</label>
            <input
                id="player-name"
                type="text"
                bind:value={playerName}
                placeholder="Enter your name..."
                maxlength="20"
                onkeypress={(e) => e.key === 'Enter' && joinGame()}
                disabled={joiningGame}
                class="glass-input"
            />
        </div>

        {#if errorMessage}
            <div class="error-message">
                {errorMessage}
            </div>
        {/if}

        <button
            class="btn-modern w-full"
            onclick={joinGame}
            disabled={joiningGame ||
                !playerName.trim() ||
                !gameCodeInput.trim()}
        >
            {#if joiningGame}
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                </div>
                Joining...
            {:else}
                Join Game
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

    .game-code-input {
        text-transform: uppercase;
        letter-spacing: 0.2em;
        text-align: center;
        font-weight: 700;
        font-size: 1.75rem !important;
        font-family: var(--font-mono);
        padding: var(--spacing-lg) !important;
        background: rgba(0, 0, 0, 0.3);
    }

    .input-hint {
        font-size: 0.85rem;
        color: var(--text-muted);
        text-align: center;
        margin-top: 4px;
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
