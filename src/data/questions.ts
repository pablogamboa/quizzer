export type QuestionType = 'trivia' | 'question' | 'picture'

export interface BaseQuestion {
    id: string
    question: string
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
    type: QuestionType
    theme?: string
}

export interface TriviaQuestion extends BaseQuestion {
    type: 'trivia'
    answers: string[]
    correct: number
}

export interface FreeTextQuestion extends BaseQuestion {
    type: 'question'
    correctAnswer: string
    acceptableAnswers?: string[]
}

export interface PictureQuestion extends BaseQuestion {
    type: 'picture'
    imageUrl: string
    answers: string[]
    correct: number
}

export type Question = TriviaQuestion | FreeTextQuestion | PictureQuestion

export interface QuizTheme {
    id: string
    themeKey: string
    themeName: string
    category: string
    description?: string
    icon?: string
    isActive: boolean
}
