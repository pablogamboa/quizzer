<script>
    import { quiz } from './stores/quiz.svelte.js'
    import { initializeAudio } from './lib/audio.js'
    import { fade, fly, scale } from 'svelte/transition'

    import StartScreen from './components/StartScreen.svelte'
    import QuestionScreen from './components/QuestionScreen.svelte'
    import ResultScreen from './components/ResultScreen.svelte'
    import ErrorScreen from './components/ErrorScreen.svelte'
    import PlayerSetup from './components/PlayerSetup.svelte'
    import GroupResult from './components/GroupResult.svelte'
    import NetworkedModeSelection from './components/NetworkedModeSelection.svelte'
    import CreateNetworkedGame from './components/CreateNetworkedGame.svelte'
    import JoinNetworkedGame from './components/JoinNetworkedGame.svelte'
    import MultiplayerLobby from './components/MultiplayerLobby.svelte'
    import NetworkedQuestionScreen from './components/NetworkedQuestionScreen.svelte'
    import NetworkedResultScreen from './components/NetworkedResultScreen.svelte'

    let mounted = $state(false)
    let particles = $state([])

    // Generate particles on mount
    $effect(() => {
        mounted = true
        initializeAudio()

        // Mobile-specific optimizations
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device')
        }

        // Generate particles for background
        const particleCount = window.innerWidth < 768 ? 30 : 50
        particles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 20 + 15,
            delay: Math.random() * -20,
        }))

        // Check for URL parameters for deep linking
        const urlParams = new URLSearchParams(window.location.search)
        const gameCodeParam = urlParams.get('game')

        if (gameCodeParam) {
            // Clean and validate game code
            const cleanCode = gameCodeParam.trim().toUpperCase()
            if (/^[A-Z0-9]{6}$/.test(cleanCode)) {
                // Store the game code and navigate to join screen
                window.pendingGameCode = cleanCode
                quiz.currentScreen = 'joinNetworkedGame'

                // Clear URL parameters without reloading the page
                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname
                )
            }
        }
    })
</script>

<!-- Sophisticated Particle Background -->
<div class="background-system">
    <!-- Dynamic Mesh Gradient -->
    <div class="mesh-gradient"></div>

    <!-- Floating Particles -->
    <div class="particles">
        {#each particles as particle (particle.id)}
            <div
                class="particle"
                style="
                    left: {particle.x}%;
                    top: {particle.y}%;
                    width: {particle.size}px;
                    height: {particle.size}px;
                    animation-duration: {particle.duration}s;
                    animation-delay: {particle.delay}s;
                "
            ></div>
        {/each}
    </div>

    <!-- Animated Orbs with Enhanced Glow -->
    <div class="orb orb-coral"></div>
    <div class="orb orb-teal"></div>
    <div class="orb orb-yellow"></div>
</div>

<div class="app" class:mounted>
    {#if quiz.currentScreen === 'start'}
        <div
            class="screen-wrapper"
            in:fade={{ duration: 400 }}
            out:fade={{ duration: 200 }}
        >
            <StartScreen />
        </div>
    {:else if quiz.currentScreen === 'playerSetup'}
        <div
            class="screen-wrapper"
            in:fly={{ y: 20, duration: 400 }}
            out:fly={{ y: -20, duration: 200 }}
        >
            <PlayerSetup />
        </div>
    {:else if quiz.currentScreen === 'networkedModeSelection'}
        <div
            class="screen-wrapper"
            in:fade={{ duration: 400 }}
            out:fade={{ duration: 200 }}
        >
            <NetworkedModeSelection />
        </div>
    {:else if quiz.currentScreen === 'networkedConfig'}
        <div
            class="screen-wrapper"
            in:fade={{ duration: 400 }}
            out:fade={{ duration: 200 }}
        >
            <StartScreen />
        </div>
    {:else if quiz.currentScreen === 'createNetworkedGame'}
        <div
            class="screen-wrapper"
            in:fly={{ y: 20, duration: 400 }}
            out:fly={{ y: -20, duration: 200 }}
        >
            <CreateNetworkedGame />
        </div>
    {:else if quiz.currentScreen === 'joinNetworkedGame'}
        <div
            class="screen-wrapper"
            in:fly={{ y: 20, duration: 400 }}
            out:fly={{ y: -20, duration: 200 }}
        >
            <JoinNetworkedGame />
        </div>
    {:else if quiz.currentScreen === 'multiplayerLobby'}
        <div
            class="screen-wrapper"
            in:fly={{ y: 20, duration: 400 }}
            out:fly={{ y: -20, duration: 200 }}
        >
            <MultiplayerLobby />
        </div>
    {:else if quiz.currentScreen === 'networkedQuestion'}
        <div
            class="screen-wrapper"
            in:scale={{ duration: 400, start: 0.92 }}
            out:scale={{ duration: 200, start: 0.98 }}
        >
            <NetworkedQuestionScreen />
        </div>
    {:else if quiz.currentScreen === 'question'}
        <div
            class="screen-wrapper"
            in:scale={{ duration: 400, start: 0.92 }}
            out:scale={{ duration: 200, start: 0.98 }}
        >
            <QuestionScreen />
        </div>
    {:else if quiz.currentScreen === 'result'}
        <div
            class="screen-wrapper"
            in:fade={{ duration: 400 }}
            out:fade={{ duration: 200 }}
        >
            <ResultScreen />
        </div>
    {:else if quiz.currentScreen === 'groupResult'}
        <div
            class="screen-wrapper"
            in:fade={{ duration: 400 }}
            out:fade={{ duration: 200 }}
        >
            <GroupResult />
        </div>
    {:else if quiz.currentScreen === 'networkedResult'}
        <div
            class="screen-wrapper"
            in:fade={{ duration: 400 }}
            out:fade={{ duration: 200 }}
        >
            <NetworkedResultScreen />
        </div>
    {:else if quiz.currentScreen === 'error'}
        <div
            class="screen-wrapper"
            in:fade={{ duration: 400 }}
            out:fade={{ duration: 200 }}
        >
            <ErrorScreen />
        </div>
    {/if}
</div>

<style>
    /* Background System */
    .background-system {
        position: fixed;
        inset: 0;
        z-index: var(--z-background);
        overflow: hidden;
        background-color: var(--bg-main);
    }

    /* Animated Mesh Gradient - Subtle & Deep */
    .mesh-gradient {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(
                circle at 15% 25%,
                rgba(99, 102, 241, 0.15) 0%,
                transparent 50%
            ),
            radial-gradient(
                circle at 85% 75%,
                rgba(244, 114, 182, 0.1) 0%,
                transparent 50%
            );
        animation: meshFlow 20s ease-in-out infinite alternate;
    }

    @keyframes meshFlow {
        0% {
            transform: scale(1);
            opacity: 0.5;
        }
        100% {
            transform: scale(1.1);
            opacity: 0.7;
        }
    }

    /* Floating Particles - Refined */
    .particles {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .particle {
        position: absolute;
        background: white;
        border-radius: 50%;
        animation: particleDrift infinite linear;
        opacity: 0.2;
    }

    @keyframes particleDrift {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        20% {
            opacity: 0.3;
        }
        80% {
            opacity: 0.3;
        }
        100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
        }
    }

    /* Enhanced Animated Orbs - Sleek Palette */
    .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        animation: orbFloat 25s infinite ease-in-out;
        opacity: 0.4;
        mix-blend-mode: screen;
    }

    .orb-coral {
        /* Now Indigo/Primary */
        width: 60vh;
        height: 60vh;
        background: var(--primary);
        top: -20%;
        left: -10%;
        animation-duration: 25s;
    }

    .orb-teal {
        /* Now Accent/Pink */
        width: 50vh;
        height: 50vh;
        background: var(--accent);
        bottom: -10%;
        right: -10%;
        animation-duration: 30s;
        animation-delay: -5s;
    }

    .orb-yellow {
        /* Now Secondary/Sky Blue */
        width: 40vh;
        height: 40vh;
        background: #38bdf8; /* Sky 400 */
        top: 40%;
        left: 40%;
        animation-duration: 35s;
        animation-delay: -10s;
        opacity: 0.2;
    }

    @keyframes orbFloat {
        0%,
        100% {
            transform: translate(0, 0);
        }
        33% {
            transform: translate(30px, -50px);
        }
        66% {
            transform: translate(-20px, 30px);
        }
    }

    /* Main App Container */
    .app {
        position: relative;
        z-index: var(--z-base);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-lg);
        opacity: 0;
        transition: opacity 0.8s var(--ease-out);
    }

    .app.mounted {
        opacity: 1;
    }

    /* Screen Wrapper */
    .screen-wrapper {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-lg);
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
    }

    /* Responsive Adjustments */
    @media (max-width: 768px) {
        .app {
            padding: var(--spacing-md);
        }
        .screen-wrapper {
            padding: var(--spacing-md);
        }
        .orb {
            filter: blur(60px);
            opacity: 0.3;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .mesh-gradient,
        .particle,
        .orb {
            animation: none;
        }
        .app {
            transition-duration: 0.1s;
        }
    }
</style>
