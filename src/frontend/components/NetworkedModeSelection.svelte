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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
        Back
    </button>

    <div class="config-header">
        <h2 class="gradient-text">Online Battle</h2>
        <p>Play with friends in real-time across the web</p>
    </div>

    <div class="mode-selection">
        <button
            class="mode-card mode-create"
            onclick={createGame}
            in:scale={{ duration: 500, delay: 100, start: 0.8 }}
        >
            <div class="mode-glow"></div>
            <div class="mode-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </div>
            <h3>Create Game</h3>
            <p>Host a new game and invite friends</p>
            <div class="mode-shine"></div>
        </button>

        <button
            class="mode-card mode-join"
            onclick={joinGame}
            in:scale={{ duration: 500, delay: 200, start: 0.8 }}
        >
            <div class="mode-glow"></div>
            <div class="mode-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12L10 7M15 12H3"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </div>
            <h3>Join Game</h3>
            <p>Enter a code to join a game</p>
            <div class="mode-shine"></div>
        </button>
    </div>
</div>

<style>
    .config-section {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
    }

    .back-button {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        background: transparent;
        border: none;
        color: var(--text-white);
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        margin-bottom: var(--spacing-xl);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-full);
        transition: all var(--transition-fast);
    }

    .back-button:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(-4px);
    }

    .config-header {
        text-align: center;
        margin-bottom: var(--spacing-2xl);
    }

    .config-header h2 {
        font-size: clamp(2.5rem, 6vw, 4rem);
        margin-bottom: var(--spacing-sm);
    }

    .config-header p {
        font-size: 1.2rem;
        color: var(--text-white);
        opacity: 0.9;
    }

    /* Mode Selection Grid */
    .mode-selection {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--spacing-xl);
        perspective: 1000px;
    }

    .mode-card {
        position: relative;
        background: var(--bg-card);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-2xl);
        padding: var(--spacing-xl);
        text-align: center;
        cursor: pointer;
        transition: all var(--transition-base);
        box-shadow: var(--shadow-xl);
        transform-style: preserve-3d;
        overflow: hidden;
    }

    .mode-card::before {
        content: '';
        position: absolute;
        inset: -2px;
        background: var(--gradient-primary);
        border-radius: var(--radius-2xl);
        opacity: 0;
        transition: opacity var(--transition-base);
        z-index: -1;
    }

    .mode-card:hover {
        transform: translateY(-12px) rotateX(5deg);
        box-shadow: var(--shadow-2xl), var(--glow-coral);
        border-color: transparent;
    }

    .mode-card:hover::before {
        opacity: 1;
    }

    .mode-card:active {
        transform: translateY(-8px) rotateX(3deg) scale(0.98);
    }

    .mode-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(
            circle at 50% 0%,
            var(--coral-energy-light),
            transparent 70%
        );
        opacity: 0;
        transition: opacity var(--transition-base);
        pointer-events: none;
    }

    .mode-card:hover .mode-glow {
        opacity: 0.3;
    }

    .mode-icon {
        width: 100px;
        height: 100px;
        margin: 0 auto var(--spacing-lg);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            135deg,
            var(--coral-energy-light),
            var(--ocean-teal-light)
        );
        box-shadow: var(--glow-coral);
        transition: all var(--transition-base);
        position: relative;
        color: white;
    }

    .mode-card:hover .mode-icon {
        transform: scale(1.1) rotate(5deg);
        box-shadow:
            var(--glow-coral),
            0 0 60px rgba(255, 107, 107, 0.8);
    }

    .mode-create .mode-icon {
        background: linear-gradient(
            135deg,
            var(--victory-green),
            var(--ocean-teal)
        );
    }

    .mode-join .mode-icon {
        background: linear-gradient(
            135deg,
            var(--ocean-teal),
            var(--sunshine-yellow)
        );
    }

    .mode-card h3 {
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: var(--spacing-xs);
        color: var(--text-primary);
    }

    .mode-card p {
        color: var(--text-secondary);
        font-size: 1.05rem;
    }

    .mode-shine {
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
        );
        transition: left 0.6s ease;
        pointer-events: none;
    }

    .mode-card:hover .mode-shine {
        left: 150%;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .mode-selection {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
        }
    }

    @media (max-width: 480px) {
        .mode-icon {
            width: 80px;
            height: 80px;
            font-size: 2.5rem;
        }
    }
</style>
