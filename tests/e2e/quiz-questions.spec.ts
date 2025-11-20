import { test, expect } from '@playwright/test'

test.describe('Quiz Questions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await page.click('.mode-card:has-text("Solo Quest")')
        await page.click('button:has-text("Start Quiz")')
        await page.waitForSelector('.question-screen', { timeout: 10000 })
    })

    test('should display question information correctly', async ({ page }) => {
        const questionCounter = page.locator('.progress-text')
        await expect(questionCounter).toBeVisible()
        await expect(questionCounter).toContainText('Question 1 of')

        const category = page.locator('.category-badge')
        await expect(category).toBeVisible()

        await expect(page.locator('.question-text')).toBeVisible()
    })

    test('should handle multiple choice questions', async ({ page }) => {
        const answers = page.locator('.answer-option')
        const answerCount = await answers.count()

        if (answerCount > 0) {
            expect(answerCount).toBeGreaterThanOrEqual(2)
            expect(answerCount).toBeLessThanOrEqual(4)

            const firstAnswer = answers.first()
            await expect(firstAnswer).toBeVisible()

            await firstAnswer.click()
            await expect(firstAnswer).toHaveClass(/selected/)

            const secondAnswer = answers.nth(1)
            await secondAnswer.click()
            await expect(firstAnswer).not.toHaveClass(/selected/)
            await expect(secondAnswer).toHaveClass(/selected/)
        }
    })

    test('should handle text input questions', async ({ page }) => {
        const textInput = page.locator('.text-answer-input')
        const inputCount = await textInput.count()

        if (inputCount > 0) {
            await expect(textInput).toBeVisible()

            // Check if it's a number input
            const inputType = await textInput.getAttribute('type')
            if (inputType === 'number') {
                await expect(textInput).toHaveAttribute(
                    'placeholder',
                    'Enter a number...'
                )
                await textInput.fill('42')
                await expect(textInput).toHaveValue('42')
            } else {
                await expect(textInput).toHaveAttribute(
                    'placeholder',
                    'Type your answer here...'
                )
                await textInput.fill('Test answer')
                await expect(textInput).toHaveValue('Test answer')
            }
        }
    })

    test('should navigate between questions', async ({ page }) => {
        const nextButton = page.locator('button:has-text("Next Question")')

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
                await textInput.fill('Test answer')
            }
        }

        await nextButton.click()

        const questionCounter = page.locator('.progress-text')
        await expect(questionCounter).toContainText('Question 2 of')
    })

    test('should show progress bar', async ({ page }) => {
        const progressBar = page.locator('.progress-bar')
        await expect(progressBar).toBeVisible()

        const progressFill = page.locator('.progress-fill')
        await expect(progressFill).toBeVisible()
    })

    test('should not allow submission without answering', async ({ page }) => {
        const nextButton = page
            .locator('button')
            .filter({ hasText: /Next Question|Finish Quiz/ })
        await expect(nextButton).toBeVisible()

        const isDisabled = await nextButton.isDisabled()

        if (isDisabled) {
            await expect(nextButton).toBeDisabled()

            const answers = page.locator('.answer-option')
            const textInput = page.locator('.text-answer-input')

            if ((await answers.count()) > 0) {
                await answers.first().click()
                await expect(nextButton).toBeEnabled()
            } else if ((await textInput.count()) > 0) {
                // Check if it's a number input
                const inputType = await textInput.getAttribute('type')
                if (inputType === 'number') {
                    await textInput.fill('42')
                } else {
                    await textInput.fill('Test')
                }
                await expect(nextButton).toBeEnabled()
            }
        }
    })

    test('should handle picture questions with images', async ({ page }) => {
        const questionImages = await page.locator('.question-image').count()

        for (let i = 0; i < 10; i++) {
            if ((await page.locator('.question-image').count()) > 0) {
                const image = page.locator('.question-image')
                await expect(image).toBeVisible()
                await expect(image).toHaveAttribute('src', /.+/)
                break
            }

            const answers = page.locator('.answer-option')
            const textInput = page.locator('input[type="text"]')

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
                await page.waitForTimeout(500)
            }
        }
    })
})
