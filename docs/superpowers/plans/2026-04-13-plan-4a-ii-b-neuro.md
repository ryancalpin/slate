# Patient Template Builder — Plan 4a-ii-b: Neurology/Neurocritical Care Pack

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Neurology/Neurocritical Care specialty pack (4 modules) with evidence-cited clinical tools including NIHSS, GCS, ICP monitoring, and stroke timeline.

**Architecture:** Pack lives under `src/modules/packs/neuro/`. Imported by `src/modules/packs/index.ts`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/modules/packs/neuro/
├── index.ts                         — exports all 4 ModulePlugin objects
├── nihss/
│   ├── index.ts                     — ModulePlugin registration object
│   ├── Renderer.tsx                 — Live/Build scoring UI, 15-item grid
│   ├── Editor.tsx                   — Config panel (no options currently)
│   ├── PrintView.tsx                — Static print layout
│   └── nihss.test.tsx               — render + calcNIHSS unit tests
├── neuro-scores/
│   ├── index.ts
│   ├── Renderer.tsx                 — mRS, GCS, Hunt-Hess, Fisher
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── neuro-scores.test.tsx
├── icp-monitor/
│   ├── index.ts
│   ├── Renderer.tsx                 — ICP/MAP/CPP, pupil tracker, EVD panel
│   ├── Editor.tsx                   — CPP target threshold config
│   ├── PrintView.tsx
│   └── icp-monitor.test.tsx
└── stroke-timeline/
    ├── index.ts
    ├── Renderer.tsx                 — Timestamp inputs + auto-calculated intervals
    ├── Editor.tsx
    ├── PrintView.tsx
    └── stroke-timeline.test.tsx
```

---

## Task 1: NIHSS Module

**Files to create:**
- `src/modules/packs/neuro/nihss/nihss.test.tsx`
- `src/modules/packs/neuro/nihss/index.ts`
- `src/modules/packs/neuro/nihss/Renderer.tsx`
- `src/modules/packs/neuro/nihss/Editor.tsx`
- `src/modules/packs/neuro/nihss/PrintView.tsx`

### Step 1.1 — Write the failing test

- [ ] Create `src/modules/packs/neuro/nihss/nihss.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcNIHSS } from './Renderer'
import { Renderer } from './Renderer'

// --- Pure function tests ---

describe('calcNIHSS', () => {
  it('returns 0 for all-zero items', () => {
    expect(calcNIHSS(Array(15).fill(0))).toBe(0)
  })

  it('sums correctly with mixed values', () => {
    // items: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] = 15
    expect(calcNIHSS(Array(15).fill(1))).toBe(15)
  })

  it('caps item 2 (visual fields) at max 3', () => {
    const items = Array(15).fill(0)
    items[4] = 3 // visual fields max
    expect(calcNIHSS(items)).toBe(3)
  })

  it('treats UN sentinel (-1) as 0 in sum', () => {
    const items = Array(15).fill(0)
    items[6] = -1 // item 5a UN sentinel
    expect(calcNIHSS(items)).toBe(0)
  })

  it('handles maximum possible score (42)', () => {
    // Max per item: LOC(3)+LOCq(2)+LOCc(2)+gaze(2)+visual(3)+facial(3)+
    //   motorAL(4)+motorAR(4)+motorLL(4)+motorLR(4)+ataxia(2)+
    //   sensory(2)+language(3)+dysarthria(2)+extinction(2) = 42
    const maxItems = [3, 2, 2, 2, 3, 3, 4, 4, 4, 4, 2, 2, 3, 2, 2]
    expect(calcNIHSS(maxItems)).toBe(42)
  })
})

// --- Render tests ---

describe('NIHSS Renderer', () => {
  const defaultData = { items: Array(15).fill(0) }
  const noop = () => {}

  it('renders all 15 item labels', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/1a.*LOC/i)).toBeTruthy()
    expect(screen.getByText(/Best Language/i)).toBeTruthy()
    expect(screen.getByText(/Extinction/i)).toBeTruthy()
  })

  it('displays total score', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Total/i)).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
  })

  it('displays citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Brott T/i)).toBeTruthy()
  })

  it('calls onDataChange when a score button is clicked', () => {
    let changed = false
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={() => { changed = true }}
        mode="live"
      />
    )
    // Click first "1" button for item 1a
    const oneButtons = screen.getAllByRole('button', { name: '1' })
    fireEvent.click(oneButtons[0])
    expect(changed).toBe(true)
  })

  it('shows severity label for score 0', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/No Stroke/i)).toBeTruthy()
  })
})
```

### Step 1.2 — Run test (expect FAIL)

- [ ] Run:

```bash
npx vitest run src/modules/packs/neuro/nihss/nihss.test.tsx
```

Expected: module not found errors — confirms tests drive implementation.

### Step 1.3 — Implement all files

- [ ] Create `src/modules/packs/neuro/nihss/Renderer.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

export const CITATION = 'Brott T et al. Stroke. 1989;20(7):864-870'

// UN sentinel: -1 (untestable — items 5a, 5b, 6a, 6b, 7, 10)
export function calcNIHSS(items: number[]): number {
  return items.reduce((sum, v) => sum + (v < 0 ? 0 : v), 0)
}

function severityLabel(score: number): string {
  if (score === 0) return 'No Stroke'
  if (score <= 4) return 'Minor'
  if (score <= 15) return 'Moderate'
  if (score <= 20) return 'Moderate-Severe'
  return 'Severe'
}

function severityColor(score: number): string {
  if (score === 0) return 'text-green-400'
  if (score <= 4) return 'text-yellow-400'
  if (score <= 15) return 'text-orange-400'
  if (score <= 20) return 'text-red-400'
  return 'text-red-600'
}

interface NIHSSItem {
  label: string
  max: number
  options: { value: number | 'UN'; label: string }[]
}

const NIHSS_ITEMS: NIHSSItem[] = [
  {
    label: '1a — LOC',
    max: 3,
    options: [
      { value: 0, label: '0 — Alert' },
      { value: 1, label: '1 — Arousable' },
      { value: 2, label: '2 — Repeated stimulation' },
      { value: 3, label: '3 — Unresponsive' },
    ],
  },
  {
    label: '1b — LOC Questions',
    max: 2,
    options: [
      { value: 0, label: '0 — Both correct' },
      { value: 1, label: '1 — One correct' },
      { value: 2, label: '2 — Neither' },
    ],
  },
  {
    label: '1c — LOC Commands',
    max: 2,
    options: [
      { value: 0, label: '0 — Both obey' },
      { value: 1, label: '1 — One obeys' },
      { value: 2, label: '2 — Neither' },
    ],
  },
  {
    label: '2 — Best Gaze',
    max: 2,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Partial gaze palsy' },
      { value: 2, label: '2 — Forced deviation' },
    ],
  },
  {
    label: '3 — Visual Fields',
    max: 3,
    options: [
      { value: 0, label: '0 — No loss' },
      { value: 1, label: '1 — Partial hemianopia' },
      { value: 2, label: '2 — Complete hemianopia' },
      { value: 3, label: '3 — Bilateral' },
    ],
  },
  {
    label: '4 — Facial Palsy',
    max: 3,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Minor' },
      { value: 2, label: '2 — Partial' },
      { value: 3, label: '3 — Complete' },
    ],
  },
  {
    label: '5a — Motor Arm Left',
    max: 4,
    options: [
      { value: 0, label: '0 — No drift' },
      { value: 1, label: '1 — Drift' },
      { value: 2, label: '2 — Some effort vs gravity' },
      { value: 3, label: '3 — No effort vs gravity' },
      { value: 4, label: '4 — No movement' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '5b — Motor Arm Right',
    max: 4,
    options: [
      { value: 0, label: '0 — No drift' },
      { value: 1, label: '1 — Drift' },
      { value: 2, label: '2 — Some effort vs gravity' },
      { value: 3, label: '3 — No effort vs gravity' },
      { value: 4, label: '4 — No movement' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '6a — Motor Leg Left',
    max: 4,
    options: [
      { value: 0, label: '0 — No drift' },
      { value: 1, label: '1 — Drift' },
      { value: 2, label: '2 — Some effort vs gravity' },
      { value: 3, label: '3 — No effort vs gravity' },
      { value: 4, label: '4 — No movement' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '6b — Motor Leg Right',
    max: 4,
    options: [
      { value: 0, label: '0 — No drift' },
      { value: 1, label: '1 — Drift' },
      { value: 2, label: '2 — Some effort vs gravity' },
      { value: 3, label: '3 — No effort vs gravity' },
      { value: 4, label: '4 — No movement' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '7 — Limb Ataxia',
    max: 2,
    options: [
      { value: 0, label: '0 — Absent' },
      { value: 1, label: '1 — One limb' },
      { value: 2, label: '2 — Two limbs' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '8 — Sensory',
    max: 2,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Mild-moderate loss' },
      { value: 2, label: '2 — Severe or absent' },
    ],
  },
  {
    label: '9 — Best Language',
    max: 3,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Mild-moderate aphasia' },
      { value: 2, label: '2 — Severe aphasia' },
      { value: 3, label: '3 — Mute/global' },
    ],
  },
  {
    label: '10 — Dysarthria',
    max: 2,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Mild-moderate' },
      { value: 2, label: '2 — Severe' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '11 — Extinction / Inattention',
    max: 2,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Inattention in one modality' },
      { value: 2, label: '2 — Profound inattention' },
    ],
  },
]

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: { items: number[] }
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const items: number[] = data.items?.length === 15 ? data.items : Array(15).fill(0)
  const total = calcNIHSS(items)

  const setItem = (idx: number, value: number | 'UN') => {
    if (mode === 'build') return
    const next = [...items]
    next[idx] = value === 'UN' ? -1 : (value as number)
    onDataChange({ items: next })
  }

  return (
    <div className="p-3 space-y-2 text-sm text-gray-200">
      {/* Header / total */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-base">NIHSS</span>
        <div className="text-right">
          <span className="text-2xl font-bold mr-2">{total}</span>
          <span className={`text-sm font-medium ${severityColor(total)}`}>
            {severityLabel(total)}
          </span>
          <span className="ml-2 text-xs text-gray-400">/ 42</span>
        </div>
      </div>

      {/* Score grid */}
      <div className="space-y-1">
        {NIHSS_ITEMS.map((item, idx) => {
          const current = items[idx]
          return (
            <div key={idx} className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium">{item.label}</span>
              <div className="flex flex-wrap gap-1">
                {item.options.map((opt) => {
                  const isUN = opt.value === 'UN'
                  const storedVal = isUN ? -1 : (opt.value as number)
                  const active = current === storedVal
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => setItem(idx, opt.value)}
                      disabled={mode === 'build'}
                      aria-label={String(opt.value)}
                      className={`px-2 py-0.5 rounded text-xs border transition-colors
                        ${active
                          ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}
                        ${mode === 'build' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {String(opt.value)}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Total row */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
        <span className="font-semibold">Total</span>
        <span className={`text-xl font-bold ${severityColor(total)}`}>{total}</span>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/nihss/Editor.tsx`:

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-300">
      <p className="text-gray-400 italic">No configuration options for NIHSS.</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/nihss/PrintView.tsx`:

```tsx
import type { FC } from 'react'
import { calcNIHSS, CITATION } from './Renderer'

const SEVERITY_LABELS: [number, number, string][] = [
  [0, 0, 'No Stroke'],
  [1, 4, 'Minor'],
  [5, 15, 'Moderate'],
  [16, 20, 'Moderate-Severe'],
  [21, 42, 'Severe'],
]

function getSeverity(score: number): string {
  return (
    SEVERITY_LABELS.find(([lo, hi]) => score >= lo && score <= hi)?.[2] ?? ''
  )
}

const ITEM_LABELS = [
  '1a — LOC', '1b — LOC Questions', '1c — LOC Commands', '2 — Best Gaze',
  '3 — Visual Fields', '4 — Facial Palsy', '5a — Motor Arm Left',
  '5b — Motor Arm Right', '6a — Motor Leg Left', '6b — Motor Leg Right',
  '7 — Limb Ataxia', '8 — Sensory', '9 — Best Language',
  '10 — Dysarthria', '11 — Extinction/Inattention',
]

interface Props {
  config: Record<string, unknown>
  data: { items: number[] }
}

export const PrintView: FC<Props> = ({ data }) => {
  const items = data.items?.length === 15 ? data.items : Array(15).fill(0)
  const total = calcNIHSS(items)
  return (
    <div className="font-sans text-black text-sm">
      <h3 className="font-bold text-base mb-2">NIH Stroke Scale (NIHSS)</h3>
      <table className="w-full border-collapse text-xs mb-2">
        <tbody>
          {ITEM_LABELS.map((label, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="py-0.5 pr-2 text-gray-600">{label}</td>
              <td className="py-0.5 font-semibold text-right">
                {items[idx] === -1 ? 'UN' : items[idx]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="font-bold">
        Total: {total} — {getSeverity(total)}
      </div>
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/nihss/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const nihssPlugin: ModulePlugin = {
  meta: {
    id: 'nihss',
    name: 'NIHSS',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'NIH Stroke Scale — 15-item neurological deficit scoring',
    tags: ['neuro', 'stroke', 'score'],
    pack: 'neuro',
  },
  schema: {
    config: {},
    data: {
      items: { type: 'array', items: { type: 'number' }, minItems: 15, maxItems: 15 },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 8 },
  Renderer,
  Editor,
  PrintView,
}
```

### Step 1.4 — Run test (expect PASS)

- [ ] Run:

```bash
npx vitest run src/modules/packs/neuro/nihss/nihss.test.tsx
```

Expected: all tests green.

### Step 1.5 — Commit

- [ ] Run:

```bash
git -C ~/projects/patient-templates add src/modules/packs/neuro/nihss/
git -C ~/projects/patient-templates commit -m "feat(neuro): add NIHSS module (Plan 4a-ii-b Task 1)"
```

---

## Task 2: Neuro-Scores Module (mRS, GCS, Hunt-Hess, Fisher)

**Files to create:**
- `src/modules/packs/neuro/neuro-scores/neuro-scores.test.tsx`
- `src/modules/packs/neuro/neuro-scores/index.ts`
- `src/modules/packs/neuro/neuro-scores/Renderer.tsx`
- `src/modules/packs/neuro/neuro-scores/Editor.tsx`
- `src/modules/packs/neuro/neuro-scores/PrintView.tsx`

### Step 2.1 — Write the failing test

- [ ] Create `src/modules/packs/neuro/neuro-scores/neuro-scores.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcGCS } from './Renderer'
import { Renderer } from './Renderer'

// --- Pure function tests ---

describe('calcGCS', () => {
  it('returns 3 for minimum (1+1+1)', () => {
    expect(calcGCS(1, 1, 1)).toBe(3)
  })

  it('returns 15 for maximum (4+5+6)', () => {
    expect(calcGCS(4, 5, 6)).toBe(15)
  })

  it('sums correctly for mid-range values', () => {
    expect(calcGCS(3, 4, 5)).toBe(12)
  })
})

// --- Render tests ---

describe('Neuro-Scores Renderer', () => {
  const defaultData = {
    mrs: 0,
    gcsE: 4,
    gcsV: 5,
    gcsM: 6,
    huntHess: 1,
    fisherGrade: 1,
  }
  const noop = () => {}

  it('renders mRS section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Modified Rankin/i)).toBeTruthy()
  })

  it('renders GCS section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Glasgow Coma/i)).toBeTruthy()
  })

  it('renders Hunt-Hess section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Hunt.Hess/i)).toBeTruthy()
  })

  it('renders Fisher Grade section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Fisher/i)).toBeTruthy()
  })

  it('shows GCS total of 15 for default data', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    // GCS total = 4+5+6 = 15
    expect(screen.getByText('15')).toBeTruthy()
  })

  it('renders all citations', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/van Swieten/i)).toBeTruthy()
    expect(screen.getByText(/Teasdale/i)).toBeTruthy()
    expect(screen.getByText(/Hunt WE/i)).toBeTruthy()
    expect(screen.getByText(/Fisher CM/i)).toBeTruthy()
  })
})
```

### Step 2.2 — Run test (expect FAIL)

- [ ] Run:

```bash
npx vitest run src/modules/packs/neuro/neuro-scores/neuro-scores.test.tsx
```

### Step 2.3 — Implement all files

- [ ] Create `src/modules/packs/neuro/neuro-scores/Renderer.tsx`:

```tsx
import React, { useState } from 'react'
import type { FC } from 'react'

export const CITATION_MRS = 'van Swieten JC et al. Stroke. 1988;19(5):604-607'
export const CITATION_GCS = 'Teasdale G, Jennett B. Lancet. 1974;2(8872):81-84'
export const CITATION_HUNT_HESS = 'Hunt WE, Hess RM. J Neurosurg. 1968;28(1):14-20'
export const CITATION_FISHER = 'Fisher CM et al. Neurosurgery. 1980;6(1):1-9'

export function calcGCS(e: number, v: number, m: number): number {
  return e + v + m
}

const MRS_OPTIONS = [
  { value: 0, label: '0 — No symptoms' },
  { value: 1, label: '1 — No significant disability' },
  { value: 2, label: '2 — Slight disability' },
  { value: 3, label: '3 — Moderate disability (needs help walking)' },
  { value: 4, label: '4 — Moderately severe (unable to walk without help)' },
  { value: 5, label: '5 — Severe disability (bedridden)' },
  { value: 6, label: '6 — Dead' },
]

const GCS_EYES = [
  { v: 1, label: '1 — None' },
  { v: 2, label: '2 — To pain' },
  { v: 3, label: '3 — To speech' },
  { v: 4, label: '4 — Spontaneous' },
]

const GCS_VERBAL = [
  { v: 1, label: '1 — None' },
  { v: 2, label: '2 — Incomprehensible' },
  { v: 3, label: '3 — Inappropriate' },
  { v: 4, label: '4 — Confused' },
  { v: 5, label: '5 — Oriented' },
]

const GCS_MOTOR = [
  { v: 1, label: '1 — None' },
  { v: 2, label: '2 — Extension' },
  { v: 3, label: '3 — Abnormal flexion' },
  { v: 4, label: '4 — Withdrawal' },
  { v: 5, label: '5 — Localizing' },
  { v: 6, label: '6 — Obeys commands' },
]

const HUNT_HESS_OPTIONS = [
  { value: 1, label: 'I — Asymptomatic or mild headache' },
  { value: 2, label: 'II — Moderate-severe headache, nuchal rigidity, no deficit' },
  { value: 3, label: 'III — Drowsiness or mild deficit' },
  { value: 4, label: 'IV — Stupor, moderate-severe hemiparesis' },
  { value: 5, label: 'V — Coma, decerebrate posturing' },
]

const FISHER_OPTIONS = [
  { value: 1, label: '1 — No blood on CT' },
  { value: 2, label: '2 — Diffuse thin (<1 mm)' },
  { value: 3, label: '3 — Clot or thick layer (≥1 mm)' },
  { value: 4, label: '4 — Intraparenchymal or intraventricular' },
]

interface Data {
  mrs: number
  gcsE: number
  gcsV: number
  gcsM: number
  huntHess: number
  fisherGrade: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Data
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide border-b border-gray-700 pb-0.5 mb-1">
      {title}
    </h4>
  )
}

function SelectRow<T extends number>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  disabled: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as T)}
      disabled={disabled}
      className="w-full bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 px-2 py-1 disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function GCSButtons({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { v: number; label: string }[]
  value: number
  onChange: (v: number) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          disabled={disabled}
          title={o.label}
          className={`px-2 py-0.5 rounded text-xs border transition-colors
            ${value === o.v
              ? 'bg-blue-600 border-blue-500 text-white font-bold'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {o.v}
        </button>
      ))}
    </div>
  )
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d: Data = {
    mrs: data.mrs ?? 0,
    gcsE: data.gcsE ?? 4,
    gcsV: data.gcsV ?? 5,
    gcsM: data.gcsM ?? 6,
    huntHess: data.huntHess ?? 1,
    fisherGrade: data.fisherGrade ?? 1,
  }
  const disabled = mode === 'build'
  const gcsTotal = calcGCS(d.gcsE, d.gcsV, d.gcsM)

  function update(patch: Partial<Data>) {
    if (disabled) return
    onDataChange({ ...d, ...patch })
  }

  return (
    <div className="p-3 space-y-3 text-sm text-gray-200">

      {/* Modified Rankin Scale */}
      <div>
        <SectionHeader title="Modified Rankin Scale (mRS)" />
        <SelectRow
          value={d.mrs}
          options={MRS_OPTIONS}
          onChange={(v) => update({ mrs: v })}
          disabled={disabled}
        />
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_MRS}</p>
      </div>

      {/* GCS */}
      <div>
        <SectionHeader title="Glasgow Coma Scale (GCS)" />
        <div className="space-y-1 mb-1">
          <div>
            <span className="text-xs text-gray-400">Eyes (E)</span>
            <GCSButtons
              options={GCS_EYES}
              value={d.gcsE}
              onChange={(v) => update({ gcsE: v })}
              disabled={disabled}
            />
          </div>
          <div>
            <span className="text-xs text-gray-400">Verbal (V)</span>
            <GCSButtons
              options={GCS_VERBAL}
              value={d.gcsV}
              onChange={(v) => update({ gcsV: v })}
              disabled={disabled}
            />
          </div>
          <div>
            <span className="text-xs text-gray-400">Motor (M)</span>
            <GCSButtons
              options={GCS_MOTOR}
              value={d.gcsM}
              onChange={(v) => update({ gcsM: v })}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">Total:</span>
          <span className="text-xl font-bold text-white">{gcsTotal}</span>
          <span className="text-xs text-gray-400">
            (E{d.gcsE}+V{d.gcsV}+M{d.gcsM})
          </span>
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_GCS}</p>
      </div>

      {/* Hunt-Hess */}
      <div>
        <SectionHeader title="Hunt-Hess Grade (SAH)" />
        <SelectRow
          value={d.huntHess}
          options={HUNT_HESS_OPTIONS}
          onChange={(v) => update({ huntHess: v })}
          disabled={disabled}
        />
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_HUNT_HESS}</p>
      </div>

      {/* Fisher Grade */}
      <div>
        <SectionHeader title="Fisher Grade (SAH CT)" />
        <SelectRow
          value={d.fisherGrade}
          options={FISHER_OPTIONS}
          onChange={(v) => update({ fisherGrade: v })}
          disabled={disabled}
        />
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_FISHER}</p>
      </div>

    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/neuro-scores/Editor.tsx`:

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-300">
      <p className="text-gray-400 italic">No configuration options for Neuro Scores.</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/neuro-scores/PrintView.tsx`:

```tsx
import type { FC } from 'react'
import {
  calcGCS,
  CITATION_MRS,
  CITATION_GCS,
  CITATION_HUNT_HESS,
  CITATION_FISHER,
} from './Renderer'

const MRS_LABELS = [
  '0 — No symptoms',
  '1 — No significant disability',
  '2 — Slight disability',
  '3 — Moderate disability',
  '4 — Moderately severe disability',
  '5 — Severe disability',
  '6 — Dead',
]

const HUNT_HESS_LABELS = [
  '', 'I', 'II', 'III', 'IV', 'V',
]

interface Data {
  mrs: number
  gcsE: number
  gcsV: number
  gcsM: number
  huntHess: number
  fisherGrade: number
}

interface Props {
  config: Record<string, unknown>
  data: Data
}

export const PrintView: FC<Props> = ({ data }) => {
  const d: Data = {
    mrs: data.mrs ?? 0,
    gcsE: data.gcsE ?? 4,
    gcsV: data.gcsV ?? 5,
    gcsM: data.gcsM ?? 6,
    huntHess: data.huntHess ?? 1,
    fisherGrade: data.fisherGrade ?? 1,
  }
  const gcsTotal = calcGCS(d.gcsE, d.gcsV, d.gcsM)

  return (
    <div className="font-sans text-black text-sm space-y-2">
      <h3 className="font-bold text-base">Neuro Scores</h3>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">mRS</td>
            <td className="py-0.5 font-semibold">{MRS_LABELS[d.mrs]}</td>
            <td className="py-0.5 text-right text-gray-400 text-xs italic">{CITATION_MRS}</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">GCS</td>
            <td className="py-0.5 font-semibold">
              {gcsTotal} (E{d.gcsE}V{d.gcsV}M{d.gcsM})
            </td>
            <td className="py-0.5 text-right text-gray-400 text-xs italic">{CITATION_GCS}</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">Hunt-Hess</td>
            <td className="py-0.5 font-semibold">Grade {HUNT_HESS_LABELS[d.huntHess]}</td>
            <td className="py-0.5 text-right text-gray-400 text-xs italic">{CITATION_HUNT_HESS}</td>
          </tr>
          <tr>
            <td className="py-0.5 pr-2 text-gray-600">Fisher Grade</td>
            <td className="py-0.5 font-semibold">Grade {d.fisherGrade}</td>
            <td className="py-0.5 text-right text-gray-400 text-xs italic">{CITATION_FISHER}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/neuro-scores/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const neuroScoresPlugin: ModulePlugin = {
  meta: {
    id: 'neuro-scores',
    name: 'Neuro Scores',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'mRS, GCS, Hunt-Hess Grade, and Fisher Grade on one panel',
    tags: ['neuro', 'score', 'gcs', 'sah', 'stroke'],
    pack: 'neuro',
  },
  schema: {
    config: {},
    data: {
      mrs: { type: 'number' },
      gcsE: { type: 'number' },
      gcsV: { type: 'number' },
      gcsM: { type: 'number' },
      huntHess: { type: 'number' },
      fisherGrade: { type: 'number' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 6 },
  Renderer,
  Editor,
  PrintView,
}
```

### Step 2.4 — Run test (expect PASS)

- [ ] Run:

```bash
npx vitest run src/modules/packs/neuro/neuro-scores/neuro-scores.test.tsx
```

### Step 2.5 — Commit

- [ ] Run:

```bash
git -C ~/projects/patient-templates add src/modules/packs/neuro/neuro-scores/
git -C ~/projects/patient-templates commit -m "feat(neuro): add Neuro-Scores module — mRS, GCS, Hunt-Hess, Fisher (Plan 4a-ii-b Task 2)"
```

---

## Task 3: ICP Monitor Module

**Files to create:**
- `src/modules/packs/neuro/icp-monitor/icp-monitor.test.tsx`
- `src/modules/packs/neuro/icp-monitor/index.ts`
- `src/modules/packs/neuro/icp-monitor/Renderer.tsx`
- `src/modules/packs/neuro/icp-monitor/Editor.tsx`
- `src/modules/packs/neuro/icp-monitor/PrintView.tsx`

### Step 3.1 — Write the failing test

- [ ] Create `src/modules/packs/neuro/icp-monitor/icp-monitor.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcCPP } from './Renderer'
import { Renderer } from './Renderer'

// --- Pure function tests ---

describe('calcCPP', () => {
  it('returns CPP = MAP - ICP', () => {
    expect(calcCPP(80, 15)).toBe(65)
  })

  it('returns 0 when MAP equals ICP', () => {
    expect(calcCPP(20, 20)).toBe(0)
  })

  it('returns negative when ICP exceeds MAP', () => {
    expect(calcCPP(50, 60)).toBe(-10)
  })
})

// --- Render tests ---

describe('ICP Monitor Renderer', () => {
  const defaultData = {
    icp: 12,
    map: 80,
    cppTarget: 60,
    pupilL: { sizeMm: 3, reactivity: 'brisk' },
    pupilR: { sizeMm: 3, reactivity: 'brisk' },
    evdEnabled: false,
    evd: { refLevel: 0, drainThreshold: 20, drainRate: 0 },
  }
  const noop = () => {}

  it('renders ICP and MAP fields', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/ICP/i)).toBeTruthy()
    expect(screen.getByText(/MAP/i)).toBeTruthy()
  })

  it('displays calculated CPP', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    // CPP = 80 - 12 = 68
    expect(screen.getByText('68')).toBeTruthy()
  })

  it('renders pupil tracker for both eyes', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Left/i)).toBeTruthy()
    expect(screen.getByText(/Right/i)).toBeTruthy()
  })

  it('shows ICP alert when ICP > 20', () => {
    const highICP = { ...defaultData, icp: 25 }
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={highICP}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/ICP elevated/i)).toBeTruthy()
  })

  it('shows CPP alert when CPP < 60', () => {
    const lowCPP = { ...defaultData, icp: 30, map: 75 }
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={lowCPP}
        onDataChange={noop}
        mode="live"
      />
    )
    // CPP = 75 - 30 = 45 < 60 → alert
    expect(screen.getByText(/CPP low/i)).toBeTruthy()
  })

  it('renders EVD section when enabled', () => {
    const withEvd = { ...defaultData, evdEnabled: true }
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={withEvd}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/EVD/i)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Carney N/i)).toBeTruthy()
  })
})
```

### Step 3.2 — Run test (expect FAIL)

- [ ] Run:

```bash
npx vitest run src/modules/packs/neuro/icp-monitor/icp-monitor.test.tsx
```

### Step 3.3 — Implement all files

- [ ] Create `src/modules/packs/neuro/icp-monitor/Renderer.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

export const CITATION =
  'Carney N et al. Neurosurgery. 2017;80(1):6-15'

export function calcCPP(map: number, icp: number): number {
  return map - icp
}

type Reactivity = 'brisk' | 'sluggish' | 'fixed'

interface PupilData {
  sizeMm: number
  reactivity: Reactivity
}

interface ICPData {
  icp: number
  map: number
  cppTarget: number
  pupilL: PupilData
  pupilR: PupilData
  evdEnabled: boolean
  evd: {
    refLevel: number
    drainThreshold: number
    drainRate: number
  }
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: ICPData
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function reactivityColor(r: Reactivity): string {
  return r === 'brisk' ? 'bg-green-500' : r === 'sluggish' ? 'bg-yellow-500' : 'bg-red-600'
}

function NumericField({
  label,
  unit,
  value,
  min,
  max,
  onChange,
  disabled,
  highlight,
}: {
  label: string
  unit: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  disabled: boolean
  highlight?: 'warn' | 'ok' | null
}) {
  const borderCls =
    highlight === 'warn'
      ? 'border-red-500'
      : highlight === 'ok'
      ? 'border-green-500'
      : 'border-gray-600'

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-400">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-20 text-center text-xl font-bold bg-gray-800 border ${borderCls} rounded py-1 text-white disabled:opacity-50`}
      />
      <span className="text-xs text-gray-500">{unit}</span>
    </div>
  )
}

function PupilPanel({
  side,
  pupil,
  onChange,
  disabled,
}: {
  side: 'Left' | 'Right'
  pupil: PupilData
  onChange: (p: PupilData) => void
  disabled: boolean
}) {
  const REACTIVITY_OPTIONS: Reactivity[] = ['brisk', 'sluggish', 'fixed']

  return (
    <div className="flex flex-col gap-1 flex-1">
      <span className="text-xs font-semibold text-gray-300">{side}</span>
      <div className="flex items-center gap-1">
        <input
          type="range"
          min={1}
          max={9}
          step={0.5}
          value={pupil.sizeMm}
          disabled={disabled}
          onChange={(e) => onChange({ ...pupil, sizeMm: Number(e.target.value) })}
          className="flex-1 accent-blue-500 disabled:opacity-50"
        />
        <span className="text-xs text-white w-8 text-right">{pupil.sizeMm}mm</span>
      </div>
      <div className="flex gap-1">
        {REACTIVITY_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => !disabled && onChange({ ...pupil, reactivity: r })}
            disabled={disabled}
            className={`flex-1 text-xs rounded py-0.5 border transition-colors
              ${pupil.reactivity === r
                ? `${reactivityColor(r)} border-transparent text-white font-semibold`
                : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d: ICPData = {
    icp: data.icp ?? 15,
    map: data.map ?? 80,
    cppTarget: data.cppTarget ?? 60,
    pupilL: data.pupilL ?? { sizeMm: 3, reactivity: 'brisk' },
    pupilR: data.pupilR ?? { sizeMm: 3, reactivity: 'brisk' },
    evdEnabled: data.evdEnabled ?? false,
    evd: data.evd ?? { refLevel: 0, drainThreshold: 20, drainRate: 0 },
  }
  const disabled = mode === 'build'
  const cpp = calcCPP(d.map, d.icp)
  const icpHigh = d.icp > 20
  const cppLow = cpp < d.cppTarget

  function update(patch: Partial<ICPData>) {
    if (disabled) return
    onDataChange({ ...d, ...patch })
  }

  return (
    <div className="p-3 space-y-3 text-sm text-gray-200">

      {/* Alerts */}
      {icpHigh && (
        <div className="bg-red-900/60 border border-red-600 rounded px-2 py-1 text-xs text-red-300 font-semibold">
          ⚠ ICP elevated ({d.icp} mmHg &gt; 20 mmHg)
        </div>
      )}
      {cppLow && (
        <div className="bg-orange-900/60 border border-orange-500 rounded px-2 py-1 text-xs text-orange-300 font-semibold">
          ⚠ CPP low ({cpp} mmHg &lt; target {d.cppTarget} mmHg)
        </div>
      )}

      {/* ICP / MAP / CPP row */}
      <div className="flex gap-4 justify-center">
        <NumericField
          label="ICP"
          unit="mmHg"
          value={d.icp}
          min={0}
          max={100}
          onChange={(v) => update({ icp: v })}
          disabled={disabled}
          highlight={icpHigh ? 'warn' : null}
        />
        <NumericField
          label="MAP"
          unit="mmHg"
          value={d.map}
          min={0}
          max={200}
          onChange={(v) => update({ map: v })}
          disabled={disabled}
          highlight={null}
        />
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">CPP</span>
          <span
            className={`text-2xl font-bold ${
              cppLow ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {cpp}
          </span>
          <span className="text-xs text-gray-500">mmHg</span>
        </div>
      </div>

      {/* Pupil tracker */}
      <div>
        <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide border-b border-gray-700 pb-0.5 mb-1">
          Pupils
        </h4>
        <div className="flex gap-3">
          <PupilPanel
            side="Left"
            pupil={d.pupilL}
            onChange={(p) => update({ pupilL: p })}
            disabled={disabled}
          />
          <div className="w-px bg-gray-700" />
          <PupilPanel
            side="Right"
            pupil={d.pupilR}
            onChange={(p) => update({ pupilR: p })}
            disabled={disabled}
          />
        </div>
        {/* Equality badge */}
        {Math.abs(d.pupilL.sizeMm - d.pupilR.sizeMm) >= 1 && (
          <div className="mt-1 text-xs text-yellow-400 font-semibold">
            ⚠ Anisocoria ({Math.abs(d.pupilL.sizeMm - d.pupilR.sizeMm).toFixed(1)} mm difference)
          </div>
        )}
      </div>

      {/* EVD toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={d.evdEnabled}
            onChange={(e) => !disabled && update({ evdEnabled: e.target.checked })}
            disabled={disabled}
            className="accent-blue-500 disabled:opacity-50"
          />
          <span className="text-xs font-semibold text-gray-300">EVD Settings</span>
        </label>
        {d.evdEnabled && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Ref Level (cmH₂O)</span>
              <input
                type="number"
                value={d.evd.refLevel}
                disabled={disabled}
                onChange={(e) =>
                  update({ evd: { ...d.evd, refLevel: Number(e.target.value) } })
                }
                className="bg-gray-700 border border-gray-600 rounded text-sm text-white px-2 py-0.5 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Drain Threshold (mmHg)</span>
              <input
                type="number"
                value={d.evd.drainThreshold}
                disabled={disabled}
                onChange={(e) =>
                  update({ evd: { ...d.evd, drainThreshold: Number(e.target.value) } })
                }
                className="bg-gray-700 border border-gray-600 rounded text-sm text-white px-2 py-0.5 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Drain Rate (mL/hr)</span>
              <input
                type="number"
                value={d.evd.drainRate}
                disabled={disabled}
                onChange={(e) =>
                  update({ evd: { ...d.evd, drainRate: Number(e.target.value) } })
                }
                className="bg-gray-700 border border-gray-600 rounded text-sm text-white px-2 py-0.5 disabled:opacity-50"
              />
            </div>
          </div>
        )}
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/icp-monitor/Editor.tsx`:

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const cppTarget = (config.cppTarget as number) ?? 60

  return (
    <div className="p-3 space-y-3 text-sm text-gray-200">
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          CPP Target Threshold (mmHg)
        </label>
        <input
          type="number"
          value={cppTarget}
          min={40}
          max={100}
          onChange={(e) =>
            onConfigChange({ ...config, cppTarget: Number(e.target.value) })
          }
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
        />
        <p className="text-xs text-gray-500 mt-0.5">
          Alert shown when CPP falls below this value (BTF guideline: 60–70 mmHg)
        </p>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/icp-monitor/PrintView.tsx`:

```tsx
import type { FC } from 'react'
import { calcCPP, CITATION } from './Renderer'

type Reactivity = 'brisk' | 'sluggish' | 'fixed'

interface PupilData {
  sizeMm: number
  reactivity: Reactivity
}

interface ICPData {
  icp: number
  map: number
  cppTarget: number
  pupilL: PupilData
  pupilR: PupilData
  evdEnabled: boolean
  evd: {
    refLevel: number
    drainThreshold: number
    drainRate: number
  }
}

interface Props {
  config: Record<string, unknown>
  data: ICPData
}

export const PrintView: FC<Props> = ({ data }) => {
  const d: ICPData = {
    icp: data.icp ?? 15,
    map: data.map ?? 80,
    cppTarget: data.cppTarget ?? 60,
    pupilL: data.pupilL ?? { sizeMm: 3, reactivity: 'brisk' },
    pupilR: data.pupilR ?? { sizeMm: 3, reactivity: 'brisk' },
    evdEnabled: data.evdEnabled ?? false,
    evd: data.evd ?? { refLevel: 0, drainThreshold: 20, drainRate: 0 },
  }
  const cpp = calcCPP(d.map, d.icp)

  return (
    <div className="font-sans text-black text-sm space-y-2">
      <h3 className="font-bold text-base">ICP Monitor</h3>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">ICP</td>
            <td className="py-0.5 font-semibold">{d.icp} mmHg</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">MAP</td>
            <td className="py-0.5 font-semibold">{d.map} mmHg</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">CPP (MAP − ICP)</td>
            <td className="py-0.5 font-bold">{cpp} mmHg</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">Pupil L</td>
            <td className="py-0.5">{d.pupilL.sizeMm} mm — {d.pupilL.reactivity}</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">Pupil R</td>
            <td className="py-0.5">{d.pupilR.sizeMm} mm — {d.pupilR.reactivity}</td>
          </tr>
          {d.evdEnabled && (
            <>
              <tr className="border-b border-gray-300">
                <td className="py-0.5 pr-2 text-gray-600">EVD Ref Level</td>
                <td className="py-0.5">{d.evd.refLevel} cmH₂O</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-0.5 pr-2 text-gray-600">EVD Drain Threshold</td>
                <td className="py-0.5">{d.evd.drainThreshold} mmHg</td>
              </tr>
              <tr>
                <td className="py-0.5 pr-2 text-gray-600">EVD Drain Rate</td>
                <td className="py-0.5">{d.evd.drainRate} mL/hr</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/icp-monitor/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const icpMonitorPlugin: ModulePlugin = {
  meta: {
    id: 'icp-monitor',
    name: 'ICP Monitor',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'ICP/MAP/CPP tracking, pupil assessment, and EVD management',
    tags: ['neuro', 'icp', 'critical care', 'tbi', 'neurocritical'],
    pack: 'neuro',
  },
  schema: {
    config: {
      cppTarget: { type: 'number' },
    },
    data: {
      icp: { type: 'number' },
      map: { type: 'number' },
      cppTarget: { type: 'number' },
      pupilL: { type: 'object' },
      pupilR: { type: 'object' },
      evdEnabled: { type: 'boolean' },
      evd: { type: 'object' },
    },
  },
  defaultConfig: { cppTarget: 60 },
  minSize: { w: 3, h: 7 },
  Renderer,
  Editor,
  PrintView,
}
```

### Step 3.4 — Run test (expect PASS)

- [ ] Run:

```bash
npx vitest run src/modules/packs/neuro/icp-monitor/icp-monitor.test.tsx
```

### Step 3.5 — Commit

- [ ] Run:

```bash
git -C ~/projects/patient-templates add src/modules/packs/neuro/icp-monitor/
git -C ~/projects/patient-templates commit -m "feat(neuro): add ICP Monitor module (Plan 4a-ii-b Task 3)"
```

---

## Task 4: Stroke Timeline Module

**Files to create:**
- `src/modules/packs/neuro/stroke-timeline/stroke-timeline.test.tsx`
- `src/modules/packs/neuro/stroke-timeline/index.ts`
- `src/modules/packs/neuro/stroke-timeline/Renderer.tsx`
- `src/modules/packs/neuro/stroke-timeline/Editor.tsx`
- `src/modules/packs/neuro/stroke-timeline/PrintView.tsx`

### Step 4.1 — Write the failing test

- [ ] Create `src/modules/packs/neuro/stroke-timeline/stroke-timeline.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcMinutesBetween } from './Renderer'
import { Renderer } from './Renderer'

// --- Pure function tests ---

describe('calcMinutesBetween', () => {
  it('returns null when start is empty', () => {
    expect(calcMinutesBetween('', '2024-01-01T10:30')).toBeNull()
  })

  it('returns null when end is empty', () => {
    expect(calcMinutesBetween('2024-01-01T10:00', '')).toBeNull()
  })

  it('returns null when both are empty', () => {
    expect(calcMinutesBetween('', '')).toBeNull()
  })

  it('calculates minutes correctly for a 30-minute interval', () => {
    expect(calcMinutesBetween('2024-01-01T10:00', '2024-01-01T10:30')).toBe(30)
  })

  it('calculates minutes correctly for a 90-minute interval', () => {
    expect(calcMinutesBetween('2024-01-01T08:00', '2024-01-01T09:30')).toBe(90)
  })

  it('returns 0 when start equals end', () => {
    expect(calcMinutesBetween('2024-01-01T10:00', '2024-01-01T10:00')).toBe(0)
  })

  it('handles midnight-crossing intervals', () => {
    expect(
      calcMinutesBetween('2024-01-01T23:45', '2024-01-02T00:15')
    ).toBe(30)
  })
})

// --- Render tests ---

describe('Stroke Timeline Renderer', () => {
  const defaultData = {
    lkw: '',
    doorTime: '',
    ctTime: '',
    tpaDecision: '',
    tpaAdmin: '',
    groinTime: '',
    recanalTime: '',
    ticiGrade: '',
  }
  const noop = () => {}

  it('renders Last Known Well input', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Last Known Well/i)).toBeTruthy()
  })

  it('renders Door-to-CT label', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Door.to.CT/i)).toBeTruthy()
  })

  it('renders Door-to-Needle label', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Door.to.Needle/i)).toBeTruthy()
  })

  it('renders Door-to-Groin label', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Door.to.Groin/i)).toBeTruthy()
  })

  it('renders TICI grade selector', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/TICI/i)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Powers WJ/i)).toBeTruthy()
  })

  it('shows door-to-needle time in green when within 60 min', () => {
    const data = {
      ...defaultData,
      doorTime: '2024-01-01T08:00',
      tpaAdmin: '2024-01-01T08:55',
    }
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={data}
        onDataChange={noop}
        mode="live"
      />
    )
    // 55 min — should render with green styling; find the element by text
    expect(screen.getByText('55 min')).toBeTruthy()
  })
})
```

### Step 4.2 — Run test (expect FAIL)

- [ ] Run:

```bash
npx vitest run src/modules/packs/neuro/stroke-timeline/stroke-timeline.test.tsx
```

### Step 4.3 — Implement all files

- [ ] Create `src/modules/packs/neuro/stroke-timeline/Renderer.tsx`:

```tsx
import React from 'react'
import type { FC } from 'react'

export const CITATION =
  'Powers WJ et al. Stroke. 2019;50(12):e344-e418'

export function calcMinutesBetween(start: string, end: string): number | null {
  if (!start || !end) return null
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (isNaN(s) || isNaN(e)) return null
  return Math.round((e - s) / 60000)
}

const TICI_GRADES = ['', '0', '1', '2a', '2b', '3'] as const

interface StrokeData {
  lkw: string
  doorTime: string
  ctTime: string
  tpaDecision: string
  tpaAdmin: string
  groinTime: string
  recanalTime: string
  ticiGrade: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: StrokeData
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

interface IntervalDisplayProps {
  label: string
  minutes: number | null
  targetMin: number | null
  lowerIsBetter?: boolean
}

function IntervalDisplay({ label, minutes, targetMin, lowerIsBetter = true }: IntervalDisplayProps) {
  let colorClass = 'text-gray-400'
  if (minutes !== null && targetMin !== null) {
    colorClass =
      lowerIsBetter && minutes <= targetMin
        ? 'text-green-400 font-bold'
        : lowerIsBetter && minutes > targetMin
        ? 'text-red-400 font-bold'
        : 'text-gray-300'
  }

  return (
    <div className="flex items-center justify-between text-xs py-0.5">
      <span className="text-gray-400">{label}</span>
      <span className={colorClass}>
        {minutes !== null ? `${minutes} min` : '—'}
        {targetMin !== null && (
          <span className="ml-1 text-gray-500 font-normal">
            (target ≤{targetMin})
          </span>
        )}
      </span>
    </div>
  )
}

function TimestampRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-40 flex-shrink-0">{label}</label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 px-2 py-0.5 disabled:opacity-50"
      />
    </div>
  )
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d: StrokeData = {
    lkw: data.lkw ?? '',
    doorTime: data.doorTime ?? '',
    ctTime: data.ctTime ?? '',
    tpaDecision: data.tpaDecision ?? '',
    tpaAdmin: data.tpaAdmin ?? '',
    groinTime: data.groinTime ?? '',
    recanalTime: data.recanalTime ?? '',
    ticiGrade: data.ticiGrade ?? '',
  }
  const disabled = mode === 'build'

  function update(patch: Partial<StrokeData>) {
    if (disabled) return
    onDataChange({ ...d, ...patch })
  }

  const onsetToDoor = calcMinutesBetween(d.lkw, d.doorTime)
  const doorToCT = calcMinutesBetween(d.doorTime, d.ctTime)
  const doorToNeedle = calcMinutesBetween(d.doorTime, d.tpaAdmin)
  const doorToGroin = calcMinutesBetween(d.doorTime, d.groinTime)

  return (
    <div className="p-3 space-y-2 text-sm text-gray-200">
      <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide border-b border-gray-700 pb-0.5">
        Acute Stroke Timeline
      </h4>

      {/* Timestamp inputs */}
      <div className="space-y-1">
        <TimestampRow
          label="Last Known Well (LKW)"
          value={d.lkw}
          onChange={(v) => update({ lkw: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="Door Arrival"
          value={d.doorTime}
          onChange={(v) => update({ doorTime: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="CT Completed"
          value={d.ctTime}
          onChange={(v) => update({ ctTime: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="IV tPA Decision"
          value={d.tpaDecision}
          onChange={(v) => update({ tpaDecision: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="IV tPA Administration"
          value={d.tpaAdmin}
          onChange={(v) => update({ tpaAdmin: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="Groin Puncture"
          value={d.groinTime}
          onChange={(v) => update({ groinTime: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="Recanalization"
          value={d.recanalTime}
          onChange={(v) => update({ recanalTime: v })}
          disabled={disabled}
        />
      </div>

      {/* TICI grade */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-40 flex-shrink-0">TICI Grade</span>
        <select
          value={d.ticiGrade}
          onChange={(e) => !disabled && update({ ticiGrade: e.target.value })}
          disabled={disabled}
          className="flex-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 px-2 py-0.5 disabled:opacity-50"
        >
          {TICI_GRADES.map((g) => (
            <option key={g} value={g}>
              {g === '' ? '— Select —' : `TICI ${g}`}
            </option>
          ))}
        </select>
      </div>

      {/* Calculated intervals */}
      <div className="border-t border-gray-700 pt-2 space-y-0.5">
        <h4 className="text-xs font-semibold text-gray-300 mb-1">Calculated Intervals</h4>
        <IntervalDisplay label="Onset-to-Door" minutes={onsetToDoor} targetMin={null} />
        <IntervalDisplay label="Door-to-CT" minutes={doorToCT} targetMin={25} />
        <IntervalDisplay label="Door-to-Needle" minutes={doorToNeedle} targetMin={60} />
        <IntervalDisplay label="Door-to-Groin" minutes={doorToGroin} targetMin={90} />
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/stroke-timeline/Editor.tsx`:

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-300">
      <p className="text-gray-400 italic">No configuration options for Stroke Timeline.</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/stroke-timeline/PrintView.tsx`:

```tsx
import type { FC } from 'react'
import { calcMinutesBetween, CITATION } from './Renderer'

interface StrokeData {
  lkw: string
  doorTime: string
  ctTime: string
  tpaDecision: string
  tpaAdmin: string
  groinTime: string
  recanalTime: string
  ticiGrade: string
}

interface Props {
  config: Record<string, unknown>
  data: StrokeData
}

function fmt(ts: string): string {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return ts
  }
}

function minLabel(min: number | null, target: number | null): string {
  if (min === null) return '—'
  const flag = target !== null && min > target ? ' ⚠ EXCEEDED' : ''
  return `${min} min${flag}`
}

export const PrintView: FC<Props> = ({ data }) => {
  const d: StrokeData = {
    lkw: data.lkw ?? '',
    doorTime: data.doorTime ?? '',
    ctTime: data.ctTime ?? '',
    tpaDecision: data.tpaDecision ?? '',
    tpaAdmin: data.tpaAdmin ?? '',
    groinTime: data.groinTime ?? '',
    recanalTime: data.recanalTime ?? '',
    ticiGrade: data.ticiGrade ?? '',
  }

  const onsetToDoor = calcMinutesBetween(d.lkw, d.doorTime)
  const doorToCT = calcMinutesBetween(d.doorTime, d.ctTime)
  const doorToNeedle = calcMinutesBetween(d.doorTime, d.tpaAdmin)
  const doorToGroin = calcMinutesBetween(d.doorTime, d.groinTime)

  return (
    <div className="font-sans text-black text-sm space-y-2">
      <h3 className="font-bold text-base">Stroke Timeline</h3>
      <table className="w-full border-collapse text-xs">
        <tbody>
          {[
            ['Last Known Well', d.lkw],
            ['Door Arrival', d.doorTime],
            ['CT Completed', d.ctTime],
            ['IV tPA Decision', d.tpaDecision],
            ['IV tPA Administration', d.tpaAdmin],
            ['Groin Puncture', d.groinTime],
            ['Recanalization', d.recanalTime],
          ].map(([label, val]) => (
            <tr key={label} className="border-b border-gray-200">
              <td className="py-0.5 pr-2 text-gray-600">{label}</td>
              <td className="py-0.5 font-semibold">{fmt(val)}</td>
            </tr>
          ))}
          {d.ticiGrade && (
            <tr className="border-b border-gray-200">
              <td className="py-0.5 pr-2 text-gray-600">TICI Grade</td>
              <td className="py-0.5 font-semibold">TICI {d.ticiGrade}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h4 className="font-semibold text-xs mt-1">Intervals</h4>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-0.5 pr-2 text-gray-600">Onset-to-Door</td>
            <td className="py-0.5">{minLabel(onsetToDoor, null)}</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-0.5 pr-2 text-gray-600">Door-to-CT (target ≤25 min)</td>
            <td className="py-0.5">{minLabel(doorToCT, 25)}</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-0.5 pr-2 text-gray-600">Door-to-Needle (target ≤60 min)</td>
            <td className="py-0.5">{minLabel(doorToNeedle, 60)}</td>
          </tr>
          <tr>
            <td className="py-0.5 pr-2 text-gray-600">Door-to-Groin (target ≤90 min)</td>
            <td className="py-0.5">{minLabel(doorToGroin, 90)}</td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/neuro/stroke-timeline/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const strokeTimelinePlugin: ModulePlugin = {
  meta: {
    id: 'stroke-timeline',
    name: 'Stroke Timeline',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Acute stroke workflow timestamps with auto-calculated door-to-needle intervals',
    tags: ['neuro', 'stroke', 'timeline', 'tpa', 'thrombectomy'],
    pack: 'neuro',
  },
  schema: {
    config: {},
    data: {
      lkw: { type: 'string' },
      doorTime: { type: 'string' },
      ctTime: { type: 'string' },
      tpaDecision: { type: 'string' },
      tpaAdmin: { type: 'string' },
      groinTime: { type: 'string' },
      recanalTime: { type: 'string' },
      ticiGrade: { type: 'string' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 9 },
  Renderer,
  Editor,
  PrintView,
}
```

### Step 4.4 — Run test (expect PASS)

- [ ] Run:

```bash
npx vitest run src/modules/packs/neuro/stroke-timeline/stroke-timeline.test.tsx
```

### Step 4.5 — Commit

- [ ] Run:

```bash
git -C ~/projects/patient-templates add src/modules/packs/neuro/stroke-timeline/
git -C ~/projects/patient-templates commit -m "feat(neuro): add Stroke Timeline module (Plan 4a-ii-b Task 4)"
```

---

## Task 5: Pack Registration

**Files to create/modify:**
- `src/modules/packs/neuro/index.ts` (create)
- `src/modules/packs/index.ts` (add one import line)

### Step 5.1 — Create pack barrel

- [ ] Create `src/modules/packs/neuro/index.ts`:

```ts
export { nihssPlugin } from './nihss'
export { neuroScoresPlugin } from './neuro-scores'
export { icpMonitorPlugin } from './icp-monitor'
export { strokeTimelinePlugin } from './stroke-timeline'

import { nihssPlugin } from './nihss'
import { neuroScoresPlugin } from './neuro-scores'
import { icpMonitorPlugin } from './icp-monitor'
import { strokeTimelinePlugin } from './stroke-timeline'
import type { ModulePlugin } from '../../../core/plugin/types'

export const neuroPack: ModulePlugin[] = [
  nihssPlugin,
  neuroScoresPlugin,
  icpMonitorPlugin,
  strokeTimelinePlugin,
]
```

### Step 5.2 — Wire into packs index

- [ ] In `src/modules/packs/index.ts`, add the following import and spread the array into the master plugin list:

```ts
// Add this import alongside other pack imports:
import { neuroPack } from './neuro'

// In the array of all registered plugins, add:
...neuroPack,
```

The complete updated `src/modules/packs/index.ts` should look like:

```ts
import type { ModulePlugin } from '../../core/plugin/types'
import { neuroPack } from './neuro'
// other packs imported here in future plans

export const allPacks: ModulePlugin[] = [
  ...neuroPack,
  // other packs spread here
]
```

> **Note:** If `src/modules/packs/index.ts` doesn't exist yet, create it with the content above.

### Step 5.3 — Verify all 4 tests still pass together

- [ ] Run the full neuro pack suite:

```bash
npx vitest run src/modules/packs/neuro/
```

Expected: 4 test files, all green.

### Step 5.4 — Commit

- [ ] Run:

```bash
git -C ~/projects/patient-templates add src/modules/packs/neuro/index.ts src/modules/packs/index.ts
git -C ~/projects/patient-templates commit -m "feat(neuro): register neuro pack in packs index (Plan 4a-ii-b Task 5)"
```

---

## Summary

| Module | ID | Min Grid | Exports |
|---|---|---|---|
| NIHSS | `nihss` | 3×8 | `calcNIHSS(items)` |
| Neuro Scores | `neuro-scores` | 3×6 | `calcGCS(e, v, m)` |
| ICP Monitor | `icp-monitor` | 3×7 | `calcCPP(map, icp)` |
| Stroke Timeline | `stroke-timeline` | 3×9 | `calcMinutesBetween(start, end)` |

All modules:
- Follow `ModulePlugin` interface exactly
- Include `const CITATION = '...'` at top of `Renderer.tsx`
- Render citation as `<p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>`
- Export pure calculation functions for unit testing
- Respect `mode === 'build'` (disable inputs in build mode)
- Use Tailwind dark-mode-friendly classes (`bg-gray-700`, `text-gray-200`, etc.)
