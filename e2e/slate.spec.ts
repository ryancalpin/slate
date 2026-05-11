import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a template via the Home UI and return its URL path (/template/:id). */
async function createTemplate(page: Page, name: string): Promise<string> {
  await page.goto('/')
  await page.waitForSelector('text=My Templates', { timeout: 15_000 })

  await page.getByRole('button', { name: '+ New Template' }).click()
  await page.getByPlaceholder('Template name…').fill(name)
  await page.getByRole('button', { name: 'Create' }).click()

  // Wait for navigation to /template/:id
  await page.waitForURL(/\/template\/[^/]+$/, { timeout: 10_000 })
  return page.url()
}

// ---------------------------------------------------------------------------
// TC1: Home page loads
// ---------------------------------------------------------------------------
test('TC1: Home page loads — title is Slate, no JS errors', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', (err) => jsErrors.push(err.message))

  await page.goto('/')
  await expect(page).toHaveTitle(/Slate/i)
  await expect(page.locator('text=My Templates')).toBeVisible({ timeout: 15_000 })

  expect(jsErrors).toHaveLength(0)
})

// ---------------------------------------------------------------------------
// TC2: Create a new template
// ---------------------------------------------------------------------------
test('TC2: Create a new template — new template opens in canvas', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('text=My Templates', { timeout: 15_000 })

  await page.getByRole('button', { name: '+ New Template' }).click()

  // A name input should appear
  const nameInput = page.getByPlaceholder('Template name…')
  await expect(nameInput).toBeVisible()

  await nameInput.fill('E2E Test Template')
  await page.getByRole('button', { name: 'Create' }).click()

  // Should navigate to a template canvas URL
  await page.waitForURL(/\/template\/[^/]+$/, { timeout: 10_000 })
  expect(page.url()).toMatch(/\/template\/[^/]+$/)

  // The canvas root element should be present
  await expect(page.locator('#canvas-root')).toBeVisible({ timeout: 10_000 })
})

// ---------------------------------------------------------------------------
// TC3: Add a module to the canvas
// ---------------------------------------------------------------------------
test('TC3: Add a module to the canvas — module appears on canvas', async ({ page }) => {
  await createTemplate(page, 'Module Test Template')

  // The ModulePalette sidebar should be visible in build mode
  await expect(page.locator('aside').filter({ hasText: 'Modules' })).toBeVisible({ timeout: 10_000 })

  // Pick the first available module button in the palette
  const firstModuleButton = page.locator('aside').filter({ hasText: 'Modules' }).locator('button').first()
  await expect(firstModuleButton).toBeVisible({ timeout: 5_000 })

  const moduleName = await firstModuleButton.textContent()

  await firstModuleButton.click()

  // A canvas module card should now exist (header renders uppercase)
  await expect(page.locator('#canvas-root')).toContainText(moduleName?.trim() ?? '', { timeout: 5_000, ignoreCase: true })
})

// ---------------------------------------------------------------------------
// TC4: Build mode vs Live mode toggle
// ---------------------------------------------------------------------------
test('TC4: Build/Live mode toggle — UI reflects mode change', async ({ page }) => {
  await createTemplate(page, 'Mode Toggle Template')

  // In build mode the ModulePalette sidebar should be visible
  const palette = page.locator('aside').filter({ hasText: 'Modules' })
  await expect(palette).toBeVisible({ timeout: 10_000 })

  // The ModeToggle button shows "Build"
  const modeToggle = page.getByTitle('Toggle Build/Live mode (B)')
  await expect(modeToggle).toContainText('Build')

  // Toggle to Live mode
  await modeToggle.click()

  // Button should now say "Live"
  await expect(modeToggle).toContainText('Live', { timeout: 5_000 })

  // Sidebar should disappear in live mode
  await expect(palette).not.toBeVisible()
})

// ---------------------------------------------------------------------------
// TC5: Template persists on reload (Dexie IndexedDB persistence)
// ---------------------------------------------------------------------------
test('TC5: Template persists on reload — module still present after page reload', async ({ page }) => {
  await createTemplate(page, 'Persistence Test Template')

  // Add a module
  const firstModuleButton = page.locator('aside').filter({ hasText: 'Modules' }).locator('button').first()
  await expect(firstModuleButton).toBeVisible({ timeout: 10_000 })
  const moduleName = (await firstModuleButton.textContent())?.trim() ?? ''
  await firstModuleButton.click()
  await expect(page.locator('#canvas-root')).toContainText(moduleName, { timeout: 5_000, ignoreCase: true })

  // Note the template URL
  const templateUrl = page.url()

  // Reload the page
  await page.reload()
  await page.waitForURL(templateUrl, { timeout: 10_000 })

  // Module should still be on the canvas
  await expect(page.locator('#canvas-root')).toContainText(moduleName, { timeout: 10_000, ignoreCase: true })
})

// ---------------------------------------------------------------------------
// TC6: PDF export — button click triggers a download
// ---------------------------------------------------------------------------
test('TC6: PDF export — Export PDF button triggers a download', async ({ page }) => {
  await createTemplate(page, 'PDF Export Template')

  // Export PDF button is only visible when a template is open
  const exportBtn = page.getByRole('button', { name: /Export PDF/i })
  await expect(exportBtn).toBeVisible({ timeout: 10_000 })

  // Listen for download event
  const downloadPromise = page.waitForEvent('download', { timeout: 15_000 })
  await exportBtn.click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
})

// ---------------------------------------------------------------------------
// TC7: Census view
// ---------------------------------------------------------------------------
test('TC7: Census view — clicking census icon loads Census view', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('text=My Templates', { timeout: 15_000 })

  // Click the census grid icon button (aria-label="Open census")
  await page.getByRole('button', { name: 'Open census' }).click()

  await page.waitForURL('**/census', { timeout: 10_000 })
  expect(page.url()).toContain('/census')

  // The Census view should render something identifiable
  await expect(page.locator('main').first()).toBeVisible({ timeout: 5_000 })
})

// ---------------------------------------------------------------------------
// TC8: Gallery view
// ---------------------------------------------------------------------------
test('TC8: Gallery view — /gallery route loads Gallery view', async ({ page }) => {
  await page.goto('/gallery')

  // Should not redirect to 404 or error — the route exists
  await page.waitForURL('**/gallery', { timeout: 10_000 })
  await expect(page.locator('main').first()).toBeVisible({ timeout: 5_000 })

  // Gallery title or content should appear
  // The GalleryView renders some content — just verify the page is not blank / errored
  await expect(page.locator('body')).not.toBeEmpty()
})

// ---------------------------------------------------------------------------
// TC9: Plugin Manager
// ---------------------------------------------------------------------------
test('TC9: Plugin Manager — gear icon opens Plugin Manager view', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('text=My Templates', { timeout: 15_000 })

  await page.getByRole('button', { name: 'Open plugin manager' }).click()

  await page.waitForURL('**/plugins', { timeout: 10_000 })
  expect(page.url()).toContain('/plugins')

  await expect(page.locator('main').first()).toBeVisible({ timeout: 5_000 })
})

// ---------------------------------------------------------------------------
// TC10: Print preview
// ---------------------------------------------------------------------------
test('TC10: Print preview — Print button navigates to /template/:id/print', async ({ page }) => {
  await createTemplate(page, 'Print Preview Template')

  // Print link is an <a> tag rendered when templateId is set
  const printLink = page.getByRole('link', { name: 'Print' })
  await expect(printLink).toBeVisible({ timeout: 10_000 })

  await printLink.click()

  await page.waitForURL(/\/template\/[^/]+\/print/, { timeout: 10_000 })
  expect(page.url()).toMatch(/\/template\/[^/]+\/print/)

  // Print preview should render
  await expect(page.locator('body')).toBeVisible()
})

// ---------------------------------------------------------------------------
// TC11: Dark/light theme toggle
// ---------------------------------------------------------------------------
test('TC11: Dark/light theme toggle — dark class toggles on <html>', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('text=My Templates', { timeout: 15_000 })

  // The ThemeToggle is a <select> element
  const themeSelect = page.locator('select')
  await expect(themeSelect).toBeVisible({ timeout: 5_000 })

  // Read the current theme
  const currentTheme = await themeSelect.inputValue()

  if (currentTheme === 'dark' || currentTheme === 'system') {
    // Switch to light
    await themeSelect.selectOption('light')
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)

    // Switch back to dark
    await themeSelect.selectOption('dark')
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  } else {
    // Currently light — switch to dark
    await themeSelect.selectOption('dark')
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)

    // Switch to light
    await themeSelect.selectOption('light')
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  }
})
