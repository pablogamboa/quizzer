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
    <h2>🏆 Hall of Fame</h2>

    {#if currentEntry}
        <div class="current-entry-highlight" in:fly={{ y: -20, duration: 500 }}>
            <div class="entry-card featured">
                <div class="rank-badge">#{rank}</div>
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

    <div class="leaderboard">
        {#if loading}
            <div class="loading">Loading leaderboard...</div>
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
        Play Again
    </button>
</div>

<style>
    .hall-of-fame {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: var(--spacing-lg);
        text-align: center;
    }

    h2 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 3rem;
        margin-bottom: var(--spacing-lg);
        background: var(--primary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .current-entry-highlight {
        margin-bottom: var(--spacing-lg);
    }

    .entry-card {
        background: var(--bg-card);
        border: 1px solid #e2e8f0;
        border-radius: var(--radius-xl);
        padding: var(--spacing-lg);
        box-shadow: var(--shadow-lg);
        position: relative;
    }

    .entry-card.featured {
        border-color: var(--color-orange);
        background: linear-gradient(to right, #ff6b6b1a, #ff8c421a);
    }

    .rank-badge {
        position: absolute;
        top: -15px;
        right: 20px;
        background: var(--primary-gradient);
        color: white;
        padding: 8px 16px;
        border-radius: var(--radius-full);
        font-weight: 700;
        font-size: 1.1em;
        box-shadow: var(--shadow-md);
    }

    .entry-card h3 {
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: var(--spacing-md);
    }

    .stats {
        display: flex;
        justify-content: center;
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-md);
    }

    .stat {
        display: flex;
        flex-direction: column;
    }

    .stat .label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
    }

    .stat .value {
        font-size: 1.5rem;
        font-weight: 700;
    }

    .performance-label {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-full);
        font-weight: 700;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .performance-label.perfect {
        background: #ffe66d;
        color: var(--text-primary);
    }
    .performance-label.excellent {
        background: #06ffa5;
        color: var(--text-primary);
    }
    .performance-label.great {
        background: #2af598;
        color: var(--text-primary);
    }
    .performance-label.good {
        background: #f1f5f9;
        color: var(--text-secondary);
    }
    .performance-label.average {
        background: #e2e8f0;
        color: var(--text-secondary);
    }

    .tabs {
        display: flex;
        justify-content: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
    }

    .tab {
        background: #f1f5f9;
        border: 2px solid transparent;
        color: var(--text-secondary);
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-weight: 600;
    }

    .tab.active {
        background: var(--primary-gradient);
        color: white;
    }

    .tab:hover:not(.active) {
        background: #e2e8f0;
        color: var(--text-primary);
    }

    .leaderboard {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        padding: var(--spacing-sm);
        border: 1px solid #e2e8f0;
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: var(--spacing-lg);
    }

    .entries {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .entry-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: #f8fafc;
        border-radius: var(--radius-md);
        border: 1px solid #e2e8f0;
        transition: all var(--transition-fast);
    }

    .entry-row.current-user {
        border-color: var(--color-coral);
        background: linear-gradient(to right, #ff6b6b1a, #ff8c421a);
    }

    .rank {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-secondary);
    }

    .player-name {
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
    }

    .quiz-info {
        display: flex;
        gap: var(--spacing-xs);
        align-items: center;
        flex-wrap: wrap;
    }

    .badge {
        background: #f1f5f9;
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-secondary);
    }

    .badge.easy {
        background: #dcfce7;
        color: #22c55e;
    }
    .badge.medium {
        background: #fef9c3;
        color: #eab308;
    }
    .badge.hard {
        background: #fee2e2;
        color: #ef4444;
    }

    .date {
        font-size: 0.75rem;
        color: var(--text-light);
    }

    .score-info {
        text-align: right;
    }

    .percentage {
        font-size: 1.2rem;
        font-weight: 700;
    }

    .score-detail {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .loading,
    .error,
    .empty {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-secondary);
        font-weight: 600;
    }

    .error {
        color: var(--color-coral);
    }

    .play-again {
        margin-top: var(--spacing-lg);
    }

    @media (max-width: 768px) {
        h2 {
            font-size: 2.5rem;
        }
        .stats {
            gap: var(--spacing-md);
        }
        .stat .value {
            font-size: 1.25rem;
        }
        .entry-row {
            grid-template-columns: auto 1fr;
        }
        .score-info {
            grid-column: 2;
            text-align: left;
            margin-top: var(--spacing-xs);
        }
    }
</style>
