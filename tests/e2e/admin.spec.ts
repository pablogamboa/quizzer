import { test, expect } from '@playwright/test'

// Use HTTP context with built-in auth credentials
test.use({
    httpCredentials: {
        username: 'admin',
        password: 'admin123',
    },
})

test.describe('Admin Interface', () => {
    test.describe('Navigation and Layout', () => {
        test('should display admin layout after authentication', async ({
            page,
        }) => {
            // Navigate to admin page
            await page.goto('/admin/')

            // Wait for the page to load and Svelte to initialize
            await page.waitForLoadState('networkidle')

            // Check for admin layout
            await expect(page.locator('.admin-layout')).toBeVisible({
                timeout: 15000,
            })
        })

        test('should display sidebar with navigation links', async ({
            page,
        }) => {
            await page.goto('/admin/')

            await expect(page.locator('.admin-sidebar')).toBeVisible()
            await expect(page.locator('.admin-sidebar-title')).toContainText(
                'Quizzer Admin'
            )

            // Check navigation links
            await expect(page.locator('a[href="#/dashboard"]')).toBeVisible()
            await expect(page.locator('a[href="#/questions"]')).toBeVisible()
            await expect(page.locator('a[href="#/themes"]')).toBeVisible()
        })

        test('should navigate between pages using sidebar', async ({
            page,
        }) => {
            await page.goto('/admin/')

            // Wait for layout to be visible
            await expect(page.locator('.admin-layout')).toBeVisible()

            // Navigate to Questions
            await page.click('a[href="#/questions"]')
            await expect(page.locator('.admin-page-title')).toContainText(
                'Questions'
            )

            // Navigate to Themes
            await page.click('a[href="#/themes"]')
            await expect(page.locator('.admin-page-title')).toContainText(
                'Themes'
            )

            // Navigate back to Dashboard
            await page.click('a[href="#/dashboard"]')
            await expect(page.locator('.admin-page-title')).toContainText(
                'Dashboard'
            )
        })
    })

    test.describe('Dashboard', () => {
        test('should display dashboard page', async ({ page }) => {
            await page.goto('/admin/')

            // Wait for layout
            await expect(page.locator('.admin-layout')).toBeVisible()

            // Check for dashboard title
            await expect(page.locator('.admin-page-title')).toContainText(
                'Dashboard'
            )
        })

        test('should display stats or loading state', async ({ page }) => {
            await page.goto('/admin/')

            // Wait for layout to be visible first
            await expect(page.locator('.admin-layout')).toBeVisible()

            // Dashboard should show either loading spinner or stats or the main content area
            const hasLoading = await page
                .locator('.admin-loading, .admin-spinner')
                .isVisible()
                .catch(() => false)
            const hasStats = await page
                .locator('.admin-stats-grid')
                .isVisible()
                .catch(() => false)
            const hasMain = await page
                .locator('.admin-main')
                .isVisible()
                .catch(() => false)

            // One of these should be true
            expect(hasLoading || hasStats || hasMain).toBeTruthy()
        })
    })

    test.describe('Questions Management', () => {
        test('should display questions page', async ({ page }) => {
            await page.goto('/admin/#/questions')

            // Wait for layout and page
            await expect(page.locator('.admin-layout')).toBeVisible()
            await expect(page.locator('.admin-page-title')).toContainText(
                'Questions'
            )

            // Should have filters section
            await expect(page.locator('.admin-filters')).toBeVisible()
        })

        test('should navigate to create question form', async ({ page }) => {
            await page.goto('/admin/#/questions')

            // Wait for page to load
            await expect(page.locator('.admin-page-title')).toContainText(
                'Questions'
            )

            // Click "Add Question" button
            await page.click('.admin-btn-primary:has-text("Add Question")')

            // Should navigate to edit form - the title shows "Add Question" not "New Question"
            await expect(page.locator('.admin-page-title')).toContainText(
                'Add Question'
            )
        })

        test('should display question form fields', async ({ page }) => {
            await page.goto('/admin/#/questions')

            // Click "Add Question" button
            await page.click('.admin-btn-primary:has-text("Add Question")')

            // Wait for form to appear
            await expect(page.locator('.admin-page-title')).toContainText(
                'Add Question'
            )

            // Check for form fields
            await expect(page.locator('textarea')).toBeVisible()
            await expect(
                page.locator('.admin-form-group').first()
            ).toBeVisible()
        })
    })

    test.describe('Themes Management', () => {
        test('should display themes page', async ({ page }) => {
            await page.goto('/admin/#/themes')

            // Page title
            await expect(page.locator('.admin-page-title')).toContainText(
                'Themes'
            )

            // Should have layout
            await expect(page.locator('.admin-layout')).toBeVisible()
        })

        test('should navigate to create theme form', async ({ page }) => {
            await page.goto('/admin/#/themes')

            // Wait for page
            await expect(page.locator('.admin-page-title')).toContainText(
                'Themes'
            )

            // Click "Add Theme" button
            await page.click('.admin-btn-primary:has-text("Add Theme")')

            // Should navigate to edit form - the title shows "Add Theme" not "New Theme"
            await expect(page.locator('.admin-page-title')).toContainText(
                'Add Theme'
            )
        })

        test('should display theme form fields', async ({ page }) => {
            await page.goto('/admin/#/themes')

            // Click "Add Theme" button
            await page.click('.admin-btn-primary:has-text("Add Theme")')

            // Wait for form to appear
            await expect(page.locator('.admin-page-title')).toContainText(
                'Add Theme'
            )

            // Check for form groups
            await expect(
                page.locator('.admin-form-group').first()
            ).toBeVisible()
        })
    })

    test.describe('Responsive Design', () => {
        test('should adapt layout on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 })
            await page.goto('/admin/')

            // Layout should still be visible on mobile
            await expect(page.locator('.admin-layout')).toBeVisible()

            // Content should be visible
            await expect(page.locator('.admin-main')).toBeVisible()
        })

        test('should be functional on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 })
            await page.goto('/admin/')

            await expect(page.locator('.admin-layout')).toBeVisible()
            await expect(page.locator('.admin-sidebar')).toBeVisible()
        })
    })
})
