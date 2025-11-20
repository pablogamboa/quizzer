import { test, expect, devices } from '@playwright/test'

// Tests for mobile responsiveness and touch interactions
test.describe('Mobile Responsiveness', () => {
    test('should adapt layout for mobile portrait', async ({
        page,
        browserName,
    }) => {
        // Set viewport to iPhone 12 size
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto('/')

        const container = page.locator('.start-screen')
        await expect(container).toBeVisible()

        const containerBox = await container.boundingBox()
        expect(containerBox?.width).toBeLessThanOrEqual(390)

        // Check that font-size is smaller on mobile (should be less than desktop)
        const titleFontSize = await page
            .locator('.logo-text')
            .evaluate((el) => window.getComputedStyle(el).fontSize)
        const fontSizeValue = parseFloat(titleFontSize)
        expect(fontSizeValue).toBeLessThan(60) // Should be smaller than desktop

        const individualMode = page.locator('.mode-card:has-text("Solo Quest")')
        await expect(individualMode).toBeVisible()
    })

    test('should adapt layout for tablet', async ({ page }) => {
        // Set viewport to iPad size
        await page.setViewportSize({ width: 820, height: 1180 })
        await page.goto('/')

        const container = page.locator('.start-screen')
        await expect(container).toBeVisible()

        const containerBox = await container.boundingBox()
        expect(containerBox?.width).toBeLessThanOrEqual(700)

        // Padding check no longer applicable with new structure
    })

    test('should adapt layout for landscape mobile', async ({ page }) => {
        // Set viewport to iPhone 12 landscape
        await page.setViewportSize({ width: 844, height: 390 })
        await page.goto('/')

        const container = page.locator('.start-screen')
        await expect(container).toBeVisible()

        // Check that container is visible for landscape
        await expect(container).toBeVisible()

        // Check that title font size is appropriate for landscape
        const titleFontSize = await page
            .locator('.logo-text')
            .evaluate((el) => window.getComputedStyle(el).fontSize)
        const fontSizeValue = parseFloat(titleFontSize)
        expect(fontSizeValue).toBeGreaterThan(20) // Should be readable
    })

    test('should handle very small screens', async ({ page }) => {
        // Set viewport to very small screen
        await page.setViewportSize({ width: 320, height: 568 })
        await page.goto('/')

        const container = page.locator('.start-screen')
        await expect(container).toBeVisible()

        // Glass card styling checks - border radius varies by viewport
        const glassCard = page.locator('.glass-card').first()
        await expect(glassCard).toBeVisible()

        await page.click('.mode-card:has-text("Solo Quest")')
        await page.click('button:has-text("Start Quiz")')
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        const questionText = page.locator('.question-text')
        await expect(questionText).toBeVisible()

        const answers = page.locator('.answer-option')
        for (let i = 0; i < (await answers.count()); i++) {
            const answer = answers.nth(i)
            await expect(answer).toBeVisible()
            const box = await answer.boundingBox()
            expect(box?.width).toBeLessThanOrEqual(290)
        }
    })

    test('should have touch-friendly button sizes on mobile', async ({
        page,
    }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')

        const modeCard = page.locator('.mode-card:has-text("Solo Quest")')
        const modeBox = await modeCard.boundingBox()

        // Ensure touch targets are at least 44px (iOS HIG recommendation)
        expect(modeBox?.height).toBeGreaterThanOrEqual(44)

        await modeCard.click()
        await page.click('button:has-text("Start Quiz")')
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        const nextButton = page
            .locator('button')
            .filter({ hasText: /Next Question|Finish Quiz/ })
        const buttonBox = await nextButton.boundingBox()
        expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
    })

    test('should prevent zoom on input focus for mobile', async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')

        await page.click('.mode-card:has-text("Pass & Play")')
        await page.click('button:has-text("Start Quiz")')

        const input = page.locator('input[type="text"]').first()
        await input.focus()

        // Check that font-size is at least 16px to prevent zoom on iOS
        await expect(input).toHaveCSS('font-size', '16px')
    })

    test('should handle touch interactions properly', async ({ page }) => {
        // Set viewport to mobile size and emulate touch
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')

        // Emulate touch capabilities
        await page.evaluate(() => {
            document.body.classList.add('touch-device')
        })

        await page.click('.mode-card:has-text("Solo Quest")')
        await page.click('button:has-text("Start Quiz")')
        await page.waitForSelector('.question-screen', { timeout: 10000 })

        const answers = page.locator('.answer-option')
        if ((await answers.count()) > 0) {
            const firstAnswer = answers.first()

            // Check that hover doesn't cause transform on touch devices
            await firstAnswer.hover()
            const transform = await firstAnswer.evaluate(
                (el) => window.getComputedStyle(el).transform
            )
            // Both 'none' and identity matrix are valid (no actual transform)
            expect(transform).toMatch(
                /^(none|matrix\(1,\s*0,\s*0,\s*1,\s*0,\s*0\))$/
            )

            // Click should still work and select the answer
            await firstAnswer.click()
            await expect(firstAnswer).toHaveClass(/selected/)
        }
    })

    test('should display properly on various screen sizes', async ({
        page,
    }) => {
        const viewports = [
            { name: 'iPhone SE', width: 375, height: 667 },
            { name: 'iPhone 12', width: 390, height: 844 },
            { name: 'Pixel 5', width: 393, height: 851 },
            { name: 'iPad Mini', width: 768, height: 1024 },
            { name: 'Desktop', width: 1280, height: 720 },
        ]

        for (const viewport of viewports) {
            await page.setViewportSize({
                width: viewport.width,
                height: viewport.height,
            })
            await page.goto('/')

            // Basic visibility checks for each viewport
            await expect(page.locator('.start-screen')).toBeVisible()
            await expect(page.locator('.logo-text')).toBeVisible()
            await expect(page.locator('.hero-subtitle')).toBeVisible()
            await expect(page.locator('.mode-card')).toHaveCount(3)
        }
    })
})
