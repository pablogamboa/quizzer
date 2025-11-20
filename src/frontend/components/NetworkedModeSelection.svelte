<script>
    import { fly, scale } from 'svelte/transition'
    import { quiz } from '../stores/quiz.svelte.js'

    function createGame() {
        quiz.currentScreen = 'networkedConfig'
    }

    function joinGame() {
        quiz.currentScreen = 'joinNetworkedGame'
    }

    function goBack() {
        quiz.currentScreen = 'start'
    }
</script>

<div class="config-section" in:fly={{ x: 30, duration: 500 }}>
    <button class="back-button" onclick={goBack}>
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >
            <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
        Back
    </button>

    <div class="config-header">
        <h2 class="gradient-text">Online Battle</h2>
        <p>Play with friends in real-time</p>
    </div>

    <div class="mode-selection">
        <button
            class="glass-card mode-card"
            onclick={createGame}
            in:scale={{ duration: 500, delay: 100, start: 0.9 }}
        >
            <div class="mode-icon create">
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        d="M12 5v14M5 12h14"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </div>
            <h3>Create Game</h3>
            <p>Host a new session and invite friends</p>
        </button>

        <button
            class="glass-card mode-card"
            onclick={joinGame}
            in:scale={{ duration: 500, delay: 200, start: 0.9 }}
        >
            <div class="mode-icon join">
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </div>
            <h3>Join Game</h3>
            <p>Enter a code to join an existing lobby</p>
        </button>
    </div>
</div>

<style>
    .config-section {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: var(--spacing-lg);
    }

    .back-button {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: var(--spacing-xl);
        transition: color var(--duration-fast);
    }

    .back-button:hover {
        color: var(--text-main);
    }

    .config-header {
        text-align: center;
        margin-bottom: var(--spacing-2xl);
    }

    .config-header h2 {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-xs);
    }

    .config-header p {
        font-size: 1.1rem;
        color: var(--text-muted);
    }

    /* Mode Selection */
    .mode-selection {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--spacing-lg);
    }

    .mode-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: var(--spacing-xl);
        cursor: pointer;
        background: rgba(255, 255, 255, 0.03);
        transition: all var(--duration-normal);
    }

    .mode-card:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--primary);
        transform: translateY(-4px);
    }

    .mode-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--spacing-md);
        color: white;
        transition: transform var(--duration-normal);
    }

    .mode-card:hover .mode-icon {
        transform: scale(1.1);
    }

    .mode-icon.create {
        background: linear-gradient(135deg, var(--success), var(--primary));
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    .mode-icon.join {
        background: linear-gradient(135deg, var(--primary), var(--accent));
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }

    .mode-card h3 {
        font-size: 1.5rem;
        margin-bottom: var(--spacing-xs);
        color: var(--text-main);
    }

    .mode-card p {
        color: var(--text-muted);
        font-size: 1rem;
        line-height: 1.4;
    }

    @media (max-width: 600px) {
        .mode-selection {
            grid-template-columns: 1fr;
        }
    }
</style>
