<script>
    import { onMount, onDestroy } from 'svelte'
    import { scale, fly } from 'svelte/transition'
    import { quiz, resetQuiz } from '../stores/quiz.svelte.js'
    import { getGameRpcClient } from '../lib/rpc-client.ts'
    import { createConfetti } from '../lib/confetti.js'

    let rpcClient = null
    let sortedResults = []
    let winners = []
    let finalResults = null

    onMount(() => {
        rpcClient = getGameRpcClient()

        // Read final results from the store (set by NetworkedQuestionScreen)
        const storedResults = quiz.multiplayerFinalResults
        if (storedResults) {
            finalResults = storedResults
            calculateResults(storedResults)
        } else {
            // Fallback: calculate from current state
            calculateResults()
        }
    })

    function calculateResults(serverResults = null) {
        const totalQuestions =
            serverResults?.totalQuestions || quiz.config.questionCount

        const results = quiz.connectedPlayers.map((player) => {
            // Use scores from server if available, otherwise from store
            const score = serverResults
                ? serverResults.scores.find((s) => s.playerId === player.id)
                      ?.score || 0
                : quiz.multiplayerScores[player.id] || 0

            return {
                name: player.name,
                score: score,
                total: totalQuestions,
                percentage:
                    totalQuestions > 0
                        ? Math.round((score / totalQuestions) * 100)
                        : 0,
                correctAnswers: score,
            }
        })

        sortedResults = results.sort(
            (a, b) => b.score - a.score || b.percentage - a.percentage
        )

        // Check for tied winners
        if (sortedResults.length > 0) {
            const topScore = sortedResults[0].score
            winners = sortedResults.filter(
                (player) => player.score === topScore
            )

            // Play celebration for winner(s)
            if (sortedResults[0].percentage >= 70) {
                createConfetti()
            }
        }
    }

    function getMedalEmoji(position) {
        switch (position) {
            case 0:
                return '🥇'
            case 1:
                return '🥈'
            case 2:
                return '🥉'
            default:
                return '🏅'
        }
    }

    function getPositionText(position) {
        switch (position) {
            case 0:
                return '1st Place'
            case 1:
                return '2nd Place'
            case 2:
                return '3rd Place'
            default:
                return `${position + 1}th Place`
        }
    }

    function getActualPosition(result) {
        // Find the actual position considering ties
        let position = 0
        for (let i = 0; i < sortedResults.length; i++) {
            if (sortedResults[i].score > result.score) {
                position++
            } else {
                break
            }
        }
        return position
    }

    function handlePlayAgain() {
        // Disconnect from RPC session
        if (rpcClient) {
            rpcClient.disconnect()
        }
        resetQuiz()
    }

    onDestroy(() => {
        // Clean disconnect when component is destroyed
        if (rpcClient) {
            rpcClient.disconnect()
        }
    })
</script>

<div class="result-screen-container">
    <div class="header">
        <h2 class="gradient-text">🏆 Game Over! 🏆</h2>
        <p>Here are the final results.</p>
    </div>

    {#if sortedResults.length > 0}
        <div class="winner-card">
            {#if winners.length === 1}
                <div class="icon">👑</div>
                <h3>{winners[0].name} is the Champion!</h3>
                <p>
                    With a score of
                    <strong>{winners[0].score}/{winners[0].total}</strong>
                    ({winners[0].percentage}%)
                </p>
            {:else}
                <div class="icon">🎉</div>
                <h3>It's a tie!</h3>
                <p>
                    {winners.map((w) => w.name).join(' & ')} share the victory!
                </p>
            {/if}
        </div>

        <div class="leaderboard">
            <h3>Leaderboard</h3>
            {#each sortedResults as result, index}
                {@const actualPos = getActualPosition(result)}
                <div
                    class="player-row"
                    class:is-winner={winners.includes(result)}
                >
                    <div class="rank">
                        <span>{getMedalEmoji(actualPos)}</span>
                    </div>
                    <div class="player-info">
                        <div class="avatar">
                            {result.name.charAt(0).toUpperCase()}
                        </div>
                        <span class="name">{result.name}</span>
                    </div>
                    <div class="score">
                        <strong>{result.score}</strong>
                        <span class="total">/{result.total}</span>
                    </div>
                    <div class="percentage-bar">
                        <div
                            class="fill"
                            style="width: {result.percentage}%"
                        ></div>
                    </div>
                </div>
            {/each}
        </div>

        <div class="summary-card">
            <h3>Quiz Summary</h3>
            <div class="summary-grid">
                <div>
                    <div class="info-label">Category</div>
                    <p>
                        {quiz.config.category === 'all'
                            ? 'All'
                            : quiz.config.category}
                    </p>
                </div>
                <div>
                    <div class="info-label">Difficulty</div>
                    <p>
                        {quiz.config.difficulty.charAt(0).toUpperCase() +
                            quiz.config.difficulty.slice(1)}
                    </p>
                </div>
                <div>
                    <div class="info-label">Questions</div>
                    <p>{quiz.config.questionCount}</p>
                </div>
                <div>
                    <div class="info-label">Players</div>
                    <p>{quiz.connectedPlayers.length}</p>
                </div>
            </div>
        </div>
    {:else}
        <div class="loading-container">
            <div class="loading-dots">
                <span></span><span></span><span></span>
            </div>
            <p>Calculating results...</p>
        </div>
    {/if}

    <div class="actions">
        <button class="btn-modern" onclick={handlePlayAgain}>
            Play Again
        </button>
    </div>
</div>

<style>
    .result-screen-container {
        max-width: 800px;
        margin: auto;
        padding: var(--spacing-lg);
    }
    .header {
        text-align: center;
        margin-bottom: var(--spacing-xl);
    }
    .header h2 {
        font-family: var(--font-heading);
        font-size: 3rem;
        margin-bottom: var(--spacing-xs);
    }
    .header p {
        font-size: 1.1rem;
        color: var(--text-muted);
    }

    .winner-card {
        background: var(--gradient-brand);
        color: white;
        border-radius: var(--radius-xl);
        padding: var(--spacing-xl);
        text-align: center;
        margin-bottom: var(--spacing-xl);
        box-shadow: var(--shadow-glow);
        animation: pulse-glow 2s infinite;
    }
    .winner-card .icon {
        font-size: 4rem;
        margin-bottom: var(--spacing-sm);
    }
    .winner-card h3 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: var(--spacing-xs);
        color: white;
    }
    .winner-card p {
        font-size: 1.1rem;
        opacity: 0.95;
        color: rgba(255, 255, 255, 0.9);
    }

    .leaderboard {
        background: var(--glass-panel);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
        box-shadow: var(--shadow-md);
    }
    .leaderboard h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: var(--spacing-md);
        text-align: center;
        color: var(--text-main);
    }
    .player-row {
        display: grid;
        grid-template-columns: 40px 1fr 80px;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-sm);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
    }
    .player-row.is-winner {
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid var(--warning);
    }
    .rank {
        font-size: 1.5rem;
        text-align: center;
    }
    .player-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }
    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--gradient-brand);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
    }
    .name {
        font-weight: 600;
        color: var(--text-main);
    }
    .score {
        text-align: right;
        font-size: 1.1rem;
        color: var(--text-main);
    }
    .score strong {
        font-size: 1.25rem;
        color: var(--text-main);
    }
    .score .total {
        color: var(--text-muted);
    }
    .percentage-bar {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 4px;
        width: 100%;
        background-color: var(--bg-surface-hover);
    }
    .percentage-bar .fill {
        height: 100%;
        background: var(--gradient-brand);
        border-radius: 0 2px 2px 0;
        transition: width 0.5s ease-out;
    }

    .summary-card {
        background: var(--glass-panel);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
        box-shadow: var(--shadow-sm);
    }
    .summary-card h3 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: var(--spacing-md);
        text-align: center;
        color: var(--text-main);
    }
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-md);
        text-align: center;
    }
    .summary-grid .info-label {
        font-size: 0.9rem;
        color: var(--text-muted);
        margin-bottom: var(--spacing-xs);
        display: block;
    }
    .summary-grid p {
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--text-main);
    }

    .actions {
        text-align: center;
    }
    .actions .btn-modern {
        max-width: 300px;
    }

    .loading-container {
        padding: var(--spacing-xl);
        text-align: center;
    }
    .loading-container p {
        margin-top: var(--spacing-sm);
        font-weight: 600;
        color: var(--text-muted);
    }

    @media (max-width: 768px) {
        .header h2 {
            font-size: 2.5rem;
        }
        .winner-card h3 {
            font-size: 1.75rem;
        }
    }
</style>
