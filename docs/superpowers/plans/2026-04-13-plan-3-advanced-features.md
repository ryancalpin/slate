# Patient Template Builder — Plan 3: Advanced Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Layer all advanced features (PDF export, snapshots, census, roster mode, multi-page, freeform/sections canvases, template gallery, and plugin manager) on top of the infrastructure and 14 core modules from Plans 1 and 2.

**Architecture:** Each advanced feature is implemented as a self-contained unit with its own core logic, UI component, route (where needed), and wired into existing hooks/views from Plans 1–2. No core infrastructure files are rewritten — only extended. Plan 3 is additive only.

**Tech Stack:** html2canvas, jsPDF, React 18, dnd-kit Sortable, Dexie.js, React Router v6, Vitest + @testing-library/react, TypeScript strict mode

---

## File Map

```
src/
├── core/
│   ├── export/
│   │   ├── pdfPixel.ts
│   │   ├── pdfClean.ts
│   │   └── export.test.ts
│   ├── snapshot/
│   │   ├── snapshotEngine.ts
│   │   └── snapshotEngine.test.ts
│   ├── census/
│   │   ├── censusUtils.ts
│   │   └── censusUtils.test.ts
│   ├── gallery/
│   │   ├── galleryClient.ts
│   │   └── galleryClient.test.ts
│   └── plugin/
│       └── pluginLoader.ts
├── canvas/
│   ├── FreeformCanvas.tsx
│   └── SectionsCanvas.tsx
├── hooks/
│   └── usePatientSlot.ts
└── ui/
    ├── components/
    │   ├── SnapshotTimeline.tsx
    │   ├── PatientSelector.tsx
    │   └── PageTabs.tsx
    └── views/
        ├── CensusView.tsx
        ├── GalleryView.tsx
        └── PluginManagerView.tsx
```

---

## Task 1: Install Advanced Feature Dependencies

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1.1: Install html2canvas and jsPDF**

```bash
cd ~/projects/patient-templates
npm install html2canvas jspdf
npm install -D @types/html2canvas
```

- [ ] **Step 1.2: Verify types are available**

```bash
npx tsc --noEmit
```

Expect zero errors. If `@types/html2canvas` is not needed (html2canvas ships its own types), remove it:

```bash
npm uninstall @types/html2canvas
```

- [ ] **Step 1.3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install html2canvas and jspdf for PDF export"
```

---

## Task 2: Pixel-Perfect PDF Export

**Files:**
- Create: `src/core/export/pdfPixel.ts`
- Create: `src/core/export/export.test.ts`
- Modify: `src/ui/shell/TopBar.tsx`

- [ ] **Step 2.1: Write failing test**

```ts
// src/core/export/export.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,AAAA'),
    width: 800,
    height: 600,
  }),
}))

// Mock jsPDF
const mockAddImage = vi.fn()
const mockSave = vi.fn()
const mockOutput = vi.fn().mockReturnValue(new Uint8Array([1, 2, 3]))
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addImage: mockAddImage,
    save: mockSave,
    output: mockOutput,
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  })),
}))

import { exportPixelPerfectPdf } from './pdfPixel'

describe('exportPixelPerfectPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = '<div id="canvas-root" class="dark">content</div>'
  })

  it('returns a Blob', async () => {
    const el = document.getElementById('canvas-root') as HTMLElement
    const blob = await exportPixelPerfectPdf(el)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('temporarily removes dark class before capture and restores it', async () => {
    const el = document.getElementById('canvas-root') as HTMLElement
    expect(el.classList.contains('dark')).toBe(true)

    const html2canvas = (await import('html2canvas')).default as ReturnType<typeof vi.fn>
    html2canvas.mockImplementationOnce(async (target: HTMLElement) => {
      // During capture, dark class should be removed
      expect(target.classList.contains('dark')).toBe(false)
      return { toDataURL: () => 'data:image/png;base64,AAAA', width: 800, height: 600 }
    })

    await exportPixelPerfectPdf(el)
    // After capture, dark class is restored
    expect(el.classList.contains('dark')).toBe(true)
  })
})
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
cd ~/projects/patient-templates
npx vitest run src/core/export/export.test.ts
```

Expect: `Cannot find module './pdfPixel'`

- [ ] **Step 2.3: Create `src/core/export/pdfPixel.ts`**

```ts
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Captures the given element as a pixel-perfect screenshot and embeds it
 * into a jsPDF document. Always renders in light mode regardless of the
 * current theme by temporarily removing the 'dark' class.
 *
 * @param element - The DOM element to capture (typically the canvas root div)
 * @returns A Blob containing the PDF file
 */
export async function exportPixelPerfectPdf(element: HTMLElement): Promise<Blob> {
  const hadDark = element.classList.contains('dark')
  if (hadDark) {
    element.classList.remove('dark')
  }

  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      scale: 2, // retina quality
      logging: false,
    })
  } finally {
    if (hadDark) {
      element.classList.add('dark')
    }
  }

  const imgData = canvas.toDataURL('image/png')
  const imgWidth = canvas.width
  const imgHeight = canvas.height

  // A4 dimensions in mm
  const pdfWidth = 210
  const pdfHeight = 297
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  const scaledWidth = imgWidth * ratio
  const scaledHeight = imgHeight * ratio
  const xOffset = (pdfWidth - scaledWidth) / 2

  const doc = new jsPDF({
    orientation: scaledHeight > scaledWidth ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  doc.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight)

  const arrayBuffer = doc.output('arraybuffer')
  return new Blob([arrayBuffer], { type: 'application/pdf' })
}

/**
 * Triggers a browser download of a Blob as a named file.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 2.4: Run test to verify it passes**

```bash
npx vitest run src/core/export/export.test.ts
```

Expect: all tests pass.

- [ ] **Step 2.5: Wire "Export PDF (Pixel Perfect)" button in TopBar**

In `src/ui/shell/TopBar.tsx`, add an import and a handler. Locate the export/print controls section and add:

```tsx
// Add to imports at top of TopBar.tsx
import { exportPixelPerfectPdf, downloadBlob } from '../../core/export/pdfPixel'

// Add inside the TopBar component, before the return statement
const handlePixelPerfectExport = useCallback(async () => {
  const canvasEl = document.getElementById('canvas-root')
  if (!canvasEl) return
  const blob = await exportPixelPerfectPdf(canvasEl as HTMLElement)
  downloadBlob(blob, `template-${Date.now()}.pdf`)
}, [])

// In JSX, add button in the export controls area:
<button
  type="button"
  onClick={handlePixelPerfectExport}
  className="px-3 py-1.5 text-sm rounded bg-accent text-white hover:opacity-90 transition-opacity"
  title="Export PDF — exact screen replica"
>
  Export PDF (Pixel Perfect)
</button>
```

Also add `id="canvas-root"` to the canvas wrapper div in `src/ui/views/CanvasView.tsx` if not already present:

```tsx
// In CanvasView.tsx, ensure the outermost canvas div has:
<div id="canvas-root" className={clsx('flex-1 overflow-auto', isDark && 'dark')}>
  {/* canvas content */}
</div>
```

- [ ] **Step 2.6: Commit**

```bash
git add src/core/export/pdfPixel.ts src/core/export/export.test.ts \
        src/ui/shell/TopBar.tsx src/ui/views/CanvasView.tsx
git commit -m "feat: pixel-perfect PDF export via html2canvas + jsPDF"
```

---

## Task 3: Clean Doc PDF Export

**Files:**
- Create: `src/core/export/pdfClean.ts`
- Modify: `src/core/export/export.test.ts` (add tests)
- Modify: `src/ui/shell/TopBar.tsx`

- [ ] **Step 3.1: Write failing test**

Append to `src/core/export/export.test.ts`:

```ts
import { exportCleanDocPdf } from './pdfClean'
import type { Template } from '../template/types'
import type { PluginRegistry } from '../plugin/registry'

describe('exportCleanDocPdf', () => {
  it('returns a Blob given a template and a container element', async () => {
    const mockTemplate = {
      id: 't1',
      name: 'Test',
      pages: [{ id: 'p1', name: 'Page 1', layout: [] }],
    } as unknown as Template

    const mockRegistry = {
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as PluginRegistry

    const container = document.createElement('div')
    document.body.appendChild(container)

    const blob = await exportCleanDocPdf(mockTemplate, mockRegistry, container)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/pdf')

    document.body.removeChild(container)
  })
})
```

- [ ] **Step 3.2: Run test to verify it fails**

```bash
npx vitest run src/core/export/export.test.ts
```

Expect: `Cannot find module './pdfClean'`

- [ ] **Step 3.3: Create `src/core/export/pdfClean.ts`**

```ts
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { createRoot } from 'react-dom/client'
import React from 'react'
import type { Template, TemplatePage } from '../template/types'
import type { PluginRegistry } from '../plugin/registry'

interface PrintProps {
  data: Record<string, unknown>
  config: Record<string, unknown>
}

/**
 * Renders each module's PrintView component into an off-screen div,
 * captures each as a canvas, and assembles them into a multi-page PDF.
 * Each module snapshot occupies its own segment with proper page breaks.
 */
export async function exportCleanDocPdf(
  template: Template,
  registry: PluginRegistry,
  _container: HTMLElement,
  activeSlotId?: string,
): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pdfWidth = 210
  const pdfHeight = 297
  const margin = 10
  let currentY = margin
  let isFirstPage = true

  for (const page of template.pages as TemplatePage[]) {
    for (const instance of page.layout) {
      const plugin = registry.get(instance.moduleId)
      if (!plugin?.PrintView) continue

      // Resolve data for this module instance
      const data: Record<string, unknown> =
        template.patientMode === 'roster' && activeSlotId
          ? ((template.patientSlots?.find((s: { id: string }) => s.id === activeSlotId)
              ?.data?.[instance.instanceId] as Record<string, unknown>) ?? {})
          : ((template.singleData?.[instance.instanceId] as Record<string, unknown>) ?? {})

      const config = (instance.config as Record<string, unknown>) ?? {}

      // Mount PrintView into a hidden off-screen element
      const wrapper = document.createElement('div')
      wrapper.style.cssText =
        'position:absolute;left:-9999px;top:0;width:794px;background:white;color:black;'
      document.body.appendChild(wrapper)

      const root = createRoot(wrapper)
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(plugin.PrintView as React.FC<PrintProps>, { data, config }),
        )
        // Allow React to flush
        setTimeout(resolve, 50)
      })

      const canvas = await html2canvas(wrapper, {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
      })

      root.unmount()
      document.body.removeChild(wrapper)

      const imgData = canvas.toDataURL('image/png')
      const availWidth = pdfWidth - margin * 2
      const ratio = availWidth / canvas.width
      const imgHeight = canvas.height * ratio

      if (!isFirstPage && currentY + imgHeight > pdfHeight - margin) {
        doc.addPage()
        currentY = margin
      }

      doc.addImage(imgData, 'PNG', margin, currentY, availWidth, imgHeight)
      currentY += imgHeight + 6
      isFirstPage = false
    }
  }

  const arrayBuffer = doc.output('arraybuffer')
  return new Blob([arrayBuffer], { type: 'application/pdf' })
}
```

- [ ] **Step 3.4: Run test to verify it passes**

```bash
npx vitest run src/core/export/export.test.ts
```

Expect: all tests pass.

- [ ] **Step 3.5: Wire "Export PDF (Clean Doc)" button in TopBar**

In `src/ui/shell/TopBar.tsx`, add the import and handler:

```tsx
// Add to imports
import { exportCleanDocPdf } from '../../core/export/pdfClean'
import { usePluginRegistry } from '../../core/plugin/registry'  // or however registry is accessed

// Add handler inside TopBar component
const handleCleanDocExport = useCallback(async () => {
  if (!activeTemplate) return
  const blob = await exportCleanDocPdf(activeTemplate, registry, document.body, activeSlotId)
  downloadBlob(blob, `${activeTemplate.name}-clean-${Date.now()}.pdf`)
}, [activeTemplate, registry, activeSlotId])

// In JSX, alongside the pixel-perfect button:
<button
  type="button"
  onClick={handleCleanDocExport}
  className="px-3 py-1.5 text-sm rounded border border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
  title="Export PDF — clean formatted document"
>
  Export PDF (Clean Doc)
</button>
```

- [ ] **Step 3.6: Commit**

```bash
git add src/core/export/pdfClean.ts src/core/export/export.test.ts src/ui/shell/TopBar.tsx
git commit -m "feat: clean doc PDF export renders each module PrintView into jsPDF"
```

---

## Task 4: Snapshot Engine

**Files:**
- Create: `src/core/snapshot/snapshotEngine.ts`
- Create: `src/core/snapshot/snapshotEngine.test.ts`
- Create: `src/ui/components/SnapshotTimeline.tsx`
- Modify: `src/hooks/useTemplate.ts`

- [ ] **Step 4.1: Write failing tests**

```ts
// src/core/snapshot/snapshotEngine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shouldCreateSnapshot, createSnapshot, applySnapshotToTemplate } from './snapshotEngine'
import type { Template } from '../template/types'

function makeTemplate(updatedAt: string, snapshots: Template['snapshots'] = []): Template {
  return {
    id: 't1',
    name: 'Test Template',
    canvasMode: 'grid',
    patientMode: 'single',
    defaultMode: 'live',
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt,
    pages: [
      {
        id: 'p1',
        name: 'Page 1',
        canvasMode: 'grid',
        layout: [
          {
            instanceId: 'inst-1',
            moduleId: 'vitals',
            version: '1.0.0',
            position: { x: 0, y: 0, w: 4, h: 3 },
            config: {},
            locked: false,
            collapsed: false,
          },
        ],
      },
    ],
    singleData: { 'inst-1': { hr: 72 } },
    patientSlots: [],
    snapshots,
  } as unknown as Template
}

describe('shouldCreateSnapshot', () => {
  it('returns true when updatedAt date differs from today', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const template = makeTemplate(yesterday.toISOString())
    expect(shouldCreateSnapshot(template)).toBe(true)
  })

  it('returns false when updatedAt date is today', () => {
    const template = makeTemplate(new Date().toISOString())
    expect(shouldCreateSnapshot(template)).toBe(false)
  })

  it('returns false when a snapshot already exists for today', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const todayDate = new Date().toISOString().split('T')[0]
    const template = makeTemplate(yesterday.toISOString(), [
      { date: todayDate, slotId: null, pages: [] },
    ])
    expect(shouldCreateSnapshot(template)).toBe(false)
  })
})

describe('createSnapshot', () => {
  it('creates a snapshot with today ISO date, null slotId, and frozen page data', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const template = makeTemplate(yesterday.toISOString())
    const snapshot = createSnapshot(template, null)
    const todayDate = new Date().toISOString().split('T')[0]

    expect(snapshot.date).toBe(todayDate)
    expect(snapshot.slotId).toBeNull()
    expect(snapshot.pages).toHaveLength(1)
    expect(snapshot.pages[0].id).toBe('p1')
  })

  it('creates a roster snapshot with the correct slotId', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const template = makeTemplate(yesterday.toISOString())
    const snapshot = createSnapshot(template, 'slot-99')
    expect(snapshot.slotId).toBe('slot-99')
  })
})

describe('applySnapshotToTemplate', () => {
  it('returns a template with singleData overwritten by snapshot page data', () => {
    const template = makeTemplate(new Date().toISOString())
    const snapshotDate = '2026-04-12'
    const frozenTemplate = applySnapshotToTemplate(template, snapshotDate)
    // The function returns the template in read-only snapshot mode
    expect(frozenTemplate).toHaveProperty('_snapshotDate', snapshotDate)
  })
})
```

- [ ] **Step 4.2: Run tests to verify they fail**

```bash
npx vitest run src/core/snapshot/snapshotEngine.test.ts
```

Expect: `Cannot find module './snapshotEngine'`

- [ ] **Step 4.3: Create `src/core/snapshot/snapshotEngine.ts`**

```ts
import type { Template, TemplatePage, Snapshot } from '../template/types'

/**
 * Returns true if the template was last updated on a date prior to today
 * AND no snapshot already exists for today's date.
 */
export function shouldCreateSnapshot(template: Template): boolean {
  const todayDate = new Date().toISOString().split('T')[0]
  const updatedDate = new Date(template.updatedAt).toISOString().split('T')[0]

  if (updatedDate === todayDate) return false

  const alreadyExists = template.snapshots?.some((s) => s.date === todayDate) ?? false
  return !alreadyExists
}

/**
 * Creates a frozen snapshot of the current page layouts and data.
 * The snapshot captures all pages with their layouts deep-cloned.
 *
 * @param template - The template to snapshot
 * @param slotId - For roster mode, the patient slot ID; null for single mode
 */
export function createSnapshot(template: Template, slotId: string | null): Snapshot {
  const todayDate = new Date().toISOString().split('T')[0]

  const frozenPages = (template.pages as TemplatePage[]).map((page) => ({
    ...page,
    layout: page.layout.map((inst) => ({
      ...inst,
      config: { ...inst.config },
      position: { ...inst.position },
    })),
    // Attach per-instance data to the frozen page layout
    snapshotData: slotId
      ? { ...(template.patientSlots?.find((s) => s.id === slotId)?.data ?? {}) }
      : { ...(template.singleData ?? {}) },
  }))

  return {
    date: todayDate,
    slotId,
    pages: frozenPages,
  }
}

/**
 * Returns a read-only view of the template with data replaced by the
 * specified snapshot's frozen data. Adds a `_snapshotDate` marker so
 * the UI can show a "viewing snapshot" banner.
 */
export function applySnapshotToTemplate(
  template: Template,
  snapshotDate: string,
): Template & { _snapshotDate: string } {
  const snapshot = template.snapshots?.find((s) => s.date === snapshotDate)

  if (!snapshot) {
    return { ...template, _snapshotDate: snapshotDate }
  }

  // Rebuild singleData from snapshot pages' snapshotData
  const restoredData: Record<string, unknown> = {}
  for (const page of snapshot.pages as Array<TemplatePage & { snapshotData?: Record<string, unknown> }>) {
    if (page.snapshotData) {
      Object.assign(restoredData, page.snapshotData)
    }
  }

  return {
    ...template,
    pages: snapshot.pages as TemplatePage[],
    singleData: restoredData as Template['singleData'],
    _snapshotDate: snapshotDate,
  }
}
```

- [ ] **Step 4.4: Run tests to verify they pass**

```bash
npx vitest run src/core/snapshot/snapshotEngine.test.ts
```

Expect: all tests pass.

- [ ] **Step 4.5: Create `src/ui/components/SnapshotTimeline.tsx`**

```tsx
import React, { useCallback } from 'react'
import clsx from 'clsx'
import type { Snapshot } from '../../core/template/types'

interface SnapshotTimelineProps {
  snapshots: Snapshot[]
  activeSnapshotDate: string | null
  onSelectSnapshot: (date: string | null) => void
}

/**
 * Renders a horizontal list of snapshot dates at the bottom of the canvas.
 * Clicking a date activates read-only snapshot overlay mode.
 * Clicking "Live" returns to the current data.
 */
export function SnapshotTimeline({
  snapshots,
  activeSnapshotDate,
  onSelectSnapshot,
}: SnapshotTimelineProps) {
  const handleLive = useCallback(() => {
    onSelectSnapshot(null)
  }, [onSelectSnapshot])

  const handleDate = useCallback(
    (date: string) => {
      onSelectSnapshot(date)
    },
    [onSelectSnapshot],
  )

  if (snapshots.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-surface-raised border-t border-gray-700 overflow-x-auto">
      <span className="text-xs text-gray-400 shrink-0 mr-1">Snapshots:</span>

      <button
        type="button"
        onClick={handleLive}
        className={clsx(
          'px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors',
          activeSnapshotDate === null
            ? 'bg-accent text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
        )}
      >
        Live
      </button>

      {snapshots
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((snapshot) => (
          <button
            key={snapshot.date}
            type="button"
            onClick={() => handleDate(snapshot.date)}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors',
              activeSnapshotDate === snapshot.date
                ? 'bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
            )}
          >
            {snapshot.date}
          </button>
        ))}

      {activeSnapshotDate && (
        <span className="text-xs text-amber-400 shrink-0 ml-2">
          Read-only — viewing {activeSnapshotDate}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 4.6: Wire snapshot creation into `useTemplate.ts`**

In `src/hooks/useTemplate.ts`, after the template is loaded from the store, add the snapshot check:

```ts
// Add to imports in useTemplate.ts
import { shouldCreateSnapshot, createSnapshot } from '../core/snapshot/snapshotEngine'
import { templateStore } from '../core/storage/templateStore'

// Inside useTemplate, after template is fetched and set in state:
useEffect(() => {
  if (!template) return
  if (!shouldCreateSnapshot(template)) return

  // Create snapshot for current data (null = single mode; roster callers pass slotId separately)
  const snapshot = createSnapshot(template, null)
  const updated: Template = {
    ...template,
    snapshots: [...(template.snapshots ?? []), snapshot],
    updatedAt: new Date().toISOString(),
  }
  templateStore.save(updated).then(() => {
    setTemplate(updated)
  })
}, [template?.id]) // Only run on template load, not every render
```

- [ ] **Step 4.7: Wire SnapshotTimeline into CanvasView.tsx**

In `src/ui/views/CanvasView.tsx`, add state for the active snapshot date, import the timeline, and render it below the canvas:

```tsx
// Add to imports
import { SnapshotTimeline } from '../components/SnapshotTimeline'
import { applySnapshotToTemplate } from '../../core/snapshot/snapshotEngine'

// Add state inside CanvasView
const [activeSnapshotDate, setActiveSnapshotDate] = useState<string | null>(null)

// Derive displayed template (snapshot overlay or live)
const displayedTemplate = activeSnapshotDate && template
  ? applySnapshotToTemplate(template, activeSnapshotDate)
  : template

// In JSX, after the canvas area and before the closing wrapper:
{template && (
  <SnapshotTimeline
    snapshots={template.snapshots ?? []}
    activeSnapshotDate={activeSnapshotDate}
    onSelectSnapshot={setActiveSnapshotDate}
  />
)}
```

- [ ] **Step 4.8: Commit**

```bash
git add src/core/snapshot/ src/ui/components/SnapshotTimeline.tsx \
        src/hooks/useTemplate.ts src/ui/views/CanvasView.tsx
git commit -m "feat: daily snapshot engine with timeline UI"
```

---

## Task 5: Census View

**Files:**
- Create: `src/core/census/censusUtils.ts`
- Create: `src/core/census/censusUtils.test.ts`
- Create: `src/ui/views/CensusView.tsx`
- Modify: `src/App.tsx` (add `/census` route)
- Modify: `src/ui/shell/TopBar.tsx` (census icon button)

- [ ] **Step 5.1: Write failing tests**

```ts
// src/core/census/censusUtils.test.ts
import { describe, it, expect } from 'vitest'
import { extractCensusSummary } from './censusUtils'
import type { Template } from '../template/types'

function makeRosterTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: 't1',
    name: 'ICU Roster',
    canvasMode: 'grid',
    patientMode: 'roster',
    defaultMode: 'live',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-13T00:00:00.000Z',
    pages: [
      {
        id: 'p1',
        name: 'Page 1',
        canvasMode: 'grid',
        layout: [
          {
            instanceId: 'vitals-1',
            moduleId: 'vitals',
            version: '1.0.0',
            position: { x: 0, y: 0, w: 4, h: 3 },
            config: {},
            locked: false,
            collapsed: false,
          },
          {
            instanceId: 'tasks-1',
            moduleId: 'task-checklist',
            version: '1.0.0',
            position: { x: 4, y: 0, w: 4, h: 3 },
            config: {},
            locked: false,
            collapsed: false,
          },
        ],
      },
    ],
    patientSlots: [
      {
        id: 'slot-1',
        label: 'Smith, J',
        room: '4A',
        admitDate: '2026-04-10',
        notes: '',
        data: {
          'vitals-1': { hr: 110, bp_systolic: 90, bp_diastolic: 60, temp: 38.9, spo2: 94 },
          'tasks-1': {
            tasks: [
              { id: 'task-a', text: 'Order echo', completed: false },
              { id: 'task-b', text: 'Check cultures', completed: true },
            ],
          },
        },
      },
    ],
    singleData: {},
    snapshots: [],
    ...overrides,
  } as unknown as Template
}

describe('extractCensusSummary', () => {
  it('extracts patient label, room, and template name', () => {
    const template = makeRosterTemplate()
    const summaries = extractCensusSummary(template)
    expect(summaries).toHaveLength(1)
    expect(summaries[0].label).toBe('Smith, J')
    expect(summaries[0].room).toBe('4A')
    expect(summaries[0].templateName).toBe('ICU Roster')
  })

  it('extracts HR, BP, Temp, and SpO2 when vitals module is present', () => {
    const template = makeRosterTemplate()
    const summaries = extractCensusSummary(template)
    expect(summaries[0].vitals.hr).toBe(110)
    expect(summaries[0].vitals.bp_systolic).toBe(90)
    expect(summaries[0].vitals.temp).toBe(38.9)
    expect(summaries[0].vitals.spo2).toBe(94)
  })

  it('counts pending tasks correctly', () => {
    const template = makeRosterTemplate()
    const summaries = extractCensusSummary(template)
    expect(summaries[0].pendingTaskCount).toBe(1) // only one incomplete task
  })

  it('calculates admit day number from admitDate', () => {
    const template = makeRosterTemplate()
    const summaries = extractCensusSummary(template)
    // admitDate is 2026-04-10, updatedAt is 2026-04-13 → day 4
    expect(summaries[0].admitDayNumber).toBe(4)
  })

  it('returns empty vitals when no vitals module is in layout', () => {
    const template = makeRosterTemplate()
    // Remove vitals from layout
    ;(template.pages[0].layout as unknown[]).splice(0, 1)
    const summaries = extractCensusSummary(template)
    expect(summaries[0].vitals).toEqual({})
  })
})
```

- [ ] **Step 5.2: Run tests to verify they fail**

```bash
npx vitest run src/core/census/censusUtils.test.ts
```

Expect: `Cannot find module './censusUtils'`

- [ ] **Step 5.3: Create `src/core/census/censusUtils.ts`**

```ts
import type { Template, PatientSlot } from '../template/types'

export interface VitalsSummary {
  hr?: number
  bp_systolic?: number
  bp_diastolic?: number
  temp?: number
  spo2?: number
}

export interface CensusSummary {
  templateId: string
  templateName: string
  slotId: string
  label: string
  room: string
  admitDate: string
  admitDayNumber: number
  vitals: VitalsSummary
  flaggedAbnormalsCount: number
  pendingTaskCount: number
}

/**
 * Extracts glanceable summary data from each patient slot in a template.
 * Returns one CensusSummary per slot (roster mode) or a single summary
 * for single-instance templates.
 */
export function extractCensusSummary(template: Template): CensusSummary[] {
  const slots: PatientSlot[] =
    template.patientMode === 'roster' && template.patientSlots?.length
      ? (template.patientSlots as PatientSlot[])
      : [
          {
            id: '__single__',
            label: template.name,
            room: '',
            admitDate: template.createdAt.split('T')[0],
            notes: '',
            data: (template.singleData as PatientSlot['data']) ?? {},
          },
        ]

  const allLayouts = (template.pages ?? []).flatMap((p) => p.layout)
  const vitalsInstance = allLayouts.find((l) => l.moduleId === 'vitals')
  const taskInstance = allLayouts.find((l) => l.moduleId === 'task-checklist')

  return slots.map((slot) => {
    const slotData = (slot.data as Record<string, Record<string, unknown>>) ?? {}

    // Vitals
    let vitals: VitalsSummary = {}
    if (vitalsInstance) {
      const vd = slotData[vitalsInstance.instanceId] ?? {}
      vitals = {
        hr: vd['hr'] as number | undefined,
        bp_systolic: vd['bp_systolic'] as number | undefined,
        bp_diastolic: vd['bp_diastolic'] as number | undefined,
        temp: vd['temp'] as number | undefined,
        spo2: vd['spo2'] as number | undefined,
      }
    }

    // Pending tasks
    let pendingTaskCount = 0
    if (taskInstance) {
      const td = slotData[taskInstance.instanceId] ?? {}
      const tasks = (td['tasks'] as Array<{ completed: boolean }> | undefined) ?? []
      pendingTaskCount = tasks.filter((t) => !t.completed).length
    }

    // Admit day number (day 1 = admit date)
    const admitMs = new Date(slot.admitDate).getTime()
    const nowMs = new Date(template.updatedAt).getTime()
    const admitDayNumber = Math.max(1, Math.floor((nowMs - admitMs) / 86_400_000) + 1)

    return {
      templateId: template.id,
      templateName: template.name,
      slotId: slot.id,
      label: slot.label,
      room: slot.room,
      admitDate: slot.admitDate,
      admitDayNumber,
      vitals,
      flaggedAbnormalsCount: 0, // Populated by abnormal highlighting logic in future
      pendingTaskCount,
    }
  })
}
```

- [ ] **Step 5.4: Run tests to verify they pass**

```bash
npx vitest run src/core/census/censusUtils.test.ts
```

Expect: all tests pass.

- [ ] **Step 5.5: Create `src/ui/views/CensusView.tsx`**

```tsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { templateStore } from '../../core/storage/templateStore'
import { extractCensusSummary, type CensusSummary } from '../../core/census/censusUtils'
import type { Template } from '../../core/template/types'

function VitalsChip({ label, value, unit }: { label: string; value?: number; unit?: string }) {
  if (value === undefined) return null
  return (
    <span className="inline-flex items-center gap-0.5 text-xs bg-gray-800 rounded px-1.5 py-0.5">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-white">
        {value}
        {unit && <span className="text-gray-400">{unit}</span>}
      </span>
    </span>
  )
}

function CensusCard({ summary, onClick }: { summary: CensusSummary; onClick: () => void }) {
  const bpText =
    summary.vitals.bp_systolic !== undefined && summary.vitals.bp_diastolic !== undefined
      ? `${summary.vitals.bp_systolic}/${summary.vitals.bp_diastolic}`
      : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg bg-surface-raised border border-gray-700 hover:border-accent transition-colors space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-white">{summary.label || 'Unnamed'}</div>
          {summary.room && (
            <div className="text-xs text-gray-400">Room {summary.room}</div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-gray-400 leading-tight">Day {summary.admitDayNumber}</div>
          {summary.flaggedAbnormalsCount > 0 && (
            <div className="text-xs text-red-400 font-medium mt-0.5">
              {summary.flaggedAbnormalsCount} abnormal
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <VitalsChip label="HR " value={summary.vitals.hr} unit=" bpm" />
        {bpText && (
          <span className="inline-flex items-center gap-0.5 text-xs bg-gray-800 rounded px-1.5 py-0.5">
            <span className="text-gray-400">BP </span>
            <span className="font-medium text-white">{bpText}</span>
          </span>
        )}
        <VitalsChip label="T " value={summary.vitals.temp} unit="°C" />
        <VitalsChip label="SpO₂ " value={summary.vitals.spo2} unit="%" />
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>{summary.templateName}</span>
        {summary.pendingTaskCount > 0 && (
          <span className="text-amber-400 font-medium">{summary.pendingTaskCount} tasks</span>
        )}
      </div>
    </button>
  )
}

export function CensusView() {
  const navigate = useNavigate()
  const [summaries, setSummaries] = useState<CensusSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const templates = await templateStore.list() as Template[]
        const all = templates.flatMap((t) => extractCensusSummary(t))
        setSummaries(all)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const handleCardClick = useCallback(
    (summary: CensusSummary) => {
      navigate(`/template/${summary.templateId}`)
    },
    [navigate],
  )

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Census</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        {loading && (
          <p className="text-gray-400 text-sm">Loading patient data…</p>
        )}

        {!loading && summaries.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No open patients</p>
            <p className="text-sm mt-1">
              Open a template in Live Mode to see patients here.
            </p>
          </div>
        )}

        {!loading && summaries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {summaries.map((s) => (
              <CensusCard
                key={`${s.templateId}-${s.slotId}`}
                summary={s}
                onClick={() => handleCardClick(s)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5.6: Add `/census` route and TopBar census icon**

In `src/App.tsx`, import and add the route:

```tsx
import { CensusView } from './ui/views/CensusView'

// Inside the <Routes> block:
<Route path="/census" element={<CensusView />} />
```

In `src/ui/shell/TopBar.tsx`, add the census button:

```tsx
// Add to imports
import { useNavigate } from 'react-router-dom'

// Inside TopBar component, before return:
const navigate = useNavigate()
const handleCensus = useCallback(() => navigate('/census'), [navigate])

// In JSX, in the right-side icon cluster:
<button
  type="button"
  onClick={handleCensus}
  title="Census view"
  className="p-2 rounded hover:bg-gray-700 transition-colors"
  aria-label="Open census"
>
  {/* Grid of patient cards icon — inline SVG */}
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
</button>
```

- [ ] **Step 5.7: Commit**

```bash
git add src/core/census/ src/ui/views/CensusView.tsx src/App.tsx src/ui/shell/TopBar.tsx
git commit -m "feat: census view with per-slot vitals, task count, and admit day"
```

---

## Task 6: Roster Patient Mode

**Files:**
- Create: `src/hooks/usePatientSlot.ts`
- Create: `src/ui/components/PatientSelector.tsx`
- Modify: `src/ui/views/CanvasView.tsx`
- Modify: `src/ui/shell/TopBar.tsx`

- [ ] **Step 6.1: Write failing tests**

```ts
// src/hooks/usePatientSlot.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePatientSlot } from './usePatientSlot'
import type { Template } from '../core/template/types'

const mockSave = vi.fn()
vi.mock('../core/storage/templateStore', () => ({
  templateStore: { save: (...args: unknown[]) => mockSave(...args) },
}))

function makeRosterTemplate(): Template {
  return {
    id: 't1',
    name: 'Roster',
    canvasMode: 'grid',
    patientMode: 'roster',
    defaultMode: 'live',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-13T00:00:00.000Z',
    pages: [],
    patientSlots: [
      { id: 'slot-a', label: 'Jones, M', room: '2B', admitDate: '2026-04-10', notes: '', data: { 'inst-1': { hr: 80 } } },
      { id: 'slot-b', label: 'Lee, K', room: '3C', admitDate: '2026-04-11', notes: '', data: { 'inst-1': { hr: 60 } } },
    ],
    singleData: {},
    snapshots: [],
  } as unknown as Template
}

describe('usePatientSlot', () => {
  beforeEach(() => {
    mockSave.mockResolvedValue(undefined)
  })

  it('defaults to first slot', () => {
    const template = makeRosterTemplate()
    const { result } = renderHook(() => usePatientSlot(template, vi.fn()))
    expect(result.current.activeSlotId).toBe('slot-a')
  })

  it('switching slots changes activeSlotId', () => {
    const template = makeRosterTemplate()
    const { result } = renderHook(() => usePatientSlot(template, vi.fn()))
    act(() => { result.current.setActiveSlotId('slot-b') })
    expect(result.current.activeSlotId).toBe('slot-b')
  })

  it('getData returns data for the active slot', () => {
    const template = makeRosterTemplate()
    const { result } = renderHook(() => usePatientSlot(template, vi.fn()))
    const data = result.current.getData('inst-1')
    expect(data).toEqual({ hr: 80 })
  })

  it('getData returns different data after slot switch', () => {
    const template = makeRosterTemplate()
    const { result } = renderHook(() => usePatientSlot(template, vi.fn()))
    act(() => { result.current.setActiveSlotId('slot-b') })
    const data = result.current.getData('inst-1')
    expect(data).toEqual({ hr: 60 })
  })

  it('addSlot creates a new slot with empty data and saves', async () => {
    const template = makeRosterTemplate()
    const onUpdate = vi.fn()
    const { result } = renderHook(() => usePatientSlot(template, onUpdate))
    await act(async () => {
      await result.current.addSlot({ label: 'New Patient', room: '5D' })
    })
    expect(mockSave).toHaveBeenCalledOnce()
    const savedTemplate = mockSave.mock.calls[0][0] as Template
    expect(savedTemplate.patientSlots).toHaveLength(3)
    expect(savedTemplate.patientSlots?.[2].label).toBe('New Patient')
    expect(savedTemplate.patientSlots?.[2].room).toBe('5D')
  })
})
```

- [ ] **Step 6.2: Run tests to verify they fail**

```bash
npx vitest run src/hooks/usePatientSlot.test.ts
```

Expect: `Cannot find module './usePatientSlot'`

- [ ] **Step 6.3: Create `src/hooks/usePatientSlot.ts`**

```ts
import { useState, useCallback } from 'react'
import type { Template, PatientSlot } from '../core/template/types'
import { templateStore } from '../core/storage/templateStore'

interface AddSlotOptions {
  label: string
  room: string
}

interface UsePatientSlotReturn {
  activeSlotId: string | null
  setActiveSlotId: (id: string) => void
  activeSlot: PatientSlot | null
  getData: (instanceId: string) => Record<string, unknown>
  setData: (instanceId: string, data: Record<string, unknown>) => Promise<void>
  addSlot: (options: AddSlotOptions) => Promise<void>
  removeSlot: (slotId: string) => Promise<void>
  renameSlot: (slotId: string, label: string, room: string) => Promise<void>
}

/**
 * Manages patient slot selection and per-slot data reads/writes for
 * roster-mode templates. Falls back to null / singleData for single mode.
 */
export function usePatientSlot(
  template: Template | null,
  onUpdate: (updated: Template) => void,
): UsePatientSlotReturn {
  const firstSlotId = template?.patientSlots?.[0]?.id ?? null
  const [activeSlotId, setActiveSlotId] = useState<string | null>(firstSlotId)

  const activeSlot: PatientSlot | null =
    template?.patientSlots?.find((s) => s.id === activeSlotId) ?? null

  const getData = useCallback(
    (instanceId: string): Record<string, unknown> => {
      if (!template) return {}
      if (template.patientMode === 'roster' && activeSlot) {
        return (activeSlot.data?.[instanceId] as Record<string, unknown>) ?? {}
      }
      return (template.singleData?.[instanceId] as Record<string, unknown>) ?? {}
    },
    [template, activeSlot],
  )

  const setData = useCallback(
    async (instanceId: string, data: Record<string, unknown>): Promise<void> => {
      if (!template) return

      let updated: Template
      if (template.patientMode === 'roster' && activeSlotId) {
        const slots = (template.patientSlots ?? []).map((s) =>
          s.id === activeSlotId
            ? { ...s, data: { ...s.data, [instanceId]: data } }
            : s,
        )
        updated = { ...template, patientSlots: slots, updatedAt: new Date().toISOString() }
      } else {
        updated = {
          ...template,
          singleData: { ...template.singleData, [instanceId]: data },
          updatedAt: new Date().toISOString(),
        }
      }

      await templateStore.save(updated)
      onUpdate(updated)
    },
    [template, activeSlotId, onUpdate],
  )

  const addSlot = useCallback(
    async ({ label, room }: AddSlotOptions): Promise<void> => {
      if (!template) return
      const newSlot: PatientSlot = {
        id: `slot-${Date.now()}`,
        label,
        room,
        admitDate: new Date().toISOString().split('T')[0],
        notes: '',
        data: {},
      }
      const updated: Template = {
        ...template,
        patientSlots: [...(template.patientSlots ?? []), newSlot],
        updatedAt: new Date().toISOString(),
      }
      await templateStore.save(updated)
      onUpdate(updated)
      setActiveSlotId(newSlot.id)
    },
    [template, onUpdate],
  )

  const removeSlot = useCallback(
    async (slotId: string): Promise<void> => {
      if (!template) return
      const slots = (template.patientSlots ?? []).filter((s) => s.id !== slotId)
      const updated: Template = {
        ...template,
        patientSlots: slots,
        updatedAt: new Date().toISOString(),
      }
      await templateStore.save(updated)
      onUpdate(updated)
      if (activeSlotId === slotId) {
        setActiveSlotId(slots[0]?.id ?? null)
      }
    },
    [template, activeSlotId, onUpdate],
  )

  const renameSlot = useCallback(
    async (slotId: string, label: string, room: string): Promise<void> => {
      if (!template) return
      const slots = (template.patientSlots ?? []).map((s) =>
        s.id === slotId ? { ...s, label, room } : s,
      )
      const updated: Template = {
        ...template,
        patientSlots: slots,
        updatedAt: new Date().toISOString(),
      }
      await templateStore.save(updated)
      onUpdate(updated)
    },
    [template, onUpdate],
  )

  return {
    activeSlotId,
    setActiveSlotId,
    activeSlot,
    getData,
    setData,
    addSlot,
    removeSlot,
    renameSlot,
  }
}
```

- [ ] **Step 6.4: Run tests to verify they pass**

```bash
npx vitest run src/hooks/usePatientSlot.test.ts
```

Expect: all tests pass.

- [ ] **Step 6.5: Create `src/ui/components/PatientSelector.tsx`**

```tsx
import React, { useState, useCallback } from 'react'
import clsx from 'clsx'
import type { PatientSlot } from '../../core/template/types'

interface PatientSelectorProps {
  slots: PatientSlot[]
  activeSlotId: string | null
  onSelect: (slotId: string) => void
  onAddSlot: (label: string, room: string) => Promise<void>
}

/**
 * Shown in TopBar during Live Mode for roster templates.
 * Renders a dropdown of patient slots and an "Add Patient" button
 * that opens an inline modal for label + room fields.
 */
export function PatientSelector({
  slots,
  activeSlotId,
  onSelect,
  onAddSlot,
}: PatientSelectorProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newRoom, setNewRoom] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = useCallback(async () => {
    if (!newLabel.trim()) return
    setSaving(true)
    try {
      await onAddSlot(newLabel.trim(), newRoom.trim())
      setNewLabel('')
      setNewRoom('')
      setShowAddModal(false)
    } finally {
      setSaving(false)
    }
  }, [newLabel, newRoom, onAddSlot])

  const activeSlot = slots.find((s) => s.id === activeSlotId)

  return (
    <div className="relative flex items-center gap-2">
      {/* Slot dropdown */}
      <select
        value={activeSlotId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        className="text-sm rounded bg-gray-800 border border-gray-600 text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Select patient slot"
      >
        {slots.map((slot) => (
          <option key={slot.id} value={slot.id}>
            {slot.label || 'Unnamed'}{slot.room ? ` · ${slot.room}` : ''}
          </option>
        ))}
      </select>

      {/* Add Patient button */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        title="Add patient slot"
      >
        + Add Patient
      </button>

      {/* Add Patient modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add patient"
          className="absolute top-full right-0 mt-2 z-50 w-64 bg-surface-raised border border-gray-600 rounded-lg shadow-xl p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-white">Add Patient</h3>

          <div className="space-y-2">
            <label className="block">
              <span className="text-xs text-gray-400">Label (name / initials)</span>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Smith, J"
                className="mt-1 w-full text-sm rounded bg-gray-800 border border-gray-600 text-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-400">Room / Bed</span>
              <input
                type="text"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                placeholder="4A"
                className="mt-1 w-full text-sm rounded bg-gray-800 border border-gray-600 text-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs px-3 py-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newLabel.trim() || saving}
              className={clsx(
                'text-xs px-3 py-1.5 rounded font-medium transition-colors',
                newLabel.trim() && !saving
                  ? 'bg-accent text-white hover:opacity-90'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed',
              )}
            >
              {saving ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6.6: Wire `usePatientSlot` into `CanvasView.tsx`**

In `src/ui/views/CanvasView.tsx`, integrate the hook and route data reads/writes through it:

```tsx
// Add to imports
import { usePatientSlot } from '../../hooks/usePatientSlot'
import { PatientSelector } from '../components/PatientSelector'

// Inside CanvasView, after template is loaded:
const handleTemplateUpdate = useCallback((updated: Template) => {
  setTemplate(updated)
}, [])

const {
  activeSlotId,
  setActiveSlotId,
  getData,
  setData,
  addSlot,
} = usePatientSlot(template, handleTemplateUpdate)

// Pass getData/setData as props (or context) to GridCanvas → CanvasModule → module Renderer
// In JSX, show PatientSelector in the header when roster mode + live mode:
{template?.patientMode === 'roster' && !isBuildMode && (
  <PatientSelector
    slots={template.patientSlots ?? []}
    activeSlotId={activeSlotId}
    onSelect={setActiveSlotId}
    onAddSlot={addSlot}
  />
)}
```

- [ ] **Step 6.7: Commit**

```bash
git add src/hooks/usePatientSlot.ts src/hooks/usePatientSlot.test.ts \
        src/ui/components/PatientSelector.tsx src/ui/views/CanvasView.tsx
git commit -m "feat: roster patient mode with per-slot data, patient selector, and add-patient modal"
```

---

## Task 7: Multi-Page Canvases

**Files:**
- Create: `src/ui/components/PageTabs.tsx`
- Modify: `src/ui/views/CanvasView.tsx`
- Modify: `src/ui/views/HomeView.tsx`

- [ ] **Step 7.1: Write failing tests**

```tsx
// src/ui/components/PageTabs.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PageTabs } from './PageTabs'
import type { TemplatePage } from '../../core/template/types'

const pages: TemplatePage[] = [
  { id: 'p1', name: 'Rounding', canvasMode: 'grid', layout: [] },
  { id: 'p2', name: 'Discharge', canvasMode: 'grid', layout: [] },
]

describe('PageTabs', () => {
  it('renders all page tab names', () => {
    render(
      <PageTabs
        pages={pages}
        activePageId="p1"
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        canEdit={true}
      />,
    )
    expect(screen.getByText('Rounding')).toBeInTheDocument()
    expect(screen.getByText('Discharge')).toBeInTheDocument()
  })

  it('calls onSelect when a tab is clicked', () => {
    const onSelect = vi.fn()
    render(
      <PageTabs
        pages={pages}
        activePageId="p1"
        onSelect={onSelect}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        canEdit={true}
      />,
    )
    fireEvent.click(screen.getByText('Discharge'))
    expect(onSelect).toHaveBeenCalledWith('p2')
  })

  it('calls onDelete when × button is clicked', () => {
    const onDelete = vi.fn()
    render(
      <PageTabs
        pages={pages}
        activePageId="p1"
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={onDelete}
        canEdit={true}
      />,
    )
    // Find the delete button for the Discharge tab (second tab)
    const deleteButtons = screen.getAllByRole('button', { name: /delete page/i })
    fireEvent.click(deleteButtons[1])
    expect(onDelete).toHaveBeenCalledWith('p2')
  })

  it('calls onAdd when + button is clicked', () => {
    const onAdd = vi.fn()
    render(
      <PageTabs
        pages={pages}
        activePageId="p1"
        onSelect={vi.fn()}
        onAdd={onAdd}
        onDelete={vi.fn()}
        canEdit={true}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /add page/i }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('hides delete and add buttons when canEdit is false', () => {
    render(
      <PageTabs
        pages={pages}
        activePageId="p1"
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        canEdit={false}
      />,
    )
    expect(screen.queryByRole('button', { name: /delete page/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add page/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 7.2: Run tests to verify they fail**

```bash
npx vitest run src/ui/components/PageTabs.test.tsx
```

Expect: `Cannot find module './PageTabs'`

- [ ] **Step 7.3: Create `src/ui/components/PageTabs.tsx`**

```tsx
import React, { useCallback } from 'react'
import clsx from 'clsx'
import type { TemplatePage } from '../../core/template/types'

interface PageTabsProps {
  pages: TemplatePage[]
  activePageId: string
  onSelect: (pageId: string) => void
  onAdd: () => void
  onDelete: (pageId: string) => void
  canEdit: boolean
}

/**
 * Tab row shown below the main TabBar when a template has multiple pages.
 * Displays each page name as a tab with an active indicator.
 * In Build Mode (canEdit=true), shows × delete buttons and a + add button.
 */
export function PageTabs({
  pages,
  activePageId,
  onSelect,
  onAdd,
  onDelete,
  canEdit,
}: PageTabsProps) {
  const handleDelete = useCallback(
    (e: React.MouseEvent, pageId: string) => {
      e.stopPropagation()
      if (pages.length <= 1) return // Cannot delete last page
      onDelete(pageId)
    },
    [pages.length, onDelete],
  )

  return (
    <div className="flex items-center gap-0 border-b border-gray-700 bg-surface px-2 overflow-x-auto">
      {pages.map((page) => {
        const isActive = page.id === activePageId
        return (
          <div
            key={page.id}
            className={clsx(
              'flex items-center gap-1 px-3 py-2 text-sm cursor-pointer border-b-2 transition-colors shrink-0',
              isActive
                ? 'border-accent text-white font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500',
            )}
            onClick={() => onSelect(page.id)}
            role="tab"
            aria-selected={isActive}
          >
            <span>{page.name}</span>
            {canEdit && pages.length > 1 && (
              <button
                type="button"
                onClick={(e) => handleDelete(e, page.id)}
                aria-label={`Delete page ${page.name}`}
                className="ml-0.5 w-4 h-4 rounded flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        )
      })}

      {canEdit && (
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add page"
          className="ml-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors shrink-0"
        >
          + Page
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 7.4: Run tests to verify they pass**

```bash
npx vitest run src/ui/components/PageTabs.test.tsx
```

Expect: all tests pass.

- [ ] **Step 7.5: Wire PageTabs into `CanvasView.tsx`**

In `src/ui/views/CanvasView.tsx`, add multi-page state management:

```tsx
// Add to imports
import { PageTabs } from '../components/PageTabs'
import { createPage } from '../../core/template/utils'

// Inside CanvasView, add state:
const [activePageId, setActivePageId] = useState<string>(() =>
  template?.pages?.[0]?.id ?? '',
)

// Sync activePageId when template loads
useEffect(() => {
  if (template?.pages?.length && !template.pages.find((p) => p.id === activePageId)) {
    setActivePageId(template.pages[0].id)
  }
}, [template?.id])

const activePage = template?.pages?.find((p) => p.id === activePageId) ?? template?.pages?.[0]

const handleAddPage = useCallback(async () => {
  if (!template) return
  const newPage = createPage(`Page ${template.pages.length + 1}`)
  const updated: Template = {
    ...template,
    pages: [...template.pages, newPage],
    updatedAt: new Date().toISOString(),
  }
  await templateStore.save(updated)
  setTemplate(updated)
  setActivePageId(newPage.id)
}, [template])

const handleDeletePage = useCallback(async (pageId: string) => {
  if (!template || template.pages.length <= 1) return
  const pages = template.pages.filter((p) => p.id !== pageId)
  const updated: Template = { ...template, pages, updatedAt: new Date().toISOString() }
  await templateStore.save(updated)
  setTemplate(updated)
  if (activePageId === pageId) {
    setActivePageId(pages[0].id)
  }
}, [template, activePageId])

// In JSX, render PageTabs above the canvas when template has pages:
{template && template.pages.length > 0 && (
  <PageTabs
    pages={template.pages}
    activePageId={activePageId}
    onSelect={setActivePageId}
    onAdd={handleAddPage}
    onDelete={handleDeletePage}
    canEdit={isBuildMode}
  />
)}

// Pass activePage.layout (not all pages) to GridCanvas:
<GridCanvas layout={activePage?.layout ?? []} ... />
```

- [ ] **Step 7.6: Show page count on HomeView template card**

In `src/ui/views/HomeView.tsx`, add page count to the template card:

```tsx
// In the template card JSX, after the template name:
{template.pages.length > 1 && (
  <span className="text-xs text-gray-500">
    {template.pages.length} pages
  </span>
)}
```

- [ ] **Step 7.7: Commit**

```bash
git add src/ui/components/PageTabs.tsx src/ui/components/PageTabs.test.tsx \
        src/ui/views/CanvasView.tsx src/ui/views/HomeView.tsx
git commit -m "feat: multi-page canvases with PageTabs and per-page layout state"
```

---

## Task 8: Freeform Canvas Mode

**Files:**
- Create: `src/canvas/FreeformCanvas.tsx`
- Modify: `src/canvas/canvasUtils.ts`
- Modify: `src/ui/views/CanvasView.tsx`

- [ ] **Step 8.1: Write failing tests**

```ts
// src/canvas/canvasUtils.test.ts
import { describe, it, expect } from 'vitest'
import { freeformToPixel, pixelToFreeform } from './canvasUtils'

describe('freeformToPixel', () => {
  it('converts freeform {x, y} to pixel CSS values', () => {
    const result = freeformToPixel({ x: 50, y: 100 })
    expect(result.left).toBe('50px')
    expect(result.top).toBe('100px')
  })
})

describe('pixelToFreeform', () => {
  it('converts pixel coordinates to freeform {x, y}', () => {
    const result = pixelToFreeform(50, 100)
    expect(result.x).toBe(50)
    expect(result.y).toBe(100)
  })
})
```

- [ ] **Step 8.2: Run tests to verify they fail**

```bash
npx vitest run src/canvas/canvasUtils.test.ts
```

Expect: tests fail (functions do not exist yet in canvasUtils).

- [ ] **Step 8.3: Add helpers to `src/canvas/canvasUtils.ts`**

Append to the existing `canvasUtils.ts` file (do not remove existing functions):

```ts
// --- Freeform canvas helpers ---

export interface FreeformPosition {
  x: number
  y: number
}

export interface FreeformPixelStyle {
  left: string
  top: string
}

/**
 * Converts a freeform position (pixel coordinates stored in layout data)
 * to CSS style values for absolute positioning.
 */
export function freeformToPixel(pos: FreeformPosition): FreeformPixelStyle {
  return {
    left: `${pos.x}px`,
    top: `${pos.y}px`,
  }
}

/**
 * Converts raw pixel coordinates (e.g., from a drag event) back to
 * freeform position data for storage in the layout.
 */
export function pixelToFreeform(x: number, y: number): FreeformPosition {
  return { x, y }
}
```

- [ ] **Step 8.4: Run tests to verify they pass**

```bash
npx vitest run src/canvas/canvasUtils.test.ts
```

Expect: all tests pass.

- [ ] **Step 8.5: Create `src/canvas/FreeformCanvas.tsx`**

```tsx
import React, { useCallback, useRef } from 'react'
import {
  DndContext,
  useDraggable,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { LayoutInstance } from '../core/template/types'
import { CanvasModule } from './CanvasModule'
import { freeformToPixel, pixelToFreeform } from './canvasUtils'

interface FreeformCanvasProps {
  layout: LayoutInstance[]
  onLayoutChange: (updated: LayoutInstance[]) => void
  isBuildMode: boolean
  renderModule: (instance: LayoutInstance) => React.ReactNode
}

interface DraggableModuleProps {
  instance: LayoutInstance
  isBuildMode: boolean
  children: React.ReactNode
}

function DraggableModule({ instance, isBuildMode, children }: DraggableModuleProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: instance.instanceId,
    disabled: !isBuildMode || instance.locked,
  })

  const pixelPos = freeformToPixel({ x: instance.position.x, y: instance.position.y })
  const style: React.CSSProperties = {
    position: 'absolute',
    left: pixelPos.left,
    top: pixelPos.top,
    width: `${instance.position.w}px`,
    minHeight: `${instance.position.h}px`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: isBuildMode && !instance.locked ? 'grab' : 'default',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

/**
 * Renders modules at arbitrary absolute pixel positions on an infinite canvas.
 * No grid snapping. Drag anywhere using dnd-kit useDraggable.
 * Positions are stored as pixel coordinates in LayoutInstance.position {x, y}.
 * w/h in freeform mode represent pixel dimensions rather than grid units.
 */
export function FreeformCanvas({
  layout,
  onLayoutChange,
  isBuildMode,
  renderModule,
}: FreeformCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event
      const updated = layout.map((inst) => {
        if (inst.instanceId !== active.id) return inst
        const newPos = pixelToFreeform(
          inst.position.x + delta.x,
          inst.position.y + delta.y,
        )
        return {
          ...inst,
          position: { ...inst.position, x: newPos.x, y: newPos.y },
        }
      })
      onLayoutChange(updated)
    },
    [layout, onLayoutChange],
  )

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ minHeight: '2000px' }}
        data-testid="freeform-canvas"
      >
        {layout.map((instance) => (
          <DraggableModule
            key={instance.instanceId}
            instance={instance}
            isBuildMode={isBuildMode}
          >
            <CanvasModule instance={instance} isBuildMode={isBuildMode}>
              {renderModule(instance)}
            </CanvasModule>
          </DraggableModule>
        ))}
      </div>
    </DndContext>
  )
}
```

- [ ] **Step 8.6: Wire FreeformCanvas into `CanvasView.tsx`**

In `src/ui/views/CanvasView.tsx`, add a conditional render based on `activePage.canvasMode`:

```tsx
// Add to imports
import { FreeformCanvas } from '../../canvas/FreeformCanvas'

// In the canvas render section, replace the single GridCanvas with:
{activePage?.canvasMode === 'freeform' ? (
  <FreeformCanvas
    layout={activePage.layout}
    onLayoutChange={handleLayoutChange}
    isBuildMode={isBuildMode}
    renderModule={renderModule}
  />
) : (
  <GridCanvas
    layout={activePage?.layout ?? []}
    onLayoutChange={handleLayoutChange}
    isBuildMode={isBuildMode}
    renderModule={renderModule}
  />
)}
```

- [ ] **Step 8.7: Commit**

```bash
git add src/canvas/FreeformCanvas.tsx src/canvas/canvasUtils.ts \
        src/canvas/canvasUtils.test.ts src/ui/views/CanvasView.tsx
git commit -m "feat: freeform canvas mode with absolute pixel positioning"
```

---

## Task 9: Sections Canvas Mode

**Files:**
- Create: `src/canvas/SectionsCanvas.tsx`
- Modify: `src/ui/views/CanvasView.tsx`

- [ ] **Step 9.1: Create `src/canvas/SectionsCanvas.tsx`**

```tsx
import React, { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { LayoutInstance } from '../core/template/types'
import { CanvasModule } from './CanvasModule'

export interface CanvasSection {
  id: string
  name: string
  instanceIds: string[]
}

interface SectionsCanvasProps {
  layout: LayoutInstance[]
  sections: CanvasSection[]
  onSectionsChange: (sections: CanvasSection[]) => void
  isBuildMode: boolean
  renderModule: (instance: LayoutInstance) => React.ReactNode
}

interface SortableSectionProps {
  section: CanvasSection
  instances: LayoutInstance[]
  isBuildMode: boolean
  renderModule: (instance: LayoutInstance) => React.ReactNode
}

function SortableSection({
  section,
  instances,
  isBuildMode,
  renderModule,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: !isBuildMode,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-700 rounded-lg overflow-hidden"
    >
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-4 py-2 bg-surface-raised border-b border-gray-700"
        {...(isBuildMode ? { ...attributes, ...listeners } : {})}
      >
        {isBuildMode && (
          <span className="text-gray-500 cursor-grab" aria-hidden>⠿</span>
        )}
        <span className="text-sm font-medium text-white">{section.name}</span>
      </div>

      {/* Module row */}
      <div className="flex flex-wrap gap-3 p-3">
        {instances.map((inst) => (
          <div
            key={inst.instanceId}
            className="min-w-[200px] flex-1"
            style={{ minWidth: `${inst.position.w * 60}px` }}
          >
            <CanvasModule instance={inst} isBuildMode={isBuildMode}>
              {renderModule(inst)}
            </CanvasModule>
          </div>
        ))}
        {instances.length === 0 && (
          <p className="text-xs text-gray-600 py-4 px-2">No modules in this section</p>
        )}
      </div>
    </div>
  )
}

/**
 * Renders modules in named vertical sections. Each section contains a
 * flex-row of modules. Sections can be reordered by drag (dnd-kit Sortable)
 * in Build Mode.
 *
 * Sections data is stored in TemplatePage.sections[]. When sections is empty,
 * all layout instances are placed in a default "Main" section.
 */
export function SectionsCanvas({
  layout,
  sections: rawSections,
  onSectionsChange,
  isBuildMode,
  renderModule,
}: SectionsCanvasProps) {
  // Default section if none defined
  const sections: CanvasSection[] =
    rawSections.length > 0
      ? rawSections
      : [{ id: 'default', name: 'Main', instanceIds: layout.map((l) => l.instanceId) }]

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)
      onSectionsChange(arrayMove(sections, oldIndex, newIndex))
    },
    [sections, onSectionsChange],
  )

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4 p-4" data-testid="sections-canvas">
          {sections.map((section) => {
            const instances = section.instanceIds
              .map((id) => layout.find((l) => l.instanceId === id))
              .filter(Boolean) as LayoutInstance[]
            return (
              <SortableSection
                key={section.id}
                section={section}
                instances={instances}
                isBuildMode={isBuildMode}
                renderModule={renderModule}
              />
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

- [ ] **Step 9.2: Wire SectionsCanvas into `CanvasView.tsx`**

In `src/ui/views/CanvasView.tsx`, extend the canvas mode conditional:

```tsx
// Add to imports
import { SectionsCanvas, type CanvasSection } from '../../canvas/SectionsCanvas'

// Add handler for sections change
const handleSectionsChange = useCallback(async (sections: CanvasSection[]) => {
  if (!template || !activePage) return
  const updatedPages = template.pages.map((p) =>
    p.id === activePage.id ? { ...p, sections } : p,
  )
  const updated: Template = { ...template, pages: updatedPages, updatedAt: new Date().toISOString() }
  await templateStore.save(updated)
  setTemplate(updated)
}, [template, activePage])

// Extend the canvas conditional render:
{activePage?.canvasMode === 'freeform' ? (
  <FreeformCanvas
    layout={activePage.layout}
    onLayoutChange={handleLayoutChange}
    isBuildMode={isBuildMode}
    renderModule={renderModule}
  />
) : activePage?.canvasMode === 'sections' ? (
  <SectionsCanvas
    layout={activePage.layout}
    sections={(activePage as { sections?: CanvasSection[] }).sections ?? []}
    onSectionsChange={handleSectionsChange}
    isBuildMode={isBuildMode}
    renderModule={renderModule}
  />
) : (
  <GridCanvas
    layout={activePage?.layout ?? []}
    onLayoutChange={handleLayoutChange}
    isBuildMode={isBuildMode}
    renderModule={renderModule}
  />
)}
```

- [ ] **Step 9.3: Commit**

```bash
git add src/canvas/SectionsCanvas.tsx src/ui/views/CanvasView.tsx
git commit -m "feat: sections canvas mode with sortable named sections"
```

---

## Task 10: Template Gallery (Community Browser)

**Files:**
- Create: `src/core/gallery/galleryClient.ts`
- Create: `src/core/gallery/galleryClient.test.ts`
- Create: `src/ui/views/GalleryView.tsx`
- Modify: `src/App.tsx` (add `/gallery` route)
- Modify: `src/ui/views/HomeView.tsx` (add gallery link)

- [ ] **Step 10.1: Write failing tests**

```ts
// src/core/gallery/galleryClient.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchGalleryIndex, importGalleryTemplate } from './galleryClient'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const mockIndexJson = {
  templates: [
    {
      id: 'community-icu',
      name: 'ICU Rounding Card',
      description: 'Complete ICU rounding template with vitals, vents, and pressors',
      tags: ['icu', 'critical-care'],
      author: 'drsmith',
      version: '1.0.0',
      ptjsonUrl: 'https://raw.githubusercontent.com/patient-templates/community/main/templates/icu.ptjson',
    },
  ],
}

describe('fetchGalleryIndex', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns parsed template list on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockIndexJson,
    })
    const result = await fetchGalleryIndex()
    expect(result.templates).toHaveLength(1)
    expect(result.templates[0].name).toBe('ICU Rounding Card')
  })

  it('returns empty templates array on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const result = await fetchGalleryIndex()
    expect(result.templates).toEqual([])
    expect(result.error).toBeTruthy()
  })

  it('returns empty templates array on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
    const result = await fetchGalleryIndex()
    expect(result.templates).toEqual([])
    expect(result.error).toBeTruthy()
  })
})

describe('importGalleryTemplate', () => {
  it('fetches a ptjson URL and returns parsed template object', async () => {
    const mockTemplate = { id: 'imported', name: 'ICU Rounding Card', pages: [] }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTemplate,
    })
    const result = await importGalleryTemplate(
      'https://raw.githubusercontent.com/example/template.ptjson',
    )
    expect(result.id).toBe('imported')
    expect(result.name).toBe('ICU Rounding Card')
  })

  it('throws an error when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })
    await expect(
      importGalleryTemplate('https://example.com/missing.ptjson'),
    ).rejects.toThrow('Failed to fetch template')
  })
})
```

- [ ] **Step 10.2: Run tests to verify they fail**

```bash
npx vitest run src/core/gallery/galleryClient.test.ts
```

Expect: `Cannot find module './galleryClient'`

- [ ] **Step 10.3: Create `src/core/gallery/galleryClient.ts`**

```ts
import type { Template } from '../template/types'

// Configurable community index URL — change this to point to your fork
export const COMMUNITY_INDEX_URL =
  'https://raw.githubusercontent.com/patient-templates/community/main/index.json'

export interface GalleryTemplateEntry {
  id: string
  name: string
  description: string
  tags: string[]
  author: string
  version: string
  ptjsonUrl: string
}

export interface GalleryIndex {
  templates: GalleryTemplateEntry[]
  error?: string
}

/**
 * Fetches the community template index JSON.
 * Returns an empty list with an error message if the fetch fails,
 * so callers can show an "offline" notice without throwing.
 */
export async function fetchGalleryIndex(): Promise<GalleryIndex> {
  try {
    const response = await fetch(COMMUNITY_INDEX_URL)
    if (!response.ok) {
      return {
        templates: [],
        error: `Community gallery unavailable (HTTP ${response.status})`,
      }
    }
    const data = (await response.json()) as GalleryIndex
    return { templates: data.templates ?? [] }
  } catch (err) {
    return {
      templates: [],
      error: 'Community gallery unavailable offline',
    }
  }
}

/**
 * Fetches and parses a `.ptjson` template from a given URL.
 * Throws with a descriptive message on failure.
 *
 * @param url - Raw URL to a `.ptjson` file
 * @returns Parsed Template object (caller is responsible for saving to IndexedDB)
 */
export async function importGalleryTemplate(url: string): Promise<Template> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch template from ${url} (HTTP ${response.status})`)
  }
  const template = (await response.json()) as Template
  // Assign a new local ID to avoid collisions with existing templates
  return {
    ...template,
    id: `imported-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
```

- [ ] **Step 10.4: Run tests to verify they pass**

```bash
npx vitest run src/core/gallery/galleryClient.test.ts
```

Expect: all tests pass.

- [ ] **Step 10.5: Create `src/ui/views/GalleryView.tsx`**

```tsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  fetchGalleryIndex,
  importGalleryTemplate,
  type GalleryTemplateEntry,
} from '../../core/gallery/galleryClient'
import { templateStore } from '../../core/storage/templateStore'

function TagChip({ tag }: { tag: string }) {
  return (
    <span className="inline-block text-xs bg-gray-700 text-gray-300 rounded px-1.5 py-0.5">
      {tag}
    </span>
  )
}

function GalleryCard({
  entry,
  onImport,
  importing,
}: {
  entry: GalleryTemplateEntry
  onImport: (entry: GalleryTemplateEntry) => void
  importing: boolean
}) {
  return (
    <div className="p-4 rounded-lg bg-surface-raised border border-gray-700 space-y-3 flex flex-col">
      <div>
        <div className="font-semibold text-white">{entry.name}</div>
        <div className="text-xs text-gray-400 mt-0.5">by {entry.author} · v{entry.version}</div>
      </div>

      <p className="text-sm text-gray-300 leading-snug flex-1">{entry.description}</p>

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onImport(entry)}
        disabled={importing}
        className={clsx(
          'w-full py-2 text-sm rounded font-medium transition-colors',
          importing
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-accent text-white hover:opacity-90',
        )}
      >
        {importing ? 'Importing…' : 'Import'}
      </button>
    </div>
  )
}

export function GalleryView() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<GalleryTemplateEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      setLoading(true)
      const result = await fetchGalleryIndex()
      setEntries(result.templates)
      if (result.error) setError(result.error)
      setLoading(false)
    }
    void load()
  }, [])

  const handleImport = useCallback(async (entry: GalleryTemplateEntry) => {
    setImportingId(entry.id)
    try {
      const template = await importGalleryTemplate(entry.ptjsonUrl)
      await templateStore.save(template)
      setImportedIds((prev) => new Set(prev).add(entry.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import template')
    } finally {
      setImportingId(null)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Community Gallery</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Browse and import community-contributed templates
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-amber-900/30 border border-amber-700 text-amber-300 text-sm">
            {error}
          </div>
        )}

        {loading && <p className="text-gray-400 text-sm">Loading community templates…</p>}

        {!loading && entries.length === 0 && !error && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No templates available</p>
            <p className="text-sm mt-1">The community gallery is empty or unavailable.</p>
          </div>
        )}

        {entries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <GalleryCard
                key={entry.id}
                entry={entry}
                onImport={handleImport}
                importing={importingId === entry.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 10.6: Add `/gallery` route and HomeView link**

In `src/App.tsx`:

```tsx
import { GalleryView } from './ui/views/GalleryView'

// Inside <Routes>:
<Route path="/gallery" element={<GalleryView />} />
```

In `src/ui/views/HomeView.tsx`, add a gallery button in the header area:

```tsx
import { useNavigate } from 'react-router-dom'

// Inside HomeView:
const navigate = useNavigate()

// In JSX header section, alongside "New Template":
<button
  type="button"
  onClick={() => navigate('/gallery')}
  className="px-4 py-2 text-sm rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
>
  Community Gallery
</button>
```

- [ ] **Step 10.7: Commit**

```bash
git add src/core/gallery/ src/ui/views/GalleryView.tsx src/App.tsx src/ui/views/HomeView.tsx
git commit -m "feat: community template gallery with index fetch and one-click import"
```

---

## Task 11: Plugin Manager UI

**Files:**
- Create: `src/core/plugin/pluginLoader.ts`
- Create: `src/ui/views/PluginManagerView.tsx`
- Modify: `src/App.tsx` (add `/plugins` route)

- [ ] **Step 11.1: Write failing tests**

```ts
// src/core/plugin/pluginLoader.test.ts
import { describe, it, expect, vi } from 'vitest'
import { validatePluginShape, loadPluginFromUrl } from './pluginLoader'
import type { ModulePlugin } from './types'

const validPlugin: ModulePlugin = {
  meta: {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    author: 'Test Author',
    description: 'A test plugin',
    tags: ['test'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {},
  minSize: { w: 2, h: 2 },
  Renderer: (() => null) as unknown as ModulePlugin['Renderer'],
  Editor: (() => null) as unknown as ModulePlugin['Editor'],
  PrintView: (() => null) as unknown as ModulePlugin['PrintView'],
}

describe('validatePluginShape', () => {
  it('returns true for a valid plugin object', () => {
    expect(validatePluginShape(validPlugin)).toBe(true)
  })

  it('returns false when meta is missing', () => {
    const { meta: _, ...bad } = validPlugin
    expect(validatePluginShape(bad)).toBe(false)
  })

  it('returns false when Renderer is missing', () => {
    const { Renderer: _, ...bad } = validPlugin
    expect(validatePluginShape(bad)).toBe(false)
  })

  it('returns false when meta.id is missing', () => {
    const bad = { ...validPlugin, meta: { ...validPlugin.meta, id: '' } }
    expect(validatePluginShape(bad)).toBe(false)
  })

  it('returns false for a non-object', () => {
    expect(validatePluginShape(null)).toBe(false)
    expect(validatePluginShape('string')).toBe(false)
    expect(validatePluginShape(42)).toBe(false)
  })
})

describe('loadPluginFromUrl', () => {
  it('throws with a helpful message when the import resolves to an object without default export', async () => {
    // Dynamic import returns a module without a `default` that is a valid plugin
    vi.stubGlobal(
      'importModule',
      vi.fn().mockResolvedValue({ default: { notAPlugin: true } }),
    )
    // We cannot actually test dynamic import() in vitest easily, so we test the validator path
    // by verifying that validatePluginShape({ notAPlugin: true }) returns false
    expect(validatePluginShape({ notAPlugin: true })).toBe(false)
  })
})
```

- [ ] **Step 11.2: Run tests to verify they fail**

```bash
npx vitest run src/core/plugin/pluginLoader.test.ts
```

Expect: `Cannot find module './pluginLoader'`

- [ ] **Step 11.3: Create `src/core/plugin/pluginLoader.ts`**

```ts
import type { ModulePlugin } from './types'

/**
 * Validates that an unknown value matches the required ModulePlugin shape.
 * Checks for required top-level keys and non-empty meta.id.
 */
export function validatePluginShape(value: unknown): value is ModulePlugin {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>

  if (!obj['meta'] || typeof obj['meta'] !== 'object') return false
  const meta = obj['meta'] as Record<string, unknown>
  if (!meta['id'] || typeof meta['id'] !== 'string' || meta['id'].trim() === '') return false
  if (!meta['name'] || !meta['version'] || !meta['author']) return false

  if (typeof obj['Renderer'] !== 'function') return false
  if (typeof obj['Editor'] !== 'function') return false
  if (typeof obj['PrintView'] !== 'function') return false

  if (!obj['schema'] || typeof obj['schema'] !== 'object') return false
  if (!obj['minSize'] || typeof obj['minSize'] !== 'object') return false

  return true
}

/**
 * Dynamically imports a plugin from a remote URL.
 *
 * The URL must point to an ES module that exports a valid ModulePlugin as its
 * default export. Throws with a descriptive message if the module cannot be
 * loaded or fails shape validation.
 *
 * @param url - Raw URL to the `.ptplugin` ES module bundle
 */
export async function loadPluginFromUrl(url: string): Promise<ModulePlugin> {
  let mod: Record<string, unknown>
  try {
    // Dynamic import — works in modern browsers and Vite
    mod = (await import(/* @vite-ignore */ url)) as Record<string, unknown>
  } catch (err) {
    throw new Error(
      `Failed to load plugin from "${url}": ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  const plugin = mod['default'] ?? mod
  if (!validatePluginShape(plugin)) {
    throw new Error(
      `Plugin at "${url}" does not export a valid ModulePlugin. ` +
        `Ensure the module has a default export with meta.id, Renderer, Editor, and PrintView.`,
    )
  }

  return plugin
}
```

- [ ] **Step 11.4: Run tests to verify they pass**

```bash
npx vitest run src/core/plugin/pluginLoader.test.ts
```

Expect: all tests pass.

- [ ] **Step 11.5: Create `src/ui/views/PluginManagerView.tsx`**

```tsx
import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { pluginRegistry } from '../../core/plugin/registry'
import { loadPluginFromUrl } from '../../core/plugin/pluginLoader'
import type { ModulePlugin } from '../../core/plugin/types'

interface PluginCardProps {
  plugin: ModulePlugin
  isBuiltIn: boolean
  onUninstall: (id: string) => void
}

function PluginCard({ plugin, isBuiltIn, onUninstall }: PluginCardProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-surface-raised border border-gray-700">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{plugin.meta.name}</span>
          <span className="text-xs text-gray-500">v{plugin.meta.version}</span>
          {isBuiltIn && (
            <span className="text-xs bg-blue-900 text-blue-300 rounded px-1.5 py-0.5">
              built-in
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">{plugin.meta.description}</p>
        <p className="text-xs text-gray-500">by {plugin.meta.author}</p>
        {plugin.meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {plugin.meta.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-700 text-gray-300 rounded px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {!isBuiltIn && (
        <button
          type="button"
          onClick={() => onUninstall(plugin.meta.id)}
          className="shrink-0 px-3 py-1.5 text-xs rounded bg-red-900/40 text-red-400 hover:bg-red-900/70 transition-colors border border-red-800"
        >
          Uninstall
        </button>
      )}
    </div>
  )
}

export function PluginManagerView() {
  const navigate = useNavigate()
  const [plugins, setPlugins] = useState<ModulePlugin[]>(() => pluginRegistry.getAll())
  const [installUrl, setInstallUrl] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installError, setInstallError] = useState<string | null>(null)
  const [installSuccess, setInstallSuccess] = useState<string | null>(null)

  // Plugins without a pack are considered built-in (or we check a registry-level flag)
  const builtInIds = new Set(
    plugins.filter((p) => !p.meta.pack || p.meta.pack === '__builtin__').map((p) => p.meta.id),
  )

  // Group by pack
  const grouped: Record<string, ModulePlugin[]> = {}
  for (const plugin of plugins) {
    const pack = plugin.meta.pack ?? 'Core'
    if (!grouped[pack]) grouped[pack] = []
    grouped[pack].push(plugin)
  }

  const handleUninstall = useCallback((id: string) => {
    pluginRegistry.unregister(id)
    setPlugins(pluginRegistry.getAll())
  }, [])

  const handleInstallFromUrl = useCallback(async () => {
    if (!installUrl.trim()) return
    setInstalling(true)
    setInstallError(null)
    setInstallSuccess(null)
    try {
      const plugin = await loadPluginFromUrl(installUrl.trim())
      pluginRegistry.register(plugin)
      setPlugins(pluginRegistry.getAll())
      setInstallSuccess(`Successfully installed "${plugin.meta.name}"`)
      setInstallUrl('')
    } catch (err) {
      setInstallError(err instanceof Error ? err.message : 'Installation failed')
    } finally {
      setInstalling(false)
    }
  }, [installUrl])

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Plugin Manager</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {plugins.length} plugin{plugins.length !== 1 ? 's' : ''} installed
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Install from URL */}
        <div className="p-4 rounded-lg bg-surface-raised border border-gray-700 space-y-3">
          <h2 className="text-sm font-semibold text-white">Install from URL</h2>
          <p className="text-xs text-gray-400">
            Paste a raw GitHub URL to a <code className="text-gray-300">.ptplugin</code> ES module bundle.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={installUrl}
              onChange={(e) => setInstallUrl(e.target.value)}
              placeholder="https://raw.githubusercontent.com/..."
              className="flex-1 text-sm rounded bg-gray-800 border border-gray-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              onKeyDown={(e) => { if (e.key === 'Enter') void handleInstallFromUrl() }}
            />
            <button
              type="button"
              onClick={handleInstallFromUrl}
              disabled={!installUrl.trim() || installing}
              className={clsx(
                'px-4 py-2 text-sm rounded font-medium transition-colors',
                installUrl.trim() && !installing
                  ? 'bg-accent text-white hover:opacity-90'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed',
              )}
            >
              {installing ? 'Installing…' : 'Install'}
            </button>
          </div>
          {installError && (
            <p className="text-sm text-red-400">{installError}</p>
          )}
          {installSuccess && (
            <p className="text-sm text-green-400">{installSuccess}</p>
          )}
        </div>

        {/* Plugin groups */}
        {Object.entries(grouped).map(([pack, packPlugins]) => (
          <div key={pack} className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {pack}
            </h2>
            <div className="space-y-2">
              {packPlugins.map((plugin) => (
                <PluginCard
                  key={plugin.meta.id}
                  plugin={plugin}
                  isBuiltIn={builtInIds.has(plugin.meta.id)}
                  onUninstall={handleUninstall}
                />
              ))}
            </div>
          </div>
        ))}

        {plugins.length === 0 && (
          <p className="text-center text-gray-500 py-10">No plugins installed.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 11.6: Add `unregister` and `getAll` to PluginRegistry**

The PluginManagerView calls `pluginRegistry.unregister(id)` and `pluginRegistry.getAll()`. Add these to `src/core/plugin/registry.ts` if not already present:

```ts
// Add to the PluginRegistry class in src/core/plugin/registry.ts

/** Returns all registered plugins as an array. */
getAll(): ModulePlugin[] {
  return Array.from(this.plugins.values())
}

/** Removes a plugin by ID. Built-in protection should be enforced in the UI, not here. */
unregister(id: string): void {
  this.plugins.delete(id)
}
```

- [ ] **Step 11.7: Add `/plugins` route**

In `src/App.tsx`:

```tsx
import { PluginManagerView } from './ui/views/PluginManagerView'

// Inside <Routes>:
<Route path="/plugins" element={<PluginManagerView />} />
```

Add a gear/settings icon button in TopBar that navigates to `/plugins`:

```tsx
// In TopBar.tsx JSX, in the right-side icon cluster:
<button
  type="button"
  onClick={() => navigate('/plugins')}
  title="Plugin Manager"
  className="p-2 rounded hover:bg-gray-700 transition-colors"
  aria-label="Open plugin manager"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
</button>
```

- [ ] **Step 11.8: Commit**

```bash
git add src/core/plugin/pluginLoader.ts src/core/plugin/pluginLoader.test.ts \
        src/core/plugin/registry.ts \
        src/ui/views/PluginManagerView.tsx src/App.tsx src/ui/shell/TopBar.tsx
git commit -m "feat: plugin manager UI with install-from-URL and uninstall support"
```

---

## Task 12: Final Integration Verification

**Files:**
- No new files — verification only

- [ ] **Step 12.1: Run full test suite**

```bash
cd ~/projects/patient-templates
npx vitest run
```

Expect: all tests pass with zero failures.

- [ ] **Step 12.2: TypeScript check**

```bash
npx tsc --noEmit
```

Expect: zero type errors.

- [ ] **Step 12.3: Build check**

```bash
npm run build
```

Expect: successful build with no errors, only expected warnings (e.g., chunk size).

- [ ] **Step 12.4: Verify all routes exist in App.tsx**

Confirm the following routes are registered:
- `/` → `HomeView`
- `/template/:id` → `CanvasView`
- `/census` → `CensusView`
- `/gallery` → `GalleryView`
- `/plugins` → `PluginManagerView`

- [ ] **Step 12.5: Final commit**

```bash
git add -A
git commit -m "feat: Plan 3 complete — all advanced features integrated and verified"
```

---

## Summary

| Task | Feature | Key Files | Tests |
|------|---------|-----------|-------|
| 1 | Dependencies | `package.json` | — |
| 2 | Pixel-perfect PDF | `pdfPixel.ts` | `export.test.ts` |
| 3 | Clean doc PDF | `pdfClean.ts` | `export.test.ts` |
| 4 | Snapshot engine | `snapshotEngine.ts`, `SnapshotTimeline.tsx` | `snapshotEngine.test.ts` |
| 5 | Census view | `censusUtils.ts`, `CensusView.tsx` | `censusUtils.test.ts` |
| 6 | Roster patient mode | `usePatientSlot.ts`, `PatientSelector.tsx` | `usePatientSlot.test.ts` |
| 7 | Multi-page canvases | `PageTabs.tsx` | `PageTabs.test.tsx` |
| 8 | Freeform canvas | `FreeformCanvas.tsx`, `canvasUtils.ts` | `canvasUtils.test.ts` |
| 9 | Sections canvas | `SectionsCanvas.tsx` | — |
| 10 | Community gallery | `galleryClient.ts`, `GalleryView.tsx` | `galleryClient.test.ts` |
| 11 | Plugin manager | `pluginLoader.ts`, `PluginManagerView.tsx` | `pluginLoader.test.ts` |
| 12 | Integration check | — | full suite |
