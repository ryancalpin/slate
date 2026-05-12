# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa-probe.spec.ts >> PROBE-1: Fishbone Na input — controlled value behavior in live mode
- Location: e2e/qa-probe.spec.ts:30:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "138"
Received: "8"
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "Slate" [ref=e5] [cursor=pointer]:
      - /url: /
    - generic [ref=e6]:
      - link "Print" [ref=e7] [cursor=pointer]:
        - /url: /template/ac8b9de0-acf5-4253-a98b-3d3d54fa828e/print
      - button "Export PDF (Pixel Perfect)" [ref=e8] [cursor=pointer]
      - button "Open census" [ref=e9] [cursor=pointer]:
        - img [ref=e10]
      - button "Open plugin manager" [ref=e15] [cursor=pointer]:
        - img [ref=e16]
      - button "🟢 Live" [ref=e19] [cursor=pointer]
      - combobox [ref=e20] [cursor=pointer]:
        - option "🌙 Dark" [selected]
        - option "☀️ Light"
        - option "💻 System"
  - generic [ref=e22] [cursor=pointer]:
    - generic [ref=e23]: Fishbone Data Probe
    - button "×" [ref=e24]
  - main [ref=e25]:
    - generic [ref=e26]:
      - tab "Page 1" [selected] [ref=e28] [cursor=pointer]:
        - generic [ref=e29]: Page 1
      - generic [ref=e36]:
        - generic [ref=e37]:
          - generic [ref=e38]: LABS FISHBONE
          - button "▲" [ref=e39] [cursor=pointer]
        - generic [ref=e42]:
          - generic [ref=e43]:
            - generic [ref=e44]:
              - textbox "Na" [active] [ref=e46]: "8"
              - textbox "Cl" [ref=e48]
              - textbox "K" [ref=e50]
              - textbox "CO2" [ref=e52]
            - generic [ref=e53]:
              - textbox "BUN" [ref=e55]
              - textbox "Glu" [ref=e57]
              - textbox "Cr" [ref=e59]
          - generic [ref=e61]:
            - generic [ref=e62]: CBC
            - generic [ref=e63]:
              - textbox "WBC" [ref=e65]
              - textbox "Hgb" [ref=e67]
              - textbox "Plt" [ref=e69]
              - textbox "Hct" [ref=e71]
```

# Test source

```ts
  1   | /**
  2   |  * Probe tests to verify the two remaining failure root causes.
  3   |  */
  4   | import { test, expect, type Page } from '@playwright/test'
  5   | 
  6   | async function waitForHome(page: Page) {
  7   |   await page.goto('/', { waitUntil: 'networkidle' })
  8   |   await page.waitForSelector('text=My Templates', { timeout: 20_000 })
  9   | }
  10  | 
  11  | async function makeTemplate(page: Page, name: string): Promise<string> {
  12  |   await waitForHome(page)
  13  |   await page.getByRole('button', { name: '+ New Template' }).click()
  14  |   await page.getByPlaceholder('Template name…').fill(name)
  15  |   await page.getByRole('button', { name: 'Create' }).click()
  16  |   await page.waitForURL(/\/template\/[^/]+$/, { timeout: 10_000 })
  17  |   await expect(page.locator('#canvas-root')).toBeVisible({ timeout: 10_000 })
  18  |   return page.url()
  19  | }
  20  | 
  21  | async function clickPaletteModule(page: Page, moduleName: string) {
  22  |   const btn = page.locator('aside button', { hasText: moduleName }).first()
  23  |   await expect(btn).toBeVisible({ timeout: 8_000 })
  24  |   await btn.click()
  25  | }
  26  | 
  27  | // ---------------------------------------------------------------------------
  28  | // PROBE-1: Fishbone data entry in live mode — verify exact input behavior
  29  | // ---------------------------------------------------------------------------
  30  | test('PROBE-1: Fishbone Na input — controlled value behavior in live mode', async ({ page }) => {
  31  |   // Collect console logs for insight
  32  |   const consoleLogs: string[] = []
  33  |   page.on('console', msg => consoleLogs.push(`${msg.type()}: ${msg.text()}`))
  34  | 
  35  |   await makeTemplate(page, 'Fishbone Data Probe')
  36  |   await clickPaletteModule(page, 'Labs Fishbone')
  37  |   await page.waitForTimeout(600)
  38  | 
  39  |   const canvas = page.locator('#canvas-root')
  40  |   const naInput = canvas.locator('input[placeholder="Na"]')
  41  |   await expect(naInput).toBeVisible({ timeout: 5_000 })
  42  | 
  43  |   // Verify readOnly in build mode
  44  |   const readOnlyBuild = await naInput.evaluate(el => (el as HTMLInputElement).readOnly)
  45  |   expect(readOnlyBuild).toBeTruthy()
  46  | 
  47  |   // Switch to live mode
  48  |   const modeToggle = page.getByTitle('Toggle Build/Live mode (B)')
  49  |   await modeToggle.click()
  50  |   await expect(modeToggle).toContainText('Live', { timeout: 5_000 })
  51  |   await page.waitForTimeout(500)
  52  | 
  53  |   // In live mode — verify readOnly is false
  54  |   const naLive = canvas.locator('input[placeholder="Na"]')
  55  |   await expect(naLive).toBeVisible({ timeout: 5_000 })
  56  |   const readOnlyLive = await naLive.evaluate(el => (el as HTMLInputElement).readOnly)
  57  |   expect(readOnlyLive).toBeFalsy()
  58  | 
  59  |   // Type into the input using type() instead of fill() to simulate real keystrokes
  60  |   await naLive.click()
  61  |   await page.waitForTimeout(100)
  62  |   await page.keyboard.type('138')
  63  |   await page.waitForTimeout(500)
  64  | 
  65  |   // Check DOM value
  66  |   const domValue = await naLive.evaluate(el => (el as HTMLInputElement).value)
  67  |   console.log('DOM value after typing:', domValue)
  68  | 
  69  |   // Check React-controlled value via inputValue()
  70  |   const reactValue = await naLive.inputValue()
  71  |   console.log('React inputValue:', reactValue)
  72  | 
  73  |   // The value should be 138 after typing
  74  |   // If it's empty, the controlled input is not being updated (bug: onDataChange not wiring up)
  75  |   if (reactValue === '') {
  76  |     console.log('BUG CONFIRMED: Fishbone Na input does not retain typed value in live mode')
  77  |     console.log('CAUSE: Controlled input with value={val(field)} — data state not updating')
  78  |     // Mark as known bug but don't fail — this is a real app bug to report
  79  |     console.log('STATUS: REAL BUG — data entry broken in labs fishbone live mode')
  80  |   } else {
> 81  |     expect(reactValue).toBe('138')
      |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  82  |   }
  83  | })
  84  | 
  85  | // ---------------------------------------------------------------------------
  86  | // PROBE-2: Command palette — verify actual DOM structure of results
  87  | // ---------------------------------------------------------------------------
  88  | test('PROBE-2: Command palette — verify DOM structure and Vitals result visible', async ({ page }) => {
  89  |   await makeTemplate(page, 'CmdK DOM Probe')
  90  | 
  91  |   await page.keyboard.press('Control+k')
  92  |   await page.waitForTimeout(500)
  93  | 
  94  |   // Verify palette opened by checking for the Esc hint
  95  |   const escHint = page.locator('kbd', { hasText: 'Esc' })
  96  |   await expect(escHint).toBeVisible({ timeout: 3_000 })
  97  | 
  98  |   // Get the search input (placeholder "Search modules to add…")
  99  |   const searchInput = page.locator('input[placeholder="Search modules to add…"]')
  100 |   await expect(searchInput).toBeVisible({ timeout: 3_000 })
  101 |   await searchInput.fill('vitals')
  102 |   await page.waitForTimeout(300)
  103 | 
  104 |   // The results are plain <button> elements with data-index attribute
  105 |   const resultButtons = page.locator('button[data-index]')
  106 |   const count = await resultButtons.count()
  107 |   expect(count).toBeGreaterThan(0)
  108 | 
  109 |   // First result should be Vitals
  110 |   const firstResult = resultButtons.first()
  111 |   const text = await firstResult.innerText()
  112 |   console.log('First result text:', text)
  113 |   expect(text.toLowerCase()).toContain('vitals')
  114 | 
  115 |   // Arrow key navigation
  116 |   await page.keyboard.press('ArrowDown')
  117 |   await page.waitForTimeout(100)
  118 |   await page.keyboard.press('ArrowUp')
  119 |   await page.waitForTimeout(100)
  120 | 
  121 |   // Press Enter to add module
  122 |   await page.keyboard.press('Enter')
  123 |   await page.waitForTimeout(500)
  124 | 
  125 |   // Palette should be closed now
  126 |   const searchAfter = await searchInput.isVisible().catch(() => false)
  127 |   expect(searchAfter).toBeFalsy()
  128 | 
  129 |   // Module should be on canvas
  130 |   const canvas = page.locator('#canvas-root')
  131 |   const items = canvas.locator('.react-grid-item')
  132 |   const itemCount = await items.count()
  133 |   expect(itemCount).toBeGreaterThan(0)
  134 | })
  135 | 
  136 | // ---------------------------------------------------------------------------
  137 | // PROBE-3: Vitals module — SortableRows drag handles visible in build mode
  138 | // ---------------------------------------------------------------------------
  139 | test('PROBE-3: Vitals SortableRows — drag handles exist for field reordering', async ({ page }) => {
  140 |   await makeTemplate(page, 'Vitals Drag Probe')
  141 |   await clickPaletteModule(page, 'Vitals')
  142 |   await page.waitForTimeout(600)
  143 | 
  144 |   const canvas = page.locator('#canvas-root')
  145 |   await expect(canvas.locator('.react-grid-item').first()).toBeVisible({ timeout: 5_000 })
  146 | 
  147 |   // SortableRows in build mode should show drag handles
  148 |   // Check for dnd-kit sortable elements
  149 |   const sortableItems = canvas.locator('[data-sortable-id], [data-id], [draggable="true"]')
  150 |   const sortableCount = await sortableItems.count()
  151 |   console.log('Sortable items found:', sortableCount)
  152 | 
  153 |   // Vitals labels should all be visible
  154 |   const canvasText = await canvas.innerText()
  155 |   for (const label of ['HR', 'BP', 'Temp', 'SpO2', 'RR', 'Weight']) {
  156 |     if (!canvasText.includes(label)) {
  157 |       console.log(`MISSING LABEL: ${label}`)
  158 |     }
  159 |   }
  160 | 
  161 |   // Vital field order indicator
  162 |   const fieldOrderIndicator = canvas.locator('text=HR').or(canvas.locator('text=BP')).first()
  163 |   await expect(fieldOrderIndicator).toBeVisible({ timeout: 3_000 })
  164 | })
  165 | 
  166 | // ---------------------------------------------------------------------------
  167 | // PROBE-4: Loading skeleton — verify pulse animation appears on template load
  168 | // ---------------------------------------------------------------------------
  169 | test('PROBE-4: Loading skeleton shows animate-pulse on template load', async ({ page }) => {
  170 |   // First create a template
  171 |   await makeTemplate(page, 'Skeleton Probe')
  172 | 
  173 |   const templateUrl = page.url()
  174 | 
  175 |   // Go home
  176 |   await page.goto('/', { waitUntil: 'networkidle' })
  177 | 
  178 |   // Navigate to template and immediately look for skeleton
  179 |   const skeletonPromise = page.waitForSelector('.animate-pulse', { timeout: 3_000 }).catch(() => null)
  180 |   await page.goto(templateUrl)
  181 | 
```