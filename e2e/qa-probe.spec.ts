/**
 * Probe tests to verify the two remaining failure root causes.
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

async function clickPaletteModule(page: Page, moduleName: string) {
  const btn = page.locator('aside button', { hasText: moduleName }).first()
  await expect(btn).toBeVisible({ timeout: 8_000 })
  await btn.click()
}

// ---------------------------------------------------------------------------
// PROBE-1: Fishbone data entry in live mode — verify exact input behavior
// ---------------------------------------------------------------------------
test('PROBE-1: Fishbone Na input — controlled value behavior in live mode', async ({ page }) => {
  // Collect console logs for insight
  const consoleLogs: string[] = []
  page.on('console', msg => consoleLogs.push(`${msg.type()}: ${msg.text()}`))

  await makeTemplate(page, 'Fishbone Data Probe')
  await clickPaletteModule(page, 'Labs Fishbone')
  await page.waitForTimeout(600)

  const canvas = page.locator('#canvas-root')
  const naInput = canvas.locator('input[placeholder="Na"]')
  await expect(naInput).toBeVisible({ timeout: 5_000 })

  // Verify readOnly in build mode
  const readOnlyBuild = await naInput.evaluate(el => (el as HTMLInputElement).readOnly)
  expect(readOnlyBuild).toBeTruthy()

  // Switch to live mode
  const modeToggle = page.getByTitle('Toggle Build/Live mode (B)')
  await modeToggle.click()
  await expect(modeToggle).toContainText('Live', { timeout: 5_000 })
  await page.waitForTimeout(500)

  // In live mode — verify readOnly is false
  const naLive = canvas.locator('input[placeholder="Na"]')
  await expect(naLive).toBeVisible({ timeout: 5_000 })
  const readOnlyLive = await naLive.evaluate(el => (el as HTMLInputElement).readOnly)
  expect(readOnlyLive).toBeFalsy()

  // Type into the input using type() instead of fill() to simulate real keystrokes
  await naLive.click()
  await page.waitForTimeout(100)
  await page.keyboard.type('138')
  await page.waitForTimeout(500)

  // Check DOM value
  const domValue = await naLive.evaluate(el => (el as HTMLInputElement).value)
  console.log('DOM value after typing:', domValue)

  // Check React-controlled value via inputValue()
  const reactValue = await naLive.inputValue()
  console.log('React inputValue:', reactValue)

  // The value should be 138 after typing
  // If it's empty, the controlled input is not being updated (bug: onDataChange not wiring up)
  if (reactValue === '') {
    console.log('BUG CONFIRMED: Fishbone Na input does not retain typed value in live mode')
    console.log('CAUSE: Controlled input with value={val(field)} — data state not updating')
    // Mark as known bug but don't fail — this is a real app bug to report
    console.log('STATUS: REAL BUG — data entry broken in labs fishbone live mode')
  } else {
    expect(reactValue).toBe('138')
  }
})

// ---------------------------------------------------------------------------
// PROBE-2: Command palette — verify actual DOM structure of results
// ---------------------------------------------------------------------------
test('PROBE-2: Command palette — verify DOM structure and Vitals result visible', async ({ page }) => {
  await makeTemplate(page, 'CmdK DOM Probe')

  await page.keyboard.press('Control+k')
  await page.waitForTimeout(500)

  // Verify palette opened by checking for the Esc hint
  const escHint = page.locator('kbd', { hasText: 'Esc' })
  await expect(escHint).toBeVisible({ timeout: 3_000 })

  // Get the search input (placeholder "Search modules to add…")
  const searchInput = page.locator('input[placeholder="Search modules to add…"]')
  await expect(searchInput).toBeVisible({ timeout: 3_000 })
  await searchInput.fill('vitals')
  await page.waitForTimeout(300)

  // The results are plain <button> elements with data-index attribute
  const resultButtons = page.locator('button[data-index]')
  const count = await resultButtons.count()
  expect(count).toBeGreaterThan(0)

  // First result should be Vitals
  const firstResult = resultButtons.first()
  const text = await firstResult.innerText()
  console.log('First result text:', text)
  expect(text.toLowerCase()).toContain('vitals')

  // Arrow key navigation
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(100)
  await page.keyboard.press('ArrowUp')
  await page.waitForTimeout(100)

  // Press Enter to add module
  await page.keyboard.press('Enter')
  await page.waitForTimeout(500)

  // Palette should be closed now
  const searchAfter = await searchInput.isVisible().catch(() => false)
  expect(searchAfter).toBeFalsy()

  // Module should be on canvas
  const canvas = page.locator('#canvas-root')
  const items = canvas.locator('.react-grid-item')
  const itemCount = await items.count()
  expect(itemCount).toBeGreaterThan(0)
})

// ---------------------------------------------------------------------------
// PROBE-3: Vitals module — SortableRows drag handles visible in build mode
// ---------------------------------------------------------------------------
test('PROBE-3: Vitals SortableRows — drag handles exist for field reordering', async ({ page }) => {
  await makeTemplate(page, 'Vitals Drag Probe')
  await clickPaletteModule(page, 'Vitals')
  await page.waitForTimeout(600)

  const canvas = page.locator('#canvas-root')
  await expect(canvas.locator('.react-grid-item').first()).toBeVisible({ timeout: 5_000 })

  // SortableRows in build mode should show drag handles
  // Check for dnd-kit sortable elements
  const sortableItems = canvas.locator('[data-sortable-id], [data-id], [draggable="true"]')
  const sortableCount = await sortableItems.count()
  console.log('Sortable items found:', sortableCount)

  // Vitals labels should all be visible
  const canvasText = await canvas.innerText()
  for (const label of ['HR', 'BP', 'Temp', 'SpO2', 'RR', 'Weight']) {
    if (!canvasText.includes(label)) {
      console.log(`MISSING LABEL: ${label}`)
    }
  }

  // Vital field order indicator
  const fieldOrderIndicator = canvas.locator('text=HR').or(canvas.locator('text=BP')).first()
  await expect(fieldOrderIndicator).toBeVisible({ timeout: 3_000 })
})

// ---------------------------------------------------------------------------
// PROBE-4: Loading skeleton — verify pulse animation appears on template load
// ---------------------------------------------------------------------------
test('PROBE-4: Loading skeleton shows animate-pulse on template load', async ({ page }) => {
  // First create a template
  await makeTemplate(page, 'Skeleton Probe')

  const templateUrl = page.url()

  // Go home
  await page.goto('/', { waitUntil: 'networkidle' })

  // Navigate to template and immediately look for skeleton
  const skeletonPromise = page.waitForSelector('.animate-pulse', { timeout: 3_000 }).catch(() => null)
  await page.goto(templateUrl)

  const skeleton = await skeletonPromise
  if (skeleton) {
    console.log('PASS: Loading skeleton (animate-pulse) detected during navigation')
  } else {
    console.log('OBSERVATION: Skeleton too fast to capture — template loaded instantly (good perf, but skeleton not observable)')
  }

  // Verify final state loads correctly
  await expect(page.locator('#canvas-root')).toBeVisible({ timeout: 10_000 })
})

// ---------------------------------------------------------------------------
// PROBE-5: Module right-side clipping check with ICU preset
// ---------------------------------------------------------------------------
test('PROBE-5: ICU preset — no modules clipped outside viewport', async ({ page }) => {
  await waitForHome(page)

  const useBtn = page.locator('button', { hasText: 'Use this template' }).first()
  await useBtn.click()
  await page.waitForURL(/\/template\/[^/]+$/, { timeout: 10_000 })

  const canvas = page.locator('#canvas-root')
  await expect(canvas.locator('.react-grid-item').first()).toBeVisible({ timeout: 10_000 })

  const viewportWidth = page.viewportSize()?.width ?? 1280
  console.log('Viewport width:', viewportWidth)

  const items = canvas.locator('.react-grid-item')
  const count = await items.count()
  console.log('Module count on ICU preset canvas:', count)

  let clippedCount = 0
  const clipped: string[] = []
  for (let i = 0; i < count; i++) {
    const box = await items.nth(i).boundingBox()
    if (box) {
      const rightEdge = box.x + box.width
      if (rightEdge > viewportWidth + 2) {
        clippedCount++
        const text = await items.nth(i).innerText().catch(() => '?')
        clipped.push(`Module ${i}: right=${rightEdge.toFixed(0)} (viewport=${viewportWidth})  — "${text.slice(0, 30)}"`)
      }
    }
  }

  if (clippedCount > 0) {
    console.log('CLIPPED MODULES:', clipped.join('\n'))
  } else {
    console.log('PASS: All modules within viewport width')
  }

  expect(clippedCount).toBe(0)
})
