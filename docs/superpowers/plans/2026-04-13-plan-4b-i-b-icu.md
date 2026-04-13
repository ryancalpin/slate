# Patient Template Builder — Plan 4b-i-b: ICU/Critical Care Pack

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the ICU/Critical Care specialty pack (5 modules) with evidence-cited clinical scoring tools.

**Architecture:** Pack lives under `src/modules/packs/icu/`, registers via its `index.ts` imported by `src/modules/packs/index.ts`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/modules/packs/icu/
├── index.ts
├── vasopressor-tracker/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── vasopressor-tracker.test.tsx
├── sedation-tracker/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── sedation-tracker.test.tsx
├── sat-sbt-readiness/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── sat-sbt-readiness.test.tsx
├── nutrition-tracker/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── nutrition-tracker.test.tsx
└── sofa-apache/
    ├── index.ts
    ├── Renderer.tsx
    ├── Editor.tsx
    ├── PrintView.tsx
    └── sofa-apache.test.tsx
```

---

## Task 1: vasopressor-tracker

**Goal:** Track up to 4 simultaneous vasopressor agents with doses, units, MAP target, MAP readings, and a trend arrow computed from the last 2 MAP readings.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/icu/vasopressor-tracker/vasopressor-tracker.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VasopressorRenderer } from './Renderer'

const emptyData = { pressors: [], mapReadings: [] }

const sampleData = {
  pressors: [
    { agent: 'norepinephrine', dose: 0.1, unit: 'mcg/kg/min', mapTarget: 65 },
    { agent: 'vasopressin', dose: 0.04, unit: 'units/min', mapTarget: 65 },
  ],
  mapReadings: [
    { timestamp: '2026-04-13T08:00:00Z', map: 58 },
    { timestamp: '2026-04-13T09:00:00Z', map: 67 },
  ],
}

const risingData = {
  pressors: [{ agent: 'norepinephrine', dose: 0.1, unit: 'mcg/kg/min', mapTarget: 65 }],
  mapReadings: [
    { timestamp: '2026-04-13T08:00:00Z', map: 55 },
    { timestamp: '2026-04-13T09:00:00Z', map: 70 },
  ],
}

const fallingData = {
  pressors: [{ agent: 'norepinephrine', dose: 0.1, unit: 'mcg/kg/min', mapTarget: 65 }],
  mapReadings: [
    { timestamp: '2026-04-13T08:00:00Z', map: 70 },
    { timestamp: '2026-04-13T09:00:00Z', map: 55 },
  ],
}

const stableData = {
  pressors: [{ agent: 'norepinephrine', dose: 0.1, unit: 'mcg/kg/min', mapTarget: 65 }],
  mapReadings: [
    { timestamp: '2026-04-13T08:00:00Z', map: 66 },
    { timestamp: '2026-04-13T09:00:00Z', map: 66 },
  ],
}

describe('VasopressorRenderer', () => {
  it('renders with no pressors and shows add button', () => {
    render(
      <VasopressorRenderer
        instanceId="test-1"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Add Pressor/i)).toBeTruthy()
  })

  it('renders existing pressor rows', () => {
    render(
      <VasopressorRenderer
        instanceId="test-2"
        config={{}}
        data={sampleData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('norepinephrine')).toBeTruthy()
    expect(screen.getByDisplayValue('vasopressin')).toBeTruthy()
  })

  it('calls onDataChange when Add Pressor is clicked', () => {
    const onDataChange = vi.fn()
    render(
      <VasopressorRenderer
        instanceId="test-3"
        config={{}}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText(/Add Pressor/i))
    expect(onDataChange).toHaveBeenCalledOnce()
    const updated = onDataChange.mock.calls[0][0]
    expect(updated.pressors).toHaveLength(1)
  })

  it('disables Add Pressor when 4 pressors already exist', () => {
    const fourPressors = {
      pressors: Array(4).fill({ agent: 'norepinephrine', dose: 0.1, unit: 'mcg/kg/min', mapTarget: 65 }),
      mapReadings: [],
    }
    render(
      <VasopressorRenderer
        instanceId="test-4"
        config={{}}
        data={fourPressors}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    const btn = screen.getByText(/Add Pressor/i).closest('button')
    expect(btn?.disabled).toBe(true)
  })

  it('shows rising trend arrow ↑ when MAP increases', () => {
    render(
      <VasopressorRenderer
        instanceId="test-5"
        config={{}}
        data={risingData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('↑')).toBeTruthy()
  })

  it('shows falling trend arrow ↓ when MAP decreases', () => {
    render(
      <VasopressorRenderer
        instanceId="test-6"
        config={{}}
        data={fallingData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('↓')).toBeTruthy()
  })

  it('shows stable trend arrow → when MAP unchanged', () => {
    render(
      <VasopressorRenderer
        instanceId="test-7"
        config={{}}
        data={stableData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('→')).toBeTruthy()
  })

  it('renders in build mode without crashing', () => {
    render(
      <VasopressorRenderer
        instanceId="test-8"
        config={{}}
        data={sampleData}
        onDataChange={vi.fn()}
        mode="build"
      />
    )
    expect(screen.getByText(/norepinephrine/i)).toBeTruthy()
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run: `npx vitest run src/modules/packs/icu/vasopressor-tracker/vasopressor-tracker.test.tsx`
- [ ] Confirm tests fail (module does not exist yet)

### Step 3: Implement all 4 files

- [ ] Create `src/modules/packs/icu/vasopressor-tracker/Renderer.tsx`:

```tsx
import React, { FC } from 'react'

const AGENTS = [
  'norepinephrine',
  'epinephrine',
  'vasopressin',
  'dopamine',
  'phenylephrine',
  'angiotensin-II',
  'dobutamine',
] as const

type Unit = 'mcg/kg/min' | 'units/min'

interface Pressor {
  agent: string
  dose: number
  unit: Unit
  mapTarget: number
}

interface MapReading {
  timestamp: string
  map: number
}

interface VasopressorData {
  pressors: Pressor[]
  mapReadings: MapReading[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function getTrend(readings: MapReading[]): '↑' | '↓' | '→' | null {
  if (readings.length < 2) return null
  const sorted = [...readings].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const last = sorted[sorted.length - 1].map
  const prev = sorted[sorted.length - 2].map
  if (last > prev) return '↑'
  if (last < prev) return '↓'
  return '→'
}

const defaultPressor = (): Pressor => ({
  agent: 'norepinephrine',
  dose: 0,
  unit: 'mcg/kg/min',
  mapTarget: 65,
})

export const VasopressorRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const typedData = data as VasopressorData
  const pressors: Pressor[] = typedData.pressors ?? []
  const mapReadings: MapReading[] = typedData.mapReadings ?? []
  const trend = getTrend(mapReadings)
  const latestMap = mapReadings.length
    ? [...mapReadings].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-1)[0].map
    : null

  const updatePressor = (index: number, field: keyof Pressor, value: string | number) => {
    const updated = pressors.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    onDataChange({ ...typedData, pressors: updated })
  }

  const addPressor = () => {
    onDataChange({ ...typedData, pressors: [...pressors, defaultPressor()] })
  }

  const removePressor = (index: number) => {
    onDataChange({ ...typedData, pressors: pressors.filter((_, i) => i !== index) })
  }

  const addMapReading = (value: number) => {
    const reading: MapReading = { timestamp: new Date().toISOString(), map: value }
    onDataChange({ ...typedData, mapReadings: [...mapReadings, reading] })
  }

  const trendColor =
    trend === '↑' ? 'text-green-400' : trend === '↓' ? 'text-red-400' : 'text-gray-400'

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-200">Vasopressor Tracker</h3>
        <div className="flex items-center gap-3">
          {latestMap !== null && (
            <span className="text-sm text-gray-300">
              MAP: <strong>{latestMap}</strong>{' '}
              {trend && <span className={`text-lg font-bold ${trendColor}`}>{trend}</span>}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-600 text-gray-400">
              <th className="text-left py-1 pr-2">Agent</th>
              <th className="text-left py-1 pr-2">Dose</th>
              <th className="text-left py-1 pr-2">Unit</th>
              <th className="text-left py-1 pr-2">MAP Target</th>
              {mode === 'live' && <th className="text-left py-1 pr-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pressors.map((pressor, i) => (
              <tr key={i} className="border-b border-gray-700">
                <td className="py-1 pr-2">
                  <select
                    value={pressor.agent}
                    onChange={(e) => updatePressor(i, 'agent', e.target.value)}
                    className="bg-gray-800 text-gray-100 rounded px-1 py-0.5 text-xs w-full"
                    disabled={mode === 'build'}
                  >
                    {AGENTS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-1 pr-2">
                  <input
                    type="number"
                    value={pressor.dose}
                    onChange={(e) => updatePressor(i, 'dose', parseFloat(e.target.value) || 0)}
                    className="bg-gray-800 text-gray-100 rounded px-1 py-0.5 text-xs w-20"
                    step="0.01"
                    min="0"
                    disabled={mode === 'build'}
                  />
                </td>
                <td className="py-1 pr-2">
                  <select
                    value={pressor.unit}
                    onChange={(e) => updatePressor(i, 'unit', e.target.value as Unit)}
                    className="bg-gray-800 text-gray-100 rounded px-1 py-0.5 text-xs"
                    disabled={mode === 'build'}
                  >
                    <option value="mcg/kg/min">mcg/kg/min</option>
                    <option value="units/min">units/min</option>
                  </select>
                </td>
                <td className="py-1 pr-2">
                  <input
                    type="number"
                    value={pressor.mapTarget}
                    onChange={(e) => updatePressor(i, 'mapTarget', parseInt(e.target.value) || 65)}
                    className="bg-gray-800 text-gray-100 rounded px-1 py-0.5 text-xs w-16"
                    min="40"
                    max="110"
                    disabled={mode === 'build'}
                  />
                </td>
                {mode === 'live' && (
                  <td className="py-1">
                    <button
                      onClick={() => removePressor(i)}
                      className="text-red-400 hover:text-red-300 text-xs px-1"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mode === 'live' && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={addPressor}
            disabled={pressors.length >= 4}
            className="text-xs bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-2 py-1 rounded"
          >
            Add Pressor
          </button>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Log MAP:</label>
            <input
              type="number"
              placeholder="mmHg"
              className="bg-gray-800 text-gray-100 rounded px-2 py-0.5 text-xs w-20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt((e.target as HTMLInputElement).value)
                  if (!isNaN(val)) {
                    addMapReading(val)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/vasopressor-tracker/Editor.tsx`:

```tsx
import React, { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const VasopressorEditor: FC<Props> = ({ config, onConfigChange }) => {
  const defaultMapTarget = (config.defaultMapTarget as number) ?? 65

  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">Vasopressor Tracker Settings</h4>
      <div className="space-y-1">
        <label className="block text-xs text-gray-400">Default MAP Target (mmHg)</label>
        <input
          type="number"
          value={defaultMapTarget}
          min={40}
          max={110}
          onChange={(e) =>
            onConfigChange({ ...config, defaultMapTarget: parseInt(e.target.value) || 65 })
          }
          className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-24"
        />
        <p className="text-xs text-gray-500">Applied to each new pressor row added.</p>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/vasopressor-tracker/PrintView.tsx`:

```tsx
import React, { FC } from 'react'

interface Pressor {
  agent: string
  dose: number
  unit: string
  mapTarget: number
}

interface MapReading {
  timestamp: string
  map: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const VasopressorPrintView: FC<Props> = ({ data }) => {
  const pressors: Pressor[] = (data.pressors as Pressor[]) ?? []
  const mapReadings: MapReading[] = (data.mapReadings as MapReading[]) ?? []
  const latest =
    mapReadings.length > 0
      ? [...mapReadings].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-1)[0]
      : null

  return (
    <div className="font-mono text-sm">
      <h3 className="font-bold text-base mb-2">Vasopressor Tracker</h3>
      {latest && (
        <p className="mb-2">
          Latest MAP: <strong>{latest.map} mmHg</strong>
        </p>
      )}
      <table className="w-full border border-gray-300 text-xs mb-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">Agent</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Dose</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Unit</th>
            <th className="border border-gray-300 px-2 py-1 text-left">MAP Target</th>
          </tr>
        </thead>
        <tbody>
          {pressors.map((p, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-2 py-1">{p.agent}</td>
              <td className="border border-gray-300 px-2 py-1">{p.dose}</td>
              <td className="border border-gray-300 px-2 py-1">{p.unit}</td>
              <td className="border border-gray-300 px-2 py-1">{p.mapTarget} mmHg</td>
            </tr>
          ))}
          {pressors.length === 0 && (
            <tr>
              <td colSpan={4} className="border border-gray-300 px-2 py-1 text-gray-400 italic">
                No pressors recorded
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {mapReadings.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1">MAP Log</p>
          <ul className="text-xs space-y-0.5">
            {[...mapReadings]
              .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
              .map((r, i) => (
                <li key={i}>
                  {new Date(r.timestamp).toLocaleTimeString()} — {r.map} mmHg
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/vasopressor-tracker/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { VasopressorRenderer } from './Renderer'
import { VasopressorEditor } from './Editor'
import { VasopressorPrintView } from './PrintView'

export const vasopressorTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'vasopressor-tracker',
    name: 'Vasopressor Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track up to 4 simultaneous vasopressor agents with doses, MAP target, and MAP trend.',
    tags: ['icu', 'critical-care', 'hemodynamics', 'vasopressors'],
    pack: 'icu',
  },
  schema: {
    config: {
      type: 'object',
      properties: {
        defaultMapTarget: { type: 'number', default: 65 },
      },
    },
    data: {
      type: 'object',
      properties: {
        pressors: { type: 'array' },
        mapReadings: { type: 'array' },
      },
    },
  },
  defaultConfig: { defaultMapTarget: 65 },
  minSize: { w: 4, h: 3 },
  Renderer: VasopressorRenderer,
  Editor: VasopressorEditor,
  PrintView: VasopressorPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run: `npx vitest run src/modules/packs/icu/vasopressor-tracker/vasopressor-tracker.test.tsx`
- [ ] All tests pass

### Step 5: Commit

- [ ] `git add src/modules/packs/icu/vasopressor-tracker/`
- [ ] `git commit -m "feat(icu): add vasopressor-tracker module"`

---

## Task 2: sedation-tracker

**Goal:** RASS score selector (-5 to +4) with verbal descriptors, CPOT score entry (4 subscales 0-2 each), configurable goal RASS range with in-goal badge. Two exported pure functions: `calcCPOT` and RASS goal check. Citations required for both instruments.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/icu/sedation-tracker/sedation-tracker.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SedationRenderer } from './Renderer'
import { calcCPOT } from './Renderer'

const defaultData = {
  rass: 0,
  cpotFace: 0,
  cpotBody: 0,
  cpotMuscle: 0,
  cpotCompliance: 0,
  goalRassMin: -2,
  goalRassMax: 0,
}

describe('calcCPOT', () => {
  it('returns 0 when all subscales are 0', () => {
    expect(calcCPOT(0, 0, 0, 0)).toBe(0)
  })

  it('returns 8 when all subscales are 2', () => {
    expect(calcCPOT(2, 2, 2, 2)).toBe(8)
  })

  it('returns sum of all subscales', () => {
    expect(calcCPOT(1, 2, 0, 1)).toBe(4)
    expect(calcCPOT(0, 1, 2, 1)).toBe(4)
    expect(calcCPOT(2, 0, 1, 0)).toBe(3)
  })
})

describe('SedationRenderer', () => {
  it('renders RASS heading and descriptor for RASS 0', () => {
    render(
      <SedationRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/RASS/i)).toBeTruthy()
    expect(screen.getByText(/Alert & calm/i)).toBeTruthy()
  })

  it('shows IN GOAL badge when RASS is within goal range', () => {
    const inGoalData = { ...defaultData, rass: -1, goalRassMin: -2, goalRassMax: 0 }
    render(
      <SedationRenderer
        instanceId="test-2"
        config={{}}
        data={inGoalData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/IN GOAL/i)).toBeTruthy()
  })

  it('shows OUT OF GOAL badge when RASS is outside goal range', () => {
    const outData = { ...defaultData, rass: -4, goalRassMin: -2, goalRassMax: 0 }
    render(
      <SedationRenderer
        instanceId="test-3"
        config={{}}
        data={outData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/OUT OF GOAL/i)).toBeTruthy()
  })

  it('renders CPOT section with all 4 subscale labels', () => {
    render(
      <SedationRenderer
        instanceId="test-4"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Facial Expression/i)).toBeTruthy()
    expect(screen.getByText(/Body Movements/i)).toBeTruthy()
    expect(screen.getByText(/Muscle Tension/i)).toBeTruthy()
    expect(screen.getByText(/Compliance/i)).toBeTruthy()
  })

  it('renders both citations', () => {
    render(
      <SedationRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Sessler CN/i)).toBeTruthy()
    expect(screen.getByText(/Gélinas C/i)).toBeTruthy()
  })

  it('calls onDataChange when RASS changes', () => {
    const onDataChange = vi.fn()
    render(
      <SedationRenderer
        instanceId="test-6"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    const select = screen.getByLabelText(/RASS Score/i)
    fireEvent.change(select, { target: { value: '-3' } })
    expect(onDataChange).toHaveBeenCalledOnce()
    expect(onDataChange.mock.calls[0][0].rass).toBe(-3)
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run: `npx vitest run src/modules/packs/icu/sedation-tracker/sedation-tracker.test.tsx`
- [ ] Confirm tests fail

### Step 3: Implement all 4 files

- [ ] Create `src/modules/packs/icu/sedation-tracker/Renderer.tsx`:

```tsx
import React, { FC } from 'react'

const RASS_CITATION = 'Sessler CN et al. Am J Respir Crit Care Med. 2002;166(10):1338-1344'
const CPOT_CITATION = 'Gélinas C et al. Am J Crit Care. 2006;15(4):420-427'

const RASS_LEVELS: { score: number; label: string }[] = [
  { score: -5, label: 'Unarousable' },
  { score: -4, label: 'Deep sedation' },
  { score: -3, label: 'Moderate sedation' },
  { score: -2, label: 'Light sedation' },
  { score: -1, label: 'Drowsy' },
  { score: 0, label: 'Alert & calm' },
  { score: 1, label: 'Restless' },
  { score: 2, label: 'Agitated' },
  { score: 3, label: 'Very agitated' },
  { score: 4, label: 'Combative' },
]

export function calcCPOT(face: number, body: number, muscle: number, compliance: number): number {
  return face + body + muscle + compliance
}

interface SedationData {
  rass: number
  cpotFace: number
  cpotBody: number
  cpotMuscle: number
  cpotCompliance: number
  goalRassMin: number
  goalRassMax: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const SubscaleInput: FC<{
  label: string
  value: number
  onChange: (v: number) => void
  disabled: boolean
}> = ({ label, value, onChange, disabled }) => (
  <div className="flex items-center justify-between py-1 border-b border-gray-700 last:border-0">
    <span className="text-xs text-gray-300">{label}</span>
    <div className="flex gap-1">
      {[0, 1, 2].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          disabled={disabled}
          className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
            value === v
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } disabled:cursor-not-allowed`}
        >
          {v}
        </button>
      ))}
    </div>
  </div>
)

export const SedationRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as SedationData
  const rass = d.rass ?? 0
  const goalMin = d.goalRassMin ?? -2
  const goalMax = d.goalRassMax ?? 0
  const inGoal = rass >= goalMin && rass <= goalMax

  const cpotTotal = calcCPOT(d.cpotFace ?? 0, d.cpotBody ?? 0, d.cpotMuscle ?? 0, d.cpotCompliance ?? 0)
  const rassLabel = RASS_LEVELS.find((r) => r.score === rass)?.label ?? ''

  const update = (fields: Partial<SedationData>) => onDataChange({ ...d, ...fields })

  return (
    <div className="p-3 space-y-4">
      {/* RASS Section */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm text-gray-200">RASS Score</h3>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              inGoal ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
            }`}
          >
            {inGoal ? 'IN GOAL' : 'OUT OF GOAL'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <label htmlFor="rass-select" className="text-xs text-gray-400 sr-only">
            RASS Score
          </label>
          <select
            id="rass-select"
            aria-label="RASS Score"
            value={rass}
            onChange={(e) => update({ rass: parseInt(e.target.value) })}
            disabled={mode === 'build'}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm"
          >
            {RASS_LEVELS.map((r) => (
              <option key={r.score} value={r.score}>
                {r.score > 0 ? `+${r.score}` : r.score} — {r.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-300 italic">{rassLabel}</span>
        </div>

        <p className="text-xs text-gray-500">
          Goal: {goalMin} to {goalMax >= 0 ? `+${goalMax}` : goalMax}
        </p>
        <p className="text-xs italic text-gray-400 mt-1">{RASS_CITATION}</p>
      </div>

      {/* CPOT Section */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm text-gray-200">CPOT Score</h3>
          <span className="text-sm font-bold text-gray-200">{cpotTotal} / 8</span>
        </div>
        <div className="space-y-0">
          <SubscaleInput
            label="Facial Expression (0-2)"
            value={d.cpotFace ?? 0}
            onChange={(v) => update({ cpotFace: v })}
            disabled={mode === 'build'}
          />
          <SubscaleInput
            label="Body Movements (0-2)"
            value={d.cpotBody ?? 0}
            onChange={(v) => update({ cpotBody: v })}
            disabled={mode === 'build'}
          />
          <SubscaleInput
            label="Muscle Tension (0-2)"
            value={d.cpotMuscle ?? 0}
            onChange={(v) => update({ cpotMuscle: v })}
            disabled={mode === 'build'}
          />
          <SubscaleInput
            label="Compliance with Vent / Vocalization (0-2)"
            value={d.cpotCompliance ?? 0}
            onChange={(v) => update({ cpotCompliance: v })}
            disabled={mode === 'build'}
          />
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CPOT_CITATION}</p>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/sedation-tracker/Editor.tsx`:

```tsx
import React, { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const SedationEditor: FC<Props> = ({ config, onConfigChange }) => {
  const goalMin = (config.goalRassMin as number) ?? -2
  const goalMax = (config.goalRassMax as number) ?? 0

  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">Sedation Tracker Settings</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Goal RASS Min</label>
          <input
            type="number"
            value={goalMin}
            min={-5}
            max={4}
            onChange={(e) => onConfigChange({ ...config, goalRassMin: parseInt(e.target.value) })}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-20"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Goal RASS Max</label>
          <input
            type="number"
            value={goalMax}
            min={-5}
            max={4}
            onChange={(e) => onConfigChange({ ...config, goalRassMax: parseInt(e.target.value) })}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-20"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Default goal range is -2 to 0 (light sedation to alert &amp; calm).
      </p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/sedation-tracker/PrintView.tsx`:

```tsx
import React, { FC } from 'react'
import { calcCPOT } from './Renderer'

const RASS_CITATION = 'Sessler CN et al. Am J Respir Crit Care Med. 2002;166(10):1338-1344'
const CPOT_CITATION = 'Gélinas C et al. Am J Crit Care. 2006;15(4):420-427'

const RASS_LABELS: Record<number, string> = {
  [-5]: 'Unarousable',
  [-4]: 'Deep sedation',
  [-3]: 'Moderate sedation',
  [-2]: 'Light sedation',
  [-1]: 'Drowsy',
  0: 'Alert & calm',
  1: 'Restless',
  2: 'Agitated',
  3: 'Very agitated',
  4: 'Combative',
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const SedationPrintView: FC<Props> = ({ data }) => {
  const rass = (data.rass as number) ?? 0
  const face = (data.cpotFace as number) ?? 0
  const body = (data.cpotBody as number) ?? 0
  const muscle = (data.cpotMuscle as number) ?? 0
  const compliance = (data.cpotCompliance as number) ?? 0
  const goalMin = (data.goalRassMin as number) ?? -2
  const goalMax = (data.goalRassMax as number) ?? 0
  const cpot = calcCPOT(face, body, muscle, compliance)
  const inGoal = rass >= goalMin && rass <= goalMax

  return (
    <div className="font-mono text-sm space-y-3">
      <h3 className="font-bold text-base">Sedation Tracker</h3>
      <div>
        <p>
          <strong>RASS:</strong> {rass} ({RASS_LABELS[rass] ?? 'Unknown'}){' '}
          <span className={inGoal ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
            [{inGoal ? 'IN GOAL' : 'OUT OF GOAL'}]
          </span>
        </p>
        <p className="text-xs text-gray-500">Goal: {goalMin} to {goalMax}</p>
        <p className="text-xs italic text-gray-500 mt-1">{RASS_CITATION}</p>
      </div>
      <div>
        <p>
          <strong>CPOT:</strong> {cpot} / 8
        </p>
        <ul className="text-xs ml-4 space-y-0.5">
          <li>Facial Expression: {face}</li>
          <li>Body Movements: {body}</li>
          <li>Muscle Tension: {muscle}</li>
          <li>Compliance/Vocalization: {compliance}</li>
        </ul>
        <p className="text-xs italic text-gray-500 mt-1">{CPOT_CITATION}</p>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/sedation-tracker/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { SedationRenderer } from './Renderer'
import { SedationEditor } from './Editor'
import { SedationPrintView } from './PrintView'

export const sedationTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'sedation-tracker',
    name: 'Sedation Tracker (RASS / CPOT)',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'RASS score selector with verbal descriptors, CPOT subscale entry, and configurable goal RASS range.',
    tags: ['icu', 'critical-care', 'sedation', 'pain', 'rass', 'cpot'],
    pack: 'icu',
  },
  schema: {
    config: {
      type: 'object',
      properties: {
        goalRassMin: { type: 'number', default: -2 },
        goalRassMax: { type: 'number', default: 0 },
      },
    },
    data: {
      type: 'object',
      properties: {
        rass: { type: 'number' },
        cpotFace: { type: 'number' },
        cpotBody: { type: 'number' },
        cpotMuscle: { type: 'number' },
        cpotCompliance: { type: 'number' },
        goalRassMin: { type: 'number' },
        goalRassMax: { type: 'number' },
      },
    },
  },
  defaultConfig: { goalRassMin: -2, goalRassMax: 0 },
  minSize: { w: 3, h: 4 },
  Renderer: SedationRenderer,
  Editor: SedationEditor,
  PrintView: SedationPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run: `npx vitest run src/modules/packs/icu/sedation-tracker/sedation-tracker.test.tsx`
- [ ] All tests pass

### Step 5: Commit

- [ ] `git add src/modules/packs/icu/sedation-tracker/`
- [ ] `git commit -m "feat(icu): add sedation-tracker module (RASS/CPOT)"`

---

## Task 3: sat-sbt-readiness

**Goal:** SAT Safety Screen (6 checkbox items) + SBT Safety Screen (5 checkbox items). Auto-display PASS/FAIL badges when all items in each screen are checked. Log last SAT date, last SBT date, last SBT outcome. Citation required.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/icu/sat-sbt-readiness/sat-sbt-readiness.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SatSbtRenderer } from './Renderer'

const emptyData = {
  satScreen: {},
  sbtScreen: {},
  lastSatDate: '',
  lastSbtDate: '',
  lastSbtPassed: false,
}

const allSatPass = {
  satScreen: {
    noAgitation: true,
    noSeizures: true,
    noWithdrawal: true,
    noParalytic: true,
    noElevatedICP: true,
    noHighFiO2: true,
  },
  sbtScreen: {},
  lastSatDate: '',
  lastSbtDate: '',
  lastSbtPassed: false,
}

const allBothPass = {
  satScreen: {
    noAgitation: true,
    noSeizures: true,
    noWithdrawal: true,
    noParalytic: true,
    noElevatedICP: true,
    noHighFiO2: true,
  },
  sbtScreen: {
    fio2Ok: true,
    peepOk: true,
    noVasopressors: true,
    passedSat: true,
    coughOk: true,
  },
  lastSatDate: '2026-04-12',
  lastSbtDate: '2026-04-12',
  lastSbtPassed: true,
}

describe('SatSbtRenderer', () => {
  it('renders SAT and SBT section headings', () => {
    render(
      <SatSbtRenderer
        instanceId="test-1"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/SAT Safety Screen/i)).toBeTruthy()
    expect(screen.getByText(/SBT Safety Screen/i)).toBeTruthy()
  })

  it('shows SAT FAIL when not all items checked', () => {
    render(
      <SatSbtRenderer
        instanceId="test-2"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('SAT FAIL')).toBeTruthy()
    expect(screen.getByText('SBT FAIL')).toBeTruthy()
  })

  it('shows SAT PASS when all SAT items checked', () => {
    render(
      <SatSbtRenderer
        instanceId="test-3"
        config={{}}
        data={allSatPass}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('SAT PASS')).toBeTruthy()
  })

  it('shows SBT PASS when all SBT items checked', () => {
    render(
      <SatSbtRenderer
        instanceId="test-4"
        config={{}}
        data={allBothPass}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('SAT PASS')).toBeTruthy()
    expect(screen.getByText('SBT PASS')).toBeTruthy()
  })

  it('renders the citation', () => {
    render(
      <SatSbtRenderer
        instanceId="test-5"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Girard TD/i)).toBeTruthy()
  })

  it('calls onDataChange when a SAT checkbox is toggled', () => {
    const onDataChange = vi.fn()
    render(
      <SatSbtRenderer
        instanceId="test-6"
        config={{}}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    expect(onDataChange).toHaveBeenCalledOnce()
  })

  it('renders last SAT and SBT dates when provided', () => {
    render(
      <SatSbtRenderer
        instanceId="test-7"
        config={{}}
        data={allBothPass}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getAllByText(/2026-04-12/).length).toBeGreaterThan(0)
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run: `npx vitest run src/modules/packs/icu/sat-sbt-readiness/sat-sbt-readiness.test.tsx`
- [ ] Confirm tests fail

### Step 3: Implement all 4 files

- [ ] Create `src/modules/packs/icu/sat-sbt-readiness/Renderer.tsx`:

```tsx
import React, { FC } from 'react'

const CITATION = 'Girard TD et al. Lancet. 2008;371(9607):126-134'

const SAT_ITEMS: { key: string; label: string }[] = [
  { key: 'noAgitation', label: 'No agitation (RASS ≤ -3 overnight or no recent episodes)' },
  { key: 'noSeizures', label: 'No active seizures' },
  { key: 'noWithdrawal', label: 'No alcohol/benzo withdrawal' },
  { key: 'noParalytic', label: 'No active paralytic infusion' },
  { key: 'noElevatedICP', label: 'No elevated ICP' },
  { key: 'noHighFiO2', label: 'No FiO₂ > 50% or PEEP > 8 (NMD patients)' },
]

const SBT_ITEMS: { key: string; label: string }[] = [
  { key: 'fio2Ok', label: 'FiO₂ ≤ 50%' },
  { key: 'peepOk', label: 'PEEP ≤ 8 cmH₂O' },
  { key: 'noVasopressors', label: 'No vasopressors (or minimal low-dose)' },
  { key: 'passedSat', label: 'Passed SAT' },
  { key: 'coughOk', label: 'Adequate cough / secretions manageable' },
]

interface SatSbtData {
  satScreen: Record<string, boolean>
  sbtScreen: Record<string, boolean>
  lastSatDate: string
  lastSbtDate: string
  lastSbtPassed: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const SatSbtRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as SatSbtData
  const satScreen = d.satScreen ?? {}
  const sbtScreen = d.sbtScreen ?? {}

  const satPassed = SAT_ITEMS.every((item) => satScreen[item.key] === true)
  const sbtPassed = SBT_ITEMS.every((item) => sbtScreen[item.key] === true)

  const toggleSat = (key: string, checked: boolean) => {
    onDataChange({ ...d, satScreen: { ...satScreen, [key]: checked } })
  }

  const toggleSbt = (key: string, checked: boolean) => {
    onDataChange({ ...d, sbtScreen: { ...sbtScreen, [key]: checked } })
  }

  const PassBadge = ({ passed, label }: { passed: boolean; label: string }) => (
    <span
      className={`text-xs font-bold px-2 py-0.5 rounded ${
        passed ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
      }`}
    >
      {passed ? `${label} PASS` : `${label} FAIL`}
    </span>
  )

  return (
    <div className="p-3 space-y-4">
      {/* SAT Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-200">SAT Safety Screen</h3>
          <PassBadge passed={satPassed} label="SAT" />
        </div>
        <div className="space-y-1.5">
          {SAT_ITEMS.map((item) => (
            <label key={item.key} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={satScreen[item.key] === true}
                onChange={(e) => toggleSat(item.key, e.target.checked)}
                disabled={mode === 'build'}
                className="mt-0.5 accent-blue-500"
              />
              <span className="text-xs text-gray-300">{item.label}</span>
            </label>
          ))}
        </div>
        {d.lastSatDate && (
          <p className="text-xs text-gray-500 mt-1">Last SAT: {d.lastSatDate}</p>
        )}
      </div>

      {/* SBT Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-200">SBT Safety Screen</h3>
          <PassBadge passed={sbtPassed} label="SBT" />
        </div>
        <div className="space-y-1.5">
          {SBT_ITEMS.map((item) => (
            <label key={item.key} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sbtScreen[item.key] === true}
                onChange={(e) => toggleSbt(item.key, e.target.checked)}
                disabled={mode === 'build'}
                className="mt-0.5 accent-blue-500"
              />
              <span className="text-xs text-gray-300">{item.label}</span>
            </label>
          ))}
        </div>
        {d.lastSbtDate && (
          <p className="text-xs text-gray-500 mt-1">
            Last SBT: {d.lastSbtDate} —{' '}
            <span className={d.lastSbtPassed ? 'text-green-400' : 'text-red-400'}>
              {d.lastSbtPassed ? 'Passed' : 'Failed'}
            </span>
          </p>
        )}
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/sat-sbt-readiness/Editor.tsx`:

```tsx
import React, { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const SatSbtEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">SAT/SBT Readiness Settings</h4>
      <p className="text-xs text-gray-400">
        No configurable options for this module. Items are fixed per the ABC protocol
        (Girard et al. 2008).
      </p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/sat-sbt-readiness/PrintView.tsx`:

```tsx
import React, { FC } from 'react'

const CITATION = 'Girard TD et al. Lancet. 2008;371(9607):126-134'

const SAT_ITEMS = [
  { key: 'noAgitation', label: 'No agitation' },
  { key: 'noSeizures', label: 'No active seizures' },
  { key: 'noWithdrawal', label: 'No alcohol/benzo withdrawal' },
  { key: 'noParalytic', label: 'No active paralytic infusion' },
  { key: 'noElevatedICP', label: 'No elevated ICP' },
  { key: 'noHighFiO2', label: 'No FiO2 > 50% or PEEP > 8 (NMD)' },
]

const SBT_ITEMS = [
  { key: 'fio2Ok', label: 'FiO2 ≤ 50%' },
  { key: 'peepOk', label: 'PEEP ≤ 8 cmH2O' },
  { key: 'noVasopressors', label: 'No vasopressors (or minimal)' },
  { key: 'passedSat', label: 'Passed SAT' },
  { key: 'coughOk', label: 'Adequate cough / secretions manageable' },
]

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const SatSbtPrintView: FC<Props> = ({ data }) => {
  const satScreen = (data.satScreen as Record<string, boolean>) ?? {}
  const sbtScreen = (data.sbtScreen as Record<string, boolean>) ?? {}
  const lastSatDate = (data.lastSatDate as string) ?? ''
  const lastSbtDate = (data.lastSbtDate as string) ?? ''
  const lastSbtPassed = (data.lastSbtPassed as boolean) ?? false

  const satPassed = SAT_ITEMS.every((i) => satScreen[i.key])
  const sbtPassed = SBT_ITEMS.every((i) => sbtScreen[i.key])

  return (
    <div className="font-mono text-sm space-y-3">
      <h3 className="font-bold text-base">SAT / SBT Readiness</h3>

      <div>
        <p className="font-semibold">
          SAT Safety Screen: <span className={satPassed ? 'text-green-700' : 'text-red-700'}>{satPassed ? 'PASS' : 'FAIL'}</span>
        </p>
        <ul className="ml-4 text-xs space-y-0.5">
          {SAT_ITEMS.map((item) => (
            <li key={item.key}>
              [{satScreen[item.key] ? 'X' : ' '}] {item.label}
            </li>
          ))}
        </ul>
        {lastSatDate && <p className="text-xs text-gray-500">Last SAT: {lastSatDate}</p>}
      </div>

      <div>
        <p className="font-semibold">
          SBT Safety Screen: <span className={sbtPassed ? 'text-green-700' : 'text-red-700'}>{sbtPassed ? 'PASS' : 'FAIL'}</span>
        </p>
        <ul className="ml-4 text-xs space-y-0.5">
          {SBT_ITEMS.map((item) => (
            <li key={item.key}>
              [{sbtScreen[item.key] ? 'X' : ' '}] {item.label}
            </li>
          ))}
        </ul>
        {lastSbtDate && (
          <p className="text-xs text-gray-500">
            Last SBT: {lastSbtDate} — {lastSbtPassed ? 'Passed' : 'Failed'}
          </p>
        )}
      </div>

      <p className="text-xs italic text-gray-500">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/sat-sbt-readiness/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { SatSbtRenderer } from './Renderer'
import { SatSbtEditor } from './Editor'
import { SatSbtPrintView } from './PrintView'

export const satSbtReadinessPlugin: ModulePlugin = {
  meta: {
    id: 'sat-sbt-readiness',
    name: 'SAT / SBT Readiness',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'SAT and SBT safety screening checklists per the ABC protocol with PASS/FAIL auto-assessment.',
    tags: ['icu', 'critical-care', 'ventilator', 'weaning', 'sat', 'sbt'],
    pack: 'icu',
  },
  schema: {
    config: { type: 'object', properties: {} },
    data: {
      type: 'object',
      properties: {
        satScreen: { type: 'object' },
        sbtScreen: { type: 'object' },
        lastSatDate: { type: 'string' },
        lastSbtDate: { type: 'string' },
        lastSbtPassed: { type: 'boolean' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 5 },
  Renderer: SatSbtRenderer,
  Editor: SatSbtEditor,
  PrintView: SatSbtPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run: `npx vitest run src/modules/packs/icu/sat-sbt-readiness/sat-sbt-readiness.test.tsx`
- [ ] All tests pass

### Step 5: Commit

- [ ] `git add src/modules/packs/icu/sat-sbt-readiness/`
- [ ] `git commit -m "feat(icu): add sat-sbt-readiness module"`

---

## Task 4: nutrition-tracker

**Goal:** EN/PN mode toggle; weight-based kcal and protein goals with configurable per-kg targets; current intake entry; auto-calculated % of goal for kcal and protein with progress bars. No citation (weight-based targets are standard institutional practice).

### Step 1: Write failing test

- [ ] Create `src/modules/packs/icu/nutrition-tracker/nutrition-tracker.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NutritionRenderer, calcPctGoal } from './Renderer'

describe('calcPctGoal', () => {
  it('returns 0 when goal is 0', () => {
    expect(calcPctGoal(100, 0)).toBe(0)
  })

  it('returns 100 when current equals goal', () => {
    expect(calcPctGoal(2000, 2000)).toBe(100)
  })

  it('returns correct percentage', () => {
    expect(calcPctGoal(1500, 2000)).toBe(75)
  })

  it('caps at 100 when over goal', () => {
    expect(calcPctGoal(2500, 2000)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calcPctGoal(1, 3)).toBe(33)
  })
})

const defaultData = {
  mode: 'EN' as const,
  weightKg: 70,
  kcalGoalPerKg: 25,
  proteinGoalPerKg: 1.2,
  kcalCurrentPerDay: 0,
  proteinCurrentPerDay: 0,
}

const filledData = {
  mode: 'EN' as const,
  weightKg: 80,
  kcalGoalPerKg: 30,
  proteinGoalPerKg: 2.0,
  kcalCurrentPerDay: 1800,
  proteinCurrentPerDay: 120,
}

describe('NutritionRenderer', () => {
  it('renders EN and PN mode buttons', () => {
    render(
      <NutritionRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('EN')).toBeTruthy()
    expect(screen.getByText('PN')).toBeTruthy()
  })

  it('renders weight, kcal, and protein fields', () => {
    render(
      <NutritionRenderer
        instanceId="test-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/Weight/i)).toBeTruthy()
    expect(screen.getByLabelText(/kcal goal/i)).toBeTruthy()
    expect(screen.getByLabelText(/protein goal/i)).toBeTruthy()
  })

  it('calculates total kcal goal from weight × kcalGoalPerKg', () => {
    render(
      <NutritionRenderer
        instanceId="test-3"
        config={{}}
        data={filledData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // 80 × 30 = 2400 kcal/day goal
    expect(screen.getByText(/2400/)).toBeTruthy()
  })

  it('calculates total protein goal from weight × proteinGoalPerKg', () => {
    render(
      <NutritionRenderer
        instanceId="test-4"
        config={{}}
        data={filledData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // 80 × 2.0 = 160 g/day goal
    expect(screen.getByText(/160/)).toBeTruthy()
  })

  it('calls onDataChange when mode toggled to PN', () => {
    const onDataChange = vi.fn()
    render(
      <NutritionRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText('PN'))
    expect(onDataChange).toHaveBeenCalledOnce()
    expect(onDataChange.mock.calls[0][0].mode).toBe('PN')
  })

  it('shows % of goal for kcal', () => {
    render(
      <NutritionRenderer
        instanceId="test-6"
        config={{}}
        data={filledData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // 1800 / 2400 = 75%
    expect(screen.getByText(/75%/)).toBeTruthy()
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run: `npx vitest run src/modules/packs/icu/nutrition-tracker/nutrition-tracker.test.tsx`
- [ ] Confirm tests fail

### Step 3: Implement all 4 files

- [ ] Create `src/modules/packs/icu/nutrition-tracker/Renderer.tsx`:

```tsx
import React, { FC } from 'react'

export function calcPctGoal(current: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min(100, Math.round((current / goal) * 100))
}

interface NutritionData {
  mode: 'EN' | 'PN'
  weightKg: number
  kcalGoalPerKg: number
  proteinGoalPerKg: number
  kcalCurrentPerDay: number
  proteinCurrentPerDay: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const ProgressBar: FC<{ pct: number; color: string }> = ({ pct, color }) => (
  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
    <div
      className={`h-2 rounded-full transition-all ${color}`}
      style={{ width: `${Math.min(100, pct)}%` }}
    />
  </div>
)

export const NutritionRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as NutritionData
  const feedMode = d.mode ?? 'EN'
  const weight = d.weightKg ?? 70
  const kcalPerKg = d.kcalGoalPerKg ?? 25
  const proteinPerKg = d.proteinGoalPerKg ?? 1.2
  const kcalCurrent = d.kcalCurrentPerDay ?? 0
  const proteinCurrent = d.proteinCurrentPerDay ?? 0

  const kcalGoal = Math.round(weight * kcalPerKg)
  const proteinGoal = Math.round(weight * proteinPerKg * 10) / 10
  const kcalPct = calcPctGoal(kcalCurrent, kcalGoal)
  const proteinPct = calcPctGoal(proteinCurrent, proteinGoal)

  const update = (fields: Partial<NutritionData>) => onDataChange({ ...d, ...fields })

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-200">Nutrition Tracker</h3>
        <div className="flex rounded overflow-hidden border border-gray-600">
          {(['EN', 'PN'] as const).map((m) => (
            <button
              key={m}
              onClick={() => update({ mode: m })}
              disabled={mode === 'build'}
              className={`px-3 py-1 text-xs font-semibold transition-colors ${
                feedMode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              } disabled:cursor-not-allowed`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1" htmlFor="weight-input">
            Weight (kg)
          </label>
          <input
            id="weight-input"
            type="number"
            value={weight}
            min={1}
            max={300}
            onChange={(e) => update({ weightKg: parseFloat(e.target.value) || 0 })}
            disabled={mode === 'build'}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <span className="text-sm text-gray-300 font-semibold">{feedMode}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1" htmlFor="kcal-goal-input">
            kcal goal (kcal/kg/d)
          </label>
          <input
            id="kcal-goal-input"
            type="number"
            value={kcalPerKg}
            min={10}
            max={50}
            step={1}
            onChange={(e) => update({ kcalGoalPerKg: parseFloat(e.target.value) || 25 })}
            disabled={mode === 'build'}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1" htmlFor="protein-goal-input">
            Protein goal (g/kg/d)
          </label>
          <input
            id="protein-goal-input"
            type="number"
            value={proteinPerKg}
            min={0.5}
            max={3.0}
            step={0.1}
            onChange={(e) => update({ proteinGoalPerKg: parseFloat(e.target.value) || 1.2 })}
            disabled={mode === 'build'}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-full"
          />
        </div>
      </div>

      {/* Kcal row */}
      <div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-400">Kcal</span>
          <span className="text-xs text-gray-300">
            {kcalCurrent} / <strong>{kcalGoal}</strong> kcal/d &nbsp;
            <span className="font-bold text-blue-300">{kcalPct}%</span>
          </span>
        </div>
        <ProgressBar pct={kcalPct} color={kcalPct >= 80 ? 'bg-green-500' : 'bg-blue-500'} />
        <input
          type="number"
          value={kcalCurrent}
          min={0}
          onChange={(e) => update({ kcalCurrentPerDay: parseFloat(e.target.value) || 0 })}
          disabled={mode === 'build'}
          placeholder="Current kcal/day"
          className="mt-1 bg-gray-800 text-gray-100 rounded px-2 py-1 text-xs w-full"
        />
      </div>

      {/* Protein row */}
      <div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-400">Protein</span>
          <span className="text-xs text-gray-300">
            {proteinCurrent} / <strong>{proteinGoal}</strong> g/d &nbsp;
            <span className="font-bold text-blue-300">{proteinPct}%</span>
          </span>
        </div>
        <ProgressBar pct={proteinPct} color={proteinPct >= 80 ? 'bg-green-500' : 'bg-purple-500'} />
        <input
          type="number"
          value={proteinCurrent}
          min={0}
          onChange={(e) => update({ proteinCurrentPerDay: parseFloat(e.target.value) || 0 })}
          disabled={mode === 'build'}
          placeholder="Current protein g/day"
          className="mt-1 bg-gray-800 text-gray-100 rounded px-2 py-1 text-xs w-full"
        />
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/nutrition-tracker/Editor.tsx`:

```tsx
import React, { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const NutritionEditor: FC<Props> = ({ config, onConfigChange }) => {
  const defaultKcalPerKg = (config.defaultKcalPerKg as number) ?? 25
  const defaultProteinPerKg = (config.defaultProteinPerKg as number) ?? 1.2

  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">Nutrition Tracker Settings</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Default kcal/kg/d</label>
          <input
            type="number"
            value={defaultKcalPerKg}
            min={10}
            max={50}
            step={1}
            onChange={(e) =>
              onConfigChange({ ...config, defaultKcalPerKg: parseFloat(e.target.value) || 25 })
            }
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Default protein g/kg/d</label>
          <input
            type="number"
            value={defaultProteinPerKg}
            min={0.5}
            max={3.0}
            step={0.1}
            onChange={(e) =>
              onConfigChange({ ...config, defaultProteinPerKg: parseFloat(e.target.value) || 1.2 })
            }
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-full"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Typical ICU targets: 25–30 kcal/kg/d, 1.2–2.0 g protein/kg/d.
      </p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/nutrition-tracker/PrintView.tsx`:

```tsx
import React, { FC } from 'react'
import { calcPctGoal } from './Renderer'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const NutritionPrintView: FC<Props> = ({ data }) => {
  const mode = (data.mode as string) ?? 'EN'
  const weight = (data.weightKg as number) ?? 0
  const kcalPerKg = (data.kcalGoalPerKg as number) ?? 25
  const proteinPerKg = (data.proteinGoalPerKg as number) ?? 1.2
  const kcalCurrent = (data.kcalCurrentPerDay as number) ?? 0
  const proteinCurrent = (data.proteinCurrentPerDay as number) ?? 0
  const kcalGoal = Math.round(weight * kcalPerKg)
  const proteinGoal = Math.round(weight * proteinPerKg * 10) / 10
  const kcalPct = calcPctGoal(kcalCurrent, kcalGoal)
  const proteinPct = calcPctGoal(proteinCurrent, proteinGoal)

  return (
    <div className="font-mono text-sm space-y-2">
      <h3 className="font-bold text-base">Nutrition Tracker</h3>
      <p>Mode: <strong>{mode}</strong> | Weight: {weight} kg</p>
      <table className="w-full border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">Metric</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Goal/kg</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Total Goal</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Current</th>
            <th className="border border-gray-300 px-2 py-1 text-left">% Goal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-2 py-1">Kcal</td>
            <td className="border border-gray-300 px-2 py-1">{kcalPerKg} kcal/kg</td>
            <td className="border border-gray-300 px-2 py-1">{kcalGoal} kcal/d</td>
            <td className="border border-gray-300 px-2 py-1">{kcalCurrent} kcal/d</td>
            <td className="border border-gray-300 px-2 py-1">{kcalPct}%</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1">Protein</td>
            <td className="border border-gray-300 px-2 py-1">{proteinPerKg} g/kg</td>
            <td className="border border-gray-300 px-2 py-1">{proteinGoal} g/d</td>
            <td className="border border-gray-300 px-2 py-1">{proteinCurrent} g/d</td>
            <td className="border border-gray-300 px-2 py-1">{proteinPct}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/nutrition-tracker/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { NutritionRenderer } from './Renderer'
import { NutritionEditor } from './Editor'
import { NutritionPrintView } from './PrintView'

export const nutritionTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'nutrition-tracker',
    name: 'Nutrition Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'EN/PN mode; weight-based kcal and protein goal tracking with progress bars.',
    tags: ['icu', 'critical-care', 'nutrition', 'enteral', 'parenteral'],
    pack: 'icu',
  },
  schema: {
    config: {
      type: 'object',
      properties: {
        defaultKcalPerKg: { type: 'number', default: 25 },
        defaultProteinPerKg: { type: 'number', default: 1.2 },
      },
    },
    data: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['EN', 'PN'] },
        weightKg: { type: 'number' },
        kcalGoalPerKg: { type: 'number' },
        proteinGoalPerKg: { type: 'number' },
        kcalCurrentPerDay: { type: 'number' },
        proteinCurrentPerDay: { type: 'number' },
      },
    },
  },
  defaultConfig: { defaultKcalPerKg: 25, defaultProteinPerKg: 1.2 },
  minSize: { w: 3, h: 4 },
  Renderer: NutritionRenderer,
  Editor: NutritionEditor,
  PrintView: NutritionPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run: `npx vitest run src/modules/packs/icu/nutrition-tracker/nutrition-tracker.test.tsx`
- [ ] All tests pass

### Step 5: Commit

- [ ] `git add src/modules/packs/icu/nutrition-tracker/`
- [ ] `git commit -m "feat(icu): add nutrition-tracker module"`

---

## Task 5: sofa-apache

**Goal:** SOFA score (6 components, each 0-4, total 0-24) and APACHE II score (APS + age points + chronic health points) in separate sections. Exported pure functions `calcSOFA` and `calcAPACHEII`. Both citations required.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/icu/sofa-apache/sofa-apache.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SofaApacheRenderer, calcSOFA, calcAPACHEII } from './Renderer'

describe('calcSOFA', () => {
  it('returns 0 when all components are 0', () => {
    expect(calcSOFA(0, 0, 0, 0, 0, 0)).toBe(0)
  })

  it('returns 24 when all components are 4', () => {
    expect(calcSOFA(4, 4, 4, 4, 4, 4)).toBe(24)
  })

  it('returns correct sum', () => {
    expect(calcSOFA(2, 1, 3, 2, 1, 0)).toBe(9)
    expect(calcSOFA(0, 4, 0, 0, 0, 0)).toBe(4)
  })
})

describe('calcAPACHEII', () => {
  it('returns 0 when all inputs are 0', () => {
    expect(calcAPACHEII(0, 0, 0)).toBe(0)
  })

  it('returns sum of aps + age + chronic', () => {
    expect(calcAPACHEII(20, 5, 2)).toBe(27)
    expect(calcAPACHEII(10, 3, 0)).toBe(13)
  })

  it('handles max realistic values', () => {
    expect(calcAPACHEII(60, 6, 5)).toBe(71)
  })
})

const defaultData = {
  sofa: {
    pf: 0,
    platelets: 0,
    bilirubin: 0,
    cardio: 0,
    gcs: 0,
    creatinine: 0,
    uoPerDay: 0,
  },
  apache: {
    aps: 0,
    ageYears: 0,
    chronicPoints: 0,
  },
}

const filledData = {
  sofa: {
    pf: 2,
    platelets: 1,
    bilirubin: 1,
    cardio: 2,
    gcs: 1,
    creatinine: 1,
    uoPerDay: 0,
  },
  apache: {
    aps: 15,
    ageYears: 3,
    chronicPoints: 2,
  },
}

describe('SofaApacheRenderer', () => {
  it('renders SOFA and APACHE II headings', () => {
    render(
      <SofaApacheRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/SOFA/i)).toBeTruthy()
    expect(screen.getByText(/APACHE II/i)).toBeTruthy()
  })

  it('renders all 6 SOFA component labels', () => {
    render(
      <SofaApacheRenderer
        instanceId="test-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Respiration/i)).toBeTruthy()
    expect(screen.getByText(/Coagulation/i)).toBeTruthy()
    expect(screen.getByText(/Liver/i)).toBeTruthy()
    expect(screen.getByText(/Cardiovascular/i)).toBeTruthy()
    expect(screen.getByText(/CNS/i)).toBeTruthy()
    expect(screen.getByText(/Renal/i)).toBeTruthy()
  })

  it('displays calculated SOFA total', () => {
    render(
      <SofaApacheRenderer
        instanceId="test-3"
        config={{}}
        data={filledData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // pf=2 + platelets=1 + bilirubin=1 + cardio=2 + gcs=1 + creatinine=1 = 8
    expect(screen.getByText(/SOFA Total/i)).toBeTruthy()
    expect(screen.getByText('8')).toBeTruthy()
  })

  it('displays calculated APACHE II total', () => {
    render(
      <SofaApacheRenderer
        instanceId="test-4"
        config={{}}
        data={filledData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // aps=15 + age=3 + chronic=2 = 20
    expect(screen.getByText(/APACHE II Total/i)).toBeTruthy()
    expect(screen.getByText('20')).toBeTruthy()
  })

  it('renders both citations', () => {
    render(
      <SofaApacheRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Singer M/i)).toBeTruthy()
    expect(screen.getByText(/Knaus WA/i)).toBeTruthy()
  })

  it('calls onDataChange when a SOFA component score changes', () => {
    const onDataChange = vi.fn()
    render(
      <SofaApacheRenderer
        instanceId="test-6"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    // Click the button for Respiration score = 2
    const buttons = screen.getAllByRole('button')
    // Find "2" buttons and click first one for Respiration
    const scoreButtons = buttons.filter((b) => b.textContent === '2')
    fireEvent.click(scoreButtons[0])
    expect(onDataChange).toHaveBeenCalledOnce()
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run: `npx vitest run src/modules/packs/icu/sofa-apache/sofa-apache.test.tsx`
- [ ] Confirm tests fail

### Step 3: Implement all 4 files

- [ ] Create `src/modules/packs/icu/sofa-apache/Renderer.tsx`:

```tsx
import React, { FC } from 'react'

const SOFA_CITATION = 'Singer M et al. JAMA. 2016;315(8):801-810'
const APACHE_CITATION = 'Knaus WA et al. Crit Care Med. 1985;13(10):818-829'

export function calcSOFA(
  resp: number,
  coag: number,
  liver: number,
  cardio: number,
  cns: number,
  renal: number
): number {
  return resp + coag + liver + cardio + cns + renal
}

export function calcAPACHEII(aps: number, age: number, chronic: number): number {
  return aps + age + chronic
}

interface SofaScores {
  pf: number
  platelets: number
  bilirubin: number
  cardio: number
  gcs: number
  creatinine: number
  uoPerDay: number
}

interface ApacheScores {
  aps: number
  ageYears: number
  chronicPoints: number
}

interface SofaApacheData {
  sofa: SofaScores
  apache: ApacheScores
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const SOFA_COMPONENTS: {
  key: keyof SofaScores
  label: string
  sublabel: string
  max: number
}[] = [
  {
    key: 'pf',
    label: 'Respiration',
    sublabel: 'P/F ratio (≥400=0, 300-399=1, 200-299=2, 100-199+vent=3, <100+vent=4)',
    max: 4,
  },
  {
    key: 'platelets',
    label: 'Coagulation',
    sublabel: 'Platelets ×10³/µL (≥150=0, 100-149=1, 50-99=2, 20-49=3, <20=4)',
    max: 4,
  },
  {
    key: 'bilirubin',
    label: 'Liver',
    sublabel: 'Bilirubin mg/dL (<1.2=0, 1.2-1.9=1, 2.0-5.9=2, 6.0-11.9=3, ≥12=4)',
    max: 4,
  },
  {
    key: 'cardio',
    label: 'Cardiovascular',
    sublabel: 'MAP/vasopressors (MAP≥70=0, <70=1, dopa≤5 or dobu=2, dopa>5 or NE/epi≤0.1=3, dopa>15 or NE/epi>0.1=4)',
    max: 4,
  },
  {
    key: 'gcs',
    label: 'CNS',
    sublabel: 'GCS (15=0, 13-14=1, 10-12=2, 6-9=3, <6=4)',
    max: 4,
  },
  {
    key: 'creatinine',
    label: 'Renal',
    sublabel: 'Cr mg/dL or UO (<1.2=0, 1.2-1.9=1, 2.0-3.4=2, 3.5-4.9 or UO<500=3, ≥5 or UO<200=4)',
    max: 4,
  },
]

const ScoreSelector: FC<{
  label: string
  sublabel: string
  value: number
  max: number
  onChange: (v: number) => void
  disabled: boolean
}> = ({ label, sublabel, value, max, onChange, disabled }) => (
  <div className="py-2 border-b border-gray-700 last:border-0">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-200">{label}</p>
        <p className="text-xs text-gray-500 leading-tight mt-0.5">{sublabel}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {Array.from({ length: max + 1 }, (_, i) => i).map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            disabled={disabled}
            className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
              value === v
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:cursor-not-allowed`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  </div>
)

export const SofaApacheRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as SofaApacheData
  const sofa: SofaScores = d.sofa ?? {
    pf: 0, platelets: 0, bilirubin: 0, cardio: 0, gcs: 0, creatinine: 0, uoPerDay: 0,
  }
  const apache: ApacheScores = d.apache ?? { aps: 0, ageYears: 0, chronicPoints: 0 }

  const sofaTotal = calcSOFA(
    sofa.pf, sofa.platelets, sofa.bilirubin, sofa.cardio, sofa.gcs, sofa.creatinine
  )
  const apacheTotal = calcAPACHEII(apache.aps, apache.ageYears, apache.chronicPoints)

  const updateSofa = (key: keyof SofaScores, value: number) =>
    onDataChange({ ...d, sofa: { ...sofa, [key]: value } })

  const updateApache = (key: keyof ApacheScores, value: number) =>
    onDataChange({ ...d, apache: { ...apache, [key]: value } })

  return (
    <div className="p-3 space-y-5">
      {/* SOFA Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-200">SOFA Score</h3>
          <div className="text-right">
            <span className="text-xs text-gray-400">SOFA Total</span>
            <span className="ml-2 text-lg font-bold text-blue-300">{sofaTotal}</span>
            <span className="text-xs text-gray-500"> / 24</span>
          </div>
        </div>

        <div>
          {SOFA_COMPONENTS.map((comp) => (
            <ScoreSelector
              key={comp.key}
              label={comp.label}
              sublabel={comp.sublabel}
              value={sofa[comp.key] ?? 0}
              max={comp.max}
              onChange={(v) => updateSofa(comp.key, v)}
              disabled={mode === 'build'}
            />
          ))}
        </div>
        <p className="text-xs italic text-gray-400 mt-2">{SOFA_CITATION}</p>
      </div>

      {/* APACHE II Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-200">APACHE II Score</h3>
          <div className="text-right">
            <span className="text-xs text-gray-400">APACHE II Total</span>
            <span className="ml-2 text-lg font-bold text-orange-300">{apacheTotal}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              APS (Acute Physiology Score, 0-60)
            </label>
            <p className="text-xs text-gray-500 mb-1 leading-tight">
              Sum of 12 APS variables: temp, MAP, HR, RR, A-a gradient/PaO2, pH, Na, K, Cr (×2 if ARF), Hct, WBC, GCS score (15 − actual GCS)
            </p>
            <input
              type="number"
              value={apache.aps}
              min={0}
              max={60}
              onChange={(e) => updateApache('aps', parseInt(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-24"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Age Points
            </label>
            <p className="text-xs text-gray-500 mb-1">&lt;44=0, 45-54=2, 55-64=3, 65-74=5, ≥75=6</p>
            <div className="flex gap-1">
              {[
                { label: '<44', value: 0 },
                { label: '45-54', value: 2 },
                { label: '55-64', value: 3 },
                { label: '65-74', value: 5 },
                { label: '≥75', value: 6 },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => updateApache('ageYears', value)}
                  disabled={mode === 'build'}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                    apache.ageYears === value
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:cursor-not-allowed`}
                >
                  {label}
                  <span className="block text-xs opacity-70">+{value}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Chronic Health Points
            </label>
            <p className="text-xs text-gray-500 mb-1">
              None=0; Elective post-op=2; Emergency/non-op with liver, CV, respiratory, renal, or immunocompromised=5
            </p>
            <div className="flex gap-1">
              {[
                { label: 'None', value: 0 },
                { label: 'Elective', value: 2 },
                { label: 'Emergency', value: 5 },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => updateApache('chronicPoints', value)}
                  disabled={mode === 'build'}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    apache.chronicPoints === value
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:cursor-not-allowed`}
                >
                  {label}
                  <span className="block text-xs opacity-70">+{value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs italic text-gray-400 mt-2">{APACHE_CITATION}</p>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/sofa-apache/Editor.tsx`:

```tsx
import React, { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const SofaApacheEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">SOFA / APACHE II Settings</h4>
      <p className="text-xs text-gray-400">
        No configurable options. Scoring follows published criteria (Singer et al. 2016; Knaus et al. 1985).
      </p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/sofa-apache/PrintView.tsx`:

```tsx
import React, { FC } from 'react'
import { calcSOFA, calcAPACHEII } from './Renderer'

const SOFA_CITATION = 'Singer M et al. JAMA. 2016;315(8):801-810'
const APACHE_CITATION = 'Knaus WA et al. Crit Care Med. 1985;13(10):818-829'

const AGE_LABELS: Record<number, string> = {
  0: '<44 yr',
  2: '45-54 yr',
  3: '55-64 yr',
  5: '65-74 yr',
  6: '≥75 yr',
}

const CHRONIC_LABELS: Record<number, string> = {
  0: 'None',
  2: 'Elective post-op',
  5: 'Emergency / non-op',
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const SofaApachePrintView: FC<Props> = ({ data }) => {
  const sofa = (data.sofa as Record<string, number>) ?? {}
  const apache = (data.apache as Record<string, number>) ?? {}

  const sofaTotal = calcSOFA(
    sofa.pf ?? 0,
    sofa.platelets ?? 0,
    sofa.bilirubin ?? 0,
    sofa.cardio ?? 0,
    sofa.gcs ?? 0,
    sofa.creatinine ?? 0
  )
  const apacheTotal = calcAPACHEII(apache.aps ?? 0, apache.ageYears ?? 0, apache.chronicPoints ?? 0)

  return (
    <div className="font-mono text-sm space-y-4">
      <h3 className="font-bold text-base">SOFA / APACHE II</h3>

      <div>
        <p className="font-semibold">SOFA Score: {sofaTotal} / 24</p>
        <table className="w-full border border-gray-300 text-xs mt-1">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1 text-left">Component</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Respiration (P/F)', value: sofa.pf ?? 0 },
              { label: 'Coagulation (Platelets)', value: sofa.platelets ?? 0 },
              { label: 'Liver (Bilirubin)', value: sofa.bilirubin ?? 0 },
              { label: 'Cardiovascular (MAP/pressors)', value: sofa.cardio ?? 0 },
              { label: 'CNS (GCS)', value: sofa.gcs ?? 0 },
              { label: 'Renal (Cr / UO)', value: sofa.creatinine ?? 0 },
            ].map(({ label, value }) => (
              <tr key={label}>
                <td className="border border-gray-300 px-2 py-1">{label}</td>
                <td className="border border-gray-300 px-2 py-1">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs italic text-gray-500 mt-1">{SOFA_CITATION}</p>
      </div>

      <div>
        <p className="font-semibold">APACHE II Score: {apacheTotal}</p>
        <ul className="ml-4 text-xs space-y-0.5 mt-1">
          <li>APS: {apache.aps ?? 0}</li>
          <li>Age: {AGE_LABELS[apache.ageYears ?? 0] ?? apache.ageYears} (+{apache.ageYears ?? 0})</li>
          <li>
            Chronic Health: {CHRONIC_LABELS[apache.chronicPoints ?? 0] ?? apache.chronicPoints} (+{apache.chronicPoints ?? 0})
          </li>
        </ul>
        <p className="text-xs italic text-gray-500 mt-1">{APACHE_CITATION}</p>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/icu/sofa-apache/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { SofaApacheRenderer } from './Renderer'
import { SofaApacheEditor } from './Editor'
import { SofaApachePrintView } from './PrintView'

export const sofaApachePlugin: ModulePlugin = {
  meta: {
    id: 'sofa-apache',
    name: 'SOFA / APACHE II',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'SOFA score (6 organ systems, 0-24) and APACHE II score (APS + age + chronic health) with published citations.',
    tags: ['icu', 'critical-care', 'severity', 'sofa', 'apache', 'prognosis'],
    pack: 'icu',
  },
  schema: {
    config: { type: 'object', properties: {} },
    data: {
      type: 'object',
      properties: {
        sofa: { type: 'object' },
        apache: { type: 'object' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 6 },
  Renderer: SofaApacheRenderer,
  Editor: SofaApacheEditor,
  PrintView: SofaApachePrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run: `npx vitest run src/modules/packs/icu/sofa-apache/sofa-apache.test.tsx`
- [ ] All tests pass

### Step 5: Commit

- [ ] `git add src/modules/packs/icu/sofa-apache/`
- [ ] `git commit -m "feat(icu): add sofa-apache module"`

---

## Task 6: Pack index and registration

**Goal:** Create the pack-level `index.ts` that exports all 5 plugins and registers them. Then wire the ICU pack into `src/modules/packs/index.ts`.

### Step 1: Create `src/modules/packs/icu/index.ts`

- [ ] Create `src/modules/packs/icu/index.ts`:

```ts
import { vasopressorTrackerPlugin } from './vasopressor-tracker'
import { sedationTrackerPlugin } from './sedation-tracker'
import { satSbtReadinessPlugin } from './sat-sbt-readiness'
import { nutritionTrackerPlugin } from './nutrition-tracker'
import { sofaApachePlugin } from './sofa-apache'

export const icuPack = [
  vasopressorTrackerPlugin,
  sedationTrackerPlugin,
  satSbtReadinessPlugin,
  nutritionTrackerPlugin,
  sofaApachePlugin,
]
```

### Step 2: Wire into packs index

- [ ] Open `src/modules/packs/index.ts` (created by Plan 4a-i) and add the ICU pack:

```ts
// Add this import alongside existing pack imports:
import { icuPack } from './icu'

// Add icuPack to the allPacks array:
export const allPacks = [
  ...icuPack,
  // ...other packs
]
```

> If `src/modules/packs/index.ts` does not yet exist, create it with:
>
> ```ts
> import { icuPack } from './icu'
> export const allPacks = [...icuPack]
> ```

### Step 3: Commit

- [ ] `git add src/modules/packs/icu/index.ts src/modules/packs/index.ts`
- [ ] `git commit -m "feat(icu): register ICU pack in module registry"`

---

## Verification Checklist

Before marking this plan complete, confirm:

- [ ] All 5 modules have passing tests: `npx vitest run src/modules/packs/icu/`
- [ ] Every clinical scoring module (`sedation-tracker`, `sat-sbt-readiness`, `sofa-apache`) renders its citation string in the UI
- [ ] `calcCPOT`, `calcSOFA`, and `calcAPACHEII` are exported named functions with unit test coverage
- [ ] No placeholder comments or `// TODO` stubs remain in any file
- [ ] `vasopressor-tracker` enforces maximum 4 pressors (button disabled state)
- [ ] `sedation-tracker` shows IN GOAL / OUT OF GOAL badge based on RASS vs. goal range
- [ ] `sat-sbt-readiness` correctly auto-displays SAT PASS/FAIL and SBT PASS/FAIL
- [ ] `nutrition-tracker` exports `calcPctGoal` and correctly caps at 100
- [ ] All `index.ts` files match the `ModulePlugin` interface exactly
- [ ] ICU pack is registered in `src/modules/packs/index.ts`
