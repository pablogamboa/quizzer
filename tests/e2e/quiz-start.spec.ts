import { test, expect } from '@playwright/test'

test.describe('Quiz Start Screen', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should display the quiz title and subtitle', async ({ page }) => {
        await expect(page.locator('.logo-text')).toHaveText('Quizzer')
        await expect(page.locator('.hero-subtitle')).toContainText(
            'Challenge your knowledge'
        )
    })

    test('should display welcome message and available quiz modes', async ({
        page,
    }) => {
        await expect(page.locator('.section-title')).toContainText(
            'Choose Your Game Mode'
        )

        const individualMode = page.locator('.mode-card:has-text("Solo Quest")')
        await expect(individualMode).toBeVisible()
        await expect(individualMode).toContainText(
            'Test your knowledge at your own pace'
        )

        const groupMode = page.locator('.mode-card:has-text("Pass & Play")')
        await expect(groupMode).toBeVisible()
        await expect(groupMode).toContainText('Local multiplayer')
    })

    test('should navigate to quiz when starting solo mode', async ({
        page,
    }) => {
        await page.click('.mode-card:has-text("Solo Quest")')

        // Should show configuration screen
        await expect(page.locator('.config-options')).toBeVisible()
        await expect(page.locator('#question-count')).toBeVisible()

        // Click start quiz button
        await page.click('button:has-text("Start Quiz")')

        // Check for question screen elements
        await expect(page.locator('.question-screen')).toBeVisible({
            timeout: 10000,
        })
        await expect(page.locator('.question-text')).toBeVisible()
    })

    test('should navigate to player setup when starting group mode', async ({
        page,
    }) => {
        await page.click('.mode-card:has-text("Pass & Play")')

        // Should show configuration screen
        await expect(page.locator('.config-options')).toBeVisible()
        await expect(page.locator('#question-count')).toBeVisible()

        // Click start quiz button to go to player setup
        await page.click('button:has-text("Start Quiz")')

        await expect(page.locator('h2')).toContainText('Setup Players')
        await expect(
            page.locator('text=Add players for the group quiz')
        ).toBeVisible()
    })

    test('should handle API errors gracefully', async ({ page, context }) => {
        await context.route('**/api/quiz/**', (route) => {
            route.fulfill({
                status: 500,
                body: JSON.stringify({ error: 'Server error' }),
            })
        })

        await page.click('.mode-card:has-text("Solo Quest")')
        await page.click('button:has-text("Start Quiz")')

        await expect(page.locator('.error-message')).toBeVisible({
            timeout: 10000,
        })
        await expect(page.locator('.error-message')).toContainText(
            'Failed to load questions'
        )
    })
})
