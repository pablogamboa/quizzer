<script>
    import { quiz } from '../stores/quiz.svelte.js'
    import { loadQuestions } from '../lib/api.js'

    let playerName = ''

    function addPlayer() {
        if (playerName.trim()) {
            quiz.players = [...quiz.players, playerName.trim()]
            playerName = ''
        }
    }

    function removePlayer(index) {
        quiz.players = quiz.players.filter((_, i) => i !== index)
    }

    async function startGroupQuiz() {
        if (quiz.players.length >= 2) {
            try {
                // Load enough questions for all players (each player gets the full question count)
                const totalQuestionsNeeded =
                    quiz.quizConfig.questionCount * quiz.players.length
                const config = {
                    ...quiz.quizConfig,
                    questionCount: totalQuestionsNeeded,
                }
                const loadedQuestions = await loadQuestions(config)

                console.log(
                    `Requested ${totalQuestionsNeeded} questions, got ${loadedQuestions.length} questions`
                )
                console.log(
                    `Players: ${quiz.players.length}, Questions per player: ${quiz.quizConfig.questionCount}`
                )

                quiz.questions = loadedQuestions

                // Initialize playerScores with an empty answers array for each player
                const initialScores = {}
                quiz.players.forEach((player) => {
                    initialScores[player] = {
                        answers: [],
                        score: 0,
                    }
                })
                quiz.playerScores = initialScores

                // Reset to first player and first question
                quiz.currentPlayerIndex = 0
                quiz.currentQuestionIndex = 0

                quiz.currentScreen = 'question'
            } catch (error) {
                console.error('Failed to load questions:', error)
                quiz.currentScreen = 'error'
            }
        }
    }

    function goBack() {
        quiz.currentScreen = 'start'
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            addPlayer()
        }
    }
</script>

<div class="player-setup">
    <h2>Setup Players</h2>
    <p>Add players for the group quiz. Minimum 2 players required.</p>

    <div class="player-input">
        <input
            type="text"
            placeholder="Enter player name..."
            bind:value={playerName}
            onkeypress={handleKeyPress}
            maxlength="20"
        />
        <button
            class="btn-add"
            onclick={addPlayer}
            disabled={!playerName.trim()}
        >
            Add Player
        </button>
    </div>

    {#if quiz.players.length > 0}
        <div class="players-list">
            <h3>Players ({quiz.players.length}):</h3>
            <div class="players-grid">
                {#each quiz.players as player, index}
                    <div class="player-card">
                        <span class="player-name">{player}</span>
                        <button
                            class="btn-remove"
                            onclick={() => removePlayer(index)}
                        >
                            ×
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <div class="action-buttons">
        <button class="btn btn-secondary" onclick={goBack}>Back</button>
        <button
            class="btn"
            onclick={startGroupQuiz}
            disabled={quiz.players.length < 2}
        >
            Start Group Quiz
        </button>
    </div>
</div>

<style>
    .player-setup {
        text-align: center;
    }

    .player-setup h2 {
        color: #333;
        margin-bottom: 15px;
        font-size: 1.8em;
    }

    .player-setup p {
        color: #666;
        margin-bottom: 30px;
        font-size: 1.1em;
    }

    .player-input {
        display: flex;
        gap: 10px;
        margin-bottom: 30px;
        align-items: center;
    }

    .player-input input {
        flex: 1;
        padding: 12px 15px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        font-size: 1em;
        min-height: 48px;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }

    .player-input input:focus {
        outline: none;
        border-color: #667eea;
    }

    .btn-add {
        background: #667eea;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        min-height: 48px;
        min-width: 100px;
    }

    .btn-add:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .players-list {
        margin-bottom: 30px;
    }

    .players-list h3 {
        color: #333;
        margin-bottom: 15px;
        text-align: left;
    }

    .players-grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }

    .player-card {
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        padding: 12px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .player-name {
        font-weight: 500;
        color: #333;
    }

    .btn-remove {
        background: #f44336;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .action-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
    }

    .btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px 30px;
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

    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .btn-secondary {
        background: #6c757d;
    }

    .btn-secondary:hover {
        background: #5a6268;
        box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
        .player-input {
            flex-direction: column;
            gap: 15px;
        }

        .player-input input {
            width: 100%;
        }

        .btn-add {
            width: 100%;
        }

        .players-grid {
            grid-template-columns: 1fr;
        }

        .action-buttons {
            flex-direction: column;
        }

        .btn {
            width: 100%;
            max-width: 280px;
            margin: 0 auto;
        }
    }
</style>
