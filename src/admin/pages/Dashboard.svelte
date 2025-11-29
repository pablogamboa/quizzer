<script>
    import { onMount } from 'svelte'
    import { getStats } from '../lib/api.js'
    import { showError } from '../lib/toast.js'

    let stats = $state(null)
    let loading = $state(true)

    async function loadStats() {
        try {
            loading = true
            stats = await getStats()
        } catch (err) {
            showError('Failed to load stats: ' + err.message)
        } finally {
            loading = false
        }
    }

    onMount(() => {
        loadStats()
    })
</script>

<div class="admin-page-header">
    <h1 class="admin-page-title">Dashboard</h1>
</div>

{#if loading}
    <div class="admin-loading">
        <div class="admin-spinner"></div>
    </div>
{:else if stats}
    <div class="admin-stats-grid">
        <div class="admin-stat-card">
            <div class="admin-stat-label">Total Questions</div>
            <div class="admin-stat-value">{stats.totalQuestions}</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-label">Active Themes</div>
            <div class="admin-stat-value">{stats.activeThemes}</div>
            <div class="admin-stat-breakdown">
                {stats.totalThemes} total themes
            </div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-label">Hall of Fame Entries</div>
            <div class="admin-stat-value">{stats.totalHallOfFameEntries}</div>
        </div>
    </div>

    <div class="admin-card">
        <div class="admin-card-header">
            <h2 class="admin-card-title">Questions by Type</h2>
        </div>
        <div class="admin-stats-grid" style="margin-bottom: 0;">
            {#each Object.entries(stats.questionsByType) as [type, count]}
                <div
                    class="admin-stat-card"
                    style="background: var(--admin-bg);"
                >
                    <div
                        class="admin-stat-label"
                        style="text-transform: capitalize;"
                    >
                        {type}
                    </div>
                    <div class="admin-stat-value" style="font-size: 1.5rem;">
                        {count}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="admin-card">
        <div class="admin-card-header">
            <h2 class="admin-card-title">Questions by Difficulty</h2>
        </div>
        <div class="admin-stats-grid" style="margin-bottom: 0;">
            <div class="admin-stat-card" style="background: #d1fae5;">
                <div class="admin-stat-label">Easy</div>
                <div
                    class="admin-stat-value"
                    style="font-size: 1.5rem; color: #065f46;"
                >
                    {stats.questionsByDifficulty.easy || 0}
                </div>
            </div>
            <div class="admin-stat-card" style="background: #fef3c7;">
                <div class="admin-stat-label">Medium</div>
                <div
                    class="admin-stat-value"
                    style="font-size: 1.5rem; color: #92400e;"
                >
                    {stats.questionsByDifficulty.medium || 0}
                </div>
            </div>
            <div class="admin-stat-card" style="background: #fee2e2;">
                <div class="admin-stat-label">Hard</div>
                <div
                    class="admin-stat-value"
                    style="font-size: 1.5rem; color: #991b1b;"
                >
                    {stats.questionsByDifficulty.hard || 0}
                </div>
            </div>
        </div>
    </div>

    <div class="admin-card">
        <div class="admin-card-header">
            <h2 class="admin-card-title">Questions by Category</h2>
        </div>
        <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Questions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each Object.entries(stats.questionsByCategory).sort((a, b) => b[1] - a[1]) as [category, count]}
                        <tr>
                            <td>{category}</td>
                            <td>{count}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
{/if}
