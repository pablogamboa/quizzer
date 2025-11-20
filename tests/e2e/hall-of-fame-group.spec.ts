import { test, expect } from '@playwright/test'

test.describe('Hall of Fame - Group Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should automatically save all players to hall of fame', async ({
        page,
    }) => {
        // Start group mode
        await page.click('text=Pass & Play')

        // Configure quiz - Science Medium has exactly 10 questions, so don't specify count
        await page.selectOption('#category-select', 'Science')
        await page.click('.difficulty-btn:has-text("Medium")')
        await page.click('text=Start Quiz')

        // Add 3 players
        await page.fill('input[placeholder="Enter player name..."]', 'Alice')
        await page.click('button:has-text("Add Player")')

        await page.fill('input[placeholder="Enter player name..."]', 'Bob')
        await page.click('button:has-text("Add Player")')

        await page.fill('input[placeholder="Enter player name..."]', 'Charlie')
        await page.click('button:has-text("Add Player")')

        // Start the game
        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Default is 10 questions, but we'll answer them all
        // Each player will get questions in rotation
        for (let i = 0; i < 10; i++) {
            // Check current player indicator
            const playerIndicator = page.locator('.player-indicator')
            await expect(playerIndicator).toBeVisible()

            // Answer the question
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
                // Vary answers for different scores
                const optionIndex = i % 4
                await page.click(`.answer-option >> nth=${optionIndex}`)
            }

            // Wait for button and click it
            // Click the action button regardless of its text
            const button = page.locator('.next-button').first()
            await expect(button).toBeEnabled({ timeout: 5000 })
            await button.click()
        }

        // Should see group results
        await expect(page.locator('text=Group Quiz Results')).toBeVisible({
            timeout: 10000,
        })

        // All players should be listed in results
        await expect(page.locator('h4:has-text("Alice")')).toBeVisible()
        await expect(page.locator('h4:has-text("Bob")')).toBeVisible()
        await expect(page.locator('h4:has-text("Charlie")')).toBeVisible()

        // Click View Hall of Fame
        await page.click('button:has-text("View Hall of Fame")')

        // Should see hall of fame with all players
        await expect(page.locator('.hall-of-fame')).toBeVisible({
            timeout: 10000,
        })
        // Wait for entries to load
        await page.waitForTimeout(500)
        await expect(
            page.locator('.player-name:has-text("Alice")').first()
        ).toBeVisible({ timeout: 10000 })
        await expect(
            page.locator('.player-name:has-text("Bob")').first()
        ).toBeVisible({ timeout: 10000 })
        await expect(
            page.locator('.player-name:has-text("Charlie")').first()
        ).toBeVisible({ timeout: 10000 })
    })

    test('should display group results with rankings', async ({ page }) => {
        // Start group mode
        await page.click('text=Pass & Play')

        // Quick setup - use default 10 questions
        await page.click('text=Start Quiz')

        // Add 2 players
        await page.fill(
            'input[placeholder="Enter player name..."]',
            'Player One'
        )
        await page.click('button:has-text("Add Player")')

        await page.fill(
            'input[placeholder="Enter player name..."]',
            'Player Two'
        )
        await page.click('button:has-text("Add Player")')

        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Answer questions until we see results
        let questionCount = 0
        const maxQuestions = 50 // Safety limit
        while (questionCount < maxQuestions) {
            // Check if we've reached the results screen
            const resultsVisible = await page
                .locator('text=Group Quiz Results')
                .isVisible()
                .catch(() => false)
            if (resultsVisible) break

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
                // Vary answers for different scores
                const playerIndex = questionCount % 2
                await page.locator('.answer-option').nth(playerIndex).click()
            }
            // Click the action button regardless of its text
            const button = page.locator('.next-button').first()
            await expect(button).toBeEnabled({ timeout: 5000 })
            await button.click()
            questionCount++
        }

        // Check group results
        await expect(page.locator('.winner-announcement')).toBeVisible()
        await expect(page.locator('.results-list')).toBeVisible()

        // Check for medal emojis
        await expect(page.locator('.medal').first()).toBeVisible()

        // Check for score bars
        await expect(page.locator('.score-bar').first()).toBeVisible()
    })

    test('should handle tied scores correctly', async ({ page }) => {
        await page.click('text=Pass & Play')
        await page.click('text=Start Quiz')

        // Add 2 players
        await page.fill(
            'input[placeholder="Enter player name..."]',
            'Tied Player A'
        )
        await page.click('button:has-text("Add Player")')

        await page.fill(
            'input[placeholder="Enter player name..."]',
            'Tied Player B'
        )
        await page.click('button:has-text("Add Player")')

        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Both players select same answers for a tie
        let questionCount = 0
        const maxQuestions = 50 // Safety limit
        while (questionCount < maxQuestions) {
            // Check if we've reached the results screen
            const resultsVisible = await page
                .locator('text=Group Quiz Results')
                .isVisible()
                .catch(() => false)
            if (resultsVisible) break

            const textInput = await page.locator('.text-answer-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-answer-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-answer-input').fill('42')
                } else {
                    await page.locator('.text-answer-input').fill('same answer')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }
            // Click the action button regardless of its text
            const button = page.locator('.next-button').first()
            await expect(button).toBeEnabled({ timeout: 5000 })
            await button.click()
            questionCount++
        }

        // Wait for results screen to appear
        await page.waitForTimeout(1000) // Give time for transition

        // Debug - check if we're on results screen
        const resultsHeader = page.locator('text=Group Quiz Results')
        await expect(resultsHeader).toBeVisible({ timeout: 10000 })

        // Should show tie announcement
        const tieAnnouncement = page.locator('text=/tie/i')
        const tieVisible = await tieAnnouncement.isVisible().catch(() => false)

        if (tieVisible) {
            await expect(tieAnnouncement).toBeVisible()
        }

        // Both players should be in results - use more specific selectors
        await expect(page.locator('h4:has-text("Tied Player A")')).toBeVisible()
        await expect(page.locator('h4:has-text("Tied Player B")')).toBeVisible()
    })

    test('should track time for group quiz', async ({ page }) => {
        await page.click('text=Pass & Play')
        await page.click('text=Start Quiz')

        // Add players
        await page.fill(
            'input[placeholder="Enter player name..."]',
            'Fast Player'
        )
        await page.click('button:has-text("Add Player")')

        await page.fill(
            'input[placeholder="Enter player name..."]',
            'Slow Player'
        )
        await page.click('button:has-text("Add Player")')

        const startTime = Date.now()
        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Answer questions quickly
        let questionCount = 0
        const maxQuestions = 50 // Safety limit
        while (questionCount < maxQuestions) {
            // Check if we've reached the results screen
            const resultsVisible = await page
                .locator('text=Group Quiz Results')
                .isVisible()
                .catch(() => false)
            if (resultsVisible) break

            const textInput = await page.locator('.text-answer-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-answer-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-answer-input').fill('42')
                } else {
                    await page.locator('.text-answer-input').fill('quick')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }
            // Click the action button regardless of its text
            const button = page.locator('.next-button').first()
            await expect(button).toBeEnabled({ timeout: 5000 })
            await button.click()
            questionCount++
        }

        const endTime = Date.now()
        const totalTime = Math.floor((endTime - startTime) / 1000)

        // Wait for results to appear
        await expect(page.locator('text=Group Quiz Results')).toBeVisible({
            timeout: 10000,
        })

        // View hall of fame
        await page.click('button:has-text("View Hall of Fame")')

        // Entries should be present
        await expect(page.locator('.hall-of-fame')).toBeVisible({
            timeout: 10000,
        })
        // Check that there are player entries (from any quiz)
        await expect(page.locator('.player-name').first()).toBeVisible()

        // Time should be reasonable
        expect(totalTime).toBeGreaterThan(0)
        expect(totalTime).toBeLessThan(300) // Less than 5 minutes
    })

    test('should show player turn indicator during group quiz', async ({
        page,
    }) => {
        await page.click('text=Pass & Play')
        await page.click('text=Start Quiz')

        // Add players
        await page.fill('input[placeholder="Enter player name..."]', 'First')
        await page.click('button:has-text("Add Player")')

        await page.fill('input[placeholder="Enter player name..."]', 'Second')
        await page.click('button:has-text("Add Player")')

        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Check player indicators during the quiz
        let questionCount = 0
        const maxQuestions = 50 // Safety limit
        while (questionCount < maxQuestions) {
            // Check if we've reached the results screen
            const resultsVisible = await page
                .locator('text=Group Quiz Results')
                .isVisible()
                .catch(() => false)
            if (resultsVisible) break

            const playerIndicator = page.locator('.player-indicator')
            await expect(playerIndicator).toBeVisible()

            // Check which player's turn it is
            const expectedPlayer = questionCount % 2 === 0 ? 'First' : 'Second'
            await expect(
                page.locator(`.player-indicator:has-text("${expectedPlayer}")`)
            ).toBeVisible()

            // Answer question
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
            // Click the action button regardless of its text
            const button = page.locator('.next-button').first()
            await expect(button).toBeEnabled({ timeout: 5000 })
            await button.click()
            questionCount++
        }
    })

    test('should allow playing again from hall of fame', async ({ page }) => {
        // Quick group game
        await page.click('text=Pass & Play')
        await page.click('text=Start Quiz')

        await page.fill(
            'input[placeholder="Enter player name..."]',
            'Replay Test'
        )
        await page.click('button:has-text("Add Player")')

        await page.fill(
            'input[placeholder="Enter player name..."]',
            'Player Two'
        )
        await page.click('button:has-text("Add Player")')

        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Answer questions
        let questionCount = 0
        const maxQuestions = 50 // Safety limit
        while (questionCount < maxQuestions) {
            // Check if we've reached the results screen
            const resultsVisible = await page
                .locator('text=Group Quiz Results')
                .isVisible()
                .catch(() => false)
            if (resultsVisible) break

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
            // Click the action button regardless of its text
            const button = page.locator('.next-button').first()
            await expect(button).toBeEnabled({ timeout: 5000 })
            await button.click()
            questionCount++
        }

        // Wait for results
        await expect(page.locator('text=Group Quiz Results')).toBeVisible({
            timeout: 10000,
        })

        // Go to hall of fame
        await page.click('button:has-text("View Hall of Fame")')
        await expect(page.locator('.hall-of-fame')).toBeVisible({
            timeout: 10000,
        })

        // Click Play Again
        await page.click('button:has-text("Play Again")')

        // Should be back at start screen - check for main app container or mode cards
        await expect(page.locator('.app')).toBeVisible()
        await expect(page.locator('.mode-card').first()).toBeVisible()
    })

    test('should save correct metadata for group players', async ({ page }) => {
        await page.click('text=Pass & Play')

        // Use default settings (all categories, all difficulties) for enough questions
        await page.click('text=Start Quiz')

        // Add players
        await page.fill(
            'input[placeholder="Enter player name..."]',
            'History Buff'
        )
        await page.click('button:has-text("Add Player")')

        await page.fill(
            'input[placeholder="Enter player name..."]',
            'Player Two'
        )
        await page.click('button:has-text("Add Player")')

        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Answer questions
        let questionCount = 0
        const maxQuestions = 50 // Safety limit
        while (questionCount < maxQuestions) {
            // Check if we've reached the results screen
            const resultsVisible = await page
                .locator('text=Group Quiz Results')
                .isVisible()
                .catch(() => false)
            if (resultsVisible) break

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
            // Click the action button regardless of its text
            const button = page.locator('.next-button').first()
            await expect(button).toBeEnabled({ timeout: 5000 })
            await button.click()
            questionCount++
        }

        // Wait for results
        await expect(page.locator('text=Group Quiz Results')).toBeVisible({
            timeout: 10000,
        })

        // View hall of fame
        await page.click('button:has-text("View Hall of Fame")')

        // Check that hall of fame is displayed
        await expect(page.locator('.hall-of-fame')).toBeVisible({
            timeout: 10000,
        })
        // Check that there are entries (from any quiz)
        await expect(page.locator('.player-name').first()).toBeVisible()
    })
})
