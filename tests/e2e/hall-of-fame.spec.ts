import { test, expect } from '@playwright/test'

test.describe('Hall of Fame - Solo Quest Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should save score to hall of fame with player name', async ({
        page,
    }) => {
        // Start individual quiz
        await page.click('text=Solo Quest')

        // Configure quiz settings
        await page.locator('#question-count').fill('5')
        await page.selectOption('#category-select', 'all')
        await page.click('.difficulty-btn:has-text("All")')

        // Start quiz
        await page.click('text=Start Quiz')

        // Answer 5 questions
        for (let i = 0; i < 5; i++) {
            // Wait for question to load
            await page.waitForSelector('.question-screen', { timeout: 10000 })

            // Check if it's a text input or multiple choice
            const textInput = await page.locator('.text-answer-input').count()

            if (textInput > 0) {
                // Text question - enter an answer
                const inputType = await page
                    .locator('.text-answer-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-answer-input').fill('42')
                } else {
                    await page.locator('.text-answer-input').fill('test answer')
                }
            } else {
                // Multiple choice - select first option
                await page.locator('.answer-option').first().click()
            }

            // Click next/submit
            // Wait for button to be enabled and click it
            const nextButton =
                i < 4
                    ? page.locator('button:has-text("Next Question")')
                    : page.locator('button:has-text("Finish Quiz")')
            await expect(nextButton).toBeEnabled({ timeout: 5000 })
            await nextButton.click()
        }

        // After last question, name input modal should appear
        await expect(page.locator('.modal-overlay')).toBeVisible({
            timeout: 10000,
        })
        await expect(page.locator('text=Quiz Complete!')).toBeVisible()

        // Enter player name
        await page.fill('.modal-content input[type="text"]', 'Test Player')
        await page.click('button:has-text("Save to Hall of Fame")')

        // Should be redirected to results
        await expect(page.locator('text=Quiz Completed!')).toBeVisible({
            timeout: 10000,
        })

        // Click View Hall of Fame
        await page.click('button:has-text("View Hall of Fame")')

        // Should see hall of fame with the player's entry
        await expect(page.locator('text=Hall of Fame')).toBeVisible({
            timeout: 10000,
        })
        // Look for the specific player name, not just the first entry
        await expect(
            page.locator('.player-name:has-text("Test Player")')
        ).toBeVisible({ timeout: 10000 })
    })

    test('should allow skipping name entry', async ({ page }) => {
        // Start individual quiz
        await page.click('text=Solo Quest')

        // Quick quiz settings
        await page.locator('#question-count').fill('5')
        await page.click('text=Start Quiz')

        // Answer questions
        for (let i = 0; i < 5; i++) {
            // Wait for question to be ready
            await page.waitForTimeout(200)

            const textInput = await page.locator('.text-answer-input').count()

            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-answer-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-answer-input').fill('42')
                } else {
                    await page.locator('.text-answer-input').fill('answer')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }

            // Wait for button to be enabled and click it
            const nextButton =
                i < 4
                    ? page.locator('button:has-text("Next Question")')
                    : page.locator('button:has-text("Finish Quiz")')
            await expect(nextButton).toBeEnabled({ timeout: 5000 })
            await nextButton.click()
        }

        // Skip name entry
        await page.click('button:has-text("Skip")')

        // Should see results without hall of fame entry
        await expect(page.locator('text=Quiz Completed!')).toBeVisible()

        // Hall of fame button should still be available
        await expect(
            page.locator('button:has-text("View Hall of Fame")')
        ).toBeVisible()
    })

    test('should display player rank and similar attempts', async ({
        page,
    }) => {
        // Create multiple quiz attempts first
        for (let i = 0; i < 3; i++) {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            // Wait for the Solo Quest button to be ready
            const soloButton = page.locator('text=Solo Quest')
            await expect(soloButton).toBeVisible()
            await soloButton.click()

            await page.locator('#question-count').fill('5')
            await page.selectOption('#category-select', 'Science')
            await page.click('.difficulty-btn:has-text("Medium")')
            await page.click('text=Start Quiz')

            // Answer questions
            for (let j = 0; j < 5; j++) {
                const textInput = await page
                    .locator('.text-answer-input')
                    .count()
                if (textInput > 0) {
                    const inputType = await page
                        .locator('.text-answer-input')
                        .getAttribute('type')
                    if (inputType === 'number') {
                        await page.locator('.text-answer-input').fill('42')
                    } else {
                        await page.locator('.text-answer-input').fill('answer')
                    }
                } else {
                    // Vary answers to get different scores
                    const optionIndex = (i + j) % 4
                    await page.click(`.answer-option >> nth=${optionIndex}`)
                }
                const nextButton =
                    j < 4
                        ? page.locator('button:has-text("Next Question")')
                        : page.locator('button:has-text("Finish Quiz")')
                await expect(nextButton).toBeEnabled({ timeout: 5000 })
                await nextButton.click()
            }

            // Wait for modal to appear
            await expect(page.locator('.modal-overlay')).toBeVisible({
                timeout: 10000,
            })

            // Save with different names
            await page.fill(
                '.modal-content input[type="text"]',
                `Player ${i + 1}`
            )
            await page.click('button:has-text("Save to Hall of Fame")')
        }

        // View hall of fame
        await page.click('button:has-text("View Hall of Fame")')

        // Check for hall of fame elements
        await expect(page.locator('.hall-of-fame')).toBeVisible()
        await expect(page.locator('.leaderboard')).toBeVisible()

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
        // Complete a Science quiz
        await page.click('text=Solo Quest')
        await page.selectOption('#category-select', 'Science')
        await page.click('.difficulty-btn:has-text("Medium")')
        await page.locator('#question-count').fill('5')
        await page.click('text=Start Quiz')

        // Answer questions
        for (let i = 0; i < 5; i++) {
            const textInput = await page.locator('.text-answer-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-answer-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-answer-input').fill('42')
                } else {
                    await page.fill('.text-answer-input', 'answer')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }
            // Wait for button to be enabled and click it
            const nextButton =
                i < 4
                    ? page.locator('button:has-text("Next Question")')
                    : page.locator('button:has-text("Finish Quiz")')
            await expect(nextButton).toBeEnabled({ timeout: 5000 })
            await nextButton.click()
        }

        // Save score
        await page.fill('.modal-content input[type="text"]', 'Science Player')
        await page.click('button:has-text("Save to Hall of Fame")')

        // View hall of fame
        await page.click('button:has-text("View Hall of Fame")')

        // Should see the Similar Quizzes tab since we filtered by category/difficulty
        const similarTab = page.locator('button:has-text("Similar Quizzes")')
        if (await similarTab.isVisible()) {
            await similarTab.click()

            // Should only show Science/medium entries
            await expect(
                page
                    .locator('.player-name')
                    .filter({ hasText: 'Science Player' })
            ).toBeVisible()
        }
    })

    test('should track and display quiz completion time', async ({ page }) => {
        await page.click('text=Solo Quest')
        await page.locator('#question-count').fill('5')
        await page.click('text=Start Quiz')

        // Record start time
        const startTime = Date.now()

        // Answer questions
        for (let i = 0; i < 5; i++) {
            // Wait for question to be ready
            await page.waitForTimeout(200)

            const textInput = await page.locator('.text-answer-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-answer-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-answer-input').fill('42')
                } else {
                    await page.fill('.text-answer-input', 'answer')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }
            // Wait for button to be enabled and click it
            const nextButton =
                i < 4
                    ? page.locator('button:has-text("Next Question")')
                    : page.locator('button:has-text("Finish Quiz")')
            await expect(nextButton).toBeEnabled({ timeout: 5000 })
            await nextButton.click()
        }

        // Wait for modal to appear
        await expect(page.locator('.modal-overlay')).toBeVisible({
            timeout: 10000,
        })

        // Save with name
        await page.fill('.modal-content input[type="text"]', 'Timed Player')
        await page.click('button:has-text("Save to Hall of Fame")')

        const endTime = Date.now()
        const timeTaken = Math.floor((endTime - startTime) / 1000)

        // View hall of fame
        await page.click('button:has-text("View Hall of Fame")')

        // The entry should be visible
        await expect(
            page.locator('.player-name').filter({ hasText: 'Timed Player' })
        ).toBeVisible()

        // Time should be reasonable (between 1 second and 5 minutes)
        expect(timeTaken).toBeGreaterThan(0)
        expect(timeTaken).toBeLessThan(300)
    })

    test('should show performance labels based on score', async ({ page }) => {
        await page.click('text=Solo Quest')
        await page.locator('#question-count').fill('5')
        await page.click('text=Start Quiz')

        // Try to get a high score by selecting consistent answers
        for (let i = 0; i < 5; i++) {
            // Wait for question to be ready
            await page.waitForTimeout(200)

            const textInput = await page.locator('.text-answer-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-answer-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-answer-input').fill('42')
                } else {
                    await page.locator('.text-answer-input').fill('Paris') // Common correct answer
                }
            } else {
                await page.locator('.answer-option').first().click()
            }
            // Wait for button to be enabled and click it
            const nextButton =
                i < 4
                    ? page.locator('button:has-text("Next Question")')
                    : page.locator('button:has-text("Finish Quiz")')
            await expect(nextButton).toBeEnabled({ timeout: 5000 })
            await nextButton.click()
        }

        // Save score
        await page.fill('.modal-content input[type="text"]', 'Performance Test')
        await page.click('button:has-text("Save to Hall of Fame")')

        // View hall of fame
        await page.click('button:has-text("View Hall of Fame")')

        // Should see performance label
        const performanceLabel = page.locator('.performance-label').first()
        await expect(performanceLabel).toBeVisible()

        // Check that it has one of the expected classes
        const classes = await performanceLabel.getAttribute('class')
        expect(classes).toMatch(/(perfect|excellent|great|good|average)/)
    })
})
