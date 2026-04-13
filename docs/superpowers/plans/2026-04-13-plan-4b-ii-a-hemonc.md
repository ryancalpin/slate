# Patient Template Builder — Plan 4b-ii-a: Hematology/Oncology Pack

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Hematology/Oncology specialty pack (4 modules).

**Architecture:** Pack lives under `src/modules/packs/hemonc/`. Imported by `src/modules/packs/index.ts`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/modules/packs/hemonc/
├── index.ts
├── chemo-regimen/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── chemo-regimen.test.tsx
├── cbc-trends/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── cbc-trends.test.tsx
├── transfusion-log/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── transfusion-log.test.tsx
└── neutropenic-fever/
    ├── index.ts
    ├── Renderer.tsx
    ├── Editor.tsx
    ├── PrintView.tsx
    └── neutropenic-fever.test.tsx
```

---

## Task 1: chemo-regimen

**Goal:** Display a chemotherapy regimen summary card. Tracks regimen name, cycle and day numbers, a list of agents (drug, dose in mg/m², route), expected nadir date, and next cycle date. Supports add/remove of agent rows in build mode.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/hemonc/chemo-regimen/chemo-regimen.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChemoRegimenRenderer } from './Renderer'

const emptyData = {
  regimenName: '',
  cycleNum: 1,
  dayNum: 1,
  agents: [],
  nadirDate: '',
  nextCycleDate: '',
}

const sampleData = {
  regimenName: 'CHOP',
  cycleNum: 2,
  dayNum: 1,
  agents: [
    { drug: 'Cyclophosphamide', doseMgM2: 750, route: 'IV' },
    { drug: 'Vincristine', doseMgM2: 1.4, route: 'IV' },
  ],
  nadirDate: '2026-04-20',
  nextCycleDate: '2026-05-01',
}

const noop = () => {}

describe('ChemoRegimenRenderer', () => {
  it('renders regimen name', () => {
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('CHOP')).toBeTruthy()
  })

  it('renders cycle and day numbers', () => {
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Cycle 2/i)).toBeTruthy()
    expect(screen.getByText(/Day 1/i)).toBeTruthy()
  })

  it('renders agent rows', () => {
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Cyclophosphamide')).toBeTruthy()
    expect(screen.getByText('Vincristine')).toBeTruthy()
  })

  it('shows nadir date and next cycle date', () => {
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/2026-04-20/)).toBeTruthy()
    expect(screen.getByText(/2026-05-01/)).toBeTruthy()
  })

  it('shows Add Agent button in build mode', () => {
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={noop}
        mode="build"
      />
    )
    expect(screen.getByRole('button', { name: /add agent/i })).toBeTruthy()
  })

  it('calls onDataChange when agent is added', () => {
    const onChange = vi.fn()
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={onChange}
        mode="build"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /add agent/i }))
    expect(onChange).toHaveBeenCalled()
    const newData = onChange.mock.calls[0][0]
    expect(newData.agents).toHaveLength(1)
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run: `npx vitest run src/modules/packs/hemonc/chemo-regimen/chemo-regimen.test.tsx`
- [ ] Confirm test output shows failures (module not found).

### Step 3: Implement all files

- [ ] Create `src/modules/packs/hemonc/chemo-regimen/Renderer.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

interface Agent {
  drug: string
  doseMgM2: number
  route: string
}

interface ChemoData {
  regimenName: string
  cycleNum: number
  dayNum: number
  agents: Agent[]
  nadirDate: string
  nextCycleDate: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const ChemoRegimenRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as ChemoData

  const addAgent = () => {
    const newAgent: Agent = { drug: '', doseMgM2: 0, route: 'IV' }
    onDataChange({ ...d, agents: [...(d.agents ?? []), newAgent] })
  }

  const removeAgent = (idx: number) => {
    const agents = (d.agents ?? []).filter((_, i) => i !== idx)
    onDataChange({ ...d, agents })
  }

  const updateAgent = (idx: number, field: keyof Agent, value: string | number) => {
    const agents = (d.agents ?? []).map((a, i) =>
      i === idx ? { ...a, [field]: value } : a
    )
    onDataChange({ ...d, agents })
  }

  const updateField = (field: keyof ChemoData, value: string | number) => {
    onDataChange({ ...d, [field]: value })
  }

  const routes = ['IV', 'PO', 'SQ', 'IM']

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        {mode === 'build' ? (
          <input
            className="text-lg font-bold border-b border-gray-300 focus:outline-none focus:border-blue-500 flex-1 min-w-0"
            placeholder="Regimen name"
            value={d.regimenName ?? ''}
            onChange={e => updateField('regimenName', e.target.value)}
          />
        ) : (
          <span className="text-lg font-bold">{d.regimenName || '—'}</span>
        )}
        <span className="text-sm text-gray-600 whitespace-nowrap">
          Cycle {d.cycleNum ?? 1} · Day {d.dayNum ?? 1}
        </span>
      </div>

      {/* Cycle / Day inputs in build mode */}
      {mode === 'build' && (
        <div className="flex gap-3 text-sm">
          <label className="flex items-center gap-1">
            Cycle
            <input
              type="number"
              min={1}
              className="w-14 border rounded px-1 py-0.5"
              value={d.cycleNum ?? 1}
              onChange={e => updateField('cycleNum', Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-1">
            Day
            <input
              type="number"
              min={1}
              className="w-14 border rounded px-1 py-0.5"
              value={d.dayNum ?? 1}
              onChange={e => updateField('dayNum', Number(e.target.value))}
            />
          </label>
        </div>
      )}

      {/* Agent table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-1 pr-2">Drug</th>
            <th className="pb-1 pr-2">Dose (mg/m²)</th>
            <th className="pb-1 pr-2">Route</th>
            {mode === 'build' && <th className="pb-1" />}
          </tr>
        </thead>
        <tbody>
          {(d.agents ?? []).map((agent, idx) => (
            <tr key={idx} className="border-b last:border-0">
              {mode === 'build' ? (
                <>
                  <td className="py-1 pr-2">
                    <input
                      className="w-full border-b border-gray-200 focus:outline-none focus:border-blue-400"
                      value={agent.drug}
                      onChange={e => updateAgent(idx, 'drug', e.target.value)}
                      placeholder="Drug name"
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className="w-20 border-b border-gray-200 focus:outline-none focus:border-blue-400"
                      value={agent.doseMgM2}
                      onChange={e => updateAgent(idx, 'doseMgM2', Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <select
                      className="border rounded px-1 py-0.5 text-sm"
                      value={agent.route}
                      onChange={e => updateAgent(idx, 'route', e.target.value)}
                    >
                      {routes.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="py-1">
                    <button
                      onClick={() => removeAgent(idx)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      aria-label="Remove agent"
                    >
                      ✕
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-1 pr-2 font-medium">{agent.drug}</td>
                  <td className="py-1 pr-2">{agent.doseMgM2}</td>
                  <td className="py-1">{agent.route}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {mode === 'build' && (
        <button
          onClick={addAgent}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          + Add Agent
        </button>
      )}

      {/* Dates */}
      <div className="flex flex-wrap gap-4 text-sm pt-1 border-t">
        <div>
          <span className="text-gray-500 mr-1">Expected Nadir:</span>
          {mode === 'build' ? (
            <input
              type="date"
              className="border rounded px-1 py-0.5 text-sm"
              value={d.nadirDate ?? ''}
              onChange={e => updateField('nadirDate', e.target.value)}
            />
          ) : (
            <span>{d.nadirDate || '—'}</span>
          )}
        </div>
        <div>
          <span className="text-gray-500 mr-1">Next Cycle:</span>
          {mode === 'build' ? (
            <input
              type="date"
              className="border rounded px-1 py-0.5 text-sm"
              value={d.nextCycleDate ?? ''}
              onChange={e => updateField('nextCycleDate', e.target.value)}
            />
          ) : (
            <span>{d.nextCycleDate || '—'}</span>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/chemo-regimen/Editor.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const ChemoRegimenEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showDates ?? true)}
          onChange={e => onConfigChange({ ...config, showDates: e.target.checked })}
        />
        Show nadir / next-cycle dates
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.compactAgents ?? false)}
          onChange={e => onConfigChange({ ...config, compactAgents: e.target.checked })}
        />
        Compact agent list
      </label>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/chemo-regimen/PrintView.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

interface Agent {
  drug: string
  doseMgM2: number
  route: string
}

interface ChemoData {
  regimenName: string
  cycleNum: number
  dayNum: number
  agents: Agent[]
  nadirDate: string
  nextCycleDate: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const ChemoRegimenPrintView: FC<Props> = ({ data }) => {
  const d = data as ChemoData
  return (
    <div className="text-sm space-y-2">
      <div className="font-bold text-base">
        {d.regimenName || 'Chemotherapy Regimen'} — Cycle {d.cycleNum}, Day {d.dayNum}
      </div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b">
            <th className="text-left pb-1 pr-2">Drug</th>
            <th className="text-left pb-1 pr-2">Dose (mg/m²)</th>
            <th className="text-left pb-1">Route</th>
          </tr>
        </thead>
        <tbody>
          {(d.agents ?? []).map((a, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-0.5 pr-2">{a.drug}</td>
              <td className="py-0.5 pr-2">{a.doseMgM2}</td>
              <td className="py-0.5">{a.route}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(d.nadirDate || d.nextCycleDate) && (
        <div className="flex gap-4 text-xs text-gray-600 pt-1">
          {d.nadirDate && <span>Expected Nadir: {d.nadirDate}</span>}
          {d.nextCycleDate && <span>Next Cycle: {d.nextCycleDate}</span>}
        </div>
      )}
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/chemo-regimen/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { ChemoRegimenRenderer } from './Renderer'
import { ChemoRegimenEditor } from './Editor'
import { ChemoRegimenPrintView } from './PrintView'

export const chemoRegimenPlugin: ModulePlugin = {
  meta: {
    id: 'chemo-regimen',
    name: 'Chemo Regimen',
    version: '1.0.0',
    author: 'HemOnc Pack',
    description: 'Chemotherapy regimen summary card with agent list, nadir, and next-cycle dates.',
    tags: ['hemonc', 'chemotherapy', 'oncology'],
    pack: 'hemonc',
  },
  schema: {
    config: {},
    data: {
      regimenName: 'string',
      cycleNum: 'number',
      dayNum: 'number',
      agents: 'array',
      nadirDate: 'string',
      nextCycleDate: 'string',
    },
  },
  defaultConfig: { showDates: true, compactAgents: false },
  minSize: { w: 3, h: 3 },
  Renderer: ChemoRegimenRenderer,
  Editor: ChemoRegimenEditor,
  PrintView: ChemoRegimenPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run: `npx vitest run src/modules/packs/hemonc/chemo-regimen/chemo-regimen.test.tsx`
- [ ] Confirm all tests pass.

### Step 5: Commit

- [ ] `git add src/modules/packs/hemonc/chemo-regimen/`
- [ ] `git commit -m "feat(hemonc): add chemo-regimen module"`

---

## Task 2: cbc-trends

**Goal:** Daily CBC table with add-row support. Tracks date, WBC, ANC, Hgb, and Plt. Renders div-based sparkline bars per column. Detects and badges the nadir (lowest value) in each column. Shows a recovery arrow (↑) when the most recent value exceeds the nadir. Exports `findNadir`.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/hemonc/cbc-trends/cbc-trends.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CBCTrendsRenderer } from './Renderer'
import { findNadir } from './Renderer'

const emptyData = { entries: [] }

const sampleData = {
  entries: [
    { date: '2026-04-10', wbc: 4.5, anc: 2.1, hgb: 12.0, plt: 180 },
    { date: '2026-04-11', wbc: 1.2, anc: 0.4, hgb: 9.5, plt: 55 },
    { date: '2026-04-12', wbc: 2.8, anc: 1.0, hgb: 10.2, plt: 90 },
  ],
}

const noop = () => {}

describe('findNadir', () => {
  it('returns the index and value of the minimum', () => {
    const result = findNadir([4.5, 1.2, 2.8])
    expect(result).toEqual({ index: 1, value: 1.2 })
  })

  it('handles a single-element array', () => {
    const result = findNadir([7.0])
    expect(result).toEqual({ index: 0, value: 7.0 })
  })

  it('returns the first occurrence when values tie', () => {
    const result = findNadir([3.0, 1.0, 1.0])
    expect(result).toEqual({ index: 1, value: 1.0 })
  })
})

describe('CBCTrendsRenderer', () => {
  it('renders column headers', () => {
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/WBC/)).toBeTruthy()
    expect(screen.getByText(/ANC/)).toBeTruthy()
    expect(screen.getByText(/Hgb/)).toBeTruthy()
    expect(screen.getByText(/Plt/)).toBeTruthy()
  })

  it('renders entry rows', () => {
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('2026-04-10')).toBeTruthy()
    expect(screen.getByText('2026-04-11')).toBeTruthy()
  })

  it('renders a nadir badge on the lowest WBC row', () => {
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    // nadir WBC is 1.2 on 2026-04-11
    const nadirBadges = screen.getAllByText('nadir')
    expect(nadirBadges.length).toBeGreaterThan(0)
  })

  it('renders recovery arrow when last value exceeds nadir', () => {
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    // Last WBC (2.8) > nadir (1.2) → should show ↑
    expect(screen.getAllByText('↑').length).toBeGreaterThan(0)
  })

  it('shows Add Row button in build mode', () => {
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={noop}
        mode="build"
      />
    )
    expect(screen.getByRole('button', { name: /add row/i })).toBeTruthy()
  })

  it('calls onDataChange when Add Row is clicked', () => {
    const onChange = vi.fn()
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={onChange}
        mode="build"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /add row/i }))
    expect(onChange).toHaveBeenCalled()
    const newData = onChange.mock.calls[0][0]
    expect(newData.entries).toHaveLength(1)
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run: `npx vitest run src/modules/packs/hemonc/cbc-trends/cbc-trends.test.tsx`
- [ ] Confirm failures (module not found).

### Step 3: Implement all files

- [ ] Create `src/modules/packs/hemonc/cbc-trends/Renderer.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

export interface CBCEntry {
  date: string
  wbc: number
  anc: number
  hgb: number
  plt: number
}

interface CBCData {
  entries: CBCEntry[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function findNadir(values: number[]): { index: number; value: number } {
  if (values.length === 0) return { index: 0, value: 0 }
  let minIdx = 0
  let minVal = values[0]
  for (let i = 1; i < values.length; i++) {
    if (values[i] < minVal) {
      minVal = values[i]
      minIdx = i
    }
  }
  return { index: minIdx, value: minVal }
}

type Column = { key: keyof CBCEntry; label: string; unit: string }

const COLUMNS: Column[] = [
  { key: 'wbc', label: 'WBC', unit: '×10³/µL' },
  { key: 'anc', label: 'ANC', unit: '×10³/µL' },
  { key: 'hgb', label: 'Hgb', unit: 'g/dL' },
  { key: 'plt', label: 'Plt', unit: '×10³/µL' },
]

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null
  const max = Math.max(...values, 0.001)
  return (
    <div className="flex items-end gap-0.5 h-6">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-2 bg-blue-400 rounded-t"
          style={{ height: `${Math.max(4, Math.round((v / max) * 24))}px` }}
        />
      ))}
    </div>
  )
}

export const CBCTrendsRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as CBCData
  const entries = d.entries ?? []

  const addRow = () => {
    const newEntry: CBCEntry = { date: '', wbc: 0, anc: 0, hgb: 0, plt: 0 }
    onDataChange({ ...d, entries: [...entries, newEntry] })
  }

  const removeRow = (idx: number) => {
    onDataChange({ ...d, entries: entries.filter((_, i) => i !== idx) })
  }

  const updateEntry = (idx: number, field: keyof CBCEntry, value: string | number) => {
    const updated = entries.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    onDataChange({ ...d, entries: updated })
  }

  // Compute nadir index for each numeric column
  const nadirMap: Record<string, number> = {}
  for (const col of COLUMNS) {
    const vals = entries.map(e => Number(e[col.key]))
    if (vals.length > 0) nadirMap[col.key] = findNadir(vals).index
  }

  // Recovery: last value > nadir value
  const recoveryMap: Record<string, boolean> = {}
  for (const col of COLUMNS) {
    if (entries.length < 2) { recoveryMap[col.key] = false; continue }
    const vals = entries.map(e => Number(e[col.key]))
    const { value: nadirVal } = findNadir(vals)
    recoveryMap[col.key] = vals[vals.length - 1] > nadirVal
  }

  return (
    <div className="p-3 space-y-3 overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[420px]">
        <thead>
          <tr className="text-left text-gray-500 border-b text-xs">
            <th className="pb-1 pr-2">Date</th>
            {COLUMNS.map(col => (
              <th key={col.key} className="pb-1 pr-2">
                {col.label}
                <span className="ml-1 font-normal text-gray-400">{col.unit}</span>
                {recoveryMap[col.key] && (
                  <span className="ml-1 text-green-500">↑</span>
                )}
              </th>
            ))}
            {mode === 'build' && <th />}
          </tr>
          {/* Sparklines */}
          <tr className="border-b">
            <td />
            {COLUMNS.map(col => (
              <td key={col.key} className="pb-1 pr-2">
                <Sparkline values={entries.map(e => Number(e[col.key]))} />
              </td>
            ))}
            {mode === 'build' && <td />}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className="border-b last:border-0">
              {mode === 'build' ? (
                <>
                  <td className="py-1 pr-2">
                    <input
                      type="date"
                      className="border-b border-gray-200 focus:outline-none focus:border-blue-400 text-xs"
                      value={entry.date}
                      onChange={e => updateEntry(idx, 'date', e.target.value)}
                    />
                  </td>
                  {COLUMNS.map(col => (
                    <td key={col.key} className="py-1 pr-2">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        className="w-16 border-b border-gray-200 focus:outline-none focus:border-blue-400 text-xs"
                        value={entry[col.key]}
                        onChange={e => updateEntry(idx, col.key, Number(e.target.value))}
                      />
                    </td>
                  ))}
                  <td className="py-1">
                    <button
                      onClick={() => removeRow(idx)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      aria-label="Remove row"
                    >
                      ✕
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-1 pr-2 text-xs">{entry.date}</td>
                  {COLUMNS.map(col => {
                    const isNadir = nadirMap[col.key] === idx
                    return (
                      <td key={col.key} className={`py-1 pr-2 text-xs ${isNadir ? 'font-bold text-orange-600' : ''}`}>
                        {entry[col.key]}
                        {isNadir && (
                          <span className="ml-1 text-[10px] bg-orange-100 text-orange-600 px-1 rounded">nadir</span>
                        )}
                      </td>
                    )
                  })}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {mode === 'build' && (
        <button
          onClick={addRow}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          + Add Row
        </button>
      )}
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/cbc-trends/Editor.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const CBCTrendsEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showSparklines ?? true)}
          onChange={e => onConfigChange({ ...config, showSparklines: e.target.checked })}
        />
        Show sparklines
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showUnits ?? true)}
          onChange={e => onConfigChange({ ...config, showUnits: e.target.checked })}
        />
        Show units in header
      </label>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/cbc-trends/PrintView.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'
import { findNadir } from './Renderer'
import type { CBCEntry } from './Renderer'

interface CBCData {
  entries: CBCEntry[]
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const COLUMNS = [
  { key: 'wbc' as keyof CBCEntry, label: 'WBC (×10³/µL)' },
  { key: 'anc' as keyof CBCEntry, label: 'ANC (×10³/µL)' },
  { key: 'hgb' as keyof CBCEntry, label: 'Hgb (g/dL)' },
  { key: 'plt' as keyof CBCEntry, label: 'Plt (×10³/µL)' },
]

export const CBCTrendsPrintView: FC<Props> = ({ data }) => {
  const d = data as CBCData
  const entries = d.entries ?? []
  const nadirMap: Record<string, number> = {}
  for (const col of COLUMNS) {
    const vals = entries.map(e => Number(e[col.key]))
    if (vals.length > 0) nadirMap[col.key] = findNadir(vals).index
  }
  return (
    <div className="text-xs space-y-1">
      <div className="font-bold text-sm">CBC Trends</div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left pb-1 pr-2">Date</th>
            {COLUMNS.map(col => (
              <th key={col.key} className="text-left pb-1 pr-2">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className="border-b last:border-0">
              <td className="py-0.5 pr-2">{entry.date}</td>
              {COLUMNS.map(col => (
                <td
                  key={col.key}
                  className={`py-0.5 pr-2 ${nadirMap[col.key] === idx ? 'font-bold underline' : ''}`}
                >
                  {entry[col.key]}
                  {nadirMap[col.key] === idx && ' *'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {entries.length > 0 && <p className="text-gray-400 mt-1">* Nadir value</p>}
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/cbc-trends/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { CBCTrendsRenderer } from './Renderer'
import { CBCTrendsEditor } from './Editor'
import { CBCTrendsPrintView } from './PrintView'

export const cbcTrendsPlugin: ModulePlugin = {
  meta: {
    id: 'cbc-trends',
    name: 'CBC Trends',
    version: '1.0.0',
    author: 'HemOnc Pack',
    description: 'Daily CBC table with sparklines, nadir detection, and recovery tracking.',
    tags: ['hemonc', 'labs', 'CBC', 'oncology'],
    pack: 'hemonc',
  },
  schema: {
    config: {},
    data: { entries: 'array' },
  },
  defaultConfig: { showSparklines: true, showUnits: true },
  minSize: { w: 4, h: 3 },
  Renderer: CBCTrendsRenderer,
  Editor: CBCTrendsEditor,
  PrintView: CBCTrendsPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run: `npx vitest run src/modules/packs/hemonc/cbc-trends/cbc-trends.test.tsx`
- [ ] Confirm all tests pass.

### Step 5: Commit

- [ ] `git add src/modules/packs/hemonc/cbc-trends/`
- [ ] `git commit -m "feat(hemonc): add cbc-trends module"`

---

## Task 3: transfusion-log

**Goal:** Log table of blood product transfusions. Tracks product type, date, time, units, pre- and post-procedure values, and reaction status. Reaction rows display in red. Supports add/remove rows.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/hemonc/transfusion-log/transfusion-log.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransfusionLogRenderer } from './Renderer'

const emptyData = { transfusions: [] }

const sampleData = {
  transfusions: [
    {
      product: 'pRBC',
      date: '2026-04-10',
      time: '10:30',
      units: 2,
      preValue: 7.2,
      postValue: 9.5,
      reaction: false,
      reactionType: '',
    },
    {
      product: 'PLT',
      date: '2026-04-11',
      time: '14:00',
      units: 1,
      preValue: 18,
      postValue: 55,
      reaction: true,
      reactionType: 'febrile non-hemolytic',
    },
  ],
}

const noop = () => {}

describe('TransfusionLogRenderer', () => {
  it('renders product column header', () => {
    render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Product/i)).toBeTruthy()
  })

  it('renders transfusion rows', () => {
    render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('pRBC')).toBeTruthy()
    expect(screen.getByText('PLT')).toBeTruthy()
  })

  it('shows reaction type for reaction rows', () => {
    render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/febrile non-hemolytic/i)).toBeTruthy()
  })

  it('shows Add Row button in build mode', () => {
    render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={noop}
        mode="build"
      />
    )
    expect(screen.getByRole('button', { name: /add row/i })).toBeTruthy()
  })

  it('calls onDataChange when row is added', () => {
    const onChange = vi.fn()
    render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={onChange}
        mode="build"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /add row/i }))
    expect(onChange).toHaveBeenCalled()
    const newData = onChange.mock.calls[0][0]
    expect(newData.transfusions).toHaveLength(1)
  })

  it('renders reaction rows with red styling indicator', () => {
    const { container } = render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    // PLT row has a reaction — look for a red-styled row
    const redRows = container.querySelectorAll('tr.bg-red-50')
    expect(redRows.length).toBe(1)
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run: `npx vitest run src/modules/packs/hemonc/transfusion-log/transfusion-log.test.tsx`
- [ ] Confirm failures.

### Step 3: Implement all files

- [ ] Create `src/modules/packs/hemonc/transfusion-log/Renderer.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

export interface Transfusion {
  product: string
  date: string
  time: string
  units: number
  preValue: number
  postValue: number
  reaction: boolean
  reactionType: string
}

interface TransfusionData {
  transfusions: Transfusion[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const PRODUCTS = ['pRBC', 'FFP', 'PLT', 'Cryo', 'Granulocytes']
const REACTION_TYPES = [
  'febrile non-hemolytic',
  'allergic',
  'hemolytic',
  'TRALI',
  'TACO',
  'anaphylaxis',
  'other',
]

export const TransfusionLogRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as TransfusionData
  const transfusions = d.transfusions ?? []

  const addRow = () => {
    const newRow: Transfusion = {
      product: 'pRBC',
      date: '',
      time: '',
      units: 1,
      preValue: 0,
      postValue: 0,
      reaction: false,
      reactionType: '',
    }
    onDataChange({ ...d, transfusions: [...transfusions, newRow] })
  }

  const removeRow = (idx: number) => {
    onDataChange({ ...d, transfusions: transfusions.filter((_, i) => i !== idx) })
  }

  const updateRow = (idx: number, field: keyof Transfusion, value: string | number | boolean) => {
    const updated = transfusions.map((t, i) =>
      i === idx ? { ...t, [field]: value } : t
    )
    onDataChange({ ...d, transfusions: updated })
  }

  return (
    <div className="p-3 space-y-3 overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[640px]">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-1 pr-2">Product</th>
            <th className="pb-1 pr-2">Date</th>
            <th className="pb-1 pr-2">Time</th>
            <th className="pb-1 pr-2">Units</th>
            <th className="pb-1 pr-2">Pre</th>
            <th className="pb-1 pr-2">Post</th>
            <th className="pb-1 pr-2">Reaction</th>
            {mode === 'build' && <th className="pb-1" />}
          </tr>
        </thead>
        <tbody>
          {transfusions.map((t, idx) => (
            <tr
              key={idx}
              className={`border-b last:border-0 ${t.reaction ? 'bg-red-50' : ''}`}
            >
              {mode === 'build' ? (
                <>
                  <td className="py-1 pr-2">
                    <select
                      className="border rounded px-1 py-0.5 text-xs"
                      value={t.product}
                      onChange={e => updateRow(idx, 'product', e.target.value)}
                    >
                      {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="date"
                      className="border-b border-gray-200 focus:outline-none text-xs"
                      value={t.date}
                      onChange={e => updateRow(idx, 'date', e.target.value)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="time"
                      className="border-b border-gray-200 focus:outline-none text-xs"
                      value={t.time}
                      onChange={e => updateRow(idx, 'time', e.target.value)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-12 border-b border-gray-200 focus:outline-none text-xs"
                      value={t.units}
                      onChange={e => updateRow(idx, 'units', Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className="w-14 border-b border-gray-200 focus:outline-none text-xs"
                      value={t.preValue}
                      onChange={e => updateRow(idx, 'preValue', Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className="w-14 border-b border-gray-200 focus:outline-none text-xs"
                      value={t.postValue}
                      onChange={e => updateRow(idx, 'postValue', Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1 pr-2 space-y-1">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={t.reaction}
                        onChange={e => updateRow(idx, 'reaction', e.target.checked)}
                      />
                      Reaction
                    </label>
                    {t.reaction && (
                      <select
                        className="border rounded px-1 py-0.5 text-xs"
                        value={t.reactionType}
                        onChange={e => updateRow(idx, 'reactionType', e.target.value)}
                      >
                        <option value="">— select —</option>
                        {REACTION_TYPES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="py-1">
                    <button
                      onClick={() => removeRow(idx)}
                      className="text-red-400 hover:text-red-600"
                      aria-label="Remove row"
                    >
                      ✕
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className={`py-1 pr-2 font-medium ${t.reaction ? 'text-red-700' : ''}`}>
                    {t.product}
                  </td>
                  <td className="py-1 pr-2">{t.date}</td>
                  <td className="py-1 pr-2">{t.time}</td>
                  <td className="py-1 pr-2">{t.units}</td>
                  <td className="py-1 pr-2">{t.preValue}</td>
                  <td className="py-1 pr-2">{t.postValue}</td>
                  <td className={`py-1 pr-2 ${t.reaction ? 'text-red-700 font-semibold' : 'text-gray-400'}`}>
                    {t.reaction ? (t.reactionType || 'Yes') : 'None'}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {mode === 'build' && (
        <button
          onClick={addRow}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          + Add Row
        </button>
      )}
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/transfusion-log/Editor.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const TransfusionLogEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.highlightReactions ?? true)}
          onChange={e => onConfigChange({ ...config, highlightReactions: e.target.checked })}
        />
        Highlight reaction rows in red
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showTime ?? true)}
          onChange={e => onConfigChange({ ...config, showTime: e.target.checked })}
        />
        Show time column
      </label>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/transfusion-log/PrintView.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'
import type { Transfusion } from './Renderer'

interface TransfusionData {
  transfusions: Transfusion[]
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const TransfusionLogPrintView: FC<Props> = ({ data }) => {
  const d = data as TransfusionData
  const transfusions = d.transfusions ?? []
  return (
    <div className="text-xs space-y-1">
      <div className="font-bold text-sm">Transfusion Log</div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left pb-1 pr-2">Product</th>
            <th className="text-left pb-1 pr-2">Date/Time</th>
            <th className="text-left pb-1 pr-2">Units</th>
            <th className="text-left pb-1 pr-2">Pre</th>
            <th className="text-left pb-1 pr-2">Post</th>
            <th className="text-left pb-1">Reaction</th>
          </tr>
        </thead>
        <tbody>
          {transfusions.map((t, i) => (
            <tr key={i} className={`border-b last:border-0 ${t.reaction ? 'font-semibold' : ''}`}>
              <td className="py-0.5 pr-2">{t.product}</td>
              <td className="py-0.5 pr-2">{t.date} {t.time}</td>
              <td className="py-0.5 pr-2">{t.units}</td>
              <td className="py-0.5 pr-2">{t.preValue}</td>
              <td className="py-0.5 pr-2">{t.postValue}</td>
              <td className="py-0.5">{t.reaction ? (t.reactionType || 'Yes') : 'None'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/transfusion-log/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { TransfusionLogRenderer } from './Renderer'
import { TransfusionLogEditor } from './Editor'
import { TransfusionLogPrintView } from './PrintView'

export const transfusionLogPlugin: ModulePlugin = {
  meta: {
    id: 'transfusion-log',
    name: 'Transfusion Log',
    version: '1.0.0',
    author: 'HemOnc Pack',
    description: 'Blood product transfusion log with reaction tracking.',
    tags: ['hemonc', 'transfusion', 'blood products'],
    pack: 'hemonc',
  },
  schema: {
    config: {},
    data: { transfusions: 'array' },
  },
  defaultConfig: { highlightReactions: true, showTime: true },
  minSize: { w: 5, h: 3 },
  Renderer: TransfusionLogRenderer,
  Editor: TransfusionLogEditor,
  PrintView: TransfusionLogPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run: `npx vitest run src/modules/packs/hemonc/transfusion-log/transfusion-log.test.tsx`
- [ ] Confirm all tests pass.

### Step 5: Commit

- [ ] `git add src/modules/packs/hemonc/transfusion-log/`
- [ ] `git commit -m "feat(hemonc): add transfusion-log module"`

---

## Task 4: neutropenic-fever

**Goal:** Clinical tool for neutropenic fever management. Accepts ANC and temperature inputs, auto-triggers alert when ANC <500 AND temp >38.3°C. Calculates the MASCC risk score (7 weighted items, auto-total). Displays MASCC risk category (≥21 = low risk, <21 = high risk). Shows empiric coverage checklist. Cites Freifeld et al. CID 2011. Exports `calcMASCC`.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/hemonc/neutropenic-fever/neutropenic-fever.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NeutropenicFeverRenderer, calcMASCC } from './Renderer'

const baseData = {
  ancValue: 0,
  tempC: 0,
  masccItems: {},
  coverageChecklist: {},
}

const triggeredData = {
  ancValue: 300,
  tempC: 38.6,
  masccItems: {},
  coverageChecklist: {},
}

const highMasccData = {
  ancValue: 300,
  tempC: 38.6,
  masccItems: {
    mildSymptoms: true,        // 5
    noHypotension: true,       // 5
    noCOPD: true,              // 4
    solidTumorNoFungal: true,  // 4
    noDehydration: false,
    outpatientOnset: false,
    ageLt60: false,
  },
  coverageChecklist: {},
}

const noop = () => {}

describe('calcMASCC', () => {
  it('returns 0 for empty items', () => {
    expect(calcMASCC({})).toBe(0)
  })

  it('calculates correct score for all items true', () => {
    const allTrue = {
      mildSymptoms: true,
      noHypotension: true,
      noCOPD: true,
      solidTumorNoFungal: true,
      noDehydration: true,
      outpatientOnset: true,
      ageLt60: true,
    }
    expect(calcMASCC(allTrue)).toBe(26)
  })

  it('calculates partial score', () => {
    expect(calcMASCC({ mildSymptoms: true, noCOPD: true })).toBe(9)
  })

  it('returns 18 for high-risk scenario items', () => {
    expect(calcMASCC(highMasccData.masccItems)).toBe(18)
  })
})

describe('NeutropenicFeverRenderer', () => {
  it('renders ANC and temp inputs', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={baseData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/ANC/i)).toBeTruthy()
    expect(screen.getByLabelText(/Temp/i)).toBeTruthy()
  })

  it('shows trigger alert when ANC <500 and temp >38.3', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={triggeredData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Neutropenic Fever Criteria Met/i)).toBeTruthy()
  })

  it('does not show trigger alert when criteria not met', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={baseData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.queryByText(/Neutropenic Fever Criteria Met/i)).toBeNull()
  })

  it('shows MASCC score total', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={triggeredData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/MASCC Score/i)).toBeTruthy()
  })

  it('shows Low Risk when MASCC ≥21', () => {
    const lowRiskData = {
      ...triggeredData,
      masccItems: {
        mildSymptoms: true,
        noHypotension: true,
        noCOPD: true,
        solidTumorNoFungal: true,
        noDehydration: true,
        outpatientOnset: true,
        ageLt60: false,
      },
    }
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={lowRiskData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Low Risk/i)).toBeTruthy()
  })

  it('shows High Risk when MASCC <21', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={highMasccData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/High Risk/i)).toBeTruthy()
  })

  it('renders empiric coverage checklist', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={triggeredData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/gram-negative/i)).toBeTruthy()
  })

  it('renders the clinical citation', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={triggeredData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Freifeld AG/i)).toBeTruthy()
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run: `npx vitest run src/modules/packs/hemonc/neutropenic-fever/neutropenic-fever.test.tsx`
- [ ] Confirm failures.

### Step 3: Implement all files

- [ ] Create `src/modules/packs/hemonc/neutropenic-fever/Renderer.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

const CITATION = 'Freifeld AG et al. Clin Infect Dis. 2011;52(4):e56-e93'

interface NeutropenicFeverData {
  ancValue: number
  tempC: number
  masccItems: Record<string, boolean>
  coverageChecklist: Record<string, boolean>
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const MASCC_ITEMS: Array<{ key: string; label: string; points: number }> = [
  { key: 'mildSymptoms',       label: 'Burden of illness: mild/no symptoms',                points: 5 },
  { key: 'noHypotension',      label: 'No hypotension (SBP ≥90 mmHg)',                      points: 5 },
  { key: 'noCOPD',             label: 'No COPD',                                             points: 4 },
  { key: 'solidTumorNoFungal', label: 'Solid tumor OR no previous fungal infection',          points: 4 },
  { key: 'noDehydration',      label: 'No dehydration requiring IV fluids',                  points: 3 },
  { key: 'outpatientOnset',    label: 'Outpatient status at fever onset',                    points: 3 },
  { key: 'ageLt60',            label: 'Age <60 years',                                       points: 2 },
]

const COVERAGE_ITEMS: Array<{ key: string; label: string }> = [
  { key: 'gramNeg',      label: 'Gram-negative coverage (broad-spectrum beta-lactam)' },
  { key: 'gramPos',      label: 'Gram-positive coverage (if line infection / skin / mucositis / hemodynamic instability)' },
  { key: 'antifungal',  label: 'Antifungal (if >4 days persistent fever)' },
]

export function calcMASCC(items: Record<string, boolean>): number {
  return MASCC_ITEMS.reduce((sum, item) => sum + (items[item.key] ? item.points : 0), 0)
}

export const NeutropenicFeverRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as NeutropenicFeverData
  const masccItems = d.masccItems ?? {}
  const coverageChecklist = d.coverageChecklist ?? {}

  const anc = Number(d.ancValue ?? 0)
  const temp = Number(d.tempC ?? 0)
  const triggered = anc < 500 && temp > 38.3

  const score = calcMASCC(masccItems)
  const lowRisk = score >= 21

  const updateMascc = (key: string, value: boolean) => {
    onDataChange({ ...d, masccItems: { ...masccItems, [key]: value } })
  }

  const updateCoverage = (key: string, value: boolean) => {
    onDataChange({ ...d, coverageChecklist: { ...coverageChecklist, [key]: value } })
  }

  const updateNumeric = (field: 'ancValue' | 'tempC', value: number) => {
    onDataChange({ ...d, [field]: value })
  }

  return (
    <div className="p-3 space-y-4">
      {/* Trigger inputs */}
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2" htmlFor="anc-input">
          <span>ANC (×10³/µL)</span>
          <input
            id="anc-input"
            type="number"
            min={0}
            step={0.1}
            className="w-20 border rounded px-2 py-0.5 text-sm"
            value={d.ancValue ?? 0}
            onChange={e => updateNumeric('ancValue', Number(e.target.value))}
            aria-label="ANC"
          />
        </label>
        <label className="flex items-center gap-2" htmlFor="temp-input">
          <span>Temp (°C)</span>
          <input
            id="temp-input"
            type="number"
            min={35}
            max={42}
            step={0.1}
            className="w-20 border rounded px-2 py-0.5 text-sm"
            value={d.tempC ?? 0}
            onChange={e => updateNumeric('tempC', Number(e.target.value))}
            aria-label="Temp"
          />
        </label>
      </div>

      {/* Alert banner */}
      {triggered && (
        <div className="rounded bg-red-100 border border-red-400 px-3 py-2 text-red-800 font-semibold text-sm">
          ⚠ Neutropenic Fever Criteria Met — ANC &lt;500 &amp; Temp &gt;38.3°C
        </div>
      )}

      {/* MASCC Score */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">MASCC Score</span>
          <span className={`text-lg font-bold ${lowRisk ? 'text-green-600' : 'text-red-600'}`}>
            {score}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lowRisk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {lowRisk ? 'Low Risk' : 'High Risk'}
          </span>
          <span className="text-xs text-gray-400">(≥21 = low risk)</span>
        </div>
        <div className="space-y-1">
          {MASCC_ITEMS.map(item => (
            <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(masccItems[item.key])}
                onChange={e => updateMascc(item.key, e.target.checked)}
              />
              <span>{item.label}</span>
              <span className="ml-auto text-xs text-gray-400">+{item.points}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Empiric coverage checklist */}
      <div className="space-y-2 border-t pt-2">
        <div className="font-semibold text-sm">Empiric Coverage Checklist</div>
        <div className="space-y-1">
          {COVERAGE_ITEMS.map(item => (
            <label key={item.key} className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={Boolean(coverageChecklist[item.key])}
                onChange={e => updateCoverage(item.key, e.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/neutropenic-fever/Editor.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const NeutropenicFeverEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showCoverage ?? true)}
          onChange={e => onConfigChange({ ...config, showCoverage: e.target.checked })}
        />
        Show empiric coverage checklist
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showCitation ?? true)}
          onChange={e => onConfigChange({ ...config, showCitation: e.target.checked })}
        />
        Show citation
      </label>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/neutropenic-fever/PrintView.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'
import { calcMASCC } from './Renderer'

const CITATION = 'Freifeld AG et al. Clin Infect Dis. 2011;52(4):e56-e93'

const MASCC_ITEMS = [
  { key: 'mildSymptoms',       label: 'Mild/no symptoms',                        points: 5 },
  { key: 'noHypotension',      label: 'No hypotension',                          points: 5 },
  { key: 'noCOPD',             label: 'No COPD',                                 points: 4 },
  { key: 'solidTumorNoFungal', label: 'Solid tumor / no prior fungal infection', points: 4 },
  { key: 'noDehydration',      label: 'No IV dehydration',                       points: 3 },
  { key: 'outpatientOnset',    label: 'Outpatient onset',                        points: 3 },
  { key: 'ageLt60',            label: 'Age <60',                                 points: 2 },
]

const COVERAGE_ITEMS = [
  { key: 'gramNeg',    label: 'Gram-negative (broad-spectrum beta-lactam)' },
  { key: 'gramPos',    label: 'Gram-positive (if indicated)' },
  { key: 'antifungal', label: 'Antifungal (if >4 days persistent fever)' },
]

interface NeutropenicFeverData {
  ancValue: number
  tempC: number
  masccItems: Record<string, boolean>
  coverageChecklist: Record<string, boolean>
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const NeutropenicFeverPrintView: FC<Props> = ({ data }) => {
  const d = data as NeutropenicFeverData
  const masccItems = d.masccItems ?? {}
  const coverageChecklist = d.coverageChecklist ?? {}
  const score = calcMASCC(masccItems)
  const lowRisk = score >= 21
  const triggered = Number(d.ancValue) < 500 && Number(d.tempC) > 38.3

  return (
    <div className="text-xs space-y-2">
      <div className="font-bold text-sm">Neutropenic Fever Assessment</div>
      <div className="flex gap-4">
        <span>ANC: {d.ancValue} ×10³/µL</span>
        <span>Temp: {d.tempC}°C</span>
        {triggered && <span className="font-bold text-red-700">⚠ Criteria Met</span>}
      </div>
      <div>
        <span className="font-semibold">MASCC Score: {score} — </span>
        <span className={lowRisk ? 'text-green-700' : 'text-red-700'}>
          {lowRisk ? 'Low Risk (≥21)' : 'High Risk (<21)'}
        </span>
      </div>
      <table className="w-full border-collapse">
        <tbody>
          {MASCC_ITEMS.map(item => (
            <tr key={item.key} className="border-b last:border-0">
              <td className="py-0.5 pr-2">{masccItems[item.key] ? '☑' : '☐'}</td>
              <td className="py-0.5 pr-2">{item.label}</td>
              <td className="py-0.5 text-right">+{item.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="font-semibold mt-1">Empiric Coverage</div>
      {COVERAGE_ITEMS.map(item => (
        <div key={item.key} className="flex gap-2">
          <span>{coverageChecklist[item.key] ? '☑' : '☐'}</span>
          <span>{item.label}</span>
        </div>
      ))}
      <p className="text-gray-400 italic mt-2">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/hemonc/neutropenic-fever/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { NeutropenicFeverRenderer } from './Renderer'
import { NeutropenicFeverEditor } from './Editor'
import { NeutropenicFeverPrintView } from './PrintView'

export const neutropenicFeverPlugin: ModulePlugin = {
  meta: {
    id: 'neutropenic-fever',
    name: 'Neutropenic Fever',
    version: '1.0.0',
    author: 'HemOnc Pack',
    description: 'MASCC risk scoring and empiric coverage checklist for neutropenic fever.',
    tags: ['hemonc', 'neutropenic fever', 'MASCC', 'oncology'],
    pack: 'hemonc',
  },
  schema: {
    config: {},
    data: {
      ancValue: 'number',
      tempC: 'number',
      masccItems: 'object',
      coverageChecklist: 'object',
    },
  },
  defaultConfig: { showCoverage: true, showCitation: true },
  minSize: { w: 3, h: 5 },
  Renderer: NeutropenicFeverRenderer,
  Editor: NeutropenicFeverEditor,
  PrintView: NeutropenicFeverPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run: `npx vitest run src/modules/packs/hemonc/neutropenic-fever/neutropenic-fever.test.tsx`
- [ ] Confirm all tests pass.

### Step 5: Commit

- [ ] `git add src/modules/packs/hemonc/neutropenic-fever/`
- [ ] `git commit -m "feat(hemonc): add neutropenic-fever module with MASCC scoring"`

---

## Task 5: Pack Registration

**Goal:** Wire all four modules into the pack's barrel file `src/modules/packs/hemonc/index.ts` and register them with the PluginRegistry, following the pattern established by Plan 4a-i.

### Step 1: Create pack barrel

- [ ] Create `src/modules/packs/hemonc/index.ts`:

```ts
import { registry } from '../../../core/plugin/registry'
import { chemoRegimenPlugin } from './chemo-regimen'
import { cbcTrendsPlugin } from './cbc-trends'
import { transfusionLogPlugin } from './transfusion-log'
import { neutropenicFeverPlugin } from './neutropenic-fever'

export const hemoncPlugins = [
  chemoRegimenPlugin,
  cbcTrendsPlugin,
  transfusionLogPlugin,
  neutropenicFeverPlugin,
]

hemoncPlugins.forEach(plugin => registry.register(plugin))
```

### Step 2: Add pack import to `src/modules/packs/index.ts`

- [ ] Open `src/modules/packs/index.ts` and add the hemonc import:

```ts
// existing imports …
import './hemonc'
```

> If `src/modules/packs/index.ts` does not yet exist, create it with:
>
> ```ts
> import './hemonc'
> ```

### Step 3: Verify all four modules appear in registry

- [ ] Run the full pack test suite:

```bash
npx vitest run src/modules/packs/hemonc/
```

- [ ] Confirm all tests pass across all four modules.

### Step 4: Commit

- [ ] `git add src/modules/packs/hemonc/index.ts src/modules/packs/index.ts`
- [ ] `git commit -m "feat(hemonc): register HemOnc pack with PluginRegistry"`

---

## Completion Checklist

- [ ] `chemo-regimen` — 5 files written, tests pass, committed
- [ ] `cbc-trends` — 5 files written, `findNadir` exported, tests pass, committed
- [ ] `transfusion-log` — 5 files written, reaction highlighting, tests pass, committed
- [ ] `neutropenic-fever` — 5 files written, `calcMASCC` exported, citation rendered, tests pass, committed
- [ ] `src/modules/packs/hemonc/index.ts` — all 4 plugins registered, committed
- [ ] Full suite `npx vitest run src/modules/packs/hemonc/` — green
