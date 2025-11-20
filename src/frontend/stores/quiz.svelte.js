export const quiz = $state({
    gameMode: 'individual',
    currentScreen: 'start',
    loading: false,
    error: null,
    config: {
        questionCount: 10,
        difficulty: 'all',
        category: 'all',
        theme: null,
    },
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    selectedAnswer: null,
    results: null,
    hallOfFameId: null,
    players: [],
    currentPlayerIndex: 0,
    playerScores: {},
    categories: [],
    availableThemes: [],
    audioFiles: {},
    startTime: null,
    multiplayerMode: false,
    gameCode: null,
    isHost: false,
    hostPlayerId: null,
    localPlayerName: null,
    connectedPlayers: [],
    multiplayerScores: {},
    currentQuestionTimer: null,
    gameConnectionStatus: 'disconnected',
    multiplayerFinalResults: null,
})

const currentQuestionDerived = $derived(
    quiz.questions[quiz.currentQuestionIndex]
)
const currentPlayerDerived = $derived(quiz.players[quiz.currentPlayerIndex])
const progressDerived = $derived(
    quiz.questions.length > 0 ?
    ((quiz.currentQuestionIndex + 1) / quiz.questions.length) * 100 :
    0
)

export const currentQuestion = () => currentQuestionDerived
export const currentPlayer = () => currentPlayerDerived
export const progress = () => progressDerived

export function resetQuiz() {
    quiz.currentQuestionIndex = 0
    quiz.userAnswers = []
    quiz.selectedAnswer = null
    quiz.results = null
    quiz.hallOfFameId = null
    quiz.currentScreen = 'start'
    quiz.error = null
    quiz.startTime = null
    quiz.config.theme = null
    quiz.availableThemes = []
    quiz.gameMode = null
    quiz.players = []
    quiz.currentPlayerIndex = 0
    quiz.playerScores = {}
    quiz.multiplayerMode = false
    quiz.gameCode = null
    quiz.isHost = false
    quiz.hostPlayerId = null
    quiz.localPlayerName = null
    quiz.connectedPlayers = []
    quiz.multiplayerScores = {}
    quiz.currentQuestionTimer = null
    quiz.gameConnectionStatus = 'disconnected'
    quiz.multiplayerFinalResults = null
}

export function nextQuestion() {
    quiz.currentQuestionIndex++
    quiz.selectedAnswer = null
}

export function selectAnswer(answer) {
    quiz.selectedAnswer = answer
}