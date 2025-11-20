<script>
    import { onMount, onDestroy } from 'svelte'
    import { quiz } from '../stores/quiz.svelte.js'
    import { getGameRpcClient } from '../lib/rpc-client.ts'
    import { APP_CONFIG } from '../lib/constants.js'

    let rpcClient = null
    let errorMessage = ''
    let copied = false

    onMount(() => {
        rpcClient = getGameRpcClient()

        if (!rpcClient) {
            errorMessage = 'Not connected to game'
            return
        }

        // Set up event handlers
        const unsubscribeGameState = rpcClient.on('gameState', (state) => {
            console.log('[MultiplayerLobby] Received game state:', state)
            // Update players list
            console.log('[MultiplayerLobby] Updating players:', state.players)
            quiz.connectedPlayers = state.players || []
        })

        const unsubscribeGameStarted = rpcClient.on('gameStarted', () => {
            console.log('[MultiplayerLobby] Game is starting')
            quiz.currentScreen = 'networkedQuestion'
        })

        const unsubscribeError = rpcClient.on('error', (error) => {
            console.error('[MultiplayerLobby] Error:', error)
            console.error('[MultiplayerLobby] Error message:', error.message)
            console.error(
                '[MultiplayerLobby] Full error object:',
                JSON.stringify(error)
            )
            errorMessage = error.message || error
        })

        // Clean up on component destroy
        return () => {
            unsubscribeGameState()
            unsubscribeGameStarted()
            unsubscribeError()
        }
    })

    async function startGame() {
        if (!rpcClient) {
            errorMessage = 'Not connected to game'
            return
        }

        if (quiz.connectedPlayers.length < 2) {
            errorMessage = 'Need at least 2 players to start'
            return
        }

        try {
            errorMessage = ''
            await rpcClient.startGame()
            console.log('[MultiplayerLobby] Game started successfully')
        } catch (error) {
            console.error('[MultiplayerLobby] Error starting game:', error)
            errorMessage = error.message || 'Failed to start game'
        }
    }

    function leaveGame() {
        if (rpcClient) {
            rpcClient.disconnect()
        }
        quiz.currentScreen = 'start'
    }

    async function copyGameCode() {
        try {
            await navigator.clipboard.writeText(quiz.gameCode)
            copied = true
            setTimeout(() => {
                copied = false
            }, 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    function shareGameCode() {
        const shareUrl = `${window.location.origin}?game=${quiz.gameCode}`
        const shareText = `Join my quiz game! Code: ${quiz.gameCode}\n${shareUrl}`

        if (navigator.share) {
            navigator
                .share({
                    title: `Join my ${APP_CONFIG.name} game!`,
                    text: shareText,
                })
                .catch((err) => console.log('Error sharing:', err))
        } else {
            copyGameCode()
        }
    }

    onDestroy(() => {
        // Don't disconnect here - we'll need the socket for the game
    })
</script>

<div class="lobby-container">
    <div class="config-header">
        <h2 class="gradient-text">Game Lobby</h2>
        <p>
            {#if quiz.isHost}
                Share the code so friends can join!
            {:else}
                Waiting for the host to start the game...
            {/if}
        </p>
    </div>

    <div class="glass-card game-code-card">
        <div class="game-code-label">Game Code</div>
        <div class="game-code-display">
            <span class="code">{quiz.gameCode}</span>
            <div class="button-group">
                <button
                    class="icon-btn"
                    onclick={copyGameCode}
                    title="Copy code"
                >
                    {#if copied}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path
                                d="M20 6L9 17L4 12"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            /></svg
                        >
                    {:else}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                            /><path
                                d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                            /></svg
                        >
                    {/if}
                </button>
                <button
                    class="icon-btn"
                    onclick={shareGameCode}
                    title="Share"
                    aria-label="Share game code"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        ><circle cx="18" cy="5" r="3" /><circle
                            cx="6"
                            cy="12"
                            r="3"
                        /><circle cx="18" cy="19" r="3" /><path
                            d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49"
                        /></svg
                    >
                </button>
            </div>
        </div>
    </div>

    <div class="lobby-grid">
        <div class="glass-card players-card">
            <h3>
                Players ({quiz.connectedPlayers.length})
                {#if quiz.connectedPlayers.length < 2 && quiz.isHost}
                    <span class="min-players-text">- Need 2+ to start</span>
                {/if}
            </h3>
            <div class="players-list">
                {#each quiz.connectedPlayers as player (player.id)}
                    <div class="player-item">
                        <div class="player-avatar">
                            {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span class="player-name">{player.name}</span>
                        {#if player.isHost}
                            <span class="host-badge">Host</span>
                        {/if}
                        <div
                            class="status-dot"
                            class:connected={player.connected}
                            title={player.connected ? 'Online' : 'Offline'}
                        ></div>
                    </div>
                {/each}
                {#if quiz.connectedPlayers.length === 0}
                    <div class="empty-state">Waiting for players...</div>
                {/if}
            </div>
        </div>

        <div class="glass-card config-card">
            <h3>Settings</h3>
            <div class="config-details">
                <div class="config-item">
                    <span class="label">Questions</span>
                    <span class="value">{quiz.config.questionCount}</span>
                </div>
                <div class="config-item">
                    <span class="label">Category</span>
                    <span class="value"
                        >{quiz.config.category === 'all'
                            ? 'All'
                            : quiz.config.category}</span
                    >
                </div>
                <div class="config-item">
                    <span class="label">Difficulty</span>
                    <span class="value"
                        >{quiz.config.difficulty.charAt(0).toUpperCase() +
                            quiz.config.difficulty.slice(1)}</span
                    >
                </div>
            </div>
        </div>
    </div>

    {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
    {/if}

    <div class="actions">
        {#if quiz.isHost}
            <button
                class="btn-modern start-btn"
                onclick={startGame}
                disabled={quiz.connectedPlayers.length < 2}
            >
                Start Game
            </button>
        {:else}
            <div class="waiting-message">
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                </div>
                Waiting for host...
            </div>
        {/if}
        <button class="leave-btn" onclick={leaveGame}>Leave Game</button>
    </div>
</div>

<style>
    .lobby-container {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--spacing-lg);
    }

    .config-header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
    }
    .config-header h2 {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-xs);
    }
    .config-header p {
        font-size: 1rem;
        color: var(--text-muted);
    }

    .game-code-card {
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
        text-align: center;
        background: rgba(255, 255, 255, 0.02);
    }
    .game-code-label {
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: var(--text-muted);
        margin-bottom: var(--spacing-sm);
        font-weight: 600;
    }
    .game-code-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
        flex-wrap: wrap;
    }
    .code {
        font-family: var(--font-mono);
        font-size: 2.5rem;
        font-weight: 700;
        letter-spacing: 0.3em;
        background: var(--gradient-brand);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-align: center;
    }
    .button-group {
        display: flex;
        gap: var(--spacing-sm);
    }
    .icon-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-sm);
        color: var(--text-muted);
        cursor: pointer;
        transition: all var(--duration-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 40px;
        min-height: 40px;
    }
    .icon-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-main);
        transform: translateY(-2px);
    }
    .icon-btn:active {
        transform: translateY(0);
    }

    .lobby-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
    }

    .players-card,
    .config-card {
        padding: var(--spacing-lg);
        background: rgba(255, 255, 255, 0.02);
    }

    .players-card h3,
    .config-card h3 {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
        color: var(--text-main);
    }
    .min-players-text {
        font-size: 0.9rem;
        font-weight: 400;
        color: var(--warning);
        margin-left: 8px;
    }

    .players-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        max-height: 250px;
        overflow-y: auto;
        padding-right: var(--spacing-xs);
    }
    .player-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-sm) var(--spacing-md);
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
    }
    .player-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1rem;
        box-shadow: var(--shadow-glow);
    }
    .player-name {
        flex-grow: 1;
        font-weight: 500;
        color: var(--text-main);
    }
    .host-badge {
        background: rgba(245, 158, 11, 0.2);
        color: var(--warning);
        border: 1px solid rgba(245, 158, 11, 0.4);
        padding: 2px 8px;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 600;
    }
    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-muted);
    }
    .status-dot.connected {
        background: var(--success);
        box-shadow: 0 0 8px var(--success);
    }
    .empty-state {
        text-align: center;
        padding: var(--spacing-lg);
        color: var(--text-muted);
        font-style: italic;
    }

    .config-details {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
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
        font-weight: 600;
        color: var(--text-main);
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: center;
    }
    .start-btn {
        width: 100%;
        max-width: 400px;
    }
    .leave-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-weight: 600;
        cursor: pointer;
        transition: color var(--transition-fast);
    }
    .leave-btn:hover {
        color: var(--text-main);
    }

    .waiting-message {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: var(--text-main);
        width: 100%;
        max-width: 400px;
        font-weight: 500;
    }

    .error-message {
        padding: var(--spacing-md);
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid var(--error);
        border-radius: var(--radius-md);
        color: #fca5a5;
        text-align: center;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
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

    @media (max-width: 768px) {
        .lobby-grid {
            grid-template-columns: 1fr;
        }
        .config-header h2 {
            font-size: 2rem;
        }
        .code {
            font-size: 2rem;
        }
    }
</style>
