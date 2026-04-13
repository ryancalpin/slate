# Patient Template Builder — Plan 4c-i-b: General Surgery / Post-Op Pack

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the General Surgery/Post-Op specialty pack (4 modules) for tracking surgical drains, wounds, post-op milestones, and ostomy output.

**Architecture:** Pack lives under `src/modules/packs/surgery/`. Imported by `src/modules/packs/index.ts`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/modules/packs/surgery/
├── index.ts
├── surgical-drains/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── surgical-drains.test.tsx
├── wound-assessment/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── wound-assessment.test.tsx
├── postop-checklist/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── postop-checklist.test.tsx
└── ostomy-tracker/
    ├── index.ts
    ├── Renderer.tsx
    ├── Editor.tsx
    ├── PrintView.tsx
    └── ostomy-tracker.test.tsx
```

---

## Task 1: surgical-drains module

**Data type:**
```ts
type DrainEntry = { date: string; shift: 'day' | 'evening' | 'night'; volumeMl: number }
type Drain = { name: string; character: string; entries: DrainEntry[] }
type SurgicalDrainsData = { drains: Drain[]; alertThresholdMl: number }
```

**Exported pure function:**
```ts
export function calcDailyDrainTotal(entries: Array<{ date: string; volumeMl: number }>, date: string): number
```

**Behavior:**
- Up to 4 drains. Each drain has name (text input), character dropdown (`serosanguinous | serous | bilious | hemorrhagic | purulent | chylous`), and entries.
- Entries table: date, shift (day/evening/night), volumeMl.
- Per drain: daily total auto-summed from entries for today's date. 3-day trend sparkline rendered as div-based bars (no SVG library needed).
- Configurable high-output alert threshold (default 500 mL/shift). Entries exceeding threshold highlight amber (`bg-amber-100 border-amber-400`).
- Add/remove drains (max 4). Add/remove entries per drain.
- Config: `{ alertThresholdMl: number }` (Editor lets user set this).
- `minSize: { w: 4, h: 4 }`

- [ ] **Step 1.1: Write failing test**

Create `src/modules/packs/surgery/surgical-drains/surgical-drains.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcDailyDrainTotal } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const baseData = {
  drains: [
    {
      name: 'JP #1',
      character: 'serosanguinous',
      entries: [
        { date: '2026-04-13', shift: 'day' as const, volumeMl: 120 },
        { date: '2026-04-13', shift: 'evening' as const, volumeMl: 80 },
        { date: '2026-04-12', shift: 'day' as const, volumeMl: 200 },
      ],
    },
  ],
  alertThresholdMl: 500,
}

describe('calcDailyDrainTotal', () => {
  it('sums entries for the given date only', () => {
    expect(calcDailyDrainTotal(baseData.drains[0].entries, '2026-04-13')).toBe(200)
  })

  it('returns 0 when no entries match the date', () => {
    expect(calcDailyDrainTotal(baseData.drains[0].entries, '2026-04-11')).toBe(0)
  })
})

describe('Renderer', () => {
  it('renders drain name and character', () => {
    render(
      <Renderer
        instanceId="test-1"
        config={{ alertThresholdMl: 500 }}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText('JP #1')).toBeTruthy()
    expect(screen.getByText(/serosanguinous/i)).toBeTruthy()
  })

  it('highlights entry that exceeds alert threshold', () => {
    const highData = {
      drains: [
        {
          name: 'Blake',
          character: 'hemorrhagic',
          entries: [{ date: '2026-04-13', shift: 'day' as const, volumeMl: 600 }],
        },
      ],
      alertThresholdMl: 500,
    }
    const { container } = render(
      <Renderer
        instanceId="test-2"
        config={{ alertThresholdMl: 500 }}
        data={highData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // amber highlight class should be present
    expect(container.innerHTML).toContain('amber')
  })

  it('shows Add Drain button in build mode', () => {
    render(
      <Renderer
        instanceId="test-3"
        config={{ alertThresholdMl: 500 }}
        data={{ drains: [], alertThresholdMl: 500 }}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getByText(/add drain/i)).toBeTruthy()
  })
})

describe('PrintView', () => {
  it('renders drain name in print view', () => {
    render(<PrintView config={{ alertThresholdMl: 500 }} data={baseData} />)
    expect(screen.getByText('JP #1')).toBeTruthy()
  })
})
```

- [ ] **Step 1.2: Run tests — expect FAIL**

```bash
npx vitest run src/modules/packs/surgery/surgical-drains/surgical-drains.test.tsx
```

- [ ] **Step 1.3: Implement `src/modules/packs/surgery/surgical-drains/index.ts`**

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export type DrainEntry = { date: string; shift: 'day' | 'evening' | 'night'; volumeMl: number }
export type Drain = { name: string; character: string; entries: DrainEntry[] }
export type SurgicalDrainsData = { drains: Drain[]; alertThresholdMl: number }

export function calcDailyDrainTotal(
  entries: Array<{ date: string; volumeMl: number }>,
  date: string
): number {
  return entries.filter(e => e.date === date).reduce((sum, e) => sum + e.volumeMl, 0)
}

const defaultData: SurgicalDrainsData = { drains: [], alertThresholdMl: 500 }

export const surgicalDrainsPlugin: ModulePlugin = {
  meta: {
    id: 'surgical-drains',
    name: 'Surgical Drains',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track up to 4 surgical drains with shift-based output entries, daily totals, and 3-day trend sparklines.',
    tags: ['surgery', 'drains', 'post-op', 'output'],
    pack: 'surgery',
  },
  schema: {
    config: { alertThresholdMl: { type: 'number' } },
    data: {},
  },
  defaultConfig: { alertThresholdMl: 500 },
  minSize: { w: 4, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 1.4: Implement `src/modules/packs/surgery/surgical-drains/Renderer.tsx`**

```tsx
import React, { useState } from 'react'
import type { FC } from 'react'
import { calcDailyDrainTotal, type SurgicalDrainsData, type Drain, type DrainEntry } from './index'

const CHARACTERS = ['serosanguinous', 'serous', 'bilious', 'hemorrhagic', 'purulent', 'chylous']
const SHIFTS: Array<'day' | 'evening' | 'night'> = ['day', 'evening', 'night']

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function last3Days(): string[] {
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (2 - i))
    return d.toISOString().slice(0, 10)
  })
}

function Sparkline({ entries }: { entries: Array<{ date: string; volumeMl: number }> }) {
  const days = last3Days()
  const totals = days.map(d => calcDailyDrainTotal(entries, d))
  const max = Math.max(...totals, 1)
  return (
    <div className="flex items-end gap-1 h-8 mt-1">
      {totals.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 w-5">
          <div
            className="w-4 bg-blue-400 rounded-sm"
            style={{ height: `${Math.round((val / max) * 28)}px` }}
            title={`${days[i]}: ${val} mL`}
          />
        </div>
      ))}
    </div>
  )
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const threshold = (config.alertThresholdMl as number) ?? 500
  const typedData = data as SurgicalDrainsData
  const drains: Drain[] = typedData.drains ?? []

  function updateDrains(next: Drain[]) {
    onDataChange({ ...typedData, drains: next })
  }

  function addDrain() {
    if (drains.length >= 4) return
    updateDrains([...drains, { name: `Drain ${drains.length + 1}`, character: 'serosanguinous', entries: [] }])
  }

  function removeDrain(idx: number) {
    updateDrains(drains.filter((_, i) => i !== idx))
  }

  function updateDrain(idx: number, patch: Partial<Drain>) {
    updateDrains(drains.map((d, i) => i === idx ? { ...d, ...patch } : d))
  }

  function addEntry(drainIdx: number) {
    const entry: DrainEntry = { date: today(), shift: 'day', volumeMl: 0 }
    const drain = drains[drainIdx]
    updateDrain(drainIdx, { entries: [...drain.entries, entry] })
  }

  function updateEntry(drainIdx: number, entryIdx: number, patch: Partial<DrainEntry>) {
    const drain = drains[drainIdx]
    const entries = drain.entries.map((e, i) => i === entryIdx ? { ...e, ...patch } : e)
    updateDrain(drainIdx, { entries })
  }

  function removeEntry(drainIdx: number, entryIdx: number) {
    const drain = drains[drainIdx]
    updateDrain(drainIdx, { entries: drain.entries.filter((_, i) => i !== entryIdx) })
  }

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Surgical Drains</h3>
        {drains.length < 4 && (
          <button
            onClick={addDrain}
            className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Drain
          </button>
        )}
      </div>

      {drains.map((drain, di) => {
        const dailyTotal = calcDailyDrainTotal(drain.entries, today())
        return (
          <div key={di} className="border border-gray-200 dark:border-gray-600 rounded p-2 space-y-2">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={drain.name}
                onChange={e => updateDrain(di, { name: e.target.value })}
                placeholder="Drain name"
              />
              <select
                className="text-sm border border-gray-300 dark:border-gray-500 rounded px-1 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={drain.character}
                onChange={e => updateDrain(di, { character: e.target.value })}
              >
                {CHARACTERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={() => removeDrain(di)}
                className="text-xs text-red-500 hover:text-red-700 px-1"
                title="Remove drain"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Today's total: <span className="font-semibold text-gray-700 dark:text-gray-200">{dailyTotal} mL</span>
              <Sparkline entries={drain.entries} />
            </div>

            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-1 pr-2">Date</th>
                  <th className="pb-1 pr-2">Shift</th>
                  <th className="pb-1 pr-2">Volume (mL)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {drain.entries.map((entry, ei) => {
                  const alert = entry.volumeMl > threshold
                  return (
                    <tr
                      key={ei}
                      className={alert ? 'bg-amber-100 border border-amber-400 rounded' : ''}
                    >
                      <td className="pr-2 py-0.5">
                        <input
                          type="date"
                          className="text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                          value={entry.date}
                          onChange={e => updateEntry(di, ei, { date: e.target.value })}
                        />
                      </td>
                      <td className="pr-2 py-0.5">
                        <select
                          className="text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                          value={entry.shift}
                          onChange={e => updateEntry(di, ei, { shift: e.target.value as DrainEntry['shift'] })}
                        >
                          {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="pr-2 py-0.5">
                        <input
                          type="number"
                          min={0}
                          className="w-16 text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                          value={entry.volumeMl}
                          onChange={e => updateEntry(di, ei, { volumeMl: Number(e.target.value) })}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => removeEntry(di, ei)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <button
              onClick={() => addEntry(di)}
              className="text-xs text-blue-600 hover:underline"
            >
              + Add entry
            </button>
          </div>
        )
      })}

      {drains.length === 0 && (
        <p className="text-xs text-gray-400 italic">No drains added. Click "Add Drain" to begin.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 1.5: Implement `src/modules/packs/surgery/surgical-drains/Editor.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const threshold = (config.alertThresholdMl as number) ?? 500

  return (
    <div className="space-y-3 p-2">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
          High-output alert threshold (mL/shift)
        </label>
        <input
          type="number"
          min={0}
          className="w-28 text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
          value={threshold}
          onChange={e => onConfigChange({ ...config, alertThresholdMl: Number(e.target.value) })}
        />
        <p className="text-xs text-gray-400 mt-1">
          Entries exceeding this value are highlighted amber.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 1.6: Implement `src/modules/packs/surgery/surgical-drains/PrintView.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'
import { calcDailyDrainTotal, type SurgicalDrainsData } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const typedData = data as SurgicalDrainsData
  const drains = typedData.drains ?? []

  return (
    <div className="text-sm space-y-4">
      <h3 className="font-bold text-base border-b pb-1">Surgical Drains</h3>
      {drains.map((drain, i) => {
        const today = new Date().toISOString().slice(0, 10)
        const dailyTotal = calcDailyDrainTotal(drain.entries, today)
        return (
          <div key={i} className="space-y-1">
            <p className="font-semibold">{drain.name} — <span className="font-normal italic">{drain.character}</span></p>
            <p className="text-xs">Today's total: {dailyTotal} mL</p>
            {drain.entries.length > 0 && (
              <table className="w-full text-xs border border-gray-300 border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-0.5 text-left">Date</th>
                    <th className="border border-gray-300 px-2 py-0.5 text-left">Shift</th>
                    <th className="border border-gray-300 px-2 py-0.5 text-left">Volume (mL)</th>
                  </tr>
                </thead>
                <tbody>
                  {drain.entries.map((e, j) => (
                    <tr key={j}>
                      <td className="border border-gray-300 px-2 py-0.5">{e.date}</td>
                      <td className="border border-gray-300 px-2 py-0.5">{e.shift}</td>
                      <td className="border border-gray-300 px-2 py-0.5">{e.volumeMl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      })}
      {drains.length === 0 && <p className="text-xs text-gray-400 italic">No drains recorded.</p>}
    </div>
  )
}
```

- [ ] **Step 1.7: Run tests — expect PASS**

```bash
npx vitest run src/modules/packs/surgery/surgical-drains/surgical-drains.test.tsx
```

- [ ] **Step 1.8: Commit**

```bash
git -C ~/projects/patient-templates add src/modules/packs/surgery/surgical-drains/
git -C ~/projects/patient-templates commit -m "feat(surgery): add surgical-drains module"
```

---

## Task 2: wound-assessment module

**Data type:**
```ts
type WoundAssessmentData = {
  location: string
  woundType: string
  vac: { mode: string; pressure: number; dressingDate: string } | null
  dehiscence: string
  description: string
  assessmentDate: string
}
```

**Behavior:**
- Wound location (text input). Wound type dropdown: `surgical incision | open abdomen | VAC | dehiscence | skin graft | other`.
- If `woundType === 'VAC'`: show VAC settings section (mode: continuous/intermittent, pressure: number in cmH2O, dressing change date).
- Dehiscence status dropdown: `none | superficial | partial | complete`.
- Wound description (textarea).
- Assessment date (date picker, defaults to today).
- Config: none (empty `{}`). `minSize: { w: 3, h: 4 }`

- [ ] **Step 2.1: Write failing test**

Create `src/modules/packs/surgery/wound-assessment/wound-assessment.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const baseData = {
  location: 'Right lower quadrant',
  woundType: 'surgical incision',
  vac: null,
  dehiscence: 'none',
  description: 'Clean, dry, intact',
  assessmentDate: '2026-04-13',
}

describe('Renderer', () => {
  it('renders wound location', () => {
    render(
      <Renderer
        instanceId="w-1"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Right lower quadrant')).toBeTruthy()
  })

  it('shows VAC settings when woundType is VAC', () => {
    const vacData = { ...baseData, woundType: 'VAC', vac: { mode: 'continuous', pressure: 125, dressingDate: '2026-04-12' } }
    render(
      <Renderer
        instanceId="w-2"
        config={{}}
        data={vacData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/VAC Settings/i)).toBeTruthy()
    expect(screen.getByDisplayValue('125')).toBeTruthy()
  })

  it('hides VAC settings when woundType is not VAC', () => {
    render(
      <Renderer
        instanceId="w-3"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.queryByText(/VAC Settings/i)).toBeNull()
  })

  it('calls onDataChange when location input changes', () => {
    const onChange = vi.fn()
    render(
      <Renderer
        instanceId="w-4"
        config={{}}
        data={baseData}
        onDataChange={onChange}
        mode="live"
      />
    )
    const input = screen.getByDisplayValue('Right lower quadrant')
    fireEvent.change(input, { target: { value: 'Midline' } })
    expect(onChange).toHaveBeenCalled()
  })
})

describe('PrintView', () => {
  it('renders wound location and type in print view', () => {
    render(<PrintView config={{}} data={baseData} />)
    expect(screen.getByText('Right lower quadrant')).toBeTruthy()
    expect(screen.getByText(/surgical incision/i)).toBeTruthy()
  })
})
```

- [ ] **Step 2.2: Run tests — expect FAIL**

```bash
npx vitest run src/modules/packs/surgery/wound-assessment/wound-assessment.test.tsx
```

- [ ] **Step 2.3: Implement `src/modules/packs/surgery/wound-assessment/index.ts`**

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export type VacSettings = { mode: string; pressure: number; dressingDate: string }
export type WoundAssessmentData = {
  location: string
  woundType: string
  vac: VacSettings | null
  dehiscence: string
  description: string
  assessmentDate: string
}

export const woundAssessmentPlugin: ModulePlugin = {
  meta: {
    id: 'wound-assessment',
    name: 'Wound Assessment',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Document wound location, type, VAC settings, dehiscence status, and narrative description.',
    tags: ['surgery', 'wound', 'post-op', 'VAC'],
    pack: 'surgery',
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 2.4: Implement `src/modules/packs/surgery/wound-assessment/Renderer.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'
import type { WoundAssessmentData, VacSettings } from './index'

const WOUND_TYPES = ['surgical incision', 'open abdomen', 'VAC', 'dehiscence', 'skin graft', 'other']
const DEHISCENCE_OPTIONS = ['none', 'superficial', 'partial', 'complete']
const VAC_MODES = ['continuous', 'intermittent']

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange }) => {
  const d = data as WoundAssessmentData

  function update(patch: Partial<WoundAssessmentData>) {
    onDataChange({ ...d, ...patch })
  }

  function updateVac(patch: Partial<VacSettings>) {
    const current: VacSettings = d.vac ?? { mode: 'continuous', pressure: 125, dressingDate: '' }
    onDataChange({ ...d, vac: { ...current, ...patch } })
  }

  function handleTypeChange(woundType: string) {
    update({
      woundType,
      vac: woundType === 'VAC' ? (d.vac ?? { mode: 'continuous', pressure: 125, dressingDate: '' }) : null,
    })
  }

  return (
    <div className="p-3 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Wound Assessment</h3>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Location</label>
        <input
          className="w-full text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
          value={d.location ?? ''}
          onChange={e => update({ location: e.target.value })}
          placeholder="e.g. Right lower quadrant"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Wound Type</label>
        <select
          className="w-full text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
          value={d.woundType ?? 'surgical incision'}
          onChange={e => handleTypeChange(e.target.value)}
        >
          {WOUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {d.woundType === 'VAC' && (
        <div className="border border-blue-200 dark:border-blue-700 rounded p-2 space-y-2 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">VAC Settings</p>
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-0.5">Mode</label>
              <select
                className="text-sm border border-gray-300 dark:border-gray-500 rounded px-1 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={d.vac?.mode ?? 'continuous'}
                onChange={e => updateVac({ mode: e.target.value })}
              >
                {VAC_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-0.5">Pressure (cmH₂O)</label>
              <input
                type="number"
                className="w-20 text-sm border border-gray-300 dark:border-gray-500 rounded px-1 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={d.vac?.pressure ?? 125}
                onChange={e => updateVac({ pressure: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-0.5">Dressing Change Date</label>
              <input
                type="date"
                className="text-sm border border-gray-300 dark:border-gray-500 rounded px-1 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={d.vac?.dressingDate ?? ''}
                onChange={e => updateVac({ dressingDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Dehiscence Status</label>
        <select
          className="w-full text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
          value={d.dehiscence ?? 'none'}
          onChange={e => update({ dehiscence: e.target.value })}
        >
          {DEHISCENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
        <textarea
          className="w-full text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100 resize-y"
          rows={3}
          value={d.description ?? ''}
          onChange={e => update({ description: e.target.value })}
          placeholder="Wound appearance, drainage, surrounding tissue..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Assessment Date</label>
        <input
          type="date"
          className="text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
          value={d.assessmentDate ?? new Date().toISOString().slice(0, 10)}
          onChange={e => update({ assessmentDate: e.target.value })}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2.5: Implement `src/modules/packs/surgery/wound-assessment/Editor.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-2 text-xs text-gray-500 dark:text-gray-400 italic">
      No configuration options for this module.
    </div>
  )
}
```

- [ ] **Step 2.6: Implement `src/modules/packs/surgery/wound-assessment/PrintView.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'
import type { WoundAssessmentData } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as WoundAssessmentData

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base border-b pb-1">Wound Assessment</h3>
      <p><span className="font-semibold">Location:</span> {d.location}</p>
      <p><span className="font-semibold">Type:</span> {d.woundType}</p>
      {d.vac && (
        <div className="pl-3 border-l-2 border-blue-300 space-y-0.5">
          <p className="font-semibold text-xs">VAC Settings</p>
          <p className="text-xs">Mode: {d.vac.mode} | Pressure: {d.vac.pressure} cmH₂O | Dressing change: {d.vac.dressingDate || '—'}</p>
        </div>
      )}
      <p><span className="font-semibold">Dehiscence:</span> {d.dehiscence}</p>
      <p><span className="font-semibold">Description:</span> {d.description}</p>
      <p><span className="font-semibold">Assessment Date:</span> {d.assessmentDate}</p>
    </div>
  )
}
```

- [ ] **Step 2.7: Run tests — expect PASS**

```bash
npx vitest run src/modules/packs/surgery/wound-assessment/wound-assessment.test.tsx
```

- [ ] **Step 2.8: Commit**

```bash
git -C ~/projects/patient-templates add src/modules/packs/surgery/wound-assessment/
git -C ~/projects/patient-templates commit -m "feat(surgery): add wound-assessment module"
```

---

## Task 3: postop-checklist module

**Data type:**
```ts
type Milestone = { id: string; label: string; completed: boolean; completedAt: string }
type PostopChecklistData = { milestones: Milestone[] }
```

**Default milestones (9 items):**
1. Ambulation
2. Foley removal
3. Diet advancement (NPO → clears → regular)
4. Oral pain control tolerating
5. Incentive spirometry ×10/hr
6. DVT prophylaxis started
7. Surgical drain removal criteria met
8. Staple/suture removal date set
9. Discharge criteria met

**Behavior:**
- Each milestone has a checkbox. Checking auto-records `completedAt` as current datetime ISO string. Unchecking clears `completedAt`.
- Milestone label is editable inline.
- Add milestone (appends with empty label). Remove any milestone.
- Progress bar: "X of Y complete" with a simple div-based progress bar.
- Config: none. `minSize: { w: 3, h: 5 }`

- [ ] **Step 3.1: Write failing test**

Create `src/modules/packs/surgery/postop-checklist/postop-checklist.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DEFAULT_MILESTONES } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const makeMilestones = (overrides: Partial<typeof DEFAULT_MILESTONES[0]>[] = []) =>
  DEFAULT_MILESTONES.map((m, i) => ({ ...m, ...(overrides[i] ?? {}) }))

describe('DEFAULT_MILESTONES', () => {
  it('has 9 default milestones', () => {
    expect(DEFAULT_MILESTONES).toHaveLength(9)
  })

  it('first milestone is Ambulation', () => {
    expect(DEFAULT_MILESTONES[0].label).toMatch(/ambulation/i)
  })
})

describe('Renderer', () => {
  it('renders all milestone labels', () => {
    const data = { milestones: makeMilestones() }
    render(
      <Renderer
        instanceId="poc-1"
        config={{}}
        data={data}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/ambulation/i)).toBeTruthy()
    expect(screen.getByText(/foley/i)).toBeTruthy()
    expect(screen.getByText(/discharge criteria/i)).toBeTruthy()
  })

  it('shows progress as "X of Y complete"', () => {
    const milestones = makeMilestones()
    milestones[0].completed = true
    milestones[0].completedAt = '2026-04-13T10:00:00Z'
    render(
      <Renderer
        instanceId="poc-2"
        config={{}}
        data={{ milestones }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/1 of 9/i)).toBeTruthy()
  })

  it('calls onDataChange when a milestone is checked', () => {
    const onChange = vi.fn()
    const data = { milestones: makeMilestones() }
    render(
      <Renderer
        instanceId="poc-3"
        config={{}}
        data={data}
        onDataChange={onChange}
        mode="live"
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    expect(onChange).toHaveBeenCalled()
    const call = onChange.mock.calls[0][0] as { milestones: typeof DEFAULT_MILESTONES }
    expect(call.milestones[0].completed).toBe(true)
    expect(call.milestones[0].completedAt).not.toBe('')
  })

  it('shows Add Milestone button', () => {
    render(
      <Renderer
        instanceId="poc-4"
        config={{}}
        data={{ milestones: [] }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/add milestone/i)).toBeTruthy()
  })
})

describe('PrintView', () => {
  it('renders milestones in print view', () => {
    render(<PrintView config={{}} data={{ milestones: makeMilestones() }} />)
    expect(screen.getByText(/ambulation/i)).toBeTruthy()
  })
})
```

- [ ] **Step 3.2: Run tests — expect FAIL**

```bash
npx vitest run src/modules/packs/surgery/postop-checklist/postop-checklist.test.tsx
```

- [ ] **Step 3.3: Implement `src/modules/packs/surgery/postop-checklist/index.ts`**

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export type Milestone = { id: string; label: string; completed: boolean; completedAt: string }
export type PostopChecklistData = { milestones: Milestone[] }

export const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'm-1', label: 'Ambulation', completed: false, completedAt: '' },
  { id: 'm-2', label: 'Foley removal', completed: false, completedAt: '' },
  { id: 'm-3', label: 'Diet advancement (NPO → clears → regular)', completed: false, completedAt: '' },
  { id: 'm-4', label: 'Oral pain control tolerating', completed: false, completedAt: '' },
  { id: 'm-5', label: 'Incentive spirometry ×10/hr', completed: false, completedAt: '' },
  { id: 'm-6', label: 'DVT prophylaxis started', completed: false, completedAt: '' },
  { id: 'm-7', label: 'Surgical drain removal criteria met', completed: false, completedAt: '' },
  { id: 'm-8', label: 'Staple/suture removal date set', completed: false, completedAt: '' },
  { id: 'm-9', label: 'Discharge criteria met', completed: false, completedAt: '' },
]

export const postopChecklistPlugin: ModulePlugin = {
  meta: {
    id: 'postop-checklist',
    name: 'Post-Op Checklist',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Configurable post-operative milestone checklist with progress tracking and completion timestamps.',
    tags: ['surgery', 'post-op', 'checklist', 'milestones'],
    pack: 'surgery',
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {},
  minSize: { w: 3, h: 5 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 3.4: Implement `src/modules/packs/surgery/postop-checklist/Renderer.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'
import { type PostopChecklistData, type Milestone } from './index'

let _idCounter = 0
function uid() { return `ms-${Date.now()}-${++_idCounter}` }

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange }) => {
  const d = data as PostopChecklistData
  const milestones: Milestone[] = d.milestones ?? []

  const completed = milestones.filter(m => m.completed).length
  const total = milestones.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  function updateMilestones(next: Milestone[]) {
    onDataChange({ ...d, milestones: next })
  }

  function toggle(id: string) {
    updateMilestones(milestones.map(m => {
      if (m.id !== id) return m
      const completed = !m.completed
      return { ...m, completed, completedAt: completed ? new Date().toISOString() : '' }
    }))
  }

  function updateLabel(id: string, label: string) {
    updateMilestones(milestones.map(m => m.id === id ? { ...m, label } : m))
  }

  function addMilestone() {
    updateMilestones([...milestones, { id: uid(), label: '', completed: false, completedAt: '' }])
  }

  function removeMilestone(id: string) {
    updateMilestones(milestones.filter(m => m.id !== id))
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Post-Op Checklist</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{completed} of {total} complete</span>
      </div>

      {total > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <ul className="space-y-1.5">
        {milestones.map(m => (
          <li key={m.id} className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 cursor-pointer"
              checked={m.completed}
              onChange={() => toggle(m.id)}
            />
            <input
              className="flex-1 text-sm border-0 border-b border-transparent focus:border-gray-300 bg-transparent dark:text-gray-100 outline-none"
              value={m.label}
              onChange={e => updateLabel(m.id, e.target.value)}
              placeholder="Milestone description..."
            />
            {m.completedAt && (
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(m.completedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => removeMilestone(m.id)}
              className="text-red-400 hover:text-red-600 text-xs ml-1"
              title="Remove milestone"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={addMilestone}
        className="text-xs text-blue-600 hover:underline"
      >
        + Add Milestone
      </button>
    </div>
  )
}
```

- [ ] **Step 3.5: Implement `src/modules/packs/surgery/postop-checklist/Editor.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-2 text-xs text-gray-500 dark:text-gray-400 italic">
      No configuration options. Milestones are managed directly in the module.
    </div>
  )
}
```

- [ ] **Step 3.6: Implement `src/modules/packs/surgery/postop-checklist/PrintView.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'
import type { PostopChecklistData } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as PostopChecklistData
  const milestones = d.milestones ?? []
  const completed = milestones.filter(m => m.completed).length

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base border-b pb-1">Post-Op Checklist</h3>
      <p className="text-xs text-gray-500">{completed} of {milestones.length} complete</p>
      <ul className="space-y-1">
        {milestones.map(m => (
          <li key={m.id} className="flex items-start gap-2">
            <span className={`mt-0.5 inline-block w-4 h-4 border rounded text-center text-xs leading-4 ${m.completed ? 'bg-green-500 text-white border-green-500' : 'border-gray-400'}`}>
              {m.completed ? '✓' : ''}
            </span>
            <span className={m.completed ? 'line-through text-gray-400' : ''}>{m.label}</span>
            {m.completedAt && (
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(m.completedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 3.7: Run tests — expect PASS**

```bash
npx vitest run src/modules/packs/surgery/postop-checklist/postop-checklist.test.tsx
```

- [ ] **Step 3.8: Commit**

```bash
git -C ~/projects/patient-templates add src/modules/packs/surgery/postop-checklist/
git -C ~/projects/patient-templates commit -m "feat(surgery): add postop-checklist module"
```

---

## Task 4: ostomy-tracker module

**Data type:**
```ts
type OstomyEntry = { date: string; shift: string; volumeMl: number; character: string }
type OstomyTrackerData = {
  stomaType: string
  entries: OstomyEntry[]
  skinStatus: string
  lastApplianceChange: string
}
```

**Behavior:**
- Stoma type dropdown: `colostomy | ileostomy | urostomy | jejunostomy`.
- Output entries table (add rows): date, shift (day/evening/night), volumeMl (number), character (liquid/pasty/formed/urine/bilious).
- Peristomal skin status dropdown: `intact | moist | irritated | breakdown`.
- Appliance last changed date (date picker).
- Daily output total: auto-sums volumeMl for today's date.
- 3-day trend sparkline: div-based bars (same pattern as surgical-drains).
- Config: none. `minSize: { w: 3, h: 4 }`

- [ ] **Step 4.1: Write failing test**

Create `src/modules/packs/surgery/ostomy-tracker/ostomy-tracker.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const today = new Date().toISOString().slice(0, 10)

const baseData = {
  stomaType: 'ileostomy',
  entries: [
    { date: today, shift: 'day', volumeMl: 300, character: 'liquid' },
    { date: today, shift: 'evening', volumeMl: 200, character: 'liquid' },
  ],
  skinStatus: 'intact',
  lastApplianceChange: '2026-04-12',
}

describe('Renderer', () => {
  it('renders stoma type selector', () => {
    render(
      <Renderer
        instanceId="ot-1"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('ileostomy')).toBeTruthy()
  })

  it('shows correct daily output total', () => {
    render(
      <Renderer
        instanceId="ot-2"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/500 mL/)).toBeTruthy()
  })

  it('renders entry rows', () => {
    render(
      <Renderer
        instanceId="ot-3"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getAllByDisplayValue('liquid').length).toBeGreaterThan(0)
  })

  it('calls onDataChange when Add Entry is clicked', () => {
    const onChange = vi.fn()
    render(
      <Renderer
        instanceId="ot-4"
        config={{}}
        data={{ ...baseData, entries: [] }}
        onDataChange={onChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText(/add entry/i))
    expect(onChange).toHaveBeenCalled()
  })

  it('renders skin status selector', () => {
    render(
      <Renderer
        instanceId="ot-5"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('intact')).toBeTruthy()
  })
})

describe('PrintView', () => {
  it('renders stoma type and skin status in print view', () => {
    render(<PrintView config={{}} data={baseData} />)
    expect(screen.getByText(/ileostomy/i)).toBeTruthy()
    expect(screen.getByText(/intact/i)).toBeTruthy()
  })
})
```

- [ ] **Step 4.2: Run tests — expect FAIL**

```bash
npx vitest run src/modules/packs/surgery/ostomy-tracker/ostomy-tracker.test.tsx
```

- [ ] **Step 4.3: Implement `src/modules/packs/surgery/ostomy-tracker/index.ts`**

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export type OstomyEntry = { date: string; shift: string; volumeMl: number; character: string }
export type OstomyTrackerData = {
  stomaType: string
  entries: OstomyEntry[]
  skinStatus: string
  lastApplianceChange: string
}

export const ostomyTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'ostomy-tracker',
    name: 'Ostomy Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track ostomy output by shift, stoma type, character, peristomal skin status, and appliance changes.',
    tags: ['surgery', 'ostomy', 'post-op', 'output', 'stoma'],
    pack: 'surgery',
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 4.4: Implement `src/modules/packs/surgery/ostomy-tracker/Renderer.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'
import type { OstomyTrackerData, OstomyEntry } from './index'

const STOMA_TYPES = ['colostomy', 'ileostomy', 'urostomy', 'jejunostomy']
const SHIFTS = ['day', 'evening', 'night']
const CHARACTERS = ['liquid', 'pasty', 'formed', 'urine', 'bilious']
const SKIN_STATUSES = ['intact', 'moist', 'irritated', 'breakdown']

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function last3Days(): string[] {
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (2 - i))
    return d.toISOString().slice(0, 10)
  })
}

function dailyTotal(entries: OstomyEntry[], date: string): number {
  return entries.filter(e => e.date === date).reduce((sum, e) => sum + e.volumeMl, 0)
}

function Sparkline({ entries }: { entries: OstomyEntry[] }) {
  const days = last3Days()
  const totals = days.map(d => dailyTotal(entries, d))
  const max = Math.max(...totals, 1)
  return (
    <div className="flex items-end gap-1 h-8 mt-1">
      {totals.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 w-5">
          <div
            className="w-4 bg-purple-400 rounded-sm"
            style={{ height: `${Math.round((val / max) * 28)}px` }}
            title={`${days[i]}: ${val} mL`}
          />
        </div>
      ))}
    </div>
  )
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange }) => {
  const d = data as OstomyTrackerData
  const entries: OstomyEntry[] = d.entries ?? []
  const total = dailyTotal(entries, today())

  function update(patch: Partial<OstomyTrackerData>) {
    onDataChange({ ...d, ...patch })
  }

  function addEntry() {
    const entry: OstomyEntry = { date: today(), shift: 'day', volumeMl: 0, character: 'liquid' }
    update({ entries: [...entries, entry] })
  }

  function updateEntry(idx: number, patch: Partial<OstomyEntry>) {
    update({ entries: entries.map((e, i) => i === idx ? { ...e, ...patch } : e) })
  }

  function removeEntry(idx: number) {
    update({ entries: entries.filter((_, i) => i !== idx) })
  }

  return (
    <div className="p-3 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Ostomy Tracker</h3>

      <div className="flex gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Stoma Type</label>
          <select
            className="text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
            value={d.stomaType ?? 'ileostomy'}
            onChange={e => update({ stomaType: e.target.value })}
          >
            {STOMA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Peristomal Skin</label>
          <select
            className="text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
            value={d.skinStatus ?? 'intact'}
            onChange={e => update({ skinStatus: e.target.value })}
          >
            {SKIN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Last Appliance Change</label>
          <input
            type="date"
            className="text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
            value={d.lastApplianceChange ?? ''}
            onChange={e => update({ lastApplianceChange: e.target.value })}
          />
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Today's total output: <span className="font-semibold text-gray-700 dark:text-gray-200">{total} mL</span>
        <Sparkline entries={entries} />
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-left text-gray-500 dark:text-gray-400">
            <th className="pb-1 pr-2">Date</th>
            <th className="pb-1 pr-2">Shift</th>
            <th className="pb-1 pr-2">Volume (mL)</th>
            <th className="pb-1 pr-2">Character</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={i}>
              <td className="pr-2 py-0.5">
                <input
                  type="date"
                  className="text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                  value={entry.date}
                  onChange={e => updateEntry(i, { date: e.target.value })}
                />
              </td>
              <td className="pr-2 py-0.5">
                <select
                  className="text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                  value={entry.shift}
                  onChange={e => updateEntry(i, { shift: e.target.value })}
                >
                  {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="pr-2 py-0.5">
                <input
                  type="number"
                  min={0}
                  className="w-16 text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                  value={entry.volumeMl}
                  onChange={e => updateEntry(i, { volumeMl: Number(e.target.value) })}
                />
              </td>
              <td className="pr-2 py-0.5">
                <select
                  className="text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                  value={entry.character}
                  onChange={e => updateEntry(i, { character: e.target.value })}
                >
                  {CHARACTERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </td>
              <td>
                <button
                  onClick={() => removeEntry(i)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={addEntry}
        className="text-xs text-blue-600 hover:underline"
      >
        + Add Entry
      </button>
    </div>
  )
}
```

- [ ] **Step 4.5: Implement `src/modules/packs/surgery/ostomy-tracker/Editor.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-2 text-xs text-gray-500 dark:text-gray-400 italic">
      No configuration options for this module.
    </div>
  )
}
```

- [ ] **Step 4.6: Implement `src/modules/packs/surgery/ostomy-tracker/PrintView.tsx`**

```tsx
import React from 'react'
import type { FC } from 'react'
import type { OstomyTrackerData } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as OstomyTrackerData
  const entries = d.entries ?? []
  const today = new Date().toISOString().slice(0, 10)
  const total = entries.filter(e => e.date === today).reduce((s, e) => s + e.volumeMl, 0)

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base border-b pb-1">Ostomy Tracker</h3>
      <p><span className="font-semibold">Stoma Type:</span> {d.stomaType}</p>
      <p><span className="font-semibold">Peristomal Skin:</span> {d.skinStatus}</p>
      <p><span className="font-semibold">Last Appliance Change:</span> {d.lastApplianceChange || '—'}</p>
      <p><span className="font-semibold">Today's Total Output:</span> {total} mL</p>
      {entries.length > 0 && (
        <table className="w-full text-xs border border-gray-300 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-2 py-0.5 text-left">Date</th>
              <th className="border border-gray-300 px-2 py-0.5 text-left">Shift</th>
              <th className="border border-gray-300 px-2 py-0.5 text-left">Volume (mL)</th>
              <th className="border border-gray-300 px-2 py-0.5 text-left">Character</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td className="border border-gray-300 px-2 py-0.5">{e.date}</td>
                <td className="border border-gray-300 px-2 py-0.5">{e.shift}</td>
                <td className="border border-gray-300 px-2 py-0.5">{e.volumeMl}</td>
                <td className="border border-gray-300 px-2 py-0.5">{e.character}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

- [ ] **Step 4.7: Run tests — expect PASS**

```bash
npx vitest run src/modules/packs/surgery/ostomy-tracker/ostomy-tracker.test.tsx
```

- [ ] **Step 4.8: Commit**

```bash
git -C ~/projects/patient-templates add src/modules/packs/surgery/ostomy-tracker/
git -C ~/projects/patient-templates commit -m "feat(surgery): add ostomy-tracker module"
```

---

## Task 5: Pack registration

**Goal:** Wire all 4 modules into the surgery pack index, then document the one-line add to the global packs index.

- [ ] **Step 5.1: Write `src/modules/packs/surgery/index.ts`**

```ts
import { surgicalDrainsPlugin } from './surgical-drains'
import { woundAssessmentPlugin } from './wound-assessment'
import { postopChecklistPlugin } from './postop-checklist'
import { ostomyTrackerPlugin } from './ostomy-tracker'
import type { ModulePlugin } from '../../../core/plugin/types'

export const surgeryPack: ModulePlugin[] = [
  surgicalDrainsPlugin,
  woundAssessmentPlugin,
  postopChecklistPlugin,
  ostomyTrackerPlugin,
]
```

- [ ] **Step 5.2: Add to `src/modules/packs/index.ts`**

In `src/modules/packs/index.ts`, import and spread the surgery pack alongside any existing packs:

```ts
// Add this import:
import { surgeryPack } from './surgery'

// Add surgeryPack to your allPlugins array, e.g.:
export const allPlugins: ModulePlugin[] = [
  ...surgeryPack,
  // ...other packs
]
```

If `src/modules/packs/index.ts` does not yet exist, create it with:

```ts
import { surgeryPack } from './surgery'
import type { ModulePlugin } from '../../core/plugin/types'

export const allPlugins: ModulePlugin[] = [
  ...surgeryPack,
]
```

- [ ] **Step 5.3: Run all surgery pack tests together to confirm nothing regressed**

```bash
npx vitest run src/modules/packs/surgery/
```

- [ ] **Step 5.4: Commit**

```bash
git -C ~/projects/patient-templates add src/modules/packs/surgery/index.ts src/modules/packs/index.ts
git -C ~/projects/patient-templates commit -m "feat(surgery): register surgery pack in module index"
```

---

## Implementation Notes

- All `Renderer` components accept the generic `Record<string, unknown>` props per the `ModulePlugin` interface and cast internally to their typed data shapes.
- All sparklines are div-based (no chart library required) — a flex row of proportionally-sized divs.
- No clinical formulas are used — this pack is entirely clinical observation/documentation.
- Tests do not mock `Date` — the `today()` helpers derive date strings from `new Date()` at runtime, so tests using `today` as a variable likewise call `new Date().toISOString().slice(0, 10)` to stay in sync.
- The `alertThresholdMl` amber highlight is applied at the `<tr>` level using a conditional class — `container.innerHTML` check in the test is sufficient without a more specific selector.
- Default data for `postop-checklist` must be seeded by the canvas/template system when instantiating the module using `DEFAULT_MILESTONES` exported from `index.ts`.
