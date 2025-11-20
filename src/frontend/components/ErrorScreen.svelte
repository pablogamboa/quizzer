<script>
    import { quiz, resetQuiz } from '../stores/quiz.svelte.js'

    function handleTryAgain() {
        resetQuiz()
    }
</script>

<div class="error-screen">
    <h2>Oops! Something went wrong</h2>
    <p>
        {quiz.error ||
            'Unable to load questions. Please check your connection and try again.'}
    </p>
    <button class="btn" onclick={handleTryAgain}>Try Again</button>
</div>

<style>
    .error-screen {
        text-align: center;
    }

    .error-screen h2 {
        color: #f44336;
        margin-bottom: 20px;
        font-size: 1.8em;
    }

    .error-screen p {
        color: #666;
        margin-bottom: 30px;
        font-size: 1.1em;
        line-height: 1.6;
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
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
    }

    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .btn:active {
        transform: translateY(0);
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
        .error-screen h2 {
            font-size: 1.5em;
            margin-bottom: 15px;
        }

        .error-screen p {
            font-size: 1em;
            margin-bottom: 25px;
            line-height: 1.5;
        }

        .btn {
            padding: 18px 35px;
            font-size: 1.1em;
            border-radius: 30px;
            min-height: 56px;
            letter-spacing: 0.5px;
            width: 100%;
            max-width: 280px;
            margin: 0 auto;
            display: block;
        }
    }
</style>
