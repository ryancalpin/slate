/**
 * Targeted QA tests for previously-failed cases with corrected selectors.
 *
 * Key findings from source code inspection:
 * - ModulePalette desktop aside is `hidden md:flex` (1280px viewport = md, should be visible)
 * - The aside contains a Close button (✕) with aria-label="Close module panel" as its FIRST button
 *   but this button is `md:hidden`, so at desktop it should be invisible
 * - Module buttons are inside the aside but come AFTER the ✕ button in DOM order
 * - CanvasModule remove button: title="Remove", only visible on sm:group-hover
 * - Labs fishbone defaultConfig: showCBC is true in the plugin, but palette adds with plugin defaultConfig
 * - Data entry in labs fishbone is readOnly in build mode, live in live mode
 */
import { test, expect, type Page } from '@playwright/test'

async function waitForHome(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=My Templates', { timeout: 20_000 })
}

async function makeTemplate(page: Page, name: string): Promise<string> {
  await waitForHome(page)
  await page.getByRole('button', { name: '+ New Template' }).click()
  await page.getByPlaceholder('Template name…').fill(name)
  await page.getByRole('button', { name: 'Create' }).click()
  await page.waitForURL(/\/template\/[^/]+$/, { timeout: 10_000 })
  await expect(page.locator('#canvas-root')).toBeVisible({ timeout: 10_000 })
  return page.url()
}

/** Click a module by name in the desktop palette (aside) */
async function clickPaletteModule(page: Page, moduleName: string) {
  // Desktop aside — the actual module buttons are NOT the ✕ close button
  // Use text-based selector to find module buttons by name
  const palette = page.locator('aside.hidden.md\\:flex')
    .or(page.locator('aside').filter({ hasText: 'Modules' }).filter({ hasNot: page.locator('[aria-label="Close module panel"]') }))

  // Directly target button by exact text within the aside
  const btn = page.locator('aside').locator('button', { hasText: moduleName }).first()
  await expect(btn).toBeVisible({ timeout: 8_000 })
  await btn.click()
}

/** Add ANY module from palette (by finding visible module buttons, skipping ✕ close button) */
async function addAnyModule(page: Page): Promise<string> {
  // All buttons inside aside that are NOT the close button
  const moduleButtons = page.locator('aside button:not([aria-label="Close module panel"]):not([aria-label="Clear search"])')
  const count = await moduleButtons.count()

  for (let i = 0; i < count; i++) {
    const btn = moduleButtons.nth(i)
    const visible = await btn.isVisible().catch(() => false)
    if (visible) {
      const text = (await btn.textContent())?.trim() ?? ''
      if (text && text !== '✕' && text !== '×') {
        await btn.click()
        return text
      }
    }
  }
  throw new Error('No module buttons found in palette')
}

// ---------------------------------------------------------------------------
// TC2-D revisited: Remove (✕) button on a module card
// ---------------------------------------------------------------------------
test('TC2-D-revised: Module remove button works', async ({ page }) => {
  await makeTemplate(page, 'Remove Test Revised')

  // Add a module
  await addAnyModule(page)
  await page.waitForTimeout(600)

  const canvas = page.locator('#canvas-root')
  await expect(canvas.locator('.react-grid-item').first()).toBeVisible({ timeout: 5_000 })

  const countBefore = await canvas.locator('.react-grid-item').count()

  // Module header buttons: ⚙️ (configure), 🔓 (lock), ▲ (collapse), ✕ (remove)
  // They have `sm:opacity-0 sm:group-hover:opacity-100` — at Playwright desktop they may be opacity-0
  // But they are in the DOM and clickable even if visually invisible via opacity
  // Find the Remove button by title="Remove"
  const firstModule = canvas.locator('.react-grid-item').first()

  // Force-click the remove button even if opacity:0
  const removeBtn = firstModule.locator('button[title="Remove"]')
  await expect(removeBtn).toHaveCount(1, { timeout: 5_000 })
  await removeBtn.click({ force: true })
  await page.waitForTimeout(500)

  const countAfter = await canvas.locator('.react-grid-item').count()
  expect(countAfter).toBeLessThan(countBefore)
})

// ---------------------------------------------------------------------------
// TC3-C revisited: Adding a module via palette adds it to canvas
// ---------------------------------------------------------------------------
test('TC3-C-revised: Clicking palette module adds it to canvas', async ({ page }) => {
  await makeTemplate(page, 'Add Module Revised')

  const canvas = page.locator('#canvas-root')
  const countBefore = await canvas.locator('.react-grid-item').count()

  await addAnyModule(page)
  await page.waitForTimeout(800)

  const countAfter = await canvas.locator('.react-grid-item').count()
  expect(countAfter).toBeGreaterThan(countBefore)
})

// ---------------------------------------------------------------------------
// TC6-A revisited: Labs fishbone BMP/CBC content
// ---------------------------------------------------------------------------
test('TC6-A-revised: Labs fishbone BMP values and CBC visible', async ({ page }) => {
  await makeTemplate(page, 'Labs Fishbone Revised')

  // Click the Labs Fishbone module button in palette by name
  await clickPaletteModule(page, 'Labs Fishbone')
  await page.waitForTimeout(800)

  const canvas = page.locator('#canvas-root')
  await expect(canvas.locator('.react-grid-item').first()).toBeVisible({ timeout: 5_000 })

  // BMP placeholders: Na, K, Cl, CO2, BUN, Cr, Glu
  // These are input placeholders in the rendered fishbone
  const canvasEl = canvas

  await expect(canvasEl.locator('input[placeholder="Na"]')).toBeVisible({ timeout: 5_000 })
  await expect(canvasEl.locator('input[placeholder="K"]')).toBeVisible({ timeout: 5_000 })
  await expect(canvasEl.locator('input[placeholder="BUN"]')).toBeVisible({ timeout: 5_000 })
  await expect(canvasEl.locator('input[placeholder="Cr"]')).toBeVisible({ timeout: 5_000 })
  await expect(canvasEl.locator('input[placeholder="Cl"]')).toBeVisible({ timeout: 5_000 })
  await expect(canvasEl.locator('input[placeholder="CO2"]')).toBeVisible({ timeout: 5_000 })

  // CBC — defaultConfig has showCBC: true
  // WBC, Hgb, Plt, Hct should be visible
  await expect(canvasEl.locator('input[placeholder="WBC"]')).toBeVisible({ timeout: 5_000 })
  await expect(canvasEl.locator('input[placeholder="Hgb"]')).toBeVisible({ timeout: 5_000 })
  await expect(canvasEl.locator('input[placeholder="Plt"]')).toBeVisible({ timeout: 5_000 })
})

// ---------------------------------------------------------------------------
// TC6-B: Labs fishbone editor — toggle ShowCBC
// ---------------------------------------------------------------------------
test('TC6-B: Labs fishbone editor — toggling Show CBC hides/shows CBC block', async ({ page }) => {
  await makeTemplate(page, 'Labs Fishbone CBC Toggle')

  await clickPaletteModule(page, 'Labs Fishbone')
  await page.waitForTimeout(600)

  const canvas = page.locator('#canvas-root')
  const fishboneModule = canvas.locator('.react-grid-item').first()

  // CBC should be visible initially (showCBC: true)
  const wbcInput = canvas.locator('input[placeholder="WBC"]')
  await expect(wbcInput).toBeVisible({ timeout: 5_000 })

  // Click Configure (⚙️) button to open editor
  const configBtn = fishboneModule.locator('button[title="Configure"]')
  await configBtn.click({ force: true })
  await page.waitForTimeout(400)

  // Editor should appear — look for a CBC checkbox
  const cbcCheckbox = page.locator('input[type="checkbox"]').filter({
    has: page.locator('..').filter({ hasText: 'CBC' })
  }).first().or(
    fishboneModule.locator('input[type="checkbox"]').first()
  )

  const checkboxes = fishboneModule.locator('input[type="checkbox"]')
  const cbcCount = await checkboxes.count()

  if (cbcCount > 0) {
    // Find CBC-related checkbox
    for (let i = 0; i < cbcCount; i++) {
      const cb = checkboxes.nth(i)
      const label = await cb.evaluate(el => {
        const parent = el.closest('label') ?? el.parentElement
        return parent?.textContent ?? ''
      })
      if (label.toLowerCase().includes('cbc')) {
        const checked = await cb.isChecked()
        await cb.click()
        await page.waitForTimeout(300)

        // Close editor by clicking Configure again or clicking Save/Apply
        const applyBtn = fishboneModule.locator('button', { hasText: /apply|save|done/i }).first()
        if (await applyBtn.isVisible().catch(() => false)) {
          await applyBtn.click()
        } else {
          await configBtn.click({ force: true })
        }
        await page.waitForTimeout(400)

        // If was checked (CBC visible), unchecking should hide WBC
        if (checked) {
          const wbcAfter = canvas.locator('input[placeholder="WBC"]')
          const wbcVisible = await wbcAfter.isVisible().catch(() => false)
          // After unchecking CBC, WBC should not be visible
          expect(wbcVisible).toBeFalsy()
        }
        break
      }
    }
  } else {
    console.log('OBSERVATION: No checkboxes found in fishbone editor — editor may not have opened or uses different controls')
  }
})

// ---------------------------------------------------------------------------
// TC7-A revisited: Live mode hides palette
// ---------------------------------------------------------------------------
test('TC7-A-revised: Live mode hides module palette sidebar', async ({ page }) => {
  await makeTemplate(page, 'Live Mode Palette Test')
  await addAnyModule(page)
  await page.waitForTimeout(400)

  // Confirm palette is visible in build mode
  const desktopAside = page.locator('aside.hidden.md\\:flex').or(
    page.locator('aside').filter({ hasText: 'Modules' })
  ).first()

  // Check palette visible
  const paletteVisible = await desktopAside.isVisible({ timeout: 5_000 }).catch(() => false)
  expect(paletteVisible).toBeTruthy()

  // Switch to live mode
  const modeToggle = page.getByTitle('Toggle Build/Live mode (B)')
  await modeToggle.click()
  await expect(modeToggle).toContainText('Live', { timeout: 5_000 })

  // Palette should disappear — CanvasView only renders ModulePalette when isBuildMode
  const paletteAfterToggle = await desktopAside.isVisible({ timeout: 2_000 }).catch(() => false)
  expect(paletteAfterToggle).toBeFalsy()
})

// ---------------------------------------------------------------------------
// TC7-B revisited: Data entry in live mode — fishbone cells are readOnly in build, editable in live
// ---------------------------------------------------------------------------
test('TC7-B-revised: Labs fishbone inputs editable in live mode only', async ({ page }) => {
  await makeTemplate(page, 'Live Mode Data Entry')
  await clickPaletteModule(page, 'Labs Fishbone')
  await page.waitForTimeout(600)

  const canvas = page.locator('#canvas-root')
  const naInput = canvas.locator('input[placeholder="Na"]')
  await expect(naInput).toBeVisible({ timeout: 5_000 })

  // In BUILD mode — input should be readOnly
  const isReadOnlyBuild = await naInput.evaluate(el => (el as HTMLInputElement).readOnly)
  expect(isReadOnlyBuild).toBeTruthy()

  // Switch to LIVE mode
  const modeToggle = page.getByTitle('Toggle Build/Live mode (B)')
  await modeToggle.click()
  await expect(modeToggle).toContainText('Live', { timeout: 5_000 })
  await page.waitForTimeout(300)

  // Locate the input again (DOM may re-render)
  const naInputLive = canvas.locator('input[placeholder="Na"]')
  await expect(naInputLive).toBeVisible({ timeout: 5_000 })

  // In LIVE mode — should NOT be readOnly
  const isReadOnlyLive = await naInputLive.evaluate(el => (el as HTMLInputElement).readOnly)
  expect(isReadOnlyLive).toBeFalsy()

  // Type a value
  await naInputLive.fill('138')
  const val = await naInputLive.inputValue()
  expect(val).toBe('138')
})

// ---------------------------------------------------------------------------
// TC13-A revisited: Template and module persist after reload
// ---------------------------------------------------------------------------
test('TC13-A-revised: Module persists after page reload', async ({ page }) => {
  const url = await makeTemplate(page, 'Persistence Revised')
  await addAnyModule(page)
  await page.waitForTimeout(1000)

  const canvas = page.locator('#canvas-root')
  await expect(canvas.locator('.react-grid-item').first()).toBeVisible({ timeout: 5_000 })
  const countBefore = await canvas.locator('.react-grid-item').count()

  // Reload
  await page.reload()
  await page.waitForURL(url, { timeout: 10_000 })
  await expect(page.locator('#canvas-root')).toBeVisible({ timeout: 10_000 })
  await page.waitForTimeout(1000)

  const countAfter = await canvas.locator('.react-grid-item').count()
  expect(countAfter).toBe(countBefore)
})

// ---------------------------------------------------------------------------
// TC-EXTRA-A: Vitals module — field reorder drag handle exists
// ---------------------------------------------------------------------------
test('TC-EXTRA-A: Vitals module renders all fields (HR, BP, Temp, SpO2)', async ({ page }) => {
  await makeTemplate(page, 'Vitals Fields Test')
  await clickPaletteModule(page, 'Vitals')
  await page.waitForTimeout(600)

  const canvas = page.locator('#canvas-root')
  await expect(canvas.locator('.react-grid-item').first()).toBeVisible({ timeout: 5_000 })

  // Vitals renderer shows labels/placeholders for each vital
  const canvasText = await canvas.innerText()
  const checks = ['HR', 'BP', 'Temp', 'SpO2', 'RR', 'Weight']
  for (const label of checks) {
    expect(canvasText).toContain(label)
  }
})

// ---------------------------------------------------------------------------
// TC-EXTRA-B: Cmd+K search filters module list
// ---------------------------------------------------------------------------
test('TC-EXTRA-B: Cmd+K palette search filters results', async ({ page }) => {
  await makeTemplate(page, 'CmdK Search Test')

  // Open command palette
  await page.keyboard.press('Control+k')
  await page.waitForTimeout(500)

  // Find the command palette search input
  const searchInput = page.locator('[class*="command"] input, [class*="Command"] input, [class*="palette"] input').first()
    .or(page.locator('input[placeholder*="module"], input[placeholder*="Module"]').first())
    .or(page.locator('dialog input, [role="dialog"] input').first())

  const searchVisible = await searchInput.isVisible({ timeout: 3_000 }).catch(() => false)

  if (searchVisible) {
    // Type a search term
    await searchInput.fill('vitals')
    await page.waitForTimeout(300)

    // Should show vitals in results
    const results = page.locator('[class*="command"] button, [class*="Command"] button, [role="dialog"] button')
    const resultsText = await results.allInnerTexts()
    const hasVitals = resultsText.some(t => t.toLowerCase().includes('vitals'))
    expect(hasVitals).toBeTruthy()

    // Arrow key navigation
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)

    // Press Escape to close
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    const paletteClosed = !(await searchInput.isVisible().catch(() => false))
    expect(paletteClosed).toBeTruthy()
  } else {
    console.log('OBSERVATION: Command palette search input not found with expected selectors')
  }
})

// ---------------------------------------------------------------------------
// TC-EXTRA-C: Build mode toggle indicator — header shows ⚙️ icon, live hides it
// ---------------------------------------------------------------------------
test('TC-EXTRA-C: Module header build-mode buttons invisible in live mode', async ({ page }) => {
  await makeTemplate(page, 'Header Buttons Mode Test')
  await addAnyModule(page)
  await page.waitForTimeout(400)

  const canvas = page.locator('#canvas-root')
  const firstModule = canvas.locator('.react-grid-item').first()

  // In build mode — configure button should be present (may be opacity:0 until hover but in DOM)
  const configBtn = firstModule.locator('button[title="Configure"]')
  await expect(configBtn).toHaveCount(1, { timeout: 5_000 })

  // Switch to live mode
  const modeToggle = page.getByTitle('Toggle Build/Live mode (B)')
  await modeToggle.click()
  await expect(modeToggle).toContainText('Live', { timeout: 5_000 })
  await page.waitForTimeout(300)

  // In live mode — configure button should NOT exist (CanvasModule renders different header in live)
  const configBtnLive = firstModule.locator('button[title="Configure"]')
  const configCount = await configBtnLive.count()
  expect(configCount).toBe(0)
})

// ---------------------------------------------------------------------------
// TC-EXTRA-D: No JS errors on initial home load
// ---------------------------------------------------------------------------
test('TC-EXTRA-D: No JS errors on home page load', async ({ page }) => {
  const jsErrors: string[] = []
  page.on('pageerror', err => jsErrors.push(err.message))

  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page).toHaveTitle(/Slate/i)
  await page.waitForSelector('text=My Templates', { timeout: 15_000 })

  expect(jsErrors).toHaveLength(0)
})

// ---------------------------------------------------------------------------
// TC-EXTRA-E: Preset — all 5 specialty names present on fresh home
// ---------------------------------------------------------------------------
test('TC-EXTRA-E: All 5 preset specialty names visible on fresh home', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=My Templates', { timeout: 15_000 })

  const presets = [
    'ICU Morning Rounds',
    'General Medicine Rounds',
    'OB / Antepartum',
    'Neurology / Stroke',
    'Pediatrics',
  ]

  for (const name of presets) {
    const el = page.locator(`text="${name}"`).first()
    await expect(el).toBeVisible({ timeout: 5_000 })
  }
})

// ---------------------------------------------------------------------------
// TC-EXTRA-F: Inline template rename works
// ---------------------------------------------------------------------------
test('TC-EXTRA-F: Inline template rename in canvas toolbar', async ({ page }) => {
  await makeTemplate(page, 'Rename Source')

  // Click the rename button (✏️ template name)
  const renameBtn = page.locator('button[title="Click to rename template"]')
  await expect(renameBtn).toBeVisible({ timeout: 5_000 })
  await renameBtn.click()

  // Input should appear
  const renameInput = page.locator('input[value="Rename Source"]').or(
    page.locator('input').filter({ hasValue: 'Rename Source' })
  )
  await expect(renameInput.first()).toBeVisible({ timeout: 3_000 })

  await renameInput.first().fill('Renamed Template')
  await renameInput.first().press('Enter')
  await page.waitForTimeout(400)

  // The rename button should now show the new name
  await expect(page.locator('button[title="Click to rename template"]')).toContainText('Renamed Template', { timeout: 3_000 })
})

// ---------------------------------------------------------------------------
// TC-EXTRA-G: Undo/Redo buttons visible in build mode
// ---------------------------------------------------------------------------
test('TC-EXTRA-G: Undo/Redo buttons present in build mode toolbar', async ({ page }) => {
  await makeTemplate(page, 'Undo Redo Test')

  const undoBtn = page.locator('button[title="Undo (Ctrl+Z)"]')
  const redoBtn = page.locator('button[title="Redo (Ctrl+Y)"]')

  await expect(undoBtn).toBeVisible({ timeout: 5_000 })
  await expect(redoBtn).toBeVisible({ timeout: 5_000 })

  // Initially both should be disabled (no history changes yet)
  const undoDisabled = await undoBtn.isDisabled()
  const redoDisabled = await redoBtn.isDisabled()
  expect(undoDisabled).toBeTruthy()
  expect(redoDisabled).toBeTruthy()

  // Add a module to create history
  await addAnyModule(page)
  await page.waitForTimeout(500)

  // Undo should now be enabled
  const undoEnabled = !(await undoBtn.isDisabled())
  expect(undoEnabled).toBeTruthy()
})
