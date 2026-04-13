# Patient Template Builder — Plan 4c-i-a: Endocrinology Pack

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Endocrinology specialty pack (4 modules) with evidence-cited glucose and DKA management tools.

**Architecture:** Pack lives under `src/modules/packs/endo/`. Imported by `src/modules/packs/index.ts`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/modules/packs/endo/
├── index.ts                          — Re-exports all 4 ModulePlugin objects as endoPack array
├── insulin-infusion/
│   ├── index.ts                      — ModulePlugin definition + calcTimeAtGoal export
│   ├── Renderer.tsx                  — Rate input, glucose entry table, time-at-goal display
│   ├── Editor.tsx                    — Target range + protocol name config
│   ├── PrintView.tsx                 — Static summary for print
│   └── insulin-infusion.test.tsx     — Pure fn + render tests
├── glucose-log/
│   ├── index.ts                      — ModulePlugin definition + calcEA1c + calcTIR exports
│   ├── Renderer.tsx                  — Timestamped glucose table, sparkline, TIR %, eA1c
│   ├── Editor.tsx                    — Target low/high config
│   ├── PrintView.tsx                 — Static table + stats for print
│   └── glucose-log.test.tsx          — Pure fn + render tests
├── dka-tracker/
│   ├── index.ts                      — ModulePlugin definition + calcAnionGap + isDKAClosed exports
│   ├── Renderer.tsx                  — Trend table, AG auto-calc, DKA closure checklist
│   ├── Editor.tsx                    — (minimal — no user config needed)
│   ├── PrintView.tsx                 — Static trend table + closure status for print
│   └── dka-tracker.test.tsx          — Pure fn + render tests
└── steroid-taper/
    ├── index.ts                      — ModulePlugin definition
    ├── Renderer.tsx                  — Drug/dose/schedule table, today-highlight, AI risk note
    ├── Editor.tsx                    — Drug name + unit config
    ├── PrintView.tsx                 — Static taper schedule for print
    └── steroid-taper.test.tsx        — Render tests
```

---

## Task 1: insulin-infusion module

### Overview

Tracks continuous insulin infusion rate and glucose entries. Calculates percentage of glucose readings within the configured target range (time-at-goal). Citation is ADA 2024 Standards of Care.

**Data shape:**
```ts
{
  ratePerHour: number;
  glucoseEntries: Array<{ timestamp: string; glucose: number }>;
  targetLow: number;   // default 140
  targetHigh: number;  // default 180
  protocolName: string;
}
```

**Pure function export:**
```ts
export function calcTimeAtGoal(entries: number[], low: number, high: number): number
// Returns percentage (0-100) of entries within [low, high]. Returns 0 if empty.
```

**Citation constant (top of index.ts):**
```ts
const CITATION = 'ADA Standards of Diabetes Care 2024. Diabetes Care. 2024;47(Suppl 1):S1-S321'
```

---

- [ ] **Step 1: Write failing tests**

Create `src/modules/packs/endo/insulin-infusion/insulin-infusion.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcTimeAtGoal } from './index'
import Renderer from './Renderer'

describe('calcTimeAtGoal', () => {
  it('returns 100 when all entries are within range', () => {
    expect(calcTimeAtGoal([150, 160, 170], 140, 180)).toBe(100)
  })

  it('returns 0 when no entries are within range', () => {
    expect(calcTimeAtGoal([200, 210, 220], 140, 180)).toBe(0)
  })

  it('returns 50 when half the entries are within range', () => {
    expect(calcTimeAtGoal([150, 200], 140, 180)).toBe(50)
  })

  it('includes boundary values as in-range', () => {
    expect(calcTimeAtGoal([140, 180], 140, 180)).toBe(100)
  })

  it('returns 0 for empty entries array', () => {
    expect(calcTimeAtGoal([], 140, 180)).toBe(0)
  })
})

describe('Renderer — insulin-infusion', () => {
  const defaultData = {
    ratePerHour: 5,
    glucoseEntries: [
      { timestamp: '2024-01-01T08:00', glucose: 150 },
      { timestamp: '2024-01-01T10:00', glucose: 200 },
    ],
    targetLow: 140,
    targetHigh: 180,
    protocolName: 'Test Protocol',
  }
  const defaultConfig = {}
  const noop = () => {}

  it('renders the rate input with current value', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('5')).toBeTruthy()
  })

  it('renders the time-at-goal percentage', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    // 1 of 2 entries in range = 50%
    expect(screen.getByText(/50%/)).toBeTruthy()
  })

  it('renders the citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/ADA Standards of Diabetes Care 2024/)).toBeTruthy()
  })

  it('renders all glucose entries', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('150')).toBeTruthy()
    expect(screen.getByText('200')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run src/modules/packs/endo/insulin-infusion/insulin-infusion.test.tsx
```

Expected: tests fail (files don't exist yet).

- [ ] **Step 3: Write `src/modules/packs/endo/insulin-infusion/index.ts`**

```ts
import { FC } from 'react'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'
import type { ModulePlugin } from '@/core/plugin/types'

export const CITATION =
  'ADA Standards of Diabetes Care 2024. Diabetes Care. 2024;47(Suppl 1):S1-S321'

export function calcTimeAtGoal(
  entries: number[],
  low: number,
  high: number
): number {
  if (entries.length === 0) return 0
  const inRange = entries.filter((g) => g >= low && g <= high).length
  return Math.round((inRange / entries.length) * 100)
}

const insulinInfusion: ModulePlugin = {
  meta: {
    id: 'insulin-infusion',
    name: 'Insulin Infusion',
    version: '1.0.0',
    author: 'Endo Pack',
    description: 'Track continuous insulin infusion rate and glucose entries with time-at-goal.',
    tags: ['glucose', 'insulin', 'ICU', 'endocrinology'],
    pack: 'endo',
  },
  schema: {
    config: {},
    data: {
      ratePerHour: 'number',
      glucoseEntries: 'array',
      targetLow: 'number',
      targetHigh: 'number',
      protocolName: 'string',
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default insulinInfusion
```

- [ ] **Step 4: Write `src/modules/packs/endo/insulin-infusion/Renderer.tsx`**

```tsx
import React, { useState } from 'react'
import { CITATION, calcTimeAtGoal } from './index'

interface GlucoseEntry {
  timestamp: string
  glucose: number
}

interface InsulinData {
  ratePerHour: number
  glucoseEntries: GlucoseEntry[]
  targetLow: number
  targetHigh: number
  protocolName: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export default function Renderer({ data, onDataChange, mode }: Props) {
  const d = data as InsulinData
  const entries = d.glucoseEntries ?? []
  const targetLow = d.targetLow ?? 140
  const targetHigh = d.targetHigh ?? 180
  const timeAtGoal = calcTimeAtGoal(entries.map((e) => e.glucose), targetLow, targetHigh)

  const [newTimestamp, setNewTimestamp] = useState('')
  const [newGlucose, setNewGlucose] = useState('')

  function addEntry() {
    if (!newGlucose) return
    const entry: GlucoseEntry = {
      timestamp: newTimestamp || new Date().toISOString().slice(0, 16),
      glucose: Number(newGlucose),
    }
    onDataChange({ ...d, glucoseEntries: [...entries, entry] })
    setNewTimestamp('')
    setNewGlucose('')
  }

  function removeEntry(idx: number) {
    onDataChange({
      ...d,
      glucoseEntries: entries.filter((_, i) => i !== idx),
    })
  }

  const disabled = mode === 'build'

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 dark:text-gray-300">Protocol:</label>
        <input
          className="border rounded px-2 py-1 flex-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          value={d.protocolName ?? ''}
          disabled={disabled}
          onChange={(e) => onDataChange({ ...d, protocolName: e.target.value })}
          placeholder="Protocol name"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 dark:text-gray-300">Rate (units/hr):</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          value={d.ratePerHour ?? 0}
          disabled={disabled}
          onChange={(e) => onDataChange({ ...d, ratePerHour: Number(e.target.value) })}
          min={0}
          step={0.5}
        />
        <span className="text-gray-500 dark:text-gray-400 text-xs">units/hr</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">Target:</span>
        <span className="text-gray-600 dark:text-gray-300">{targetLow}–{targetHigh} mg/dL</span>
        <span
          className={`ml-auto font-bold text-base ${
            timeAtGoal >= 70 ? 'text-green-600' : timeAtGoal >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}
        >
          {timeAtGoal}% time-at-goal
        </span>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border dark:border-gray-600 px-2 py-1 text-left">Timestamp</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-right">Glucose (mg/dL)</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-center">In Range</th>
            {!disabled && <th className="border dark:border-gray-600 px-2 py-1"></th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const inRange = entry.glucose >= targetLow && entry.glucose <= targetHigh
            return (
              <tr key={idx} className={inRange ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                <td className="border dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-300">{entry.timestamp}</td>
                <td className="border dark:border-gray-600 px-2 py-1 text-right font-mono text-gray-900 dark:text-gray-100">{entry.glucose}</td>
                <td className="border dark:border-gray-600 px-2 py-1 text-center">
                  {inRange ? '✓' : '✗'}
                </td>
                {!disabled && (
                  <td className="border dark:border-gray-600 px-2 py-1 text-center">
                    <button
                      onClick={() => removeEntry(idx)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>

      {!disabled && (
        <div className="flex gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Timestamp</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newTimestamp}
              onChange={(e) => setNewTimestamp(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Glucose</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-20 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newGlucose}
              onChange={(e) => setNewGlucose(e.target.value)}
              placeholder="mg/dL"
            />
          </div>
          <button
            onClick={addEntry}
            className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 5: Write `src/modules/packs/endo/insulin-infusion/Editor.tsx`**

```tsx
import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export default function Editor({ config, onConfigChange }: Props) {
  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 w-32">Target Low (mg/dL)</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24"
          value={(config.targetLow as number) ?? 140}
          onChange={(e) => onConfigChange({ ...config, targetLow: Number(e.target.value) })}
          min={40}
          max={400}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 w-32">Target High (mg/dL)</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24"
          value={(config.targetHigh as number) ?? 180}
          onChange={(e) => onConfigChange({ ...config, targetHigh: Number(e.target.value) })}
          min={40}
          max={400}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Write `src/modules/packs/endo/insulin-infusion/PrintView.tsx`**

```tsx
import React from 'react'
import { CITATION, calcTimeAtGoal } from './index'

interface GlucoseEntry {
  timestamp: string
  glucose: number
}

interface InsulinData {
  ratePerHour: number
  glucoseEntries: GlucoseEntry[]
  targetLow: number
  targetHigh: number
  protocolName: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export default function PrintView({ data }: Props) {
  const d = data as InsulinData
  const entries = d.glucoseEntries ?? []
  const targetLow = d.targetLow ?? 140
  const targetHigh = d.targetHigh ?? 180
  const timeAtGoal = calcTimeAtGoal(entries.map((e) => e.glucose), targetLow, targetHigh)

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base">Insulin Infusion Log</h3>
      {d.protocolName && <p><span className="font-medium">Protocol:</span> {d.protocolName}</p>}
      <p><span className="font-medium">Rate:</span> {d.ratePerHour ?? 0} units/hr</p>
      <p><span className="font-medium">Target Range:</span> {targetLow}–{targetHigh} mg/dL</p>
      <p><span className="font-medium">Time at Goal:</span> {timeAtGoal}%</p>
      <table className="w-full border-collapse text-xs mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Timestamp</th>
            <th className="border px-2 py-1 text-right">Glucose (mg/dL)</th>
            <th className="border px-2 py-1 text-center">In Range</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{entry.timestamp}</td>
              <td className="border px-2 py-1 text-right font-mono">{entry.glucose}</td>
              <td className="border px-2 py-1 text-center">
                {entry.glucose >= targetLow && entry.glucose <= targetHigh ? '✓' : '✗'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
npx vitest run src/modules/packs/endo/insulin-infusion/insulin-infusion.test.tsx
```

All tests must pass before proceeding.

- [ ] **Step 8: Commit**

```bash
git -C ~/projects/patient-templates add src/modules/packs/endo/insulin-infusion/
git -C ~/projects/patient-templates commit -m "feat(endo): add insulin-infusion module with time-at-goal calculator"
```

---

## Task 2: glucose-log module

### Overview

Timestamped glucose reading log. Computes time-in-range (TIR) and estimated A1c (eA1c). Renders a div-based sparkline (no chart library). Defaults: 70–180 mg/dL (non-ICU).

**Data shape:**
```ts
{
  entries: Array<{ timestamp: string; glucose: number }>;
  targetLow: number;   // default 70
  targetHigh: number;  // default 180
}
```

**Pure function exports:**
```ts
export function calcTIR(entries: number[], low: number, high: number): number
// % of entries within [low, high]; returns 0 if empty.

export function calcEA1c(avgGlucose: number): number
// (avgGlucose + 46.7) / 28.7, rounded to 1 decimal.
```

**Citation constants (top of index.ts):**
```ts
const TIR_CITATION = 'Battelino T et al. Diabetes Care. 2019;42(8):1593-1603'
const EA1C_CITATION = 'Nathan DM et al. Diabetes Care. 2008;31(8):1473-1478'
```

---

- [ ] **Step 1: Write failing tests**

Create `src/modules/packs/endo/glucose-log/glucose-log.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcTIR, calcEA1c } from './index'
import Renderer from './Renderer'

describe('calcTIR', () => {
  it('returns 100 when all entries are in range', () => {
    expect(calcTIR([80, 100, 150], 70, 180)).toBe(100)
  })

  it('returns 0 when no entries are in range', () => {
    expect(calcTIR([50, 200, 300], 70, 180)).toBe(0)
  })

  it('returns 50 for half in range', () => {
    expect(calcTIR([100, 250], 70, 180)).toBe(50)
  })

  it('includes boundary values', () => {
    expect(calcTIR([70, 180], 70, 180)).toBe(100)
  })

  it('returns 0 for empty array', () => {
    expect(calcTIR([], 70, 180)).toBe(0)
  })
})

describe('calcEA1c', () => {
  it('returns correct value for avg glucose 154 (expected ~7.0)', () => {
    // (154 + 46.7) / 28.7 = 200.7 / 28.7 ≈ 6.99 → 7.0
    expect(calcEA1c(154)).toBe(7.0)
  })

  it('returns correct value for avg glucose 126 (expected ~6.0)', () => {
    // (126 + 46.7) / 28.7 = 172.7 / 28.7 ≈ 6.02 → 6.0
    expect(calcEA1c(126)).toBe(6.0)
  })

  it('returns a number rounded to 1 decimal', () => {
    const result = calcEA1c(200)
    expect(result).toBe(Math.round(result * 10) / 10)
  })
})

describe('Renderer — glucose-log', () => {
  const defaultData = {
    entries: [
      { timestamp: '2024-01-01T08:00', glucose: 100 },
      { timestamp: '2024-01-01T12:00', glucose: 250 },
    ],
    targetLow: 70,
    targetHigh: 180,
  }
  const noop = () => {}

  it('renders TIR percentage', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    // 1 of 2 entries in range = 50%
    expect(screen.getByText(/50%/)).toBeTruthy()
  })

  it('renders eA1c', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    // avg = (100+250)/2 = 175 → (175+46.7)/28.7 ≈ 7.7
    expect(screen.getByText(/eA1c/)).toBeTruthy()
  })

  it('renders both TIR and eA1c citations', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText(/Battelino/)).toBeTruthy()
    expect(screen.getByText(/Nathan/)).toBeTruthy()
  })

  it('renders glucose entries in table', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText('100')).toBeTruthy()
    expect(screen.getByText('250')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run src/modules/packs/endo/glucose-log/glucose-log.test.tsx
```

- [ ] **Step 3: Write `src/modules/packs/endo/glucose-log/index.ts`**

```ts
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'
import type { ModulePlugin } from '@/core/plugin/types'

export const TIR_CITATION =
  'Battelino T et al. Diabetes Care. 2019;42(8):1593-1603'
export const EA1C_CITATION =
  'Nathan DM et al. Diabetes Care. 2008;31(8):1473-1478'

export function calcTIR(entries: number[], low: number, high: number): number {
  if (entries.length === 0) return 0
  const inRange = entries.filter((g) => g >= low && g <= high).length
  return Math.round((inRange / entries.length) * 100)
}

export function calcEA1c(avgGlucose: number): number {
  return Math.round(((avgGlucose + 46.7) / 28.7) * 10) / 10
}

const glucoseLog: ModulePlugin = {
  meta: {
    id: 'glucose-log',
    name: 'Glucose Log',
    version: '1.0.0',
    author: 'Endo Pack',
    description: 'Timestamped glucose log with sparkline, time-in-range, and eA1c estimator.',
    tags: ['glucose', 'diabetes', 'TIR', 'A1c', 'endocrinology'],
    pack: 'endo',
  },
  schema: {
    config: {},
    data: {
      entries: 'array',
      targetLow: 'number',
      targetHigh: 'number',
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default glucoseLog
```

- [ ] **Step 4: Write `src/modules/packs/endo/glucose-log/Renderer.tsx`**

```tsx
import React, { useState } from 'react'
import { TIR_CITATION, EA1C_CITATION, calcTIR, calcEA1c } from './index'

interface GlucoseEntry {
  timestamp: string
  glucose: number
}

interface GlucoseData {
  entries: GlucoseEntry[]
  targetLow: number
  targetHigh: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function Sparkline({
  entries,
  targetLow,
  targetHigh,
}: {
  entries: GlucoseEntry[]
  targetLow: number
  targetHigh: number
}) {
  if (entries.length === 0) return null
  const values = entries.map((e) => e.glucose)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-0.5 h-12 my-2" aria-label="glucose sparkline">
      {entries.map((entry, idx) => {
        const height = Math.round(((entry.glucose - min) / range) * 40) + 4
        const inRange = entry.glucose >= targetLow && entry.glucose <= targetHigh
        return (
          <div
            key={idx}
            title={`${entry.timestamp}: ${entry.glucose} mg/dL`}
            className={`w-2 rounded-sm ${inRange ? 'bg-green-500' : 'bg-red-400'}`}
            style={{ height: `${height}px` }}
          />
        )
      })}
    </div>
  )
}

export default function Renderer({ data, onDataChange, mode }: Props) {
  const d = data as GlucoseData
  const entries = d.entries ?? []
  const targetLow = d.targetLow ?? 70
  const targetHigh = d.targetHigh ?? 180

  const glucoseValues = entries.map((e) => e.glucose)
  const tir = calcTIR(glucoseValues, targetLow, targetHigh)
  const avgGlucose =
    entries.length > 0
      ? glucoseValues.reduce((a, b) => a + b, 0) / entries.length
      : 0
  const ea1c = entries.length > 0 ? calcEA1c(avgGlucose) : null

  const [newTimestamp, setNewTimestamp] = useState('')
  const [newGlucose, setNewGlucose] = useState('')
  const disabled = mode === 'build'

  function addEntry() {
    if (!newGlucose) return
    const entry: GlucoseEntry = {
      timestamp: newTimestamp || new Date().toISOString().slice(0, 16),
      glucose: Number(newGlucose),
    }
    onDataChange({ ...d, entries: [...entries, entry] })
    setNewTimestamp('')
    setNewGlucose('')
  }

  function removeEntry(idx: number) {
    onDataChange({ ...d, entries: entries.filter((_, i) => i !== idx) })
  }

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Target: {targetLow}–{targetHigh} mg/dL
        </span>
        <div className="flex items-center gap-4">
          <span
            className={`font-bold ${
              tir >= 70 ? 'text-green-600' : tir >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}
          >
            TIR: {tir}%
          </span>
          {ea1c !== null && (
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              eA1c: {ea1c}%
            </span>
          )}
        </div>
      </div>

      <Sparkline entries={entries} targetLow={targetLow} targetHigh={targetHigh} />

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border dark:border-gray-600 px-2 py-1 text-left">Timestamp</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-right">Glucose (mg/dL)</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-center">Status</th>
            {!disabled && <th className="border dark:border-gray-600 px-2 py-1"></th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const low = entry.glucose < targetLow
            const high = entry.glucose > targetHigh
            return (
              <tr
                key={idx}
                className={
                  low
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : high
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-green-50 dark:bg-green-900/20'
                }
              >
                <td className="border dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-300">{entry.timestamp}</td>
                <td className="border dark:border-gray-600 px-2 py-1 text-right font-mono text-gray-900 dark:text-gray-100">{entry.glucose}</td>
                <td className="border dark:border-gray-600 px-2 py-1 text-center text-xs">
                  {low ? 'Low' : high ? 'High' : 'In Range'}
                </td>
                {!disabled && (
                  <td className="border dark:border-gray-600 px-2 py-1 text-center">
                    <button
                      onClick={() => removeEntry(idx)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>

      {!disabled && (
        <div className="flex gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Timestamp</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newTimestamp}
              onChange={(e) => setNewTimestamp(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Glucose</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-20 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newGlucose}
              onChange={(e) => setNewGlucose(e.target.value)}
              placeholder="mg/dL"
            />
          </div>
          <button
            onClick={addEntry}
            className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}

      <p className="text-xs italic text-gray-400 mt-1">{TIR_CITATION}</p>
      <p className="text-xs italic text-gray-400">{EA1C_CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 5: Write `src/modules/packs/endo/glucose-log/Editor.tsx`**

```tsx
import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export default function Editor({ config, onConfigChange }: Props) {
  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 w-32">Target Low (mg/dL)</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24"
          value={(config.targetLow as number) ?? 70}
          onChange={(e) => onConfigChange({ ...config, targetLow: Number(e.target.value) })}
          min={40}
          max={400}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 w-32">Target High (mg/dL)</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24"
          value={(config.targetHigh as number) ?? 180}
          onChange={(e) => onConfigChange({ ...config, targetHigh: Number(e.target.value) })}
          min={40}
          max={400}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Write `src/modules/packs/endo/glucose-log/PrintView.tsx`**

```tsx
import React from 'react'
import { TIR_CITATION, EA1C_CITATION, calcTIR, calcEA1c } from './index'

interface GlucoseEntry {
  timestamp: string
  glucose: number
}

interface GlucoseData {
  entries: GlucoseEntry[]
  targetLow: number
  targetHigh: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export default function PrintView({ data }: Props) {
  const d = data as GlucoseData
  const entries = d.entries ?? []
  const targetLow = d.targetLow ?? 70
  const targetHigh = d.targetHigh ?? 180
  const glucoseValues = entries.map((e) => e.glucose)
  const tir = calcTIR(glucoseValues, targetLow, targetHigh)
  const avg =
    entries.length > 0
      ? glucoseValues.reduce((a, b) => a + b, 0) / entries.length
      : 0
  const ea1c = entries.length > 0 ? calcEA1c(avg) : null

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base">Glucose Log</h3>
      <p><span className="font-medium">Target Range:</span> {targetLow}–{targetHigh} mg/dL</p>
      <p><span className="font-medium">Time in Range:</span> {tir}%</p>
      {ea1c !== null && (
        <p><span className="font-medium">Estimated A1c:</span> {ea1c}%</p>
      )}
      <table className="w-full border-collapse text-xs mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Timestamp</th>
            <th className="border px-2 py-1 text-right">Glucose (mg/dL)</th>
            <th className="border px-2 py-1 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{entry.timestamp}</td>
              <td className="border px-2 py-1 text-right font-mono">{entry.glucose}</td>
              <td className="border px-2 py-1 text-center">
                {entry.glucose < targetLow ? 'Low' : entry.glucose > targetHigh ? 'High' : 'In Range'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-1">{TIR_CITATION}</p>
      <p className="text-xs italic text-gray-400">{EA1C_CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
npx vitest run src/modules/packs/endo/glucose-log/glucose-log.test.tsx
```

All tests must pass before proceeding.

- [ ] **Step 8: Commit**

```bash
git -C ~/projects/patient-templates add src/modules/packs/endo/glucose-log/
git -C ~/projects/patient-templates commit -m "feat(endo): add glucose-log module with TIR and eA1c calculator"
```

---

## Task 3: dka-tracker module

### Overview

Tracks DKA trend data with auto-calculated anion gap. Displays a closure criteria checklist that turns green when all four criteria are met. Citation: Kitabchi 2009 DKA management guidelines.

**Data shape:**
```ts
{
  entries: Array<{
    timestamp: string;
    glucose: number;
    na: number;
    cl: number;
    hco3: number;
    ketones: 'trace' | 'moderate' | 'large' | 'negative';
  }>;
  patientEating: boolean;
}
```

**Pure function exports:**
```ts
export function calcAnionGap(na: number, cl: number, hco3: number): number
// na - cl - hco3

export function isDKAClosed(ag: number, hco3: number, glucose: number, eatingPO: boolean): boolean
// ag < 12 AND hco3 >= 18 AND glucose < 200 AND eatingPO
```

**DKA closure criteria (all 4 must be met):**
1. Anion gap < 12 mEq/L
2. HCO3 ≥ 18 mEq/L
3. Glucose < 200 mg/dL
4. Patient tolerating PO (checkbox)

**Citation constant (top of index.ts):**
```ts
const CITATION = 'Kitabchi AE et al. Diabetes Care. 2009;32(7):1335-1343'
```

---

- [ ] **Step 1: Write failing tests**

Create `src/modules/packs/endo/dka-tracker/dka-tracker.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcAnionGap, isDKAClosed } from './index'
import Renderer from './Renderer'

describe('calcAnionGap', () => {
  it('calculates correctly: 140 - 100 - 24 = 16', () => {
    expect(calcAnionGap(140, 100, 24)).toBe(16)
  })

  it('calculates correctly: 138 - 105 - 22 = 11', () => {
    expect(calcAnionGap(138, 105, 22)).toBe(11)
  })

  it('handles zero values', () => {
    expect(calcAnionGap(0, 0, 0)).toBe(0)
  })
})

describe('isDKAClosed', () => {
  it('returns true when all 4 criteria are met', () => {
    expect(isDKAClosed(10, 20, 180, true)).toBe(true)
  })

  it('returns false when AG >= 12', () => {
    expect(isDKAClosed(12, 20, 180, true)).toBe(false)
  })

  it('returns false when HCO3 < 18', () => {
    expect(isDKAClosed(10, 17, 180, true)).toBe(false)
  })

  it('returns false when glucose >= 200', () => {
    expect(isDKAClosed(10, 20, 200, true)).toBe(false)
  })

  it('returns false when patient not eating PO', () => {
    expect(isDKAClosed(10, 20, 180, false)).toBe(false)
  })

  it('returns false when multiple criteria fail', () => {
    expect(isDKAClosed(15, 10, 300, false)).toBe(false)
  })
})

describe('Renderer — dka-tracker', () => {
  const defaultData = {
    entries: [
      { timestamp: '2024-01-01T08:00', glucose: 350, na: 140, cl: 100, hco3: 10, ketones: 'large' },
      { timestamp: '2024-01-01T14:00', glucose: 180, na: 139, cl: 104, hco3: 20, ketones: 'trace' },
    ],
    patientEating: false,
  }
  const noop = () => {}

  it('renders citation', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText(/Kitabchi/)).toBeTruthy()
  })

  it('renders anion gap values in table', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    // First entry: 140 - 100 - 10 = 30
    expect(screen.getByText('30')).toBeTruthy()
    // Second entry: 139 - 104 - 20 = 15
    expect(screen.getByText('15')).toBeTruthy()
  })

  it('renders DKA closure criteria section', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText(/DKA Closure Criteria/i)).toBeTruthy()
  })

  it('renders ketones values', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText('large')).toBeTruthy()
    expect(screen.getByText('trace')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run src/modules/packs/endo/dka-tracker/dka-tracker.test.tsx
```

- [ ] **Step 3: Write `src/modules/packs/endo/dka-tracker/index.ts`**

```ts
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'
import type { ModulePlugin } from '@/core/plugin/types'

export const CITATION =
  'Kitabchi AE et al. Diabetes Care. 2009;32(7):1335-1343'

export function calcAnionGap(na: number, cl: number, hco3: number): number {
  return na - cl - hco3
}

export function isDKAClosed(
  ag: number,
  hco3: number,
  glucose: number,
  eatingPO: boolean
): boolean {
  return ag < 12 && hco3 >= 18 && glucose < 200 && eatingPO
}

const dkaTracker: ModulePlugin = {
  meta: {
    id: 'dka-tracker',
    name: 'DKA Tracker',
    version: '1.0.0',
    author: 'Endo Pack',
    description: 'DKA trend table with anion gap and evidence-based closure criteria checker.',
    tags: ['DKA', 'diabetes', 'anion gap', 'endocrinology', 'ICU'],
    pack: 'endo',
  },
  schema: {
    config: {},
    data: {
      entries: 'array',
      patientEating: 'boolean',
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default dkaTracker
```

- [ ] **Step 4: Write `src/modules/packs/endo/dka-tracker/Renderer.tsx`**

```tsx
import React, { useState } from 'react'
import { CITATION, calcAnionGap, isDKAClosed } from './index'

type Ketones = 'trace' | 'moderate' | 'large' | 'negative'

interface DKAEntry {
  timestamp: string
  glucose: number
  na: number
  cl: number
  hco3: number
  ketones: Ketones
}

interface DKAData {
  entries: DKAEntry[]
  patientEating: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const EMPTY_ROW = {
  timestamp: '',
  glucose: '' as unknown as number,
  na: '' as unknown as number,
  cl: '' as unknown as number,
  hco3: '' as unknown as number,
  ketones: 'moderate' as Ketones,
}

export default function Renderer({ data, onDataChange, mode }: Props) {
  const d = data as DKAData
  const entries = d.entries ?? []
  const patientEating = d.patientEating ?? false
  const disabled = mode === 'build'

  const [newRow, setNewRow] = useState({ ...EMPTY_ROW })

  const lastEntry = entries[entries.length - 1]
  const lastAG = lastEntry
    ? calcAnionGap(lastEntry.na, lastEntry.cl, lastEntry.hco3)
    : null
  const closed =
    lastEntry !== undefined && lastAG !== null
      ? isDKAClosed(lastAG, lastEntry.hco3, lastEntry.glucose, patientEating)
      : false

  function addEntry() {
    if (!newRow.glucose || !newRow.na || !newRow.cl || !newRow.hco3) return
    const entry: DKAEntry = {
      timestamp: newRow.timestamp || new Date().toISOString().slice(0, 16),
      glucose: Number(newRow.glucose),
      na: Number(newRow.na),
      cl: Number(newRow.cl),
      hco3: Number(newRow.hco3),
      ketones: newRow.ketones,
    }
    onDataChange({ ...d, entries: [...entries, entry] })
    setNewRow({ ...EMPTY_ROW })
  }

  function removeEntry(idx: number) {
    onDataChange({ ...d, entries: entries.filter((_, i) => i !== idx) })
  }

  const CriterionRow = ({
    label,
    met,
  }: {
    label: string
    met: boolean
  }) => (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
          met
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
        }`}
      >
        {met ? '✓' : '—'}
      </span>
      <span className={met ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
        {label}
      </span>
    </div>
  )

  const agOK = lastAG !== null && lastAG < 12
  const hco3OK = lastEntry ? lastEntry.hco3 >= 18 : false
  const glucoseOK = lastEntry ? lastEntry.glucose < 200 : false

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200">DKA Closure Criteria</h4>
          {closed && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              CLOSED
            </span>
          )}
        </div>
        <CriterionRow
          label={`Anion gap < 12 mEq/L${lastAG !== null ? ` (current: ${lastAG})` : ' (no data)'}`}
          met={agOK}
        />
        <CriterionRow
          label={`HCO3 ≥ 18 mEq/L${lastEntry ? ` (current: ${lastEntry.hco3})` : ' (no data)'}`}
          met={hco3OK}
        />
        <CriterionRow
          label={`Glucose < 200 mg/dL${lastEntry ? ` (current: ${lastEntry.glucose})` : ' (no data)'}`}
          met={glucoseOK}
        />
        <div className="flex items-center gap-2">
          <CriterionRow label="Patient tolerating PO" met={patientEating} />
          {!disabled && (
            <input
              type="checkbox"
              className="ml-auto"
              checked={patientEating}
              onChange={(e) => onDataChange({ ...d, patientEating: e.target.checked })}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs min-w-[600px]">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border dark:border-gray-600 px-2 py-1 text-left">Timestamp</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-right">Glucose</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-right">Na</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-right">Cl</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-right">HCO3</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-right">AG</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-center">Ketones</th>
              {!disabled && <th className="border dark:border-gray-600 px-2 py-1"></th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => {
              const ag = calcAnionGap(entry.na, entry.cl, entry.hco3)
              const agHigh = ag >= 12
              return (
                <tr key={idx}>
                  <td className="border dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-300">{entry.timestamp}</td>
                  <td className={`border dark:border-gray-600 px-2 py-1 text-right font-mono ${entry.glucose >= 200 ? 'text-red-600 font-bold' : 'text-gray-900 dark:text-gray-100'}`}>{entry.glucose}</td>
                  <td className="border dark:border-gray-600 px-2 py-1 text-right font-mono text-gray-900 dark:text-gray-100">{entry.na}</td>
                  <td className="border dark:border-gray-600 px-2 py-1 text-right font-mono text-gray-900 dark:text-gray-100">{entry.cl}</td>
                  <td className={`border dark:border-gray-600 px-2 py-1 text-right font-mono ${entry.hco3 < 18 ? 'text-red-600 font-bold' : 'text-gray-900 dark:text-gray-100'}`}>{entry.hco3}</td>
                  <td className={`border dark:border-gray-600 px-2 py-1 text-right font-mono font-bold ${agHigh ? 'text-red-600' : 'text-green-600'}`}>{ag}</td>
                  <td className="border dark:border-gray-600 px-2 py-1 text-center text-gray-700 dark:text-gray-300">{entry.ketones}</td>
                  {!disabled && (
                    <td className="border dark:border-gray-600 px-2 py-1 text-center">
                      <button onClick={() => removeEntry(idx)} className="text-red-500 hover:text-red-700 text-xs">×</button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!disabled && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Timestamp</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newRow.timestamp}
              onChange={(e) => setNewRow({ ...newRow, timestamp: e.target.value })}
            />
          </div>
          {(['glucose', 'na', 'cl', 'hco3'] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{field}</label>
              <input
                type="number"
                className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                value={newRow[field] as unknown as string}
                onChange={(e) => setNewRow({ ...newRow, [field]: e.target.value as unknown as number })}
                placeholder={field.toUpperCase()}
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Ketones</label>
            <select
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newRow.ketones}
              onChange={(e) => setNewRow({ ...newRow, ketones: e.target.value as Ketones })}
            >
              <option value="negative">Negative</option>
              <option value="trace">Trace</option>
              <option value="moderate">Moderate</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={addEntry}
              className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700 w-full"
            >
              Add Row
            </button>
          </div>
        </div>
      )}

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 5: Write `src/modules/packs/endo/dka-tracker/Editor.tsx`**

```tsx
import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

// DKA Tracker has no user-configurable options — thresholds are fixed per guideline.
export default function Editor({ config }: Props) {
  return (
    <div className="p-3 text-sm text-gray-500 dark:text-gray-400 italic">
      No configuration options. Anion gap and DKA closure thresholds are fixed per Kitabchi 2009 guidelines.
    </div>
  )
}
```

- [ ] **Step 6: Write `src/modules/packs/endo/dka-tracker/PrintView.tsx`**

```tsx
import React from 'react'
import { CITATION, calcAnionGap, isDKAClosed } from './index'

type Ketones = 'trace' | 'moderate' | 'large' | 'negative'

interface DKAEntry {
  timestamp: string
  glucose: number
  na: number
  cl: number
  hco3: number
  ketones: Ketones
}

interface DKAData {
  entries: DKAEntry[]
  patientEating: boolean
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export default function PrintView({ data }: Props) {
  const d = data as DKAData
  const entries = d.entries ?? []
  const patientEating = d.patientEating ?? false
  const lastEntry = entries[entries.length - 1]
  const lastAG = lastEntry ? calcAnionGap(lastEntry.na, lastEntry.cl, lastEntry.hco3) : null
  const closed =
    lastEntry && lastAG !== null
      ? isDKAClosed(lastAG, lastEntry.hco3, lastEntry.glucose, patientEating)
      : false

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base">DKA Tracker</h3>
      <p>
        <span className="font-medium">DKA Status:</span>{' '}
        <span className={closed ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
          {closed ? 'CLOSED' : 'ACTIVE / NOT CLOSED'}
        </span>
      </p>
      <p><span className="font-medium">Patient Tolerating PO:</span> {patientEating ? 'Yes' : 'No'}</p>
      <table className="w-full border-collapse text-xs mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Timestamp</th>
            <th className="border px-2 py-1 text-right">Glucose</th>
            <th className="border px-2 py-1 text-right">Na</th>
            <th className="border px-2 py-1 text-right">Cl</th>
            <th className="border px-2 py-1 text-right">HCO3</th>
            <th className="border px-2 py-1 text-right">AG</th>
            <th className="border px-2 py-1 text-center">Ketones</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const ag = calcAnionGap(entry.na, entry.cl, entry.hco3)
            return (
              <tr key={idx}>
                <td className="border px-2 py-1">{entry.timestamp}</td>
                <td className="border px-2 py-1 text-right font-mono">{entry.glucose}</td>
                <td className="border px-2 py-1 text-right font-mono">{entry.na}</td>
                <td className="border px-2 py-1 text-right font-mono">{entry.cl}</td>
                <td className="border px-2 py-1 text-right font-mono">{entry.hco3}</td>
                <td className="border px-2 py-1 text-right font-mono">{ag}</td>
                <td className="border px-2 py-1 text-center">{entry.ketones}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
npx vitest run src/modules/packs/endo/dka-tracker/dka-tracker.test.tsx
```

All tests must pass before proceeding.

- [ ] **Step 8: Commit**

```bash
git -C ~/projects/patient-templates add src/modules/packs/endo/dka-tracker/
git -C ~/projects/patient-templates commit -m "feat(endo): add dka-tracker module with anion gap and closure criteria"
```

---

## Task 4: steroid-taper module

### Overview

Manages a steroid taper schedule with date-indexed dose rows. Automatically highlights the row matching today's date. Displays an adrenal insufficiency advisory note when the user checks "prolonged high-dose course" (no formula — advisory only, no citation required).

**Data shape:**
```ts
{
  drug: string;
  schedule: Array<{ date: string; dose: number; unit: string }>;
  prolongedHighDose: boolean;
}
```

**Advisory note text (shown when `prolongedHighDose === true`):**
> "Prolonged high-dose corticosteroid therapy may suppress the HPA axis. Consider adrenal insufficiency in the event of physiologic stress. Taper slowly and reassess."

No clinical citation is attached to this note — it is advisory only and appears only when the clinician checks the box.

---

- [ ] **Step 1: Write failing tests**

Create `src/modules/packs/endo/steroid-taper/steroid-taper.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import Renderer from './Renderer'

// Pin today's date so "today highlight" tests are deterministic
beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-06-15T12:00:00'))
})

describe('Renderer — steroid-taper', () => {
  const defaultData = {
    drug: 'Prednisone',
    schedule: [
      { date: '2024-06-14', dose: 60, unit: 'mg' },
      { date: '2024-06-15', dose: 40, unit: 'mg' },
      { date: '2024-06-16', dose: 20, unit: 'mg' },
    ],
    prolongedHighDose: false,
  }
  const noop = () => {}

  it('renders drug name', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByDisplayValue('Prednisone')).toBeTruthy()
  })

  it('renders all schedule rows', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText('2024-06-14')).toBeTruthy()
    expect(screen.getByText('2024-06-15')).toBeTruthy()
    expect(screen.getByText('2024-06-16')).toBeTruthy()
  })

  it('highlights today\'s row', () => {
    const { container } = render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    // Today is 2024-06-15 — the row should have a highlight class
    const rows = container.querySelectorAll('tr')
    // Find the row that contains 2024-06-15
    const todayRow = Array.from(rows).find((r) => r.textContent?.includes('2024-06-15'))
    expect(todayRow?.className).toMatch(/ring|highlight|today|bg-blue|border-blue/)
  })

  it('does not show advisory note when prolongedHighDose is false', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.queryByText(/HPA axis/)).toBeNull()
  })

  it('shows advisory note when prolongedHighDose is true', () => {
    render(
      <Renderer
        instanceId="t"
        config={{}}
        data={{ ...defaultData, prolongedHighDose: true }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/HPA axis/)).toBeTruthy()
  })

  it('renders the prolonged high-dose checkbox', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByRole('checkbox')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run src/modules/packs/endo/steroid-taper/steroid-taper.test.tsx
```

- [ ] **Step 3: Write `src/modules/packs/endo/steroid-taper/index.ts`**

```ts
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'
import type { ModulePlugin } from '@/core/plugin/types'

const steroidTaper: ModulePlugin = {
  meta: {
    id: 'steroid-taper',
    name: 'Steroid Taper',
    version: '1.0.0',
    author: 'Endo Pack',
    description: 'Steroid taper schedule with today-highlight and adrenal insufficiency advisory.',
    tags: ['steroid', 'prednisone', 'taper', 'endocrinology', 'adrenal'],
    pack: 'endo',
  },
  schema: {
    config: {},
    data: {
      drug: 'string',
      schedule: 'array',
      prolongedHighDose: 'boolean',
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default steroidTaper
```

- [ ] **Step 4: Write `src/modules/packs/endo/steroid-taper/Renderer.tsx`**

```tsx
import React, { useState } from 'react'

interface ScheduleRow {
  date: string
  dose: number
  unit: string
}

interface TaperData {
  drug: string
  schedule: ScheduleRow[]
  prolongedHighDose: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const ADVISORY_NOTE =
  'Prolonged high-dose corticosteroid therapy may suppress the HPA axis. Consider adrenal insufficiency in the event of physiologic stress. Taper slowly and reassess.'

export default function Renderer({ data, onDataChange, mode }: Props) {
  const d = data as TaperData
  const schedule = d.schedule ?? []
  const prolongedHighDose = d.prolongedHighDose ?? false
  const disabled = mode === 'build'

  const todayStr = new Date().toISOString().slice(0, 10)

  const [newDate, setNewDate] = useState('')
  const [newDose, setNewDose] = useState('')
  const [newUnit, setNewUnit] = useState('mg')

  function addRow() {
    if (!newDose) return
    const row: ScheduleRow = {
      date: newDate || todayStr,
      dose: Number(newDose),
      unit: newUnit,
    }
    onDataChange({ ...d, schedule: [...schedule, row] })
    setNewDate('')
    setNewDose('')
    setNewUnit('mg')
  }

  function removeRow(idx: number) {
    onDataChange({ ...d, schedule: schedule.filter((_, i) => i !== idx) })
  }

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 dark:text-gray-300 w-16">Drug</label>
        <input
          className="border rounded px-2 py-1 flex-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          value={d.drug ?? ''}
          disabled={disabled}
          onChange={(e) => onDataChange({ ...d, drug: e.target.value })}
          placeholder="e.g. Prednisone"
        />
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border dark:border-gray-600 px-2 py-1 text-left">Date</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-right">Dose</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-left">Unit</th>
            {!disabled && <th className="border dark:border-gray-600 px-2 py-1"></th>}
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, idx) => {
            const isToday = row.date === todayStr
            return (
              <tr
                key={idx}
                className={
                  isToday
                    ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-inset ring-blue-400 today-highlight'
                    : ''
                }
              >
                <td className="border dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-300 font-medium">
                  {row.date}
                  {isToday && (
                    <span className="ml-1 text-xs bg-blue-500 text-white px-1 rounded">Today</span>
                  )}
                </td>
                <td className="border dark:border-gray-600 px-2 py-1 text-right font-mono text-gray-900 dark:text-gray-100 font-bold">
                  {row.dose}
                </td>
                <td className="border dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-300">{row.unit}</td>
                {!disabled && (
                  <td className="border dark:border-gray-600 px-2 py-1 text-center">
                    <button onClick={() => removeRow(idx)} className="text-red-500 hover:text-red-700 text-xs">×</button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>

      {!disabled && (
        <div className="flex gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Date</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Dose</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-20 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newDose}
              onChange={(e) => setNewDose(e.target.value)}
              placeholder="0"
              min={0}
              step={0.5}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Unit</label>
            <select
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
            >
              <option value="mg">mg</option>
              <option value="mcg">mcg</option>
              <option value="mg/kg">mg/kg</option>
            </select>
          </div>
          <button
            onClick={addRow}
            className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="prolonged-high-dose"
          checked={prolongedHighDose}
          disabled={disabled}
          onChange={(e) => onDataChange({ ...d, prolongedHighDose: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="prolonged-high-dose" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
          Prolonged high-dose course (≥21 days AND dose ≥ prednisone 20 mg/day equivalent)
        </label>
      </div>

      {prolongedHighDose && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 rounded p-2 text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Advisory:</span> {ADVISORY_NOTE}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Write `src/modules/packs/endo/steroid-taper/Editor.tsx`**

```tsx
import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export default function Editor({ config, onConfigChange }: Props) {
  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 w-24">Default Unit</label>
        <select
          className="border rounded px-2 py-1"
          value={(config.defaultUnit as string) ?? 'mg'}
          onChange={(e) => onConfigChange({ ...config, defaultUnit: e.target.value })}
        >
          <option value="mg">mg</option>
          <option value="mcg">mcg</option>
          <option value="mg/kg">mg/kg</option>
        </select>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Write `src/modules/packs/endo/steroid-taper/PrintView.tsx`**

```tsx
import React from 'react'

interface ScheduleRow {
  date: string
  dose: number
  unit: string
}

interface TaperData {
  drug: string
  schedule: ScheduleRow[]
  prolongedHighDose: boolean
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const ADVISORY_NOTE =
  'Prolonged high-dose corticosteroid therapy may suppress the HPA axis. Consider adrenal insufficiency in the event of physiologic stress. Taper slowly and reassess.'

export default function PrintView({ data }: Props) {
  const d = data as TaperData
  const schedule = d.schedule ?? []
  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base">Steroid Taper</h3>
      {d.drug && <p><span className="font-medium">Drug:</span> {d.drug}</p>}
      <table className="w-full border-collapse text-xs mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Date</th>
            <th className="border px-2 py-1 text-right">Dose</th>
            <th className="border px-2 py-1 text-left">Unit</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, idx) => (
            <tr key={idx} className={row.date === todayStr ? 'font-bold' : ''}>
              <td className="border px-2 py-1">
                {row.date}{row.date === todayStr ? ' (Today)' : ''}
              </td>
              <td className="border px-2 py-1 text-right font-mono">{row.dose}</td>
              <td className="border px-2 py-1">{row.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {d.prolongedHighDose && (
        <p className="mt-2 text-xs italic text-gray-600 border-l-4 border-amber-400 pl-2">
          Advisory: {ADVISORY_NOTE}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
npx vitest run src/modules/packs/endo/steroid-taper/steroid-taper.test.tsx
```

All tests must pass before proceeding.

- [ ] **Step 8: Commit**

```bash
git -C ~/projects/patient-templates add src/modules/packs/endo/steroid-taper/
git -C ~/projects/patient-templates commit -m "feat(endo): add steroid-taper module with schedule highlight and AI risk note"
```

---

## Task 5: Pack registration

### Overview

Wire all four modules into a pack barrel export and document the one-line registration in the global packs index.

---

- [ ] **Step 1: Write `src/modules/packs/endo/index.ts`**

```ts
import insulinInfusion from './insulin-infusion'
import glucoseLog from './glucose-log'
import dkaTracker from './dka-tracker'
import steroidTaper from './steroid-taper'
import type { ModulePlugin } from '@/core/plugin/types'

export const endoPack: ModulePlugin[] = [
  insulinInfusion,
  glucoseLog,
  dkaTracker,
  steroidTaper,
]

export default endoPack
```

- [ ] **Step 2: Register in the global packs index**

In `src/modules/packs/index.ts`, add one import line and spread the pack into the master export:

```ts
// Add this import:
import { endoPack } from './endo'

// In your existing allPacks or registerPacks array, add:
...endoPack,
```

If `src/modules/packs/index.ts` does not yet exist (other specialty packs not yet implemented), create it:

```ts
import { endoPack } from './endo'
import type { ModulePlugin } from '@/core/plugin/types'

export const allPacks: ModulePlugin[] = [
  ...endoPack,
]

export default allPacks
```

- [ ] **Step 3: Verify all 4 tests still pass**

```bash
npx vitest run src/modules/packs/endo/
```

All 4 test files must pass.

- [ ] **Step 4: Commit**

```bash
git -C ~/projects/patient-templates add src/modules/packs/endo/index.ts src/modules/packs/index.ts
git -C ~/projects/patient-templates commit -m "feat(endo): register Endocrinology pack in global module registry"
```

---

## Summary

| Module | id | Pure Functions Exported | Citation |
|---|---|---|---|
| Insulin Infusion | `insulin-infusion` | `calcTimeAtGoal` | ADA 2024 |
| Glucose Log | `glucose-log` | `calcTIR`, `calcEA1c` | Battelino 2019, Nathan 2008 |
| DKA Tracker | `dka-tracker` | `calcAnionGap`, `isDKAClosed` | Kitabchi 2009 |
| Steroid Taper | `steroid-taper` | — | Advisory only (no citation) |

All clinical calculations have `const CITATION` at the top of their `index.ts` and render the citation string in the `Renderer` and `PrintView` components using `<p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>`.
