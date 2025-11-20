<script>
    import { onMount } from 'svelte'
    import { quiz, resetQuiz } from '../stores/quiz.svelte.js'
    import { createConfetti } from '../lib/confetti.js'
    import { playApplauseSound } from '../lib/audio.js'
    import { submitQuiz } from '../lib/api.js'
    import HallOfFame from './HallOfFame.svelte'

    let sortedResults = []
    let winners = []
    let showHallOfFame = false
    let hallOfFameIds = []

    onMount(async () => {
        // Calculate scores by submitting each player's answers to the API
        const results = await Promise.all(
            quiz.players.map(async (player) => {
                const playerData = quiz.playerScores[player] || {
                    answers: [],
                    score: 0,
                }

                if (playerData.answers.length > 0) {
                    try {
                        // Calculate time taken
                        const timeTaken = quiz.quizStartTime
                            ? Math.floor(
                                  (Date.now() - quiz.quizStartTime) / 1000
                              )
                            : null

                        // Get quiz config
                        const category =
                            quiz.quizConfig.category === 'all'
                                ? null
                                : quiz.quizConfig.category
                        const difficulty =
                            quiz.quizConfig.difficulty === 'all'
                                ? null
                                : quiz.quizConfig.difficulty

                        // Submit with player name and quiz metadata
                        const apiResult = await submitQuiz(
                            playerData.answers,
                            player,
                            category,
                            difficulty,
                            timeTaken
                        )

                        // Store hall of fame ID if created
                        if (apiResult.hallOfFameId) {
                            hallOfFameIds.push(apiResult.hallOfFameId)
                        }

                        return {
                            name: player,
                            score: apiResult.score,
                            total: apiResult.total,
                            percentage: apiResult.percentage,
                            hallOfFameId: apiResult.hallOfFameId,
                        }
                    } catch (error) {
                        console.error(
                            `Error calculating score for ${player}:`,
                            error
                        )
                        return {
                            name: player,
                            score: 0,
                            total: playerData.answers.length,
                            percentage: 0,
                        }
                    }
                } else {
                    return {
                        name: player,
                        score: 0,
                        total: 0,
                        percentage: 0,
                    }
                }
            })
        )

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
                playApplauseSound(quiz.audioFiles)
            }
        }
    })

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

    function handleRestart() {
        resetQuiz()
    }

    function handleViewHallOfFame() {
        showHallOfFame = true
    }

    function handlePlayAgain() {
        resetQuiz()
    }
</script>

{#if !showHallOfFame}
    <div class="group-result">
        <h2>🏆 Group Quiz Results</h2>

        {#if sortedResults.length > 0}
            <div class="winner-announcement">
                {#if winners.length === 1}
                    <h3>🎉 Congratulations {winners[0].name}!</h3>
                    <p>You are the Quiz Champion!</p>
                {:else if winners.length > 1}
                    <h3>🎉 It's a tie!</h3>
                    <p>
                        {winners.map((w) => w.name).join(' and ')} share the victory!
                    </p>
                {/if}
            </div>

            <div class="results-list">
                {#each sortedResults as result, index}
                    {@const actualPos = getActualPosition(result)}
                    <div
                        class="result-card"
                        class:winner={winners.includes(result)}
                    >
                        <div class="position">
                            <span class="medal">{getMedalEmoji(actualPos)}</span
                            >
                            <span class="position-text">
                                {getPositionText(actualPos)}
                            </span>
                        </div>

                        <div class="player-info">
                            <h4 class="player-name">{result.name}</h4>
                            <div class="score-display">
                                <span class="score">
                                    {result.score}/{result.total}
                                </span>
                                <span class="percentage">
                                    ({result.percentage}%)
                                </span>
                            </div>
                        </div>

                        <div class="score-bar">
                            <div
                                class="score-fill"
                                style="width: {result.percentage}%"
                            ></div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}

        <div class="button-group">
            <button class="btn primary" onclick={handleViewHallOfFame}
                >View Hall of Fame</button
            >
            <button class="btn secondary" onclick={handleRestart}
                >Play Again</button
            >
        </div>
    </div>
{:else}
    <HallOfFame
        category={quiz.quizConfig.category === 'all'
            ? null
            : quiz.quizConfig.category}
        difficulty={quiz.quizConfig.difficulty === 'all'
            ? null
            : quiz.quizConfig.difficulty}
        onplayagain={handlePlayAgain}
    />
{/if}

<style>
    .group-result {
        text-align: center;
    }

    .group-result h2 {
        color: #333;
        margin-bottom: 20px;
        font-size: 1.8em;
    }

    .winner-announcement {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 20px;
        border-radius: 15px;
        margin-bottom: 30px;
        animation: pulse 2s infinite;
    }

    .winner-announcement h3 {
        margin: 0 0 10px 0;
        font-size: 1.5em;
    }

    .winner-announcement p {
        margin: 0;
        opacity: 0.95;
        font-size: 1.1em;
    }

    @keyframes pulse {
        0%,
        100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.02);
        }
    }

    .results-list {
        display: grid;
        gap: 15px;
        margin-bottom: 30px;
    }

    .result-card {
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 15px;
        padding: 20px;
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        gap: 15px;
        align-items: center;
        transition: all 0.3s ease;
    }

    .result-card.winner {
        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
        border-color: #f1c40f;
        box-shadow: 0 5px 20px rgba(241, 196, 15, 0.3);
    }

    .position {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }

    .medal {
        font-size: 2.5em;
    }

    .position-text {
        font-size: 0.9em;
        font-weight: 600;
        color: #666;
    }

    .player-info {
        text-align: left;
    }

    .player-name {
        margin: 0 0 10px 0;
        font-size: 1.3em;
        color: #333;
    }

    .score-display {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .score {
        font-size: 1.4em;
        font-weight: 700;
        color: #667eea;
    }

    .percentage {
        font-size: 1.1em;
        color: #666;
    }

    .score-bar {
        grid-column: 1 / -1;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
    }

    .score-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transition: width 1s ease;
        border-radius: 4px;
    }

    .button-group {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 20px;
    }

    .btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px 40px;
        font-size: 1.1em;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        min-height: 48px;
        min-width: 120px;
    }

    .btn.secondary {
        background: rgba(255, 255, 255, 0.9);
        color: #667eea;
        border: 2px solid #667eea;
    }

    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .btn.secondary:hover {
        background: rgba(255, 255, 255, 1);
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
        .result-card {
            grid-template-columns: auto 1fr;
            padding: 15px;
            gap: 12px;
        }

        .medal {
            font-size: 2em;
        }

        .player-name {
            font-size: 1.1em;
        }

        .score {
            font-size: 1.2em;
        }

        .btn {
            width: 100%;
            max-width: 280px;
            margin: 0 auto;
            display: block;
        }

        .winner-announcement {
            padding: 15px;
        }

        .winner-announcement h3 {
            font-size: 1.3em;
        }
    }
</style>
