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
        class="glass-card theme-showcase"
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
            <h2 class="gradient-text">Select Theme</h2>
            <p>Choose a special flavor or stick to classic.</p>
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
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M5 13l4 4L19 7"
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
                Skip & Start Classic Quiz
            </button>
        </div>
    </div>
</div>

<style>
    .theme-showcase-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 200;
        padding: var(--spacing-md);
    }

    .theme-showcase {
        width: 100%;
        max-width: 600px;
        padding: var(--spacing-xl);
        text-align: center;
    }

    .theme-header {
        margin-bottom: var(--spacing-lg);
    }

    .theme-header h2 {
        font-size: 2rem;
        margin-bottom: var(--spacing-xs);
    }

    .theme-header p {
        font-size: 1rem;
        color: var(--text-muted);
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
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        text-align: left;
        cursor: pointer;
        transition: all var(--duration-normal);
        position: relative;
    }

    .theme-card:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--text-muted);
        transform: translateY(-2px);
    }

    .theme-card.selected {
        border-color: var(--primary);
        background: rgba(99, 102, 241, 0.1);
        box-shadow: var(--shadow-glow);
    }

    .theme-icon {
        font-size: 2rem;
        width: 50px;
        height: 50px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-md);
    }

    .theme-info h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-main);
        margin-bottom: 4px;
    }

    .theme-info p {
        font-size: 0.9rem;
        color: var(--text-muted);
        line-height: 1.4;
    }

    .selected-check {
        position: absolute;
        top: 50%;
        right: var(--spacing-md);
        transform: translateY(-50%);
        color: var(--primary);
        display: flex;
    }

    .skip-button {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-weight: 500;
        font-size: 0.95rem;
        cursor: pointer;
        padding: 0.5rem 1rem;
        transition: color var(--duration-fast);
    }

    .skip-button:hover {
        color: var(--text-main);
        text-decoration: underline;
    }

    @media (max-width: 600px) {
        .theme-card {
            flex-direction: column;
            text-align: center;
            padding: var(--spacing-lg);
        }
        .selected-check {
            top: var(--spacing-sm);
            right: var(--spacing-sm);
            transform: none;
        }
    }
</style>
