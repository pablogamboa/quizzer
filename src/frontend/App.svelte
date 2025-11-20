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
    }

    /* Animated Mesh Gradient */
    .mesh-gradient {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(
                circle at 10% 20%,
                rgba(255, 107, 107, 0.2) 0%,
                transparent 50%
            ),
            radial-gradient(
                circle at 90% 80%,
                rgba(0, 206, 201, 0.2) 0%,
                transparent 50%
            ),
            radial-gradient(
                circle at 50% 50%,
                rgba(253, 203, 110, 0.15) 0%,
                transparent 50%
            ),
            radial-gradient(
                circle at 80% 10%,
                rgba(253, 121, 168, 0.12) 0%,
                transparent 50%
            );
        animation: meshFlow 25s ease-in-out infinite alternate;
    }

    @keyframes meshFlow {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
        }
        50% {
            transform: translate(20px, -20px) scale(1.05);
            opacity: 1;
        }
        100% {
            transform: translate(-20px, 20px) scale(1);
            opacity: 0.8;
        }
    }

    /* Floating Particles */
    .particles {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .particle {
        position: absolute;
        background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.8),
            rgba(255, 255, 255, 0.2)
        );
        border-radius: 50%;
        animation: particleDrift infinite ease-in-out;
        opacity: 0.4;
        filter: blur(1px);
    }

    @keyframes particleDrift {
        0%,
        100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
        }
        25% {
            transform: translate(30px, -50px) scale(1.2);
            opacity: 0.6;
        }
        50% {
            transform: translate(-20px, -100px) scale(0.8);
            opacity: 0.4;
        }
        75% {
            transform: translate(40px, -150px) scale(1.1);
            opacity: 0.5;
        }
    }

    /* Enhanced Animated Orbs */
    .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(100px);
        animation: orbFloat 30s infinite ease-in-out;
        opacity: 0.6;
    }

    .orb-coral {
        width: 600px;
        height: 600px;
        background: radial-gradient(
            circle,
            rgba(255, 107, 107, 0.4),
            rgba(255, 107, 107, 0.1),
            transparent
        );
        top: -300px;
        left: -200px;
        animation-duration: 28s;
        animation-delay: 0s;
    }

    .orb-teal {
        width: 500px;
        height: 500px;
        background: radial-gradient(
            circle,
            rgba(0, 206, 201, 0.4),
            rgba(0, 206, 201, 0.1),
            transparent
        );
        bottom: -200px;
        right: -150px;
        animation-duration: 35s;
        animation-delay: -10s;
    }

    .orb-yellow {
        width: 450px;
        height: 450px;
        background: radial-gradient(
            circle,
            rgba(253, 203, 110, 0.35),
            rgba(253, 203, 110, 0.1),
            transparent
        );
        top: 40%;
        left: 50%;
        animation-duration: 40s;
        animation-delay: -20s;
    }

    @keyframes orbFloat {
        0%,
        100% {
            transform: translate(0, 0) scale(1);
        }
        25% {
            transform: translate(100px, -100px) scale(1.1);
        }
        50% {
            transform: translate(-80px, 80px) scale(0.9);
        }
        75% {
            transform: translate(60px, 40px) scale(1.05);
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
        transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .app.mounted {
        opacity: 1;
    }

    /* Screen Wrapper for Smooth Transitions */
    .screen-wrapper {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-lg);
        width: 100%;
    }

    /* Responsive Adjustments */
    @media (max-width: 768px) {
        .app {
            padding: var(--spacing-md);
        }

        .screen-wrapper {
            padding: var(--spacing-md);
        }

        .orb-coral {
            width: 400px;
            height: 400px;
        }

        .orb-teal {
            width: 350px;
            height: 350px;
        }

        .orb-yellow {
            width: 300px;
            height: 300px;
        }
    }

    @media (max-width: 480px) {
        .app {
            padding: var(--spacing-sm);
        }

        .screen-wrapper {
            padding: var(--spacing-sm);
        }

        .orb {
            filter: blur(60px);
        }
    }

    /* Accessibility: Reduce motion */
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
