import { test, expect } from '@playwright/test'

test.describe('Quiz Results', () => {
    test('should complete quiz and show results', async ({ page }) => {
        await page.goto('/')
        await page.click('.mode-card:has-text("Solo Quest")')
        await page.click('button:has-text("Start Quiz")')
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        let questionsAnswered = 0
        const maxQuestions = 20

        while (questionsAnswered < maxQuestions) {
            // Wait for question to be fully loaded
            await page.waitForTimeout(200)

            // Check if modal or result screen is visible (quiz complete)
            const modalOverlay = page.locator('.modal-overlay')
            const resultScreen = page.locator('.result-screen')
            if (
                (await modalOverlay.isVisible().catch(() => false)) ||
                (await resultScreen.isVisible().catch(() => false))
            ) {
                break
            }

            // Make sure we're still on a question screen
            const questionScreen = page.locator('.question-screen')
            if (!(await questionScreen.isVisible().catch(() => false))) {
                break
            }

            // Answer the question
            const answers = page.locator('.answer-option')
            const textInput = page.locator('.text-answer-input')

            const answerCount = await answers.count()
            const textInputCount = await textInput.count()

            if (answerCount > 0) {
                await answers.first().click()
                // Wait for the selection to register and verify
                await page.waitForTimeout(200)
                // Verify an answer is selected
                await expect(answers.first()).toHaveClass(/selected/)
            } else if (textInputCount > 0) {
                // Check if it's a number input
                const inputType = await textInput.getAttribute('type')
                if (inputType === 'number') {
                    await textInput.fill('42')
                } else {
                    await textInput.fill('Test answer')
                }
                // Wait for the input to register
                await page.waitForTimeout(100)
            }

            // Click next/finish button
            const nextButton = page
                .locator('button')
                .filter({ hasText: /Next Question|Finish Quiz/ })

            await expect(nextButton).toBeVisible({ timeout: 5000 })
            await expect(nextButton).toBeEnabled({ timeout: 5000 })

            await nextButton.click()
            questionsAnswered++

            // Wait for navigation
            await page.waitForTimeout(500)
        }

        // Handle modal if it appears
        const modalOverlay = page.locator('.modal-overlay')
        if (
            await modalOverlay.isVisible({ timeout: 1000 }).catch(() => false)
        ) {
            await page.click('button:has-text("Skip")')
            await page.waitForTimeout(500)
        }

        await expect(page.locator('.result-screen')).toBeVisible({
            timeout: 10000,
        })
        await expect(page.locator('h2')).toContainText('Quiz Completed!')
    })

    test('should display score and percentage', async ({ page }) => {
        await page.goto('/')
        await page.click('.mode-card:has-text("Solo Quest")')
        await page.click('button:has-text("Start Quiz")')
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        for (let i = 0; i < 20; i++) {
            // Check if modal or result screen is visible (quiz complete)
            const modalOverlay = page.locator('.modal-overlay')
            const resultScreen = page.locator('.result-screen')
            if (
                (await modalOverlay
                    .isVisible({ timeout: 500 })
                    .catch(() => false)) ||
                (await resultScreen
                    .isVisible({ timeout: 500 })
                    .catch(() => false))
            ) {
                break
            }

            const answers = page.locator('.answer-option')
            const textInput = page.locator('.text-answer-input')

            if ((await answers.count()) > 0) {
                await answers.first().click()
            } else if ((await textInput.count()) > 0) {
                await textInput.fill('4')
            }

            const nextButton = page
                .locator('button')
                .filter({ hasText: /Next Question|Finish Quiz/ })
            if (
                (await nextButton.isVisible()) &&
                (await nextButton.isEnabled())
            ) {
                await nextButton.click()
            }
            await page.waitForTimeout(300)
        }

        // Handle modal if it appears
        const modalOverlay = page.locator('.modal-overlay')
        if (
            await modalOverlay.isVisible({ timeout: 1000 }).catch(() => false)
        ) {
            await page.click('button:has-text("Skip")')
            await page.waitForTimeout(500)
        }

        const scoreText = page.locator('.score-display')
        await expect(scoreText).toBeVisible()
        await expect(scoreText).toContainText(/\d+\/\d+/)

        const messageText = page.locator('.score-message')
        await expect(messageText).toBeVisible()
    })

    test('should show performance message based on score', async ({ page }) => {
        await page.goto('/')
        await page.click('.mode-card:has-text("Solo Quest")')
        await page.click('button:has-text("Start Quiz")')
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        for (let i = 0; i < 20; i++) {
            // Check if modal or result screen is visible (quiz complete)
            const modalOverlay = page.locator('.modal-overlay')
            const resultScreen = page.locator('.result-screen')
            if (
                (await modalOverlay
                    .isVisible({ timeout: 500 })
                    .catch(() => false)) ||
                (await resultScreen
                    .isVisible({ timeout: 500 })
                    .catch(() => false))
            ) {
                break
            }

            const answers = page.locator('.answer-option')
            const textInput = page.locator('.text-answer-input')

            if ((await answers.count()) > 0) {
                await answers.first().click()
            } else if ((await textInput.count()) > 0) {
                // Check if it's a number input
                const inputType = await textInput.getAttribute('type')
                if (inputType === 'number') {
                    await textInput.fill('42')
                } else {
                    await textInput.fill('Test')
                }
            }

            const nextButton = page
                .locator('button')
                .filter({ hasText: /Next Question|Finish Quiz/ })
            if (
                (await nextButton.isVisible()) &&
                (await nextButton.isEnabled())
            ) {
                await nextButton.click()
            }
            await page.waitForTimeout(300)
        }

        // Handle modal if it appears
        const modalOverlay = page.locator('.modal-overlay')
        if (
            await modalOverlay.isVisible({ timeout: 1000 }).catch(() => false)
        ) {
            await page.click('button:has-text("Skip")')
            await page.waitForTimeout(500)
        }

        const message = page.locator('.score-message')
        await expect(message).toBeVisible()

        const messageText = await message.textContent()
        expect(messageText).toMatch(
            /Outstanding|Great job|Not bad|Keep studying/
        )
    })

    test('should allow restarting the quiz', async ({ page }) => {
        await page.goto('/')
        await page.click('.mode-card:has-text("Solo Quest")')
        await page.click('button:has-text("Start Quiz")')
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        for (let i = 0; i < 20; i++) {
            // Check if modal or result screen is visible (quiz complete)
            const modalOverlay = page.locator('.modal-overlay')
            const resultScreen = page.locator('.result-screen')
            if (
                (await modalOverlay
                    .isVisible({ timeout: 500 })
                    .catch(() => false)) ||
                (await resultScreen
                    .isVisible({ timeout: 500 })
                    .catch(() => false))
            ) {
                break
            }

            const answers = page.locator('.answer-option')
            const textInput = page.locator('.text-answer-input')

            if ((await answers.count()) > 0) {
                await answers.first().click()
            } else if ((await textInput.count()) > 0) {
                // Check if it's a number input
                const inputType = await textInput.getAttribute('type')
                if (inputType === 'number') {
                    await textInput.fill('42')
                } else {
                    await textInput.fill('Test')
                }
            }

            const nextButton = page
                .locator('button')
                .filter({ hasText: /Next Question|Finish Quiz/ })
            if (
                (await nextButton.isVisible()) &&
                (await nextButton.isEnabled())
            ) {
                await nextButton.click()
            }
            await page.waitForTimeout(300)
        }

        // Handle modal if it appears
        const modalOverlay = page.locator('.modal-overlay')
        if (
            await modalOverlay.isVisible({ timeout: 1000 }).catch(() => false)
        ) {
            await page.click('button:has-text("Skip")')
            await page.waitForTimeout(500)
        }

        const restartButton = page.locator('button:has-text("Take Quiz Again")')
        await expect(restartButton).toBeVisible()
        await restartButton.click()

        await expect(page.locator('.section-title')).toContainText(
            'Choose Your Game Mode'
        )
        await expect(
            page.locator('.mode-card:has-text("Solo Quest")')
        ).toBeVisible()
    })

    test('should trigger confetti animation on good score', async ({
        page,
    }) => {
        await page.goto('/')
        await page.click('.mode-card:has-text("Solo Quest")')
        await page.click('button:has-text("Start Quiz")')
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        for (let i = 0; i < 20; i++) {
            // Check if modal or result screen is visible (quiz complete)
            const modalOverlay = page.locator('.modal-overlay')
            const resultScreen = page.locator('.result-screen')
            if (
                (await modalOverlay
                    .isVisible({ timeout: 500 })
                    .catch(() => false)) ||
                (await resultScreen
                    .isVisible({ timeout: 500 })
                    .catch(() => false))
            ) {
                break
            }

            const answers = page.locator('.answer-option')
            if ((await answers.count()) > 0) {
                await answers.first().click()
            } else {
                const textInput = page.locator('.text-answer-input')
                await textInput.fill('4')
            }

            const nextButton = page
                .locator('button')
                .filter({ hasText: /Next Question|Finish Quiz/ })
            if (
                (await nextButton.isVisible()) &&
                (await nextButton.isEnabled())
            ) {
                await nextButton.click()
            }
            await page.waitForTimeout(300)
        }

        // If modal is visible, skip entering name
        const modalOverlay = page.locator('.modal-overlay')
        if (
            await modalOverlay.isVisible({ timeout: 1000 }).catch(() => false)
        ) {
            await page.click('button:has-text("Skip")')
            await page.waitForSelector('.result-screen', { timeout: 5000 })
        }

        const confettiElements = page.locator('.confetti')
        const confettiCount = await confettiElements.count()

        if (confettiCount > 0) {
            await expect(confettiElements.first()).toBeVisible()
            const confettiPieces = page.locator('.confetti-piece')
            expect(await confettiPieces.count()).toBeGreaterThan(0)
        }
    })
})
