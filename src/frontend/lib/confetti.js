export function createConfetti() {
    const confettiContainer = document.createElement('div')
    confettiContainer.className = 'confetti'
    document.body.appendChild(confettiContainer)

    const shapes = ['square', 'circle', 'triangle', 'star', 'ribbon']
    const animations = ['fall', 'swing', 'spiral', 'bounce']
    const colors = Array.from({
            length: 10,
        },
        (_, i) => `color-${i + 1}`
    )

    // Create multiple bursts for spectacular effect
    const createBurst = (burstDelay = 0) => {
        setTimeout(() => {
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const piece = document.createElement('div')

                    // Random shape
                    const shape =
                        shapes[Math.floor(Math.random() * shapes.length)]

                    // Random animation
                    const animation =
                        animations[
                            Math.floor(Math.random() * animations.length)
                        ]

                    // Random color
                    const color =
                        colors[Math.floor(Math.random() * colors.length)]

                    // Build class list
                    piece.className = `confetti-piece ${shape} ${animation} ${color}`

                    // Random positioning
                    piece.style.left = Math.random() * 100 + 'vw'
                    piece.style.top = '-20px'

                    // Random animation delay for staggered effect
                    piece.style.animationDelay = Math.random() * 0.5 + 's'

                    // Random animation duration variation
                    const baseDuration =
                        animation === 'swing' ?
                        4 :
                        animation === 'spiral' ?
                        3.5 :
                        3
                    const variation = (Math.random() - 0.5) * 0.8
                    piece.style.animationDuration =
                        baseDuration + variation + 's'

                    // Random size variation
                    const scale = 0.7 + Math.random() * 0.6
                    piece.style.transform = `scale(${scale})`

                    confettiContainer.appendChild(piece)

                    // Remove piece after animation
                    setTimeout(
                        () => {
                            if (piece.parentNode) {
                                piece.remove()
                            }
                        },
                        (baseDuration + variation + 0.5) * 1000
                    )
                }, i * 50)
            }
        }, burstDelay)
    }

    // Create multiple bursts for epic effect
    createBurst(0)
    createBurst(300)
    createBurst(600)

    // Add some extra sparkle with smaller pieces
    setTimeout(() => {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div')
                sparkle.className = `confetti-piece circle fall ${colors[Math.floor(Math.random() * colors.length)]}`
                sparkle.style.left = Math.random() * 100 + 'vw'
                sparkle.style.top = '-10px'
                sparkle.style.transform = `scale(${0.3 + Math.random() * 0.4})`
                sparkle.style.animationDelay = Math.random() * 1 + 's'
                sparkle.style.animationDuration = 2 + Math.random() + 's'

                confettiContainer.appendChild(sparkle)

                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.remove()
                    }
                }, 3500)
            }, i * 100)
        }
    }, 200)

    // Clean up container after all animations
    setTimeout(() => {
        if (confettiContainer.parentNode) {
            confettiContainer.remove()
        }
    }, 8000)

    // Add burst effect sound (if browser supports it)
    if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50])
    }
}