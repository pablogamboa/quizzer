import { test, expect } from '@playwright/test'

// Helper to start a solo quiz
async function startSoloQuiz(page: any) {
    await page.click('.mode-card:has-text("Solo Quest")')
    // Click a category to start the quiz
    await page.click('.category-card:has-text("All Categories")')
}

test.describe('Last Question Navigation', () => {
    test('should keep Finish Quiz button enabled after selecting answer on last question', async ({
        page,
    }) => {
        await page.goto('/')
        await startSoloQuiz(page)
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Navigate to the last question
        let currentQuestionNumber = 1
        let totalQuestions = 0

        // Get the total number of questions from the first question counter
        const firstQuestionCounter = await page
            .locator('.progress-label')
            .textContent()
        const match = firstQuestionCounter?.match(/Question\s*1\s*\/\s*(\d+)/)
        if (match) {
            totalQuestions = parseInt(match[1])
        }

        // Navigate through all questions except the last one
        while (currentQuestionNumber < totalQuestions) {
            // Answer current question
            const answers = page.locator('.answer-option')
            const textInput = page.locator('.text-input')

            if ((await answers.count()) > 0) {
                await answers.first().click()
                await expect(answers.first()).toHaveClass(/selected/)
            } else if ((await textInput.count()) > 0) {
                const inputType = await textInput.getAttribute('type')
                if (inputType === 'number') {
                    await textInput.fill('42')
                } else {
                    await textInput.fill('Test answer')
                }
                // Wait for input to be processed
                await page.waitForTimeout(100)
            }

            // Click Next Question
            const nextButton = page.locator('button:has-text("Next Question")')
            await expect(nextButton).toBeEnabled({ timeout: 5000 })
            await nextButton.click()

            currentQuestionNumber++
            await page.waitForTimeout(300)
        }

        // Now we should be on the last question
        const questionCounter = page.locator('.progress-label')
        await expect(questionCounter).toContainText(`${totalQuestions}`)

        // The button should say "Finish Quiz" on the last question
        const finishButton = page.locator('button:has-text("Finish Quiz")')
        await expect(finishButton).toBeVisible()

        // Initially, the button should be disabled (no answer selected)
        await expect(finishButton).toBeDisabled()

        // Select an answer on the last question
        const lastAnswers = page.locator('.answer-option')
        const lastTextInput = page.locator('.text-input')

        if ((await lastAnswers.count()) > 0) {
            await lastAnswers.first().click()
            await expect(lastAnswers.first()).toHaveClass(/selected/)
        } else if ((await lastTextInput.count()) > 0) {
            const inputType = await lastTextInput.getAttribute('type')
            if (inputType === 'number') {
                await lastTextInput.fill('999')
            } else {
                await lastTextInput.fill('Final answer')
            }
        }

        // After selecting an answer, the Finish Quiz button should be enabled
        await expect(finishButton).toBeEnabled()

        // Wait a bit to ensure no state changes occur
        await page.waitForTimeout(1000)

        // The button should STILL be enabled
        await expect(finishButton).toBeEnabled()

        // Click the Finish Quiz button
        await finishButton.click()

        // Handle the name entry modal that appears after quiz completion
        const modal = page.locator('.modal-backdrop')
        if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Skip the name entry
            await page.click('button:has-text("Skip")')
        }

        // Should navigate to the results screen
        await expect(page.locator('.result-screen')).toBeVisible({
            timeout: 10000,
        })
        await expect(page.locator('.result-screen h2')).toContainText('%')
    })

    test('should handle rapid answer changes on last question', async ({
        page,
    }) => {
        await page.goto('/')
        await startSoloQuiz(page)
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Navigate to the last question
        let currentQuestionNumber = 1
        let totalQuestions = 0

        const firstQuestionCounter = await page
            .locator('.progress-label')
            .textContent()
        const match = firstQuestionCounter?.match(/Question\s*1\s*\/\s*(\d+)/)
        if (match) {
            totalQuestions = parseInt(match[1])
        }

        // Navigate through all questions except the last one
        while (currentQuestionNumber < totalQuestions) {
            const answers = page.locator('.answer-option')
            const textInput = page.locator('.text-input')

            if ((await answers.count()) > 0) {
                await answers.first().click()
                await expect(answers.first()).toHaveClass(/selected/)
            } else if ((await textInput.count()) > 0) {
                const inputType = await textInput.getAttribute('type')
                if (inputType === 'number') {
                    await textInput.fill('42')
                } else {
                    await textInput.fill('test answer')
                }
                // Wait for input to be processed
                await page.waitForTimeout(100)
            }

            // Wait for button to be enabled after answering
            const nextButton = page.locator('button:has-text("Next Question")')
            await expect(nextButton).toBeEnabled({ timeout: 5000 })
            await nextButton.click()
            currentQuestionNumber++
            await page.waitForTimeout(200)
        }

        // On the last question
        const finishButton = page.locator('button:has-text("Finish Quiz")')
        await expect(finishButton).toBeVisible()

        const lastAnswers = page.locator('.answer-option')
        if ((await lastAnswers.count()) > 0) {
            // Rapidly change answers
            for (let i = 0; i < Math.min(3, await lastAnswers.count()); i++) {
                await lastAnswers.nth(i).click()
                await expect(finishButton).toBeEnabled()
                await page.waitForTimeout(100)
            }

            // After all the rapid changes, button should still be enabled
            await expect(finishButton).toBeEnabled()
        }
    })

    test('should handle text input on last question correctly', async ({
        page,
    }) => {
        await page.goto('/')
        await page.click('.mode-card:has-text("Solo Quest")')

        // Configure quiz to get fewer questions for faster test using the number selector
        // Use - button to decrease count or find another way
        // Since the UI doesn't have an input field anymore, just start with defaults
        await page.click('.category-card:has-text("All Categories")')

        await page.waitForSelector('.question-screen', { timeout: 10000 })

        // Navigate to the last question
        let currentQuestionNumber = 1
        let totalQuestions = 10 // Default question count

        // Get actual total from the UI
        const firstQuestionCounter = await page
            .locator('.progress-label')
            .textContent()
        const match = firstQuestionCounter?.match(/Question\s*1\s*\/\s*(\d+)/)
        if (match) {
            totalQuestions = parseInt(match[1])
        }

        // Navigate through all questions except the last one
        while (currentQuestionNumber < totalQuestions) {
            // Answer current question
            const answers = page.locator('.answer-option')
            const textInput = page.locator('.text-input')

            if ((await answers.count()) > 0) {
                await answers.first().click()
            } else if ((await textInput.count()) > 0) {
                const inputType = await textInput.getAttribute('type')
                if (inputType === 'number') {
                    await textInput.fill('42')
                } else {
                    await textInput.fill('Test answer')
                }
                // Wait for input to register
                await page.waitForTimeout(200)
            }

            // Click Next Question with proper wait
            const nextButton = page.locator('button:has-text("Next Question")')
            await expect(nextButton).toBeEnabled({ timeout: 5000 })
            await nextButton.click()

            currentQuestionNumber++
            await page.waitForTimeout(300)
        }

        // Now on the last question
        const finishButton = page.locator('button:has-text("Finish Quiz")')
        await expect(finishButton).toBeVisible()

        // Test text input behavior if this is a text question
        const textInput = page.locator('.text-input')
        if ((await textInput.count()) > 0) {
            // Initially disabled
            await expect(finishButton).toBeDisabled()

            // Type some text
            await textInput.fill('Test answer for last question')
            await page.waitForTimeout(200)

            // Should be enabled after typing
            await expect(finishButton).toBeEnabled()

            // Clear the input
            await textInput.clear()
            await page.waitForTimeout(200)

            // Should be disabled again
            await expect(finishButton).toBeDisabled()

            // Type again
            await textInput.fill('Final answer')
            await page.waitForTimeout(200)

            // Should be enabled
            await expect(finishButton).toBeEnabled()
        } else {
            // For multiple choice, select an answer
            const answers = page.locator('.answer-option')
            await answers.first().click()
            await expect(finishButton).toBeEnabled()
        }

        // Submit the quiz
        await finishButton.click()

        // Handle the name entry modal
        const modal = page.locator('.modal-backdrop')
        if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Skip the name entry
            await page.click('button:has-text("Skip")')
        }

        // Should see results
        await expect(page.locator('.result-screen')).toBeVisible({
            timeout: 10000,
        })
    })
})
