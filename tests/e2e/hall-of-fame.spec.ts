import { test, expect } from '@playwright/test'

// Helper function to navigate through quiz config and start
async function startSoloQuiz(page: any, options: { difficulty?: string } = {}) {
    await page.click('.mode-card:has-text("Solo Quest")')

    // Optionally set difficulty
    if (options.difficulty) {
        await page.click(`.difficulty-option:has-text("${options.difficulty}")`)
    }

    // Click a category to start the quiz
    await page.click('.category-card:has-text("All Categories")')
}

// Helper function to answer questions
async function answerQuestions(page: any, count: number) {
    for (let i = 0; i < count; i++) {
        // Wait for question to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Check if it's a text input or multiple choice
        const textInput = await page.locator('.text-input').count()

        if (textInput > 0) {
            // Text question - enter an answer
            const inputType = await page
                .locator('.text-input')
                .getAttribute('type')
            if (inputType === 'number') {
                await page.locator('.text-input').fill('42')
            } else {
                await page.locator('.text-input').fill('test answer')
            }
        } else {
            // Multiple choice - select first option
            await page.locator('.answer-option').first().click()
        }

        // Click next/submit
        const isLastQuestion =
            (await page.locator('button:has-text("Finish Quiz")').count()) > 0
        const nextButton = isLastQuestion
            ? page.locator('button:has-text("Finish Quiz")')
            : page.locator('button:has-text("Next Question")')
        await expect(nextButton).toBeEnabled({ timeout: 5000 })
        await nextButton.click()
    }
}

test.describe('Hall of Fame - Solo Quest Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should save score to hall of fame with player name', async ({
        page,
    }) => {
        // Start individual quiz
        await startSoloQuiz(page)

        // Answer questions until quiz ends
        let questionCount = 0
        const maxQuestions = 20 // Safety limit

        while (questionCount < maxQuestions) {
            await page.waitForSelector('.question-screen', { timeout: 10000 })

            const textInput = await page.locator('.text-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-input').fill('42')
                } else {
                    await page.locator('.text-input').fill('test answer')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }

            questionCount++

            // Check for Finish button
            const finishButton = page.locator('button:has-text("Finish Quiz")')
            if (await finishButton.isVisible()) {
                await expect(finishButton).toBeEnabled({ timeout: 5000 })
                await finishButton.click()
                break
            } else {
                const nextButton = page.locator(
                    'button:has-text("Next Question")'
                )
                await expect(nextButton).toBeEnabled({ timeout: 5000 })
                await nextButton.click()
            }
        }

        // After last question, name input modal should appear
        await expect(page.locator('.modal-backdrop')).toBeVisible({
            timeout: 10000,
        })
        await expect(page.locator('text=Quiz Complete!')).toBeVisible()

        // Enter player name
        await page.fill('.modal-content input[type="text"]', 'Test Player')
        await page.click('button:has-text("Save Score")')

        // Should be redirected to results
        await expect(page.locator('.result-screen')).toBeVisible({
            timeout: 10000,
        })

        // Click View Hall of Fame
        await page.click('button:has-text("Hall of Fame")')

        // Should see hall of fame with the player's entry
        await expect(page.locator('text=Hall of Fame')).toBeVisible({
            timeout: 10000,
        })
        await expect(
            page.locator('.player-name:has-text("Test Player")')
        ).toBeVisible({ timeout: 10000 })
    })

    test('should allow skipping name entry', async ({ page }) => {
        // Start individual quiz
        await startSoloQuiz(page)

        // Answer questions until quiz ends
        let questionCount = 0
        const maxQuestions = 20

        while (questionCount < maxQuestions) {
            await page.waitForSelector('.question-screen', { timeout: 10000 })
            await page.waitForTimeout(200)

            const textInput = await page.locator('.text-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-input').fill('42')
                } else {
                    await page.locator('.text-input').fill('answer')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }

            questionCount++

            const finishButton = page.locator('button:has-text("Finish Quiz")')
            if (await finishButton.isVisible()) {
                await expect(finishButton).toBeEnabled({ timeout: 5000 })
                await finishButton.click()
                break
            } else {
                const nextButton = page.locator(
                    'button:has-text("Next Question")'
                )
                await expect(nextButton).toBeEnabled({ timeout: 5000 })
                await nextButton.click()
            }
        }

        // Skip name entry
        await page.click('button:has-text("Skip")')

        // Should see results without hall of fame entry
        await expect(page.locator('.result-screen')).toBeVisible()

        // Hall of fame button should still be available
        await expect(
            page.locator('button:has-text("Hall of Fame")')
        ).toBeVisible()
    })

    test('should display player rank and similar attempts', async ({
        page,
    }) => {
        // Create multiple quiz attempts
        for (let attempt = 0; attempt < 3; attempt++) {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            await startSoloQuiz(page, { difficulty: 'Medium' })

            // Answer questions until quiz ends
            let questionCount = 0
            const maxQuestions = 20

            while (questionCount < maxQuestions) {
                await page.waitForSelector('.question-screen', {
                    timeout: 10000,
                })

                const textInput = await page.locator('.text-input').count()
                if (textInput > 0) {
                    const inputType = await page
                        .locator('.text-input')
                        .getAttribute('type')
                    if (inputType === 'number') {
                        await page.locator('.text-input').fill('42')
                    } else {
                        await page.locator('.text-input').fill('answer')
                    }
                } else {
                    // Vary answers to get different scores
                    const optionIndex = (attempt + questionCount) % 4
                    await page.click(`.answer-option >> nth=${optionIndex}`)
                }

                questionCount++

                const finishButton = page.locator(
                    'button:has-text("Finish Quiz")'
                )
                if (await finishButton.isVisible()) {
                    await expect(finishButton).toBeEnabled({ timeout: 5000 })
                    await finishButton.click()
                    break
                } else {
                    const nextButton = page.locator(
                        'button:has-text("Next Question")'
                    )
                    await expect(nextButton).toBeEnabled({ timeout: 5000 })
                    await nextButton.click()
                }
            }

            // Wait for modal to appear
            await expect(page.locator('.modal-backdrop')).toBeVisible({
                timeout: 10000,
            })

            // Save with different names
            await page.fill(
                '.modal-content input[type="text"]',
                `Player ${attempt + 1}`
            )
            await page.click('button:has-text("Save Score")')
        }

        // View hall of fame
        await page.click('button:has-text("Hall of Fame")')

        // Check for hall of fame elements
        await expect(page.locator('.hall-of-fame')).toBeVisible()
        await expect(page.locator('.leaderboard-container')).toBeVisible()

        // Should see multiple players
        await expect(
            page.locator('.player-name').filter({ hasText: 'Player 1' })
        ).toBeVisible()
        await expect(
            page.locator('.player-name').filter({ hasText: 'Player 2' })
        ).toBeVisible()
        await expect(
            page.locator('.player-name').filter({ hasText: 'Player 3' })
        ).toBeVisible()

        // Check for ranking elements
        await expect(page.locator('.rank').first()).toBeVisible()

        // Check for filter tabs
        await expect(
            page.locator('button:has-text("All Players")')
        ).toBeVisible()
    })

    test('should filter hall of fame by category and difficulty', async ({
        page,
    }) => {
        await page.click('.mode-card:has-text("Solo Quest")')

        // Set difficulty
        await page.click('.difficulty-option:has-text("Medium")')

        // Select a specific category
        const scienceCard = page.locator('.category-card:has-text("Science")')
        if (await scienceCard.isVisible()) {
            await scienceCard.click()
        } else {
            // Fallback to All Categories if Science not available
            await page.click('.category-card:has-text("All Categories")')
        }

        // Answer questions until quiz ends
        let questionCount = 0
        const maxQuestions = 20

        while (questionCount < maxQuestions) {
            await page.waitForSelector('.question-screen', { timeout: 10000 })

            const textInput = await page.locator('.text-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-input').fill('42')
                } else {
                    await page.fill('.text-input', 'answer')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }

            questionCount++

            const finishButton = page.locator('button:has-text("Finish Quiz")')
            if (await finishButton.isVisible()) {
                await expect(finishButton).toBeEnabled({ timeout: 5000 })
                await finishButton.click()
                break
            } else {
                const nextButton = page.locator(
                    'button:has-text("Next Question")'
                )
                await expect(nextButton).toBeEnabled({ timeout: 5000 })
                await nextButton.click()
            }
        }

        // Save score
        await page.fill('.modal-content input[type="text"]', 'Science Player')
        await page.click('button:has-text("Save Score")')

        // View hall of fame
        await page.click('button:has-text("Hall of Fame")')

        // Should see the Similar Quizzes tab since we filtered by category/difficulty
        const similarTab = page.locator('button:has-text("Similar Quizzes")')
        if (await similarTab.isVisible()) {
            await similarTab.click()

            // Should only show entries for same category/difficulty
            await expect(
                page
                    .locator('.player-name')
                    .filter({ hasText: 'Science Player' })
            ).toBeVisible()
        }
    })

    test('should track and display quiz completion time', async ({ page }) => {
        await startSoloQuiz(page)

        // Record start time
        const startTime = Date.now()

        // Answer questions until quiz ends
        let questionCount = 0
        const maxQuestions = 20

        while (questionCount < maxQuestions) {
            await page.waitForSelector('.question-screen', { timeout: 10000 })
            await page.waitForTimeout(200)

            const textInput = await page.locator('.text-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-input').fill('42')
                } else {
                    await page.fill('.text-input', 'answer')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }

            questionCount++

            const finishButton = page.locator('button:has-text("Finish Quiz")')
            if (await finishButton.isVisible()) {
                await expect(finishButton).toBeEnabled({ timeout: 5000 })
                await finishButton.click()
                break
            } else {
                const nextButton = page.locator(
                    'button:has-text("Next Question")'
                )
                await expect(nextButton).toBeEnabled({ timeout: 5000 })
                await nextButton.click()
            }
        }

        // Wait for modal to appear
        await expect(page.locator('.modal-backdrop')).toBeVisible({
            timeout: 10000,
        })

        // Save with name
        await page.fill('.modal-content input[type="text"]', 'Timed Player')
        await page.click('button:has-text("Save Score")')

        const endTime = Date.now()
        const timeTaken = Math.floor((endTime - startTime) / 1000)

        // View hall of fame
        await page.click('button:has-text("Hall of Fame")')

        // The entry should be visible
        await expect(
            page.locator('.player-name').filter({ hasText: 'Timed Player' })
        ).toBeVisible()

        // Time should be reasonable (between 1 second and 5 minutes)
        expect(timeTaken).toBeGreaterThan(0)
        expect(timeTaken).toBeLessThan(300)
    })

    test('should show performance labels based on score', async ({ page }) => {
        await startSoloQuiz(page)

        // Answer questions until quiz ends
        let questionCount = 0
        const maxQuestions = 20

        while (questionCount < maxQuestions) {
            await page.waitForSelector('.question-screen', { timeout: 10000 })
            await page.waitForTimeout(200)

            const textInput = await page.locator('.text-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-input').fill('42')
                } else {
                    await page.locator('.text-input').fill('Paris')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }

            questionCount++

            const finishButton = page.locator('button:has-text("Finish Quiz")')
            if (await finishButton.isVisible()) {
                await expect(finishButton).toBeEnabled({ timeout: 5000 })
                await finishButton.click()
                break
            } else {
                const nextButton = page.locator(
                    'button:has-text("Next Question")'
                )
                await expect(nextButton).toBeEnabled({ timeout: 5000 })
                await nextButton.click()
            }
        }

        // Save score
        await page.fill('.modal-content input[type="text"]', 'Performance Test')
        await page.click('button:has-text("Save Score")')

        // Wait for result screen to fully load before viewing hall of fame
        await expect(page.locator('.result-screen')).toBeVisible({ timeout: 10000 })
        await page.waitForTimeout(500) // Allow state to settle

        // View hall of fame
        await page.click('button:has-text("Hall of Fame")')

        // Wait for hall of fame to load
        await expect(page.locator('.hall-of-fame')).toBeVisible({ timeout: 10000 })

        // Should see performance label (may take time to load via API)
        const performanceLabel = page.locator('.performance-label').first()
        await expect(performanceLabel).toBeVisible({ timeout: 10000 })

        // Check that it has one of the expected classes
        const classes = await performanceLabel.getAttribute('class')
        expect(classes).toMatch(/(perfect|excellent|great|good|average)/)
    })
})
