<script>
    import { onMount } from 'svelte'
    import { fade, fly } from 'svelte/transition'

    let {
        hallOfFameId = null,
        category = null,
        difficulty = null,
        onplayagain = () => {},
    } = $props()

    let hallOfFameEntries = $state([])
    let currentEntry = $state(null)
    let rank = $state(null)
    let loading = $state(true)
    let error = $state(null)
    let activeTab = $state('all')

    $effect(() => {
        loadHallOfFame()
    })

    $effect(() => {
        if (hallOfFameId) {
            loadCurrentEntry()
        }
    })

    async function loadHallOfFame() {
        try {
            loading = true
            error = null

            let url = '/api/quiz/hall-of-fame?limit=20'

            if (activeTab === 'similar' && (category || difficulty)) {
                if (category) url += `&category=${encodeURIComponent(category)}`
                if (difficulty)
                    url += `&difficulty=${encodeURIComponent(difficulty)}`
            }

            const response = await fetch(url)
            const data = await response.json()

            if (data.success) {
                hallOfFameEntries = data.data
            } else {
                error = data.error || 'Failed to load hall of fame'
            }
        } catch (err) {
            error = 'Failed to connect to server'
            console.error('Error loading hall of fame:', err)
        } finally {
            loading = false
        }
    }

    async function loadCurrentEntry() {
        try {
            const response = await fetch(
                `/api/quiz/hall-of-fame/${hallOfFameId}`
            )
            const data = await response.json()

            if (data.success) {
                currentEntry = data.data.entry
                rank = data.data.rank

                if (activeTab === 'similar') {
                    hallOfFameEntries = data.data.similarAttempts
                }
            }
        } catch (err) {
            console.error('Error loading current entry:', err)
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60)
            return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
        if (diffHours < 24)
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year:
                date.getFullYear() !== now.getFullYear()
                    ? 'numeric'
                    : undefined,
        })
    }

    function formatTime(seconds) {
        if (!seconds) return '-'
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    function handleTabChange(tab) {
        activeTab = tab
    }

    function handlePlayAgain() {
        onplayagain()
    }

    function getRankEmoji(index) {
        switch (index) {
            case 0:
                return '🥇'
            case 1:
                return '🥈'
            case 2:
                return '🥉'
            default:
                return `${index + 1}.`
        }
    }

    function getPerformanceLabel(percentage) {
        if (percentage >= 95) return { text: 'Perfect!', class: 'perfect' }
        if (percentage >= 85) return { text: 'Excellent', class: 'excellent' }
        if (percentage >= 75) return { text: 'Great', class: 'great' }
        if (percentage >= 60) return { text: 'Good', class: 'good' }
        return { text: 'Keep Trying', class: 'average' }
    }
</script>

<div class="hall-of-fame" in:fade={{ duration: 300 }}>
    <h2 class="gradient-text">🏆 Hall of Fame</h2>

    {#if currentEntry}
        <div class="current-entry-highlight" in:fly={{ y: -20, duration: 500 }}>
            <div class="glass-card entry-card featured">
                <div class="rank-badge">Rank #{rank}</div>
                <h3>{currentEntry.player_name}</h3>
                <div class="stats">
                    <div class="stat">
                        <span class="label">Score</span>
                        <span class="value"
                            >{currentEntry.score}/{currentEntry.total_questions}</span
                        >
                    </div>
                    <div class="stat">
                        <span class="label">Accuracy</span>
                        <span class="value"
                            >{Math.round(
                                currentEntry.percentage_correct
                            )}%</span
                        >
                    </div>
                    {#if currentEntry.time_taken_seconds}
                        <div class="stat">
                            <span class="label">Time</span>
                            <span class="value"
                                >{formatTime(
                                    currentEntry.time_taken_seconds
                                )}</span
                            >
                        </div>
                    {/if}
                </div>
                <div
                    class="performance-label {getPerformanceLabel(
                        currentEntry.percentage_correct
                    ).class}"
                >
                    {getPerformanceLabel(currentEntry.percentage_correct).text}
                </div>
            </div>
        </div>
    {/if}

    <div class="tabs">
        <button
            class="tab"
            class:active={activeTab === 'all'}
            onclick={() => handleTabChange('all')}
        >
            All Players
        </button>
        {#if category || difficulty}
            <button
                class="tab"
                class:active={activeTab === 'similar'}
                onclick={() => handleTabChange('similar')}
            >
                Similar Quizzes
            </button>
        {/if}
    </div>

    <div class="leaderboard-container">
        {#if loading}
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading leaderboard...</p>
            </div>
        {:else if error}
            <div class="error">{error}</div>
        {:else if hallOfFameEntries.length === 0}
            <div class="empty">
                Be the first to make it to the hall of fame!
            </div>
        {:else}
            <div class="entries">
                {#each hallOfFameEntries as entry, index}
                    <div
                        class="entry-row"
                        class:current-user={entry.id === hallOfFameId}
                    >
                        <div class="rank">{getRankEmoji(index)}</div>
                        <div class="player-info">
                            <div class="player-name">{entry.player_name}</div>
                            <div class="quiz-info">
                                {#if entry.category}
                                    <span class="badge">{entry.category}</span>
                                {/if}
                                {#if entry.difficulty}
                                    <span class="badge {entry.difficulty}"
                                        >{entry.difficulty}</span
                                    >
                                {/if}
                                <span class="date"
                                    >{formatDate(entry.date_played)}</span
                                >
                            </div>
                        </div>
                        <div class="score-info">
                            <div class="percentage">
                                {Math.round(entry.percentage_correct)}%
                            </div>
                            <div class="score-detail">
                                {entry.score}/{entry.total_questions}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <button class="btn-modern play-again" onclick={handlePlayAgain}>
        Start New Quiz
    </button>
</div>

<style>
    .hall-of-fame {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        text-align: center;
    }

    h2 {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-lg);
    }

    .current-entry-highlight {
        margin-bottom: var(--spacing-lg);
    }

    .entry-card {
        padding: var(--spacing-lg);
        position: relative;
        border: 1px solid var(--accent);
    }

    .entry-card.featured {
        background: rgba(99, 102, 241, 0.1);
    }

    .rank-badge {
        position: absolute;
        top: -12px;
        right: 20px;
        background: var(--accent);
        color: white;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        font-weight: 700;
        font-size: 0.9rem;
        box-shadow: var(--shadow-glow);
    }

    .entry-card h3 {
        font-size: 1.5rem;
        margin-bottom: var(--spacing-md);
        color: var(--text-main);
    }

    .stats {
        display: flex;
        justify-content: center;
        gap: var(--spacing-xl);
        margin-bottom: var(--spacing-md);
    }

    .stat {
        display: flex;
        flex-direction: column;
    }

    .stat .label {
        font-size: 0.8rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .stat .value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-main);
    }

    .performance-label {
        display: inline-block;
        padding: 0.4rem 1rem;
        border-radius: var(--radius-full);
        font-weight: 600;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .performance-label.perfect {
        background: var(--success);
        color: white;
    }
    .performance-label.excellent {
        background: var(--primary);
        color: white;
    }
    .performance-label.great {
        background: rgba(255, 255, 255, 0.2);
        color: white;
    }
    .performance-label.good {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-muted);
    }
    .performance-label.average {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-muted);
    }

    .tabs {
        display: flex;
        justify-content: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
    }

    .tab {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--glass-border);
        color: var(--text-muted);
        padding: 0.5rem 1.25rem;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all var(--duration-fast);
        font-weight: 500;
        font-size: 0.9rem;
    }

    .tab.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
    }

    .tab:hover:not(.active) {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-main);
    }

    .leaderboard-container {
        background: rgba(0, 0, 0, 0.2);
        border-radius: var(--radius-lg);
        padding: var(--spacing-sm);
        border: 1px solid var(--glass-border);
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: var(--spacing-lg);
    }

    .entries {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .entry-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: rgba(255, 255, 255, 0.02);
        border-radius: var(--radius-md);
        transition: all var(--duration-fast);
    }

    .entry-row:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .entry-row.current-user {
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid var(--primary);
    }

    .rank {
        font-size: 1.2rem;
        min-width: 30px;
    }

    .player-info {
        text-align: left;
    }

    .player-name {
        font-weight: 600;
        color: var(--text-main);
        margin-bottom: 4px;
    }

    .quiz-info {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
    }

    .badge {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        font-size: 0.7rem;
        color: var(--text-muted);
    }

    .badge.easy {
        color: var(--success);
    }
    .badge.medium {
        color: var(--warning);
    }
    .badge.hard {
        color: var(--error);
    }

    .date {
        font-size: 0.7rem;
        color: var(--text-dim);
    }

    .score-info {
        text-align: right;
    }

    .percentage {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-main);
    }

    .score-detail {
        font-size: 0.8rem;
        color: var(--text-muted);
    }

    .loading,
    .error,
    .empty {
        padding: var(--spacing-xl);
        color: var(--text-muted);
    }

    .spinner {
        width: 30px;
        height: 30px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto var(--spacing-md);
    }

    .play-again {
        margin-top: var(--spacing-md);
        width: 100%;
        max-width: 300px;
    }

    @media (max-width: 600px) {
        .entry-row {
            grid-template-columns: auto 1fr;
        }
        .score-info {
            grid-column: 2;
            text-align: left;
            display: flex;
            gap: var(--spacing-sm);
            align-items: baseline;
        }
    }
</style>
