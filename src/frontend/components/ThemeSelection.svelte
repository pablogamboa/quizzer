<script>
    import { createEventDispatcher } from 'svelte'
    import { fly } from 'svelte/transition'

    let { themes = [], selectedTheme = null } = $props()

    const dispatch = createEventDispatcher()

    function selectTheme(themeKey) {
        dispatch('selectTheme', themeKey)
    }

    function skip() {
        dispatch('skip')
    }
</script>

<div
    class="theme-showcase-overlay"
    onclick={skip}
    onkeydown={(e) => e.key === 'Escape' && skip()}
    role="button"
    tabindex="0"
>
    <div
        class="theme-showcase"
        onclick={(e) => {
            e.stopPropagation()
        }}
        onkeydown={(e) => {
            if (e.key === 'Escape') {
                e.stopPropagation()
            }
        }}
        role="dialog"
        tabindex="-1"
    >
        <div
            class="theme-header"
            in:fly={{ y: -20, duration: 400, delay: 100 }}
        >
            <h2 class="gradient-text">Choose a Theme</h2>
            <p>
                Add a special twist to your quiz, or skip for general questions.
            </p>
        </div>

        <div class="theme-cards">
            {#each themes as theme, i}
                <button
                    class="theme-card"
                    class:selected={selectedTheme === theme.themeKey}
                    onclick={() => selectTheme(theme.themeKey)}
                    in:fly={{ y: 20, duration: 400, delay: 200 + i * 100 }}
                >
                    <div class="theme-icon">{theme.icon || '✨'}</div>
                    <div class="theme-info">
                        <h3>{theme.themeName}</h3>
                        <p>{theme.description}</p>
                    </div>
                    {#if selectedTheme === theme.themeKey}
                        <div class="selected-check">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </div>
                    {/if}
                </button>
            {/each}
        </div>

        <div in:fly={{ y: 20, duration: 400, delay: 500 }}>
            <button class="skip-button" onclick={skip}>
                Skip & Start Quiz
            </button>
        </div>
    </div>
</div>

<style>
    .theme-showcase-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 1rem;
    }

    .theme-showcase {
        width: 100%;
        max-width: 600px;
        background: var(--bg-card);
        border-radius: var(--radius-xl);
        padding: var(--spacing-lg);
        box-shadow: var(--shadow-xl);
        text-align: center;
    }

    .theme-header {
        margin-bottom: var(--spacing-lg);
    }

    .theme-header h2 {
        font-size: 2.5rem;
        font-family: 'Space Grotesk', sans-serif;
        margin-bottom: var(--spacing-xs);
    }

    .theme-header p {
        font-size: 1.1rem;
        color: var(--text-secondary);
    }

    .theme-cards {
        display: grid;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }

    .theme-card {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: transparent;
        border: 2px solid #e2e8f0;
        border-radius: var(--radius-lg);
        text-align: left;
        cursor: pointer;
        transition: all var(--transition-fast);
        position: relative;
    }

    .theme-card:hover {
        transform: translateY(-4px);
        border-color: var(--color-coral);
        box-shadow: var(--shadow-md);
    }

    .theme-card.selected {
        border-color: var(--color-coral);
        background: linear-gradient(to right, #ff6b6b1a, #ff8c421a);
        box-shadow: var(--shadow-lg);
    }

    .theme-icon {
        font-size: 2.5rem;
        width: 60px;
        height: 60px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f1f5f9;
        border-radius: var(--radius-md);
    }

    .theme-info h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
    }

    .theme-info p {
        font-size: 0.95rem;
        color: var(--text-secondary);
        line-height: 1.4;
    }

    .selected-check {
        position: absolute;
        top: 1rem;
        right: 1rem;
        color: var(--color-coral);
    }

    .skip-button {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.5rem 1rem;
        transition: color var(--transition-fast);
    }

    .skip-button:hover {
        color: var(--color-coral);
    }

    @media (max-width: 600px) {
        .theme-header h2 {
            font-size: 2rem;
        }
        .theme-card {
            flex-direction: column;
            text-align: center;
            gap: var(--spacing-sm);
        }
        .theme-info h3 {
            font-size: 1.1rem;
        }
    }
</style>
