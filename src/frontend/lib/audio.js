import {
    quiz
} from '../stores/quiz.svelte.js'

const audioLoaders = {
    applause: () => import('./data/applause.js'),
    boo: () => import('./data/boo.js'),
}

// Initialize audio system
export async function initializeAudio() {
    const loadedAudio = {}

    await Promise.all(
        Object.entries(audioLoaders).map(async ([name, loader]) => {
            try {
                const module = await loader()
                const source = module.default
                const audio = new Audio(source)
                audio.preload = 'auto'
                audio.volume = 0.7
                audio.crossOrigin = 'anonymous'
                loadedAudio[name] = audio
            } catch (error) {
                console.warn(`${name} audio initialization failed:`, error)
                loadedAudio[name] = null
            }
        })
    )

    quiz.audioFiles = loadedAudio
}

// Generic function to play any sound with error handling
export function playSound(soundName, audioFilesObj) {
    const audio = audioFilesObj[soundName]

    if (!audio) {
        console.warn(`${soundName} audio not available`)
        return
    }

    try {
        audio.currentTime = 0
        const playPromise = audio.play()

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log(`${soundName} sound played successfully`)
                })
                .catch((error) => {
                    console.warn(`${soundName} sound play failed:`, error)
                })
        }
    } catch (error) {
        console.warn(`Error playing ${soundName} sound:`, error)
    }
}

export function playApplauseSound(audioFilesObj) {
    playSound('applause', audioFilesObj)
}

export function playBooSound(audioFilesObj) {
    playSound('boo', audioFilesObj)
}