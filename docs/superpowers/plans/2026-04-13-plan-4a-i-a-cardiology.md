# Patient Template Builder — Plan 4a-i-a: Cardiology Pack

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Cardiology specialty pack (5 modules) with evidence-cited clinical tools.

**Architecture:** Pack lives under `src/modules/packs/cardiology/`. This plan also creates `src/modules/packs/index.ts` (Task 0) — subsequent pack plans append imports to it.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/modules/packs/
├── index.ts                                    — top-level pack registry entry (created here)
└── cardiology/
    ├── index.ts                                — registers all 5 cardiology modules
    ├── gdmt-tracker/
    │   ├── index.ts
    │   ├── Renderer.tsx
    │   ├── Editor.tsx
    │   ├── PrintView.tsx
    │   └── gdmt-tracker.test.tsx
    ├── echo-ef/
    │   ├── index.ts
    │   ├── Renderer.tsx
    │   ├── Editor.tsx
    │   ├── PrintView.tsx
    │   └── echo-ef.test.tsx
    ├── hemodynamics/
    │   ├── index.ts
    │   ├── Renderer.tsx
    │   ├── Editor.tsx
    │   ├── PrintView.tsx
    │   └── hemodynamics.test.tsx
    ├── rhythm-pacer/
    │   ├── index.ts
    │   ├── Renderer.tsx
    │   ├── Editor.tsx
    │   ├── PrintView.tsx
    │   └── rhythm-pacer.test.tsx
    └── cardiac-scores/
        ├── index.ts
        ├── Renderer.tsx
        ├── Editor.tsx
        ├── PrintView.tsx
        └── cardiac-scores.test.tsx
```

---

## Task 0: Create `src/modules/packs/index.ts`

This file is the root entry point for all specialty pack registrations. Subsequent pack plans (4a-i-b, 4a-i-c, …) append their own imports here.

- [ ] **Step 0.1: Create `src/modules/packs/index.ts`**

```ts
// src/modules/packs/index.ts
import './cardiology'
```

- [ ] **Step 0.2: Verify the file exists**

```bash
ls src/modules/packs/index.ts
```

---

## Task 1: `gdmt-tracker` — GDMT Tracker for HFrEF

**Citation:** `"2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. JACC. 2022;79(17):e263-e421"`

**Data shape:**
```ts
type GdmtData = {
  betaBlocker: { drug: string; currentDose: number; targetDose: number; unit: string; active: boolean }
  aceArb:      { drug: string; currentDose: number; targetDose: number; unit: string; active: boolean }
  mra:         { drug: string; currentDose: number; targetDose: number; unit: string; active: boolean }
  sglt2i:      { drug: string; currentDose: number; targetDose: number; unit: string; active: boolean }
}
```

**Config shape:**
```ts
type GdmtConfig = {
  title: string
}
```

**Exported pure function:**
```ts
export function calcPercentTarget(current: number, target: number): number
// Returns 0 when target === 0. Returns Math.round((current / target) * 100) otherwise. Clamps to [0, 100].
```

### Step 1.1 — Write failing test

- [ ] Create `src/modules/packs/cardiology/gdmt-tracker/gdmt-tracker.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcPercentTarget } from './index'
import Renderer from './Renderer'

describe('calcPercentTarget', () => {
  it('returns correct percentage', () => {
    expect(calcPercentTarget(25, 50)).toBe(50)
  })

  it('returns 100 when current exceeds target', () => {
    expect(calcPercentTarget(60, 50)).toBe(100)
  })

  it('returns 0 when target is 0', () => {
    expect(calcPercentTarget(0, 0)).toBe(0)
  })

  it('returns 0 when current is 0', () => {
    expect(calcPercentTarget(0, 50)).toBe(0)
  })

  it('rounds to nearest integer', () => {
    expect(calcPercentTarget(1, 3)).toBe(33)
  })
})

const defaultData = {
  betaBlocker: { drug: 'Carvedilol', currentDose: 12.5, targetDose: 25, unit: 'mg BID', active: true },
  aceArb:      { drug: 'Lisinopril', currentDose: 10,   targetDose: 40, unit: 'mg/day', active: true },
  mra:         { drug: 'Spironolactone', currentDose: 25, targetDose: 50, unit: 'mg/day', active: true },
  sglt2i:      { drug: 'Dapagliflozin', currentDose: 10, targetDose: 10, unit: 'mg/day', active: true },
}

describe('GdmtRenderer', () => {
  it('renders all 4 drug class rows', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'GDMT' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Beta.blocker/i)).toBeTruthy()
    expect(screen.getByText(/ACEi\/ARB\/ARNI/i)).toBeTruthy()
    expect(screen.getByText(/MRA/i)).toBeTruthy()
    expect(screen.getByText(/SGLT2i/i)).toBeTruthy()
  })

  it('shows percent of target for each drug', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'GDMT' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // Carvedilol: 12.5/25 = 50%
    expect(screen.getAllByText(/50%/).length).toBeGreaterThan(0)
    // SGLT2i: 10/10 = 100%
    expect(screen.getAllByText(/100%/).length).toBeGreaterThan(0)
  })

  it('displays citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'GDMT' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/2022 AHA\/ACC\/HFSA/i)).toBeTruthy()
  })

  it('calls onDataChange when drug name is edited in live mode', () => {
    const onDataChange = vi.fn()
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'GDMT' }}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    const inputs = screen.getAllByDisplayValue('Carvedilol')
    fireEvent.change(inputs[0], { target: { value: 'Metoprolol Succinate' } })
    expect(onDataChange).toHaveBeenCalledTimes(1)
  })
})
```

### Step 1.2 — Run test (expect FAIL)

- [ ] Run:

```bash
npx vitest run src/modules/packs/cardiology/gdmt-tracker/gdmt-tracker.test.tsx
```

Expected: test file not found / import errors. Proceed.

### Step 1.3 — Implement all files

- [ ] Create `src/modules/packs/cardiology/gdmt-tracker/index.ts`

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'

export function calcPercentTarget(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

const GdmtTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'gdmt-tracker',
    name: 'GDMT Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Guideline-Directed Medical Therapy tracker for HFrEF — 4 drug class rows with dose-to-target tracking.',
    tags: ['cardiology', 'heart-failure', 'hfref', 'medications'],
    pack: 'cardiology',
  },
  schema: {
    config: {
      type: 'object',
      properties: {
        title: { type: 'string' },
      },
    },
    data: {
      type: 'object',
      properties: {
        betaBlocker: { type: 'object' },
        aceArb:      { type: 'object' },
        mra:         { type: 'object' },
        sglt2i:      { type: 'object' },
      },
    },
  },
  defaultConfig: {
    title: 'GDMT Tracker',
  },
  minSize: { w: 4, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default GdmtTrackerPlugin
```

- [ ] Create `src/modules/packs/cardiology/gdmt-tracker/Renderer.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'
import { calcPercentTarget } from './index'

const CITATION = '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. JACC. 2022;79(17):e263-e421'

type DrugRow = {
  drug: string
  currentDose: number
  targetDose: number
  unit: string
  active: boolean
}

type GdmtData = {
  betaBlocker: DrugRow
  aceArb: DrugRow
  mra: DrugRow
  sglt2i: DrugRow
}

const ROW_LABELS: Record<keyof GdmtData, string> = {
  betaBlocker: 'Beta-blocker',
  aceArb: 'ACEi/ARB/ARNI',
  mra: 'MRA',
  sglt2i: 'SGLT2i',
}

const DEFAULT_ROW: DrugRow = { drug: '', currentDose: 0, targetDose: 0, unit: 'mg/day', active: true }

const DEFAULT_DATA: GdmtData = {
  betaBlocker: { ...DEFAULT_ROW, unit: 'mg BID' },
  aceArb:      { ...DEFAULT_ROW },
  mra:         { ...DEFAULT_ROW },
  sglt2i:      { ...DEFAULT_ROW },
}

function pct(row: DrugRow): number {
  return calcPercentTarget(row.currentDose, row.targetDose)
}

function pctColor(p: number): string {
  if (p >= 100) return 'text-green-400'
  if (p >= 50)  return 'text-yellow-400'
  return 'text-red-400'
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const title = (config.title as string) ?? 'GDMT Tracker'
  const d: GdmtData = { ...DEFAULT_DATA, ...(data as Partial<GdmtData>) }

  function updateRow(key: keyof GdmtData, field: keyof DrugRow, value: string | number | boolean) {
    onDataChange({
      ...d,
      [key]: { ...d[key], [field]: value },
    })
  }

  const rows = Object.entries(ROW_LABELS) as [keyof GdmtData, string][]
  const readOnly = mode === 'build'

  return (
    <div className="p-3 h-full flex flex-col gap-2 text-sm">
      <h3 className="font-semibold text-base">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-1 pr-2">Class</th>
              <th className="pb-1 pr-2">Drug</th>
              <th className="pb-1 pr-2">Current</th>
              <th className="pb-1 pr-2">Target</th>
              <th className="pb-1 pr-2">Unit</th>
              <th className="pb-1 pr-2">% Target</th>
              <th className="pb-1">On</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([key, label]) => {
              const row = d[key]
              const p = pct(row)
              return (
                <tr key={key} className="border-b border-gray-800">
                  <td className="py-1 pr-2 font-medium whitespace-nowrap">{label}</td>
                  <td className="py-1 pr-2">
                    <input
                      className="bg-transparent border-b border-gray-600 w-28 focus:outline-none focus:border-blue-400"
                      value={row.drug}
                      readOnly={readOnly}
                      onChange={e => updateRow(key, 'drug', e.target.value)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      className="bg-transparent border-b border-gray-600 w-16 focus:outline-none focus:border-blue-400"
                      value={row.currentDose}
                      readOnly={readOnly}
                      onChange={e => updateRow(key, 'currentDose', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      className="bg-transparent border-b border-gray-600 w-16 focus:outline-none focus:border-blue-400"
                      value={row.targetDose}
                      readOnly={readOnly}
                      onChange={e => updateRow(key, 'targetDose', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      className="bg-transparent border-b border-gray-600 w-20 focus:outline-none focus:border-blue-400"
                      value={row.unit}
                      readOnly={readOnly}
                      onChange={e => updateRow(key, 'unit', e.target.value)}
                    />
                  </td>
                  <td className={`py-1 pr-2 font-bold ${pctColor(p)}`}>{p}%</td>
                  <td className="py-1">
                    <input
                      type="checkbox"
                      checked={row.active}
                      disabled={readOnly}
                      onChange={e => updateRow(key, 'active', e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}

export default Renderer
```

- [ ] Create `src/modules/packs/cardiology/gdmt-tracker/Editor.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const Editor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 flex flex-col gap-3 text-sm">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Module Title</label>
        <input
          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
          value={(config.title as string) ?? 'GDMT Tracker'}
          onChange={e => onConfigChange({ ...config, title: e.target.value })}
        />
      </div>
    </div>
  )
}

export default Editor
```

- [ ] Create `src/modules/packs/cardiology/gdmt-tracker/PrintView.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'
import { calcPercentTarget } from './index'

const CITATION = '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. JACC. 2022;79(17):e263-e421'

type DrugRow = { drug: string; currentDose: number; targetDose: number; unit: string; active: boolean }
type GdmtData = { betaBlocker: DrugRow; aceArb: DrugRow; mra: DrugRow; sglt2i: DrugRow }

const ROW_LABELS: [keyof GdmtData, string][] = [
  ['betaBlocker', 'Beta-blocker'],
  ['aceArb', 'ACEi/ARB/ARNI'],
  ['mra', 'MRA'],
  ['sglt2i', 'SGLT2i'],
]

const DEFAULT_ROW: DrugRow = { drug: '', currentDose: 0, targetDose: 0, unit: 'mg/day', active: true }
const DEFAULT_DATA: GdmtData = {
  betaBlocker: { ...DEFAULT_ROW, unit: 'mg BID' },
  aceArb: { ...DEFAULT_ROW },
  mra: { ...DEFAULT_ROW },
  sglt2i: { ...DEFAULT_ROW },
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const PrintView: FC<Props> = ({ config, data }) => {
  const title = (config.title as string) ?? 'GDMT Tracker'
  const d: GdmtData = { ...DEFAULT_DATA, ...(data as Partial<GdmtData>) }

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 11, padding: 8 }}>
      <strong>{title}</strong>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
            <th style={{ paddingRight: 6 }}>Class</th>
            <th style={{ paddingRight: 6 }}>Drug</th>
            <th style={{ paddingRight: 6 }}>Current</th>
            <th style={{ paddingRight: 6 }}>Target</th>
            <th style={{ paddingRight: 6 }}>Unit</th>
            <th style={{ paddingRight: 6 }}>% Target</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {ROW_LABELS.map(([key, label]) => {
            const row = d[key]
            const p = calcPercentTarget(row.currentDose, row.targetDose)
            return (
              <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ paddingRight: 6 }}>{label}</td>
                <td style={{ paddingRight: 6 }}>{row.drug || '—'}</td>
                <td style={{ paddingRight: 6 }}>{row.currentDose}</td>
                <td style={{ paddingRight: 6 }}>{row.targetDose}</td>
                <td style={{ paddingRight: 6 }}>{row.unit}</td>
                <td style={{ paddingRight: 6 }}>{p}%</td>
                <td>{row.active ? 'Yes' : 'No'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888', marginTop: 4 }}>{CITATION}</p>
    </div>
  )
}

export default PrintView
```

### Step 1.4 — Register in cardiology/index.ts

- [ ] Create (or update) `src/modules/packs/cardiology/index.ts` — add gdmt-tracker registration:

```ts
import { registry } from '../../../core/plugin/registry'
import GdmtTrackerPlugin from './gdmt-tracker'

registry.register(GdmtTrackerPlugin)
```

(Subsequent tasks in this plan append to this file — show full file after each addition in steps below.)

### Step 1.5 — Run test (expect PASS)

- [ ] Run:

```bash
npx vitest run src/modules/packs/cardiology/gdmt-tracker/gdmt-tracker.test.tsx
```

All tests must pass before continuing.

### Step 1.6 — Commit

- [ ] Commit:

```bash
git -C ~/projects/patient-templates add src/modules/packs/index.ts src/modules/packs/cardiology/
git -C ~/projects/patient-templates commit -m "feat(cardiology): add gdmt-tracker module"
```

---

## Task 2: `echo-ef` — Echo / EF Summary

**Citation:** `"2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. JACC. 2022;79(17):e263-e421"`

**Data shape:**
```ts
type EchoData = {
  ef: number
  echoDate: string
  lvedd: number
  lvesd: number
  wallMotion: string
  valvular: string
}
```

**Config shape:**
```ts
type EchoConfig = { title: string }
```

**Exported pure function:**
```ts
export function classifyEF(ef: number): 'HFrEF' | 'HFmrEF' | 'HFpEF'
// ef < 40  → 'HFrEF'
// ef 40-49 → 'HFmrEF'
// ef >= 50 → 'HFpEF'
```

### Step 2.1 — Write failing test

- [ ] Create `src/modules/packs/cardiology/echo-ef/echo-ef.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { classifyEF } from './index'
import Renderer from './Renderer'

describe('classifyEF', () => {
  it('classifies EF < 40 as HFrEF', () => {
    expect(classifyEF(35)).toBe('HFrEF')
    expect(classifyEF(39)).toBe('HFrEF')
  })

  it('classifies EF 40-49 as HFmrEF', () => {
    expect(classifyEF(40)).toBe('HFmrEF')
    expect(classifyEF(49)).toBe('HFmrEF')
  })

  it('classifies EF >= 50 as HFpEF', () => {
    expect(classifyEF(50)).toBe('HFpEF')
    expect(classifyEF(65)).toBe('HFpEF')
  })
})

const defaultData = {
  ef: 35,
  echoDate: '2026-04-13',
  lvedd: 62,
  lvesd: 50,
  wallMotion: 'Global hypokinesis',
  valvular: 'Mild MR',
}

describe('EchoEFRenderer', () => {
  it('renders EF value and classification', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Echo / EF' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('35')).toBeTruthy()
    expect(screen.getByText(/HFrEF/i)).toBeTruthy()
  })

  it('renders correct classification for HFpEF', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Echo / EF' }}
        data={{ ...defaultData, ef: 60 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/HFpEF/i)).toBeTruthy()
  })

  it('displays citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Echo / EF' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/2022 AHA\/ACC\/HFSA/i)).toBeTruthy()
  })
})
```

### Step 2.2 — Run test (expect FAIL)

- [ ] Run:

```bash
npx vitest run src/modules/packs/cardiology/echo-ef/echo-ef.test.tsx
```

### Step 2.3 — Implement all files

- [ ] Create `src/modules/packs/cardiology/echo-ef/index.ts`

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'

export function classifyEF(ef: number): 'HFrEF' | 'HFmrEF' | 'HFpEF' {
  if (ef < 40) return 'HFrEF'
  if (ef < 50) return 'HFmrEF'
  return 'HFpEF'
}

const EchoEFPlugin: ModulePlugin = {
  meta: {
    id: 'echo-ef',
    name: 'Echo / EF Summary',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Echocardiogram summary: EF with AHA/ACC 2022 HF classification, chamber dimensions, wall motion, valvular findings.',
    tags: ['cardiology', 'echo', 'heart-failure', 'ef'],
    pack: 'cardiology',
  },
  schema: {
    config: { type: 'object', properties: { title: { type: 'string' } } },
    data: {
      type: 'object',
      properties: {
        ef:         { type: 'number' },
        echoDate:   { type: 'string' },
        lvedd:      { type: 'number' },
        lvesd:      { type: 'number' },
        wallMotion: { type: 'string' },
        valvular:   { type: 'string' },
      },
    },
  },
  defaultConfig: { title: 'Echo / EF Summary' },
  minSize: { w: 3, h: 3 },
  Renderer,
  Editor,
  PrintView,
}

export default EchoEFPlugin
```

- [ ] Create `src/modules/packs/cardiology/echo-ef/Renderer.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'
import { classifyEF } from './index'

const CITATION = '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. JACC. 2022;79(17):e263-e421'

type EchoData = { ef: number; echoDate: string; lvedd: number; lvesd: number; wallMotion: string; valvular: string }
const DEFAULT_DATA: EchoData = { ef: 0, echoDate: '', lvedd: 0, lvesd: 0, wallMotion: '', valvular: '' }

function classColor(cls: string): string {
  if (cls === 'HFrEF') return 'bg-red-900 text-red-200'
  if (cls === 'HFmrEF') return 'bg-yellow-900 text-yellow-200'
  return 'bg-green-900 text-green-200'
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const title = (config.title as string) ?? 'Echo / EF Summary'
  const d: EchoData = { ...DEFAULT_DATA, ...(data as Partial<EchoData>) }
  const cls = d.ef > 0 ? classifyEF(d.ef) : null
  const readOnly = mode === 'build'

  function update(field: keyof EchoData, value: string | number) {
    onDataChange({ ...d, [field]: value })
  }

  return (
    <div className="p-3 h-full flex flex-col gap-2 text-sm">
      <h3 className="font-semibold text-base">{title}</h3>

      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs text-gray-400">EF (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            className="bg-transparent border-b border-gray-600 w-16 focus:outline-none focus:border-blue-400 text-lg font-bold"
            value={d.ef || ''}
            readOnly={readOnly}
            onChange={e => update('ef', parseFloat(e.target.value) || 0)}
          />
        </div>
        {cls && (
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${classColor(cls)}`}>{cls}</span>
        )}
        <div className="ml-auto">
          <label className="block text-xs text-gray-400">Echo Date</label>
          <input
            type="date"
            className="bg-transparent border-b border-gray-600 focus:outline-none focus:border-blue-400 text-xs"
            value={d.echoDate}
            readOnly={readOnly}
            onChange={e => update('echoDate', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400">LVEDD (mm)</label>
          <input
            type="number"
            className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
            value={d.lvedd || ''}
            readOnly={readOnly}
            onChange={e => update('lvedd', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400">LVESD (mm)</label>
          <input
            type="number"
            className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
            value={d.lvesd || ''}
            readOnly={readOnly}
            onChange={e => update('lvesd', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400">Wall Motion Abnormalities</label>
        <input
          className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
          value={d.wallMotion}
          readOnly={readOnly}
          onChange={e => update('wallMotion', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400">Valvular Findings</label>
        <input
          className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
          value={d.valvular}
          readOnly={readOnly}
          onChange={e => update('valvular', e.target.value)}
        />
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}

export default Renderer
```

- [ ] Create `src/modules/packs/cardiology/echo-ef/Editor.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const Editor: FC<Props> = ({ config, onConfigChange }) => (
  <div className="p-3 flex flex-col gap-3 text-sm">
    <div>
      <label className="block text-xs text-gray-400 mb-1">Module Title</label>
      <input
        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
        value={(config.title as string) ?? 'Echo / EF Summary'}
        onChange={e => onConfigChange({ ...config, title: e.target.value })}
      />
    </div>
  </div>
)

export default Editor
```

- [ ] Create `src/modules/packs/cardiology/echo-ef/PrintView.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'
import { classifyEF } from './index'

const CITATION = '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. JACC. 2022;79(17):e263-e421'

type EchoData = { ef: number; echoDate: string; lvedd: number; lvesd: number; wallMotion: string; valvular: string }
const DEFAULT_DATA: EchoData = { ef: 0, echoDate: '', lvedd: 0, lvesd: 0, wallMotion: '', valvular: '' }

interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

const PrintView: FC<Props> = ({ config, data }) => {
  const title = (config.title as string) ?? 'Echo / EF Summary'
  const d: EchoData = { ...DEFAULT_DATA, ...(data as Partial<EchoData>) }
  const cls = d.ef > 0 ? classifyEF(d.ef) : '—'

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 11, padding: 8 }}>
      <strong>{title}</strong>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
        <tbody>
          <tr><td style={{ paddingRight: 8, color: '#666' }}>EF</td><td>{d.ef ? `${d.ef}% (${cls})` : '—'}</td><td style={{ paddingRight: 8, color: '#666' }}>Echo Date</td><td>{d.echoDate || '—'}</td></tr>
          <tr><td style={{ paddingRight: 8, color: '#666' }}>LVEDD</td><td>{d.lvedd ? `${d.lvedd} mm` : '—'}</td><td style={{ paddingRight: 8, color: '#666' }}>LVESD</td><td>{d.lvesd ? `${d.lvesd} mm` : '—'}</td></tr>
          <tr><td style={{ paddingRight: 8, color: '#666' }}>Wall Motion</td><td colSpan={3}>{d.wallMotion || '—'}</td></tr>
          <tr><td style={{ paddingRight: 8, color: '#666' }}>Valvular</td><td colSpan={3}>{d.valvular || '—'}</td></tr>
        </tbody>
      </table>
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888', marginTop: 4 }}>{CITATION}</p>
    </div>
  )
}

export default PrintView
```

### Step 2.4 — Update `src/modules/packs/cardiology/index.ts`

- [ ] Update file — full contents after Task 2:

```ts
import { registry } from '../../../core/plugin/registry'
import GdmtTrackerPlugin from './gdmt-tracker'
import EchoEFPlugin from './echo-ef'

registry.register(GdmtTrackerPlugin)
registry.register(EchoEFPlugin)
```

### Step 2.5 — Run test (expect PASS)

- [ ] Run:

```bash
npx vitest run src/modules/packs/cardiology/echo-ef/echo-ef.test.tsx
```

### Step 2.6 — Commit

- [ ] Commit:

```bash
git -C ~/projects/patient-templates add src/modules/packs/cardiology/
git -C ~/projects/patient-templates commit -m "feat(cardiology): add echo-ef module"
```

---

## Task 3: `hemodynamics` — Hemodynamic Parameters

**No citation needed** (standard hemodynamic normal ranges).

**Data shape:**
```ts
type HemoData = {
  ci: number; pcwp: number; svr: number; map: number
  cvp: number; paSys: number; paDias: number; paMean: number
}
```

**Normal ranges (used for amber/red coloring):**
| Parameter | Normal Low | Normal High | Unit |
|---|---|---|---|
| CI | 2.2 | 4.0 | L/min/m² |
| PCWP | 0 | 12 | mmHg |
| SVR | 800 | 1200 | dynes·s/cm⁵ |
| MAP | 70 | 100 | mmHg |
| CVP | 2 | 8 | mmHg |
| PA Systolic | 15 | 25 | mmHg |
| PA Diastolic | 8 | 15 | mmHg |
| PA Mean | 10 | 20 | mmHg |

### Step 3.1 — Write failing test

- [ ] Create `src/modules/packs/cardiology/hemodynamics/hemodynamics.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Renderer from './Renderer'

const defaultData = {
  ci: 2.5, pcwp: 18, svr: 1400, map: 75,
  cvp: 5, paSys: 40, paDias: 22, paMean: 30,
}

describe('HemodynamicsRenderer', () => {
  it('renders all 8 parameter labels', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Hemodynamics' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Cardiac Index/i)).toBeTruthy()
    expect(screen.getByText(/PCWP/i)).toBeTruthy()
    expect(screen.getByText(/SVR/i)).toBeTruthy()
    expect(screen.getByText(/MAP/i)).toBeTruthy()
    expect(screen.getByText(/CVP/i)).toBeTruthy()
    expect(screen.getByText(/PA Systolic/i)).toBeTruthy()
    expect(screen.getByText(/PA Diastolic/i)).toBeTruthy()
    expect(screen.getByText(/PA Mean/i)).toBeTruthy()
  })

  it('shows normal range for each parameter', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Hemodynamics' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // CI normal range
    expect(screen.getByText(/2\.2.*4\.0/)).toBeTruthy()
  })

  it('renders out-of-range PCWP value (18 > 12) with amber styling indicator', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Hemodynamics' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // value 18 displayed
    const input = screen.getByDisplayValue('18')
    expect(input).toBeTruthy()
  })
})
```

### Step 3.2 — Run test (expect FAIL)

- [ ] Run:

```bash
npx vitest run src/modules/packs/cardiology/hemodynamics/hemodynamics.test.tsx
```

### Step 3.3 — Implement all files

- [ ] Create `src/modules/packs/cardiology/hemodynamics/index.ts`

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'

export type HemoParam = {
  key: string
  label: string
  unit: string
  low: number
  high: number
}

export const HEMO_PARAMS: HemoParam[] = [
  { key: 'ci',     label: 'Cardiac Index',  unit: 'L/min/m²',         low: 2.2, high: 4.0  },
  { key: 'pcwp',   label: 'PCWP',           unit: 'mmHg',              low: 0,   high: 12   },
  { key: 'svr',    label: 'SVR',            unit: 'dynes·s/cm⁵',      low: 800, high: 1200 },
  { key: 'map',    label: 'MAP',            unit: 'mmHg',              low: 70,  high: 100  },
  { key: 'cvp',    label: 'CVP',            unit: 'mmHg',              low: 2,   high: 8    },
  { key: 'paSys',  label: 'PA Systolic',    unit: 'mmHg',              low: 15,  high: 25   },
  { key: 'paDias', label: 'PA Diastolic',   unit: 'mmHg',              low: 8,   high: 15   },
  { key: 'paMean', label: 'PA Mean',        unit: 'mmHg',              low: 10,  high: 20   },
]

const HemodynamicsPlugin: ModulePlugin = {
  meta: {
    id: 'hemodynamics',
    name: 'Hemodynamics',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Hemodynamic parameters with values and normal ranges side by side. Out-of-range highlighting.',
    tags: ['cardiology', 'hemodynamics', 'critical-care', 'icu'],
    pack: 'cardiology',
  },
  schema: {
    config: { type: 'object', properties: { title: { type: 'string' } } },
    data: {
      type: 'object',
      properties: {
        ci: { type: 'number' }, pcwp: { type: 'number' }, svr: { type: 'number' },
        map: { type: 'number' }, cvp: { type: 'number' }, paSys: { type: 'number' },
        paDias: { type: 'number' }, paMean: { type: 'number' },
      },
    },
  },
  defaultConfig: { title: 'Hemodynamics' },
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default HemodynamicsPlugin
```

- [ ] Create `src/modules/packs/cardiology/hemodynamics/Renderer.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'
import { HEMO_PARAMS } from './index'

type HemoData = Record<string, number>
const DEFAULT_DATA: HemoData = { ci: 0, pcwp: 0, svr: 0, map: 0, cvp: 0, paSys: 0, paDias: 0, paMean: 0 }

function valueColor(value: number, low: number, high: number): string {
  if (value === 0) return ''
  if (value < low || value > high) {
    const pctOff = Math.abs(value > high ? (value - high) / high : (low - value) / low)
    return pctOff > 0.2 ? 'text-red-400 font-bold' : 'text-amber-400 font-semibold'
  }
  return 'text-green-400'
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const title = (config.title as string) ?? 'Hemodynamics'
  const d: HemoData = { ...DEFAULT_DATA, ...(data as Partial<HemoData>) }
  const readOnly = mode === 'build'

  function update(key: string, value: number) {
    onDataChange({ ...d, [key]: value })
  }

  return (
    <div className="p-3 h-full flex flex-col gap-2 text-sm">
      <h3 className="font-semibold text-base">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-1 pr-2">Parameter</th>
              <th className="pb-1 pr-2">Value</th>
              <th className="pb-1 pr-2">Unit</th>
              <th className="pb-1">Normal Range</th>
            </tr>
          </thead>
          <tbody>
            {HEMO_PARAMS.map(p => {
              const val = d[p.key] ?? 0
              const color = valueColor(val, p.low, p.high)
              return (
                <tr key={p.key} className="border-b border-gray-800">
                  <td className="py-1 pr-2 font-medium">{p.label}</td>
                  <td className={`py-1 pr-2 ${color}`}>
                    <input
                      type="number"
                      step="0.1"
                      className="bg-transparent border-b border-gray-600 w-16 focus:outline-none focus:border-blue-400"
                      value={val || ''}
                      readOnly={readOnly}
                      onChange={e => update(p.key, parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-1 pr-2 text-gray-400">{p.unit}</td>
                  <td className="py-1 text-gray-500">{p.low}–{p.high}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Renderer
```

- [ ] Create `src/modules/packs/cardiology/hemodynamics/Editor.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props { config: Record<string, unknown>; onConfigChange: (c: Record<string, unknown>) => void }

const Editor: FC<Props> = ({ config, onConfigChange }) => (
  <div className="p-3 flex flex-col gap-3 text-sm">
    <div>
      <label className="block text-xs text-gray-400 mb-1">Module Title</label>
      <input
        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
        value={(config.title as string) ?? 'Hemodynamics'}
        onChange={e => onConfigChange({ ...config, title: e.target.value })}
      />
    </div>
  </div>
)

export default Editor
```

- [ ] Create `src/modules/packs/cardiology/hemodynamics/PrintView.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'
import { HEMO_PARAMS } from './index'

type HemoData = Record<string, number>
const DEFAULT_DATA: HemoData = { ci: 0, pcwp: 0, svr: 0, map: 0, cvp: 0, paSys: 0, paDias: 0, paMean: 0 }

interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

const PrintView: FC<Props> = ({ config, data }) => {
  const title = (config.title as string) ?? 'Hemodynamics'
  const d: HemoData = { ...DEFAULT_DATA, ...(data as Partial<HemoData>) }

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 11, padding: 8 }}>
      <strong>{title}</strong>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
            <th style={{ paddingRight: 8 }}>Parameter</th>
            <th style={{ paddingRight: 8 }}>Value</th>
            <th style={{ paddingRight: 8 }}>Unit</th>
            <th>Normal</th>
          </tr>
        </thead>
        <tbody>
          {HEMO_PARAMS.map(p => {
            const val = d[p.key] ?? 0
            const outOfRange = val > 0 && (val < p.low || val > p.high)
            return (
              <tr key={p.key} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ paddingRight: 8 }}>{p.label}</td>
                <td style={{ paddingRight: 8, color: outOfRange ? '#b45309' : 'inherit', fontWeight: outOfRange ? 'bold' : 'normal' }}>
                  {val || '—'}
                </td>
                <td style={{ paddingRight: 8, color: '#666' }}>{p.unit}</td>
                <td style={{ color: '#666' }}>{p.low}–{p.high}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default PrintView
```

### Step 3.4 — Update `src/modules/packs/cardiology/index.ts`

- [ ] Full contents after Task 3:

```ts
import { registry } from '../../../core/plugin/registry'
import GdmtTrackerPlugin from './gdmt-tracker'
import EchoEFPlugin from './echo-ef'
import HemodynamicsPlugin from './hemodynamics'

registry.register(GdmtTrackerPlugin)
registry.register(EchoEFPlugin)
registry.register(HemodynamicsPlugin)
```

### Step 3.5 — Run test (expect PASS)

- [ ] Run:

```bash
npx vitest run src/modules/packs/cardiology/hemodynamics/hemodynamics.test.tsx
```

### Step 3.6 — Commit

- [ ] Commit:

```bash
git -C ~/projects/patient-templates add src/modules/packs/cardiology/
git -C ~/projects/patient-templates commit -m "feat(cardiology): add hemodynamics module"
```

---

## Task 4: `rhythm-pacer` — Rhythm & Pacemaker + CHADS₂-VASc + HAS-BLED

**Citations:**
- CHADS₂-VASc: `"Lip GY et al. Chest. 2010;137(2):263-272"`
- HAS-BLED: `"Pisters R et al. Chest. 2010;138(5):1093-1100"`

**Data shape:**
```ts
type RhythmData = {
  rhythm: string
  pacer?: { mode: string; rate: number; output: number; sensitivity: number }
  chadsItems: Record<string, boolean>
  hasbledItems: Record<string, boolean>
}
```

**Exported pure functions:**
```ts
export function calcCHADS2VASc(items: Record<string, boolean>): number
export function calcHASBLED(items: Record<string, boolean>): number
```

**CHADS₂-VASc items and weights:**
```
chf: 1, hypertension: 1, age75: 2, diabetes: 1, stroke: 2, vascular: 1, age6574: 1, female: 1
```

**HAS-BLED items and weights:**
```
hypertension: 1, renalDysfunction: 1, liverDysfunction: 1, stroke: 1, bleeding: 1, labileInr: 1, elderly: 1, drugs: 1, alcohol: 1
```

**Rhythm options:**
`NSR`, `AF`, `Atrial Flutter`, `SVT`, `VT`, `VF`, `AV Block 1°`, `AV Block 2° Mobitz I`, `AV Block 2° Mobitz II`, `AV Block 3°`, `Paced`

**Pacemaker fields shown when rhythm is `Paced` or contains `AV Block`.**

### Step 4.1 — Write failing test

- [ ] Create `src/modules/packs/cardiology/rhythm-pacer/rhythm-pacer.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcCHADS2VASc, calcHASBLED } from './index'
import Renderer from './Renderer'

describe('calcCHADS2VASc', () => {
  it('returns 0 for no risk factors', () => {
    expect(calcCHADS2VASc({})).toBe(0)
  })

  it('counts single-point items correctly', () => {
    expect(calcCHADS2VASc({ chf: true, hypertension: true })).toBe(2)
  })

  it('counts double-point items (age >= 75, stroke/TIA) correctly', () => {
    expect(calcCHADS2VASc({ age75: true, stroke: true })).toBe(4)
  })

  it('max score calculation', () => {
    expect(calcCHADS2VASc({
      chf: true, hypertension: true, age75: true, diabetes: true,
      stroke: true, vascular: true, age6574: true, female: true,
    })).toBe(9)
  })
})

describe('calcHASBLED', () => {
  it('returns 0 for no risk factors', () => {
    expect(calcHASBLED({})).toBe(0)
  })

  it('sums all single-point items', () => {
    expect(calcHASBLED({
      hypertension: true, renalDysfunction: true, liverDysfunction: true,
      stroke: true, bleeding: true, labileInr: true, elderly: true,
      drugs: true, alcohol: true,
    })).toBe(9)
  })

  it('ignores false values', () => {
    expect(calcHASBLED({ hypertension: false, stroke: true })).toBe(1)
  })
})

const defaultData = {
  rhythm: 'AF',
  chadsItems: {},
  hasbledItems: {},
}

describe('RhythmPacerRenderer', () => {
  it('renders rhythm dropdown', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('AF')).toBeTruthy()
  })

  it('does NOT show pacemaker fields for AF rhythm', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.queryByText(/Pacemaker Mode/i)).toBeNull()
  })

  it('shows pacemaker fields for Paced rhythm', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={{ ...defaultData, rhythm: 'Paced' }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Pacemaker/i)).toBeTruthy()
  })

  it('renders CHADS2-VASc section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/CHADS.*VASc/i)).toBeTruthy()
  })

  it('renders HAS-BLED section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/HAS-BLED/i)).toBeTruthy()
  })

  it('displays CHADS2-VASc citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Lip GY/i)).toBeTruthy()
  })

  it('displays HAS-BLED citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Pisters R/i)).toBeTruthy()
  })
})
```

### Step 4.2 — Run test (expect FAIL)

- [ ] Run:

```bash
npx vitest run src/modules/packs/cardiology/rhythm-pacer/rhythm-pacer.test.tsx
```

### Step 4.3 — Implement all files

- [ ] Create `src/modules/packs/cardiology/rhythm-pacer/index.ts`

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'

export const RHYTHM_OPTIONS = [
  'NSR', 'AF', 'Atrial Flutter', 'SVT', 'VT', 'VF',
  'AV Block 1°', 'AV Block 2° Mobitz I', 'AV Block 2° Mobitz II', 'AV Block 3°', 'Paced',
]

export const CHADS_ITEMS: { key: string; label: string; points: number }[] = [
  { key: 'chf',          label: 'CHF / LV dysfunction',       points: 1 },
  { key: 'hypertension', label: 'Hypertension',                points: 1 },
  { key: 'age75',        label: 'Age ≥ 75',                    points: 2 },
  { key: 'diabetes',     label: 'Diabetes mellitus',           points: 1 },
  { key: 'stroke',       label: 'Stroke / TIA / Thromboembolism', points: 2 },
  { key: 'vascular',     label: 'Vascular disease',            points: 1 },
  { key: 'age6574',      label: 'Age 65–74',                   points: 1 },
  { key: 'female',       label: 'Female sex category',         points: 1 },
]

export const HASBLED_ITEMS: { key: string; label: string; points: number }[] = [
  { key: 'hypertension',      label: 'Hypertension (uncontrolled, SBP > 160)',    points: 1 },
  { key: 'renalDysfunction',  label: 'Renal dysfunction',                         points: 1 },
  { key: 'liverDysfunction',  label: 'Liver dysfunction',                         points: 1 },
  { key: 'stroke',            label: 'Stroke history',                            points: 1 },
  { key: 'bleeding',          label: 'Bleeding history / predisposition',         points: 1 },
  { key: 'labileInr',         label: 'Labile INR',                               points: 1 },
  { key: 'elderly',           label: 'Elderly (age > 65)',                        points: 1 },
  { key: 'drugs',             label: 'Drugs (antiplatelets / NSAIDs)',            points: 1 },
  { key: 'alcohol',           label: 'Alcohol use',                               points: 1 },
]

export function calcCHADS2VASc(items: Record<string, boolean>): number {
  return CHADS_ITEMS.reduce((sum, item) => sum + (items[item.key] ? item.points : 0), 0)
}

export function calcHASBLED(items: Record<string, boolean>): number {
  return HASBLED_ITEMS.reduce((sum, item) => sum + (items[item.key] ? item.points : 0), 0)
}

const RhythmPacerPlugin: ModulePlugin = {
  meta: {
    id: 'rhythm-pacer',
    name: 'Rhythm & Pacemaker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Rhythm documentation, pacemaker settings (conditional), CHADS₂-VASc, and HAS-BLED scoring.',
    tags: ['cardiology', 'rhythm', 'pacemaker', 'afib', 'anticoagulation'],
    pack: 'cardiology',
  },
  schema: {
    config: { type: 'object', properties: { title: { type: 'string' } } },
    data: {
      type: 'object',
      properties: {
        rhythm:      { type: 'string' },
        pacer:       { type: 'object' },
        chadsItems:  { type: 'object' },
        hasbledItems: { type: 'object' },
      },
    },
  },
  defaultConfig: { title: 'Rhythm & Pacemaker' },
  minSize: { w: 3, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default RhythmPacerPlugin
```

- [ ] Create `src/modules/packs/cardiology/rhythm-pacer/Renderer.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'
import { RHYTHM_OPTIONS, CHADS_ITEMS, HASBLED_ITEMS, calcCHADS2VASc, calcHASBLED } from './index'

const CITATION_CHADS = 'Lip GY et al. Chest. 2010;137(2):263-272'
const CITATION_HASBLED = 'Pisters R et al. Chest. 2010;138(5):1093-1100'

type PacerSettings = { mode: string; rate: number; output: number; sensitivity: number }
type RhythmData = { rhythm: string; pacer?: PacerSettings; chadsItems: Record<string, boolean>; hasbledItems: Record<string, boolean> }

const DEFAULT_DATA: RhythmData = { rhythm: 'NSR', chadsItems: {}, hasbledItems: {} }
const DEFAULT_PACER: PacerSettings = { mode: 'DDD', rate: 60, output: 2, sensitivity: 2 }

function showPacer(rhythm: string): boolean {
  return rhythm === 'Paced' || rhythm.includes('AV Block')
}

function chadsRisk(score: number): { label: string; color: string } {
  if (score === 0) return { label: 'Low risk', color: 'text-green-400' }
  if (score === 1) return { label: 'Intermediate', color: 'text-yellow-400' }
  return { label: 'High risk (anticoag recommended)', color: 'text-red-400' }
}

function hasbledRisk(score: number): { label: string; color: string } {
  if (score < 3) return { label: 'Low bleeding risk', color: 'text-green-400' }
  return { label: 'High bleeding risk ≥ 3', color: 'text-red-400' }
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const title = (config.title as string) ?? 'Rhythm & Pacemaker'
  const d: RhythmData = { ...DEFAULT_DATA, ...(data as Partial<RhythmData>) }
  const readOnly = mode === 'build'
  const showPacerFields = showPacer(d.rhythm)
  const pacer = d.pacer ?? DEFAULT_PACER
  const chadsScore = calcCHADS2VASc(d.chadsItems)
  const hasbledScore = calcHASBLED(d.hasbledItems)

  function update(field: keyof RhythmData, value: unknown) {
    onDataChange({ ...d, [field]: value })
  }

  function updatePacer(field: keyof PacerSettings, value: string | number) {
    onDataChange({ ...d, pacer: { ...pacer, [field]: value } })
  }

  function toggleChads(key: string, checked: boolean) {
    onDataChange({ ...d, chadsItems: { ...d.chadsItems, [key]: checked } })
  }

  function toggleHasbled(key: string, checked: boolean) {
    onDataChange({ ...d, hasbledItems: { ...d.hasbledItems, [key]: checked } })
  }

  const chadsInfo = chadsRisk(chadsScore)
  const hasbledInfo = hasbledRisk(hasbledScore)

  return (
    <div className="p-3 h-full flex flex-col gap-3 text-sm overflow-y-auto">
      <h3 className="font-semibold text-base">{title}</h3>

      {/* Rhythm */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Rhythm</label>
        <select
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-400 w-full"
          value={d.rhythm}
          disabled={readOnly}
          onChange={e => update('rhythm', e.target.value)}
        >
          {RHYTHM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Pacemaker settings */}
      {showPacerFields && (
        <div className="border border-gray-700 rounded p-2">
          <p className="text-xs font-semibold text-gray-300 mb-2">Pacemaker Settings</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-gray-400">Mode</label>
              <select
                className="bg-gray-800 border border-gray-600 rounded px-1 py-0.5 w-full focus:outline-none focus:border-blue-400"
                value={pacer.mode}
                disabled={readOnly}
                onChange={e => updatePacer('mode', e.target.value)}
              >
                {['AAI', 'VVI', 'DDD', 'VOO'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400">Rate (bpm)</label>
              <input type="number" className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
                value={pacer.rate} readOnly={readOnly} onChange={e => updatePacer('rate', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-gray-400">Output (mA)</label>
              <input type="number" step="0.1" className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
                value={pacer.output} readOnly={readOnly} onChange={e => updatePacer('output', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-gray-400">Sensitivity (mV)</label>
              <input type="number" step="0.1" className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
                value={pacer.sensitivity} readOnly={readOnly} onChange={e => updatePacer('sensitivity', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </div>
      )}

      {/* CHADS2-VASc */}
      <div className="border border-gray-700 rounded p-2">
        <p className="text-xs font-semibold text-gray-300 mb-1">CHADS₂-VASc Score</p>
        <div className="grid grid-cols-1 gap-0.5">
          {CHADS_ITEMS.map(item => (
            <label key={item.key} className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" className="h-3.5 w-3.5 rounded"
                checked={!!d.chadsItems[item.key]}
                disabled={readOnly}
                onChange={e => toggleChads(item.key, e.target.checked)} />
              <span>{item.label}</span>
              <span className="ml-auto text-gray-500">+{item.points}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold">Score: {chadsScore}</span>
          <span className={`text-xs ${chadsInfo.color}`}>{chadsInfo.label}</span>
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_CHADS}</p>
      </div>

      {/* HAS-BLED */}
      <div className="border border-gray-700 rounded p-2">
        <p className="text-xs font-semibold text-gray-300 mb-1">HAS-BLED Score</p>
        <div className="grid grid-cols-1 gap-0.5">
          {HASBLED_ITEMS.map(item => (
            <label key={item.key} className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" className="h-3.5 w-3.5 rounded"
                checked={!!d.hasbledItems[item.key]}
                disabled={readOnly}
                onChange={e => toggleHasbled(item.key, e.target.checked)} />
              <span>{item.label}</span>
              <span className="ml-auto text-gray-500">+{item.points}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold">Score: {hasbledScore}</span>
          <span className={`text-xs ${hasbledInfo.color}`}>{hasbledInfo.label}</span>
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_HASBLED}</p>
      </div>
    </div>
  )
}

export default Renderer
```

- [ ] Create `src/modules/packs/cardiology/rhythm-pacer/Editor.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props { config: Record<string, unknown>; onConfigChange: (c: Record<string, unknown>) => void }

const Editor: FC<Props> = ({ config, onConfigChange }) => (
  <div className="p-3 flex flex-col gap-3 text-sm">
    <div>
      <label className="block text-xs text-gray-400 mb-1">Module Title</label>
      <input
        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
        value={(config.title as string) ?? 'Rhythm & Pacemaker'}
        onChange={e => onConfigChange({ ...config, title: e.target.value })}
      />
    </div>
  </div>
)

export default Editor
```

- [ ] Create `src/modules/packs/cardiology/rhythm-pacer/PrintView.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'
import { CHADS_ITEMS, HASBLED_ITEMS, calcCHADS2VASc, calcHASBLED } from './index'

const CITATION_CHADS = 'Lip GY et al. Chest. 2010;137(2):263-272'
const CITATION_HASBLED = 'Pisters R et al. Chest. 2010;138(5):1093-1100'

type PacerSettings = { mode: string; rate: number; output: number; sensitivity: number }
type RhythmData = { rhythm: string; pacer?: PacerSettings; chadsItems: Record<string, boolean>; hasbledItems: Record<string, boolean> }
const DEFAULT_DATA: RhythmData = { rhythm: 'NSR', chadsItems: {}, hasbledItems: {} }

interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

const PrintView: FC<Props> = ({ config, data }) => {
  const title = (config.title as string) ?? 'Rhythm & Pacemaker'
  const d: RhythmData = { ...DEFAULT_DATA, ...(data as Partial<RhythmData>) }
  const chadsScore = calcCHADS2VASc(d.chadsItems)
  const hasbledScore = calcHASBLED(d.hasbledItems)
  const showPacer = d.rhythm === 'Paced' || d.rhythm.includes('AV Block')

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 11, padding: 8 }}>
      <strong>{title}</strong>
      <p style={{ marginTop: 4 }}><strong>Rhythm:</strong> {d.rhythm}</p>
      {showPacer && d.pacer && (
        <p><strong>Pacemaker:</strong> Mode {d.pacer.mode} | Rate {d.pacer.rate} bpm | Output {d.pacer.output} mA | Sensitivity {d.pacer.sensitivity} mV</p>
      )}
      <p style={{ marginTop: 4 }}>
        <strong>CHADS₂-VASc:</strong> {chadsScore} — {chadsScore === 0 ? 'Low' : chadsScore === 1 ? 'Intermediate' : 'High risk'}
      </p>
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888' }}>{CITATION_CHADS}</p>
      <p style={{ marginTop: 4 }}>
        <strong>HAS-BLED:</strong> {hasbledScore} — {hasbledScore >= 3 ? 'High bleeding risk' : 'Low bleeding risk'}
      </p>
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888' }}>{CITATION_HASBLED}</p>
    </div>
  )
}

export default PrintView
```

### Step 4.4 — Update `src/modules/packs/cardiology/index.ts`

- [ ] Full contents after Task 4:

```ts
import { registry } from '../../../core/plugin/registry'
import GdmtTrackerPlugin from './gdmt-tracker'
import EchoEFPlugin from './echo-ef'
import HemodynamicsPlugin from './hemodynamics'
import RhythmPacerPlugin from './rhythm-pacer'

registry.register(GdmtTrackerPlugin)
registry.register(EchoEFPlugin)
registry.register(HemodynamicsPlugin)
registry.register(RhythmPacerPlugin)
```

### Step 4.5 — Run test (expect PASS)

- [ ] Run:

```bash
npx vitest run src/modules/packs/cardiology/rhythm-pacer/rhythm-pacer.test.tsx
```

### Step 4.6 — Commit

- [ ] Commit:

```bash
git -C ~/projects/patient-templates add src/modules/packs/cardiology/
git -C ~/projects/patient-templates commit -m "feat(cardiology): add rhythm-pacer module"
```

---

## Task 5: `cardiac-scores` — TIMI & GRACE Risk Scores

**Citations:**
- TIMI: `"Antman EM et al. JAMA. 2000;284(7):835-842"`
- GRACE: `"Fox KA et al. Eur Heart J. 2006;27(24):2944-2947"`

**Data shape:**
```ts
type CardiacScoresData = {
  timiItems: boolean[]           // 7-element array, index matches TIMI_ITEMS
  graceScore: number             // manually-entered or calculated total
  graceComponents: Record<string, number>  // per-component values for simplified calculator
}
```

**TIMI items (7 total, 1 point each):**
1. Age ≥ 65
2. ≥ 3 CAD risk factors (FH, HTN, hyperlipidemia, DM, active smoking)
3. Prior coronary stenosis ≥ 50%
4. ST deviation on presenting ECG
5. ≥ 2 anginal events in prior 24 hours
6. Use of aspirin in prior 7 days
7. Elevated serum cardiac markers (troponin / CK-MB)

**TIMI risk %:** `[0,1]→4.7%`, `2→8.3%`, `3→13.2%`, `4→19.9%`, `5→26.2%`, `[6,7]→40.9%`

**GRACE total score interpretation:** `<108=low`, `108-140=intermediate`, `>140=high`

**GRACE simplified components (point value entered by clinician):**
Age, HR, SBP, Creatinine, Cardiac arrest at presentation, ST-segment deviation, Elevated cardiac enzymes, Killip class

**Exported pure functions:**
```ts
export function calcTIMI(items: boolean[]): number
export function interpretGRACE(score: number): 'low' | 'intermediate' | 'high'
```

### Step 5.1 — Write failing test

- [ ] Create `src/modules/packs/cardiology/cardiac-scores/cardiac-scores.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcTIMI, interpretGRACE } from './index'
import Renderer from './Renderer'

describe('calcTIMI', () => {
  it('returns 0 for empty items', () => {
    expect(calcTIMI([false, false, false, false, false, false, false])).toBe(0)
  })

  it('returns correct count for partial items', () => {
    expect(calcTIMI([true, true, false, false, false, false, false])).toBe(2)
  })

  it('returns 7 for all items checked', () => {
    expect(calcTIMI([true, true, true, true, true, true, true])).toBe(7)
  })

  it('handles empty array gracefully', () => {
    expect(calcTIMI([])).toBe(0)
  })
})

describe('interpretGRACE', () => {
  it('returns low for score < 108', () => {
    expect(interpretGRACE(80)).toBe('low')
    expect(interpretGRACE(107)).toBe('low')
  })

  it('returns intermediate for score 108-140', () => {
    expect(interpretGRACE(108)).toBe('intermediate')
    expect(interpretGRACE(140)).toBe('intermediate')
  })

  it('returns high for score > 140', () => {
    expect(interpretGRACE(141)).toBe('high')
    expect(interpretGRACE(250)).toBe('high')
  })
})

const defaultData = {
  timiItems: [false, false, false, false, false, false, false],
  graceScore: 0,
  graceComponents: {},
}

describe('CardiacScoresRenderer', () => {
  it('renders TIMI section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/TIMI/i)).toBeTruthy()
  })

  it('renders GRACE section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/GRACE/i)).toBeTruthy()
  })

  it('shows TIMI score of 0 initially', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/TIMI Score.*0/i)).toBeTruthy()
  })

  it('shows correct TIMI risk % for score 0', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/4\.7%/)).toBeTruthy()
  })

  it('displays TIMI citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Antman EM/i)).toBeTruthy()
  })

  it('displays GRACE citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Fox KA/i)).toBeTruthy()
  })
})
```

### Step 5.2 — Run test (expect FAIL)

- [ ] Run:

```bash
npx vitest run src/modules/packs/cardiology/cardiac-scores/cardiac-scores.test.tsx
```

### Step 5.3 — Implement all files

- [ ] Create `src/modules/packs/cardiology/cardiac-scores/index.ts`

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'

export const TIMI_ITEMS: string[] = [
  'Age ≥ 65',
  '≥ 3 CAD risk factors (FH, HTN, hyperlipidemia, DM, active smoking)',
  'Prior coronary stenosis ≥ 50%',
  'ST deviation on presenting ECG',
  '≥ 2 anginal events in prior 24 hours',
  'Use of aspirin in prior 7 days',
  'Elevated serum cardiac markers (troponin / CK-MB)',
]

export const TIMI_RISK_TABLE: { maxScore: number; risk: string }[] = [
  { maxScore: 1, risk: '4.7%' },
  { maxScore: 2, risk: '8.3%' },
  { maxScore: 3, risk: '13.2%' },
  { maxScore: 4, risk: '19.9%' },
  { maxScore: 5, risk: '26.2%' },
  { maxScore: 7, risk: '40.9%' },
]

export const GRACE_COMPONENTS: string[] = [
  'Age (points)',
  'Heart Rate (points)',
  'Systolic BP (points)',
  'Creatinine (points)',
  'Cardiac arrest at presentation (points)',
  'ST-segment deviation (points)',
  'Elevated cardiac enzymes (points)',
  'Killip class (points)',
]

export function calcTIMI(items: boolean[]): number {
  return items.reduce((sum, v) => sum + (v ? 1 : 0), 0)
}

export function interpretGRACE(score: number): 'low' | 'intermediate' | 'high' {
  if (score < 108) return 'low'
  if (score <= 140) return 'intermediate'
  return 'high'
}

export function timiRisk(score: number): string {
  for (const row of TIMI_RISK_TABLE) {
    if (score <= row.maxScore) return row.risk
  }
  return '40.9%'
}

const CardiacScoresPlugin: ModulePlugin = {
  meta: {
    id: 'cardiac-scores',
    name: 'Cardiac Risk Scores',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'TIMI (UA/NSTEMI) and GRACE (ACS) risk scores with evidence-based risk stratification.',
    tags: ['cardiology', 'acs', 'nstemi', 'risk-score', 'timi', 'grace'],
    pack: 'cardiology',
  },
  schema: {
    config: { type: 'object', properties: { title: { type: 'string' } } },
    data: {
      type: 'object',
      properties: {
        timiItems:       { type: 'array', items: { type: 'boolean' } },
        graceScore:      { type: 'number' },
        graceComponents: { type: 'object' },
      },
    },
  },
  defaultConfig: { title: 'Cardiac Risk Scores' },
  minSize: { w: 3, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default CardiacScoresPlugin
```

- [ ] Create `src/modules/packs/cardiology/cardiac-scores/Renderer.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'
import { TIMI_ITEMS, GRACE_COMPONENTS, calcTIMI, interpretGRACE, timiRisk } from './index'

const CITATION_TIMI = 'Antman EM et al. JAMA. 2000;284(7):835-842'
const CITATION_GRACE = 'Fox KA et al. Eur Heart J. 2006;27(24):2944-2947'

type CardiacData = {
  timiItems: boolean[]
  graceScore: number
  graceComponents: Record<string, number>
}

const DEFAULT_DATA: CardiacData = {
  timiItems: Array(7).fill(false),
  graceScore: 0,
  graceComponents: {},
}

function graceColor(risk: string): string {
  if (risk === 'low') return 'text-green-400'
  if (risk === 'intermediate') return 'text-yellow-400'
  return 'text-red-400'
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const title = (config.title as string) ?? 'Cardiac Risk Scores'
  const d: CardiacData = {
    ...DEFAULT_DATA,
    ...(data as Partial<CardiacData>),
    timiItems: (data as Partial<CardiacData>).timiItems ?? Array(7).fill(false),
  }
  const readOnly = mode === 'build'

  const timiScore = calcTIMI(d.timiItems)
  const timiRiskPct = timiRisk(timiScore)

  const graceRisk = d.graceScore > 0 ? interpretGRACE(d.graceScore) : null
  const graceColor = graceRisk ? { low: 'text-green-400', intermediate: 'text-yellow-400', high: 'text-red-400' }[graceRisk] : ''

  // Derived GRACE total from components
  const componentTotal = Object.values(d.graceComponents).reduce((sum, v) => sum + (v || 0), 0)

  function toggleTimi(i: number, checked: boolean) {
    const next = [...d.timiItems]
    next[i] = checked
    onDataChange({ ...d, timiItems: next })
  }

  function updateGraceComponent(label: string, value: number) {
    const nextComponents = { ...d.graceComponents, [label]: value }
    const nextTotal = Object.values(nextComponents).reduce((s, v) => s + (v || 0), 0)
    onDataChange({ ...d, graceComponents: nextComponents, graceScore: nextTotal })
  }

  function updateGraceScore(value: number) {
    onDataChange({ ...d, graceScore: value })
  }

  return (
    <div className="p-3 h-full flex flex-col gap-3 text-sm overflow-y-auto">
      <h3 className="font-semibold text-base">{title}</h3>

      {/* TIMI */}
      <div className="border border-gray-700 rounded p-2">
        <p className="text-xs font-semibold text-gray-300 mb-1">TIMI Score — UA/NSTEMI</p>
        <div className="flex flex-col gap-0.5">
          {TIMI_ITEMS.map((item, i) => (
            <label key={i} className="flex items-start gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded mt-0.5 flex-shrink-0"
                checked={!!d.timiItems[i]}
                disabled={readOnly}
                onChange={e => toggleTimi(i, e.target.checked)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-sm font-bold">TIMI Score: {timiScore}</span>
          <span className="text-xs text-yellow-300">30-day event risk: {timiRiskPct}</span>
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_TIMI}</p>
      </div>

      {/* GRACE */}
      <div className="border border-gray-700 rounded p-2">
        <p className="text-xs font-semibold text-gray-300 mb-1">GRACE Score — ACS</p>

        <div className="mb-2">
          <p className="text-xs text-gray-400 mb-1">Simplified point calculator (enter component points from nomogram):</p>
          <div className="grid grid-cols-2 gap-1">
            {GRACE_COMPONENTS.map(comp => (
              <div key={comp} className="flex items-center gap-1 text-xs">
                <span className="flex-1 text-gray-300 truncate">{comp.replace(' (points)', '')}</span>
                <input
                  type="number"
                  min={0}
                  className="bg-transparent border-b border-gray-600 w-10 focus:outline-none focus:border-blue-400 text-right"
                  value={d.graceComponents[comp] ?? ''}
                  readOnly={readOnly}
                  onChange={e => updateGraceComponent(comp, parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
          {componentTotal > 0 && (
            <p className="text-xs text-gray-500 mt-1">Component sum: {componentTotal}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Total GRACE Score:</label>
          <input
            type="number"
            min={0}
            className="bg-transparent border-b border-gray-600 w-16 font-bold focus:outline-none focus:border-blue-400"
            value={d.graceScore || ''}
            readOnly={readOnly}
            onChange={e => updateGraceScore(parseInt(e.target.value) || 0)}
          />
        </div>

        {graceRisk && (
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-xs font-bold uppercase ${graceColor}`}>
              {graceRisk} risk
            </span>
            <span className="text-xs text-gray-500">
              ({'<108=low | 108-140=intermediate | >140=high'})
            </span>
          </div>
        )}
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_GRACE}</p>
      </div>
    </div>
  )
}

export default Renderer
```

- [ ] Create `src/modules/packs/cardiology/cardiac-scores/Editor.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'

interface Props { config: Record<string, unknown>; onConfigChange: (c: Record<string, unknown>) => void }

const Editor: FC<Props> = ({ config, onConfigChange }) => (
  <div className="p-3 flex flex-col gap-3 text-sm">
    <div>
      <label className="block text-xs text-gray-400 mb-1">Module Title</label>
      <input
        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
        value={(config.title as string) ?? 'Cardiac Risk Scores'}
        onChange={e => onConfigChange({ ...config, title: e.target.value })}
      />
    </div>
  </div>
)

export default Editor
```

- [ ] Create `src/modules/packs/cardiology/cardiac-scores/PrintView.tsx`

```tsx
import React from 'react'
import type { FC } from 'react'
import { TIMI_ITEMS, calcTIMI, interpretGRACE, timiRisk } from './index'

const CITATION_TIMI = 'Antman EM et al. JAMA. 2000;284(7):835-842'
const CITATION_GRACE = 'Fox KA et al. Eur Heart J. 2006;27(24):2944-2947'

type CardiacData = { timiItems: boolean[]; graceScore: number; graceComponents: Record<string, number> }
const DEFAULT_DATA: CardiacData = { timiItems: Array(7).fill(false), graceScore: 0, graceComponents: {} }

interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

const PrintView: FC<Props> = ({ config, data }) => {
  const title = (config.title as string) ?? 'Cardiac Risk Scores'
  const d: CardiacData = { ...DEFAULT_DATA, ...(data as Partial<CardiacData>) }
  const timiScore = calcTIMI(d.timiItems)
  const risk30day = timiRisk(timiScore)
  const graceRisk = d.graceScore > 0 ? interpretGRACE(d.graceScore) : '—'
  const checkedItems = TIMI_ITEMS.filter((_, i) => d.timiItems[i])

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 11, padding: 8 }}>
      <strong>{title}</strong>

      <p style={{ marginTop: 6, fontWeight: 'bold' }}>TIMI (UA/NSTEMI)</p>
      <p>Score: {timiScore} / 7 — 30-day event risk: {risk30day}</p>
      {checkedItems.length > 0 && (
        <ul style={{ margin: '2px 0 2px 12px', padding: 0 }}>
          {checkedItems.map(item => <li key={item}>{item}</li>)}
        </ul>
      )}
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888' }}>{CITATION_TIMI}</p>

      <p style={{ marginTop: 6, fontWeight: 'bold' }}>GRACE (ACS)</p>
      <p>Total Score: {d.graceScore || '—'} — Risk: {graceRisk} {'(<108 low | 108-140 intermediate | >140 high)'}</p>
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888' }}>{CITATION_GRACE}</p>
    </div>
  )
}

export default PrintView
```

### Step 5.4 — Update `src/modules/packs/cardiology/index.ts`

- [ ] Full final contents:

```ts
import { registry } from '../../../core/plugin/registry'
import GdmtTrackerPlugin from './gdmt-tracker'
import EchoEFPlugin from './echo-ef'
import HemodynamicsPlugin from './hemodynamics'
import RhythmPacerPlugin from './rhythm-pacer'
import CardiacScoresPlugin from './cardiac-scores'

registry.register(GdmtTrackerPlugin)
registry.register(EchoEFPlugin)
registry.register(HemodynamicsPlugin)
registry.register(RhythmPacerPlugin)
registry.register(CardiacScoresPlugin)
```

### Step 5.5 — Run test (expect PASS)

- [ ] Run:

```bash
npx vitest run src/modules/packs/cardiology/cardiac-scores/cardiac-scores.test.tsx
```

### Step 5.6 — Run all cardiology tests

- [ ] Run full pack test suite:

```bash
npx vitest run src/modules/packs/cardiology/
```

All 5 test files must pass before committing.

### Step 5.7 — Commit

- [ ] Final commit:

```bash
git -C ~/projects/patient-templates add src/modules/packs/cardiology/
git -C ~/projects/patient-templates commit -m "feat(cardiology): add cardiac-scores module — completes cardiology pack"
```

---

## Completion Checklist

- [ ] `src/modules/packs/index.ts` exists with cardiology import
- [ ] `src/modules/packs/cardiology/index.ts` registers all 5 modules
- [ ] `gdmt-tracker`: all 4 files + test passing; `calcPercentTarget` exported
- [ ] `echo-ef`: all 4 files + test passing; `classifyEF` exported
- [ ] `hemodynamics`: all 4 files + test passing; `HEMO_PARAMS` exported
- [ ] `rhythm-pacer`: all 4 files + test passing; `calcCHADS2VASc` and `calcHASBLED` exported
- [ ] `cardiac-scores`: all 4 files + test passing; `calcTIMI` and `interpretGRACE` exported
- [ ] Every Renderer displays its clinical citation inline
- [ ] All 5 modules run `npx vitest run src/modules/packs/cardiology/` → all green
- [ ] 5 commits made (one per module, post-passing tests)

---

## Clinical Evidence Summary

| Module | Citation |
|---|---|
| gdmt-tracker | 2022 AHA/ACC/HFSA Guideline for HF. JACC. 2022;79(17):e263-e421 |
| echo-ef | 2022 AHA/ACC/HFSA Guideline for HF. JACC. 2022;79(17):e263-e421 |
| hemodynamics | Standard hemodynamic normal ranges (no single guideline citation required) |
| rhythm-pacer (CHADS₂-VASc) | Lip GY et al. Chest. 2010;137(2):263-272 |
| rhythm-pacer (HAS-BLED) | Pisters R et al. Chest. 2010;138(5):1093-1100 |
| cardiac-scores (TIMI) | Antman EM et al. JAMA. 2000;284(7):835-842 |
| cardiac-scores (GRACE) | Fox KA et al. Eur Heart J. 2006;27(24):2944-2947 |
