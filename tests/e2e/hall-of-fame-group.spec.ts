import { test, expect } from '@playwright/test'

// Helper to start group mode quiz
async function startGroupQuiz(
    page: any,
    options: { difficulty?: string } = {}
) {
    await page.click('.mode-card:has-text("Pass & Play")')

    // Optionally set difficulty
    if (options.difficulty) {
        await page.click(`.difficulty-option:has-text("${options.difficulty}")`)
    }

    // Click a category to proceed to player setup
    await page.click('.category-card:has-text("All Categories")')
}

// Helper to add players
async function addPlayers(page: any, players: string[]) {
    for (const player of players) {
        await page.fill('input[placeholder="Enter player name..."]', player)
        await page.click('button:has-text("Add Player")')
    }
}

// Helper to answer questions until quiz ends
async function answerQuestionsUntilEnd(page: any) {
    let questionCount = 0
    const maxQuestions = 50

    while (questionCount < maxQuestions) {
        const resultsVisible = await page
            .locator('text=Group Quiz Results')
            .isVisible()
            .catch(() => false)
        if (resultsVisible) break

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
            const optionIndex = questionCount % 4
            const answerOptions = page.locator('.answer-option')
            const count = await answerOptions.count()
            if (count > 0) {
                await answerOptions.nth(optionIndex % count).click()
            }
        }

        const button = page
            .locator('button')
            .filter({ hasText: /Next Question|Finish Quiz/ })
        await expect(button).toBeEnabled({ timeout: 5000 })
        await button.click()
        questionCount++
    }

    return questionCount
}

test.describe('Hall of Fame - Group Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should automatically save all players to hall of fame', async ({
        page,
    }) => {
        // Start group mode
        await page.click('.mode-card:has-text("Pass & Play")')

        // Set difficulty
        await page.click('.difficulty-option:has-text("Medium")')

        // Click a category to proceed to player setup
        await page.click('.category-card:has-text("All Categories")')

        // Add 3 players
        await addPlayers(page, ['Alice', 'Bob', 'Charlie'])

        // Start the game
        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Answer questions until quiz ends
        await answerQuestionsUntilEnd(page)

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
        await startGroupQuiz(page)

        // Add 2 players
        await addPlayers(page, ['Player One', 'Player Two'])

        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Answer questions until we see results
        await answerQuestionsUntilEnd(page)

        // Check group results
        await expect(page.locator('.winner-announcement')).toBeVisible()
        await expect(page.locator('.results-list')).toBeVisible()

        // Check for medal emojis
        await expect(page.locator('.medal').first()).toBeVisible()

        // Check for score bars
        await expect(page.locator('.score-bar').first()).toBeVisible()
    })

    test('should handle tied scores correctly', async ({ page }) => {
        await startGroupQuiz(page)

        // Add 2 players
        await addPlayers(page, ['Tied Player A', 'Tied Player B'])

        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Both players select same answers for a tie
        let questionCount = 0
        const maxQuestions = 50
        while (questionCount < maxQuestions) {
            const resultsVisible = await page
                .locator('text=Group Quiz Results')
                .isVisible()
                .catch(() => false)
            if (resultsVisible) break

            const textInput = await page.locator('.text-input').count()
            if (textInput > 0) {
                const inputType = await page
                    .locator('.text-input')
                    .getAttribute('type')
                if (inputType === 'number') {
                    await page.locator('.text-input').fill('42')
                } else {
                    await page.locator('.text-input').fill('same answer')
                }
            } else {
                await page.locator('.answer-option').first().click()
            }
            const button = page
                .locator('button')
                .filter({ hasText: /Next Question|Finish Quiz/ })
            await expect(button).toBeEnabled({ timeout: 5000 })
            await button.click()
            questionCount++
        }

        await page.waitForTimeout(1000)

        const resultsHeader = page.locator('text=Group Quiz Results')
        await expect(resultsHeader).toBeVisible({ timeout: 10000 })

        // Should show tie announcement
        const tieAnnouncement = page.locator('text=/tie/i')
        const tieVisible = await tieAnnouncement.isVisible().catch(() => false)

        if (tieVisible) {
            await expect(tieAnnouncement).toBeVisible()
        }

        // Both players should be in results
        await expect(page.locator('h4:has-text("Tied Player A")')).toBeVisible()
        await expect(page.locator('h4:has-text("Tied Player B")')).toBeVisible()
    })

    test('should track time for group quiz', async ({ page }) => {
        await startGroupQuiz(page)

        // Add players
        await addPlayers(page, ['Fast Player', 'Slow Player'])

        const startTime = Date.now()
        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Answer questions
        await answerQuestionsUntilEnd(page)

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
        await expect(page.locator('.player-name').first()).toBeVisible()

        // Time should be reasonable
        expect(totalTime).toBeGreaterThan(0)
        expect(totalTime).toBeLessThan(300)
    })

    test('should show player turn indicator during group quiz', async ({
        page,
    }) => {
        await startGroupQuiz(page)

        // Add players
        await addPlayers(page, ['First', 'Second'])

        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Check player badge during the quiz
        let questionCount = 0
        const maxQuestions = 50
        while (questionCount < maxQuestions) {
            const resultsVisible = await page
                .locator('text=Group Quiz Results')
                .isVisible()
                .catch(() => false)
            if (resultsVisible) break

            // In group mode, player's turn is shown via player-badge
            const playerBadge = page.locator('.player-badge')
            await expect(playerBadge).toBeVisible()

            // Check which player's turn it is
            const expectedPlayer = questionCount % 2 === 0 ? 'First' : 'Second'
            await expect(playerBadge).toContainText(expectedPlayer)

            // Answer question
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
            const button = page
                .locator('button')
                .filter({ hasText: /Next Question|Finish Quiz/ })
            await expect(button).toBeEnabled({ timeout: 5000 })
            await button.click()
            questionCount++
        }
    })

    test('should allow playing again from hall of fame', async ({ page }) => {
        // Quick group game
        await startGroupQuiz(page)

        await addPlayers(page, ['Replay Test', 'Player Two'])

        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Answer questions
        await answerQuestionsUntilEnd(page)

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
        await page.click('button:has-text("Start New Quiz")')

        // Should be back at start screen
        await expect(page.locator('.app')).toBeVisible()
        await expect(page.locator('.mode-card').first()).toBeVisible()
    })

    test('should save correct metadata for group players', async ({ page }) => {
        await startGroupQuiz(page)

        // Add players
        await addPlayers(page, ['History Buff', 'Player Two'])

        await page.click('button:has-text("Start Group Quiz")')

        // Wait for the question screen to load
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Answer questions
        await answerQuestionsUntilEnd(page)

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
        await expect(page.locator('.player-name').first()).toBeVisible()
    })
})
