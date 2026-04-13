# Patient Template Builder — Plan 4b-ii-b: Hepatology/GI Pack

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Hepatology/GI specialty pack (4 modules) with evidence-cited MELD-Na, ascites, encephalopathy, and GI bleed risk tools.

**Architecture:** Pack lives under `src/modules/packs/gi/`. Imported by `src/modules/packs/index.ts`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/modules/packs/gi/
├── index.ts
├── meld-na/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── meld-na.test.tsx
├── ascites-tracker/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── ascites-tracker.test.tsx
├── encephalopathy/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── encephalopathy.test.tsx
└── gi-bleed/
    ├── index.ts
    ├── Renderer.tsx
    ├── Editor.tsx
    ├── PrintView.tsx
    └── gi-bleed.test.tsx
```

---

## Task 1: meld-na

**Goal:** Calculate MELD and MELD-Na scores from creatinine, bilirubin, INR, and sodium with UNOS capping rules. Display 90-day mortality lookup table.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/gi/meld-na/meld-na.test.tsx` with the following content:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcMELD, calcMELDNa } from './Renderer'
import { MeldNaRenderer } from './Renderer'

describe('calcMELD', () => {
  it('calculates correctly with standard inputs', () => {
    // cr=1.0, bili=1.0, inr=1.0 → 3.78*ln(1)+11.2*ln(1)+9.57*ln(1)+6.43 = 6.43 → 6
    expect(calcMELD(1.0, 1.0, 1.0)).toBe(6)
  })

  it('caps creatinine at 4.0 per UNOS rules', () => {
    const uncapped = calcMELD(4.0, 2.0, 1.5)
    const capped = calcMELD(5.0, 2.0, 1.5)
    expect(uncapped).toBe(capped)
  })

  it('enforces minimum bilirubin of 1.0', () => {
    const floored = calcMELD(1.0, 0.3, 1.0)
    const atMin = calcMELD(1.0, 1.0, 1.0)
    expect(floored).toBe(atMin)
  })

  it('enforces minimum INR of 1.0', () => {
    const floored = calcMELD(1.0, 1.0, 0.5)
    const atMin = calcMELD(1.0, 1.0, 1.0)
    expect(floored).toBe(atMin)
  })

  it('returns integer', () => {
    const result = calcMELD(1.5, 2.3, 1.8)
    expect(Number.isInteger(result)).toBe(true)
  })

  it('calculates a known clinical example', () => {
    // cr=2.0, bili=3.0, inr=2.0
    // = 3.78*ln(3)+11.2*ln(2)+9.57*ln(2)+6.43
    // = 3.78*1.0986+11.2*0.6931+9.57*0.6931+6.43
    // = 4.153+7.763+6.630+6.43 = 24.976 → 25
    expect(calcMELD(2.0, 3.0, 2.0)).toBe(25)
  })
})

describe('calcMELDNa', () => {
  it('constrains sodium to 125-137 range', () => {
    const low = calcMELDNa(20, 120)
    const atFloor = calcMELDNa(20, 125)
    expect(low).toBe(atFloor)

    const high = calcMELDNa(20, 145)
    const atCeil = calcMELDNa(20, 137)
    expect(high).toBe(atCeil)
  })

  it('returns MELD when sodium is 137 (no adjustment)', () => {
    // MELD-Na = MELD + 1.32*(137-137) - 0.033*MELD*(137-137) = MELD
    expect(calcMELDNa(20, 137)).toBe(20)
  })

  it('increases score when sodium is low', () => {
    expect(calcMELDNa(20, 125)).toBeGreaterThan(20)
  })

  it('returns integer', () => {
    expect(Number.isInteger(calcMELDNa(15, 130))).toBe(true)
  })
})

describe('MeldNaRenderer', () => {
  const defaultData = { creatinine: 1.0, bilirubin: 1.0, inr: 1.0, sodium: 137 }

  it('renders input fields', () => {
    render(
      <MeldNaRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/creatinine/i)).toBeTruthy()
    expect(screen.getByLabelText(/bilirubin/i)).toBeTruthy()
    expect(screen.getByLabelText(/inr/i)).toBeTruthy()
    expect(screen.getByLabelText(/sodium/i)).toBeTruthy()
  })

  it('renders MELD and MELD-Na score labels', () => {
    render(
      <MeldNaRenderer
        instanceId="test-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/MELD Score/i)).toBeTruthy()
    expect(screen.getByText(/MELD-Na/i)).toBeTruthy()
  })

  it('renders 90-day mortality table', () => {
    render(
      <MeldNaRenderer
        instanceId="test-3"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/90-day mortality/i)).toBeTruthy()
    expect(screen.getByText(/1\.9%/)).toBeTruthy()
    expect(screen.getByText(/71\.3%/)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <MeldNaRenderer
        instanceId="test-4"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Kim WR/i)).toBeTruthy()
  })

  it('calls onDataChange when creatinine input changes', () => {
    const onDataChange = vi.fn()
    render(
      <MeldNaRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.change(screen.getByLabelText(/creatinine/i), { target: { value: '2.5' } })
    expect(onDataChange).toHaveBeenCalled()
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run:
```bash
npx vitest run src/modules/packs/gi/meld-na/meld-na.test.tsx
```
Confirm it fails (module not found / imports missing).

### Step 3: Implement all files

- [ ] Create `src/modules/packs/gi/meld-na/Renderer.tsx`:

```tsx
import React from 'react'

const CITATION = 'Kim WR et al. Hepatology. 2008;48(4):1362-1370'

export function calcMELD(cr: number, bili: number, inr: number): number {
  const crCapped = Math.min(Math.max(cr, 1.0), 4.0)
  const biliFloored = Math.max(bili, 1.0)
  const inrFloored = Math.max(inr, 1.0)
  const score =
    3.78 * Math.log(biliFloored) +
    11.2 * Math.log(inrFloored) +
    9.57 * Math.log(crCapped) +
    6.43
  return Math.round(score)
}

export function calcMELDNa(meld: number, na: number): number {
  const naClamped = Math.min(Math.max(na, 125), 137)
  const score = meld + 1.32 * (137 - naClamped) - 0.033 * meld * (137 - naClamped)
  return Math.round(score)
}

const MORTALITY_TABLE: Array<{ label: string; mortality: string }> = [
  { label: '≤ 9', mortality: '1.9%' },
  { label: '10–19', mortality: '6%' },
  { label: '20–29', mortality: '19.6%' },
  { label: '30–39', mortality: '52.6%' },
  { label: '≥ 40', mortality: '71.3%' },
]

interface MeldNaData {
  creatinine: number
  bilirubin: number
  inr: number
  sodium: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const MeldNaRenderer: React.FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as MeldNaData
  const meld = calcMELD(d.creatinine ?? 1, d.bilirubin ?? 1, d.inr ?? 1)
  const meldNa = calcMELDNa(meld, d.sodium ?? 137)

  const getMortalityRow = (score: number) => {
    if (score <= 9) return MORTALITY_TABLE[0]
    if (score <= 19) return MORTALITY_TABLE[1]
    if (score <= 29) return MORTALITY_TABLE[2]
    if (score <= 39) return MORTALITY_TABLE[3]
    return MORTALITY_TABLE[4]
  }

  const highlighted = getMortalityRow(meldNa)

  const update = (field: keyof MeldNaData, value: number) => {
    onDataChange({ ...d, [field]: value })
  }

  return (
    <div className="p-3 space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">MELD / MELD-Na Calculator</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="meld-cr" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Creatinine (mg/dL)
          </label>
          <input
            id="meld-cr"
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={d.creatinine ?? 1}
            onChange={e => update('creatinine', parseFloat(e.target.value) || 1)}
            disabled={mode === 'build'}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
          />
          <p className="text-xs text-gray-400 mt-0.5">Capped at 4.0 (UNOS)</p>
        </div>

        <div>
          <label htmlFor="meld-bili" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Bilirubin (mg/dL)
          </label>
          <input
            id="meld-bili"
            type="number"
            min={0}
            step={0.1}
            value={d.bilirubin ?? 1}
            onChange={e => update('bilirubin', parseFloat(e.target.value) || 1)}
            disabled={mode === 'build'}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
          />
          <p className="text-xs text-gray-400 mt-0.5">Min 1.0</p>
        </div>

        <div>
          <label htmlFor="meld-inr" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            INR
          </label>
          <input
            id="meld-inr"
            type="number"
            min={0}
            step={0.1}
            value={d.inr ?? 1}
            onChange={e => update('inr', parseFloat(e.target.value) || 1)}
            disabled={mode === 'build'}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
          />
          <p className="text-xs text-gray-400 mt-0.5">Min 1.0</p>
        </div>

        <div>
          <label htmlFor="meld-na" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Sodium (mEq/L)
          </label>
          <input
            id="meld-na"
            type="number"
            min={100}
            max={160}
            step={1}
            value={d.sodium ?? 137}
            onChange={e => update('sodium', parseInt(e.target.value) || 137)}
            disabled={mode === 'build'}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
          />
          <p className="text-xs text-gray-400 mt-0.5">Clamped 125–137</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-3 text-center">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wide">MELD Score</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-200 mt-1">{meld}</p>
        </div>
        <div className="flex-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 p-3 text-center">
          <p className="text-xs font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">MELD-Na</p>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-200 mt-1">{meldNa}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">90-day mortality (by MELD-Na)</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-left">MELD-Na</th>
              <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-left">Mortality</th>
            </tr>
          </thead>
          <tbody>
            {MORTALITY_TABLE.map(row => (
              <tr
                key={row.label}
                className={row.label === highlighted.label ? 'bg-yellow-100 dark:bg-yellow-900/40 font-semibold' : ''}
              >
                <td className="border border-gray-200 dark:border-gray-600 px-2 py-1">{row.label}</td>
                <td className="border border-gray-200 dark:border-gray-600 px-2 py-1">{row.mortality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/meld-na/Editor.tsx`:

```tsx
import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const MeldNaEditor: React.FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">MELD-Na Settings</h4>
      <div className="flex items-center gap-2">
        <input
          id="meld-show-table"
          type="checkbox"
          checked={(config.showMortalityTable as boolean) ?? true}
          onChange={e => onConfigChange({ ...config, showMortalityTable: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="meld-show-table" className="text-sm text-gray-600 dark:text-gray-300">
          Show 90-day mortality table
        </label>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/meld-na/PrintView.tsx`:

```tsx
import React from 'react'
import { calcMELD, calcMELDNa } from './Renderer'

const CITATION = 'Kim WR et al. Hepatology. 2008;48(4):1362-1370'

interface MeldNaData {
  creatinine: number
  bilirubin: number
  inr: number
  sodium: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const MeldNaPrintView: React.FC<Props> = ({ data }) => {
  const d = data as MeldNaData
  const meld = calcMELD(d.creatinine ?? 1, d.bilirubin ?? 1, d.inr ?? 1)
  const meldNa = calcMELDNa(meld, d.sodium ?? 137)

  return (
    <div className="print-module">
      <h3 className="font-semibold text-sm mb-2">MELD / MELD-Na</h3>
      <table className="text-xs mb-2">
        <tbody>
          <tr><td className="pr-4 font-medium">Creatinine:</td><td>{d.creatinine ?? 1} mg/dL</td></tr>
          <tr><td className="pr-4 font-medium">Bilirubin:</td><td>{d.bilirubin ?? 1} mg/dL</td></tr>
          <tr><td className="pr-4 font-medium">INR:</td><td>{d.inr ?? 1}</td></tr>
          <tr><td className="pr-4 font-medium">Sodium:</td><td>{d.sodium ?? 137} mEq/L</td></tr>
        </tbody>
      </table>
      <p className="text-sm font-bold">MELD: {meld} &nbsp;|&nbsp; MELD-Na: {meldNa}</p>
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/meld-na/index.ts`:

```ts
import { ModulePlugin } from '../../../../core/plugin/types'
import { MeldNaRenderer, calcMELD, calcMELDNa } from './Renderer'
import { MeldNaEditor } from './Editor'
import { MeldNaPrintView } from './PrintView'

export { calcMELD, calcMELDNa }

export const meldNaPlugin: ModulePlugin = {
  meta: {
    id: 'meld-na',
    name: 'MELD / MELD-Na Calculator',
    version: '1.0.0',
    author: 'Patient Templates',
    description: 'Calculates MELD and MELD-Na scores with 90-day mortality lookup',
    tags: ['hepatology', 'liver', 'transplant', 'gi', 'score'],
    pack: 'gi',
  },
  schema: {
    config: {
      showMortalityTable: { type: 'boolean', default: true },
    },
    data: {
      creatinine: { type: 'number' },
      bilirubin: { type: 'number' },
      inr: { type: 'number' },
      sodium: { type: 'number' },
    },
  },
  defaultConfig: {
    showMortalityTable: true,
  },
  minSize: { w: 4, h: 6 },
  Renderer: MeldNaRenderer,
  Editor: MeldNaEditor,
  PrintView: MeldNaPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run:
```bash
npx vitest run src/modules/packs/gi/meld-na/meld-na.test.tsx
```
All tests must pass before proceeding.

### Step 5: Commit

- [ ] Run:
```bash
git -C ~/projects/patient-templates add src/modules/packs/gi/meld-na/
git -C ~/projects/patient-templates commit -m "feat(gi): add meld-na module with MELD and MELD-Na calculator"
```

---

## Task 2: ascites-tracker

**Goal:** Paracentesis log with large-volume albumin warning and SBP section.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/gi/ascites-tracker/ascites-tracker.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { needsAlbumin, AscitesRenderer } from './Renderer'

describe('needsAlbumin', () => {
  it('returns true when volume > 5L', () => {
    expect(needsAlbumin(5.1)).toBe(true)
    expect(needsAlbumin(6)).toBe(true)
    expect(needsAlbumin(10)).toBe(true)
  })

  it('returns false when volume <= 5L', () => {
    expect(needsAlbumin(5)).toBe(false)
    expect(needsAlbumin(4.9)).toBe(false)
    expect(needsAlbumin(0)).toBe(false)
  })
})

describe('AscitesRenderer', () => {
  const emptyData = {
    paracenteses: [],
    fluidWbc: 0,
    sbpDiagnosed: false,
    sbpTreatmentStarted: false,
  }

  const largeVolumeNoAlbumin = {
    paracenteses: [
      { date: '2026-04-10', volumeL: 6, albuminGiven: false },
    ],
    fluidWbc: 0,
    sbpDiagnosed: false,
    sbpTreatmentStarted: false,
  }

  const largeVolumeWithAlbumin = {
    paracenteses: [
      { date: '2026-04-10', volumeL: 6, albuminGiven: true },
    ],
    fluidWbc: 0,
    sbpDiagnosed: false,
    sbpTreatmentStarted: false,
  }

  it('renders paracentesis table headers', () => {
    render(
      <AscitesRenderer
        instanceId="test-1"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Date/i)).toBeTruthy()
    expect(screen.getByText(/Volume/i)).toBeTruthy()
    expect(screen.getByText(/Albumin Given/i)).toBeTruthy()
  })

  it('shows amber warning for large-volume paracentesis without albumin', () => {
    render(
      <AscitesRenderer
        instanceId="test-2"
        config={{}}
        data={largeVolumeNoAlbumin}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Large-volume paracentesis/i)).toBeTruthy()
    expect(screen.getByText(/albumin 8g\/L/i)).toBeTruthy()
  })

  it('does NOT show warning when albumin was given', () => {
    render(
      <AscitesRenderer
        instanceId="test-3"
        config={{}}
        data={largeVolumeWithAlbumin}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.queryByText(/Large-volume paracentesis/i)).toBeNull()
  })

  it('does NOT show warning for small-volume paracentesis', () => {
    const smallVolume = {
      paracenteses: [{ date: '2026-04-10', volumeL: 4, albuminGiven: false }],
      fluidWbc: 0,
      sbpDiagnosed: false,
      sbpTreatmentStarted: false,
    }
    render(
      <AscitesRenderer
        instanceId="test-4"
        config={{}}
        data={smallVolume}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.queryByText(/Large-volume paracentesis/i)).toBeNull()
  })

  it('renders SBP section', () => {
    render(
      <AscitesRenderer
        instanceId="test-5"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/SBP/i)).toBeTruthy()
    expect(screen.getByLabelText(/Fluid WBC/i)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <AscitesRenderer
        instanceId="test-6"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/EASL/i)).toBeTruthy()
  })

  it('calls onDataChange when Add Row button clicked', () => {
    const onDataChange = vi.fn()
    render(
      <AscitesRenderer
        instanceId="test-7"
        config={{}}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText(/Add Paracentesis/i))
    expect(onDataChange).toHaveBeenCalled()
    const newData = onDataChange.mock.calls[0][0]
    expect(newData.paracenteses).toHaveLength(1)
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run:
```bash
npx vitest run src/modules/packs/gi/ascites-tracker/ascites-tracker.test.tsx
```
Confirm failure.

### Step 3: Implement all files

- [ ] Create `src/modules/packs/gi/ascites-tracker/Renderer.tsx`:

```tsx
import React from 'react'

const CITATION = 'EASL Clinical Practice Guidelines on the management of ascites. J Hepatol. 2010;52(5):691-694'

export function needsAlbumin(volumeL: number): boolean {
  return volumeL > 5
}

interface Paracentesis {
  date: string
  volumeL: number
  albuminGiven: boolean
}

interface AscitesData {
  paracenteses: Paracentesis[]
  fluidWbc: number
  sbpDiagnosed: boolean
  sbpTreatmentStarted: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const AscitesRenderer: React.FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as AscitesData
  const paracenteses = d.paracenteses ?? []

  const showWarning = paracenteses.some(p => needsAlbumin(p.volumeL) && !p.albuminGiven)

  const addRow = () => {
    const newRow: Paracentesis = { date: '', volumeL: 0, albuminGiven: false }
    onDataChange({ ...d, paracenteses: [...paracenteses, newRow] })
  }

  const updateRow = (idx: number, field: keyof Paracentesis, value: string | number | boolean) => {
    const updated = paracenteses.map((p, i) => i === idx ? { ...p, [field]: value } : p)
    onDataChange({ ...d, paracenteses: updated })
  }

  const removeRow = (idx: number) => {
    onDataChange({ ...d, paracenteses: paracenteses.filter((_, i) => i !== idx) })
  }

  return (
    <div className="p-3 space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Ascites Tracker</h3>

      {showWarning && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 px-3 py-2">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            ⚠ Large-volume paracentesis: albumin 8g/L removed recommended per EASL guidelines
          </p>
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">
          Paracentesis Log
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-left">Date</th>
                <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-left">Volume (L)</th>
                <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-left">Albumin Given</th>
                <th className="border border-gray-200 dark:border-gray-600 px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {paracenteses.map((p, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-200 dark:border-gray-600 px-1 py-1">
                    <input
                      type="date"
                      value={p.date}
                      onChange={e => updateRow(idx, 'date', e.target.value)}
                      disabled={mode === 'build'}
                      className="w-full text-xs bg-transparent border-none outline-none"
                    />
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 px-1 py-1">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={p.volumeL}
                      onChange={e => updateRow(idx, 'volumeL', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'build'}
                      className="w-16 text-xs bg-transparent border-none outline-none"
                    />
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={p.albuminGiven}
                      onChange={e => updateRow(idx, 'albuminGiven', e.target.checked)}
                      disabled={mode === 'build'}
                      className="rounded"
                    />
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 px-1 py-1">
                    <button
                      onClick={() => removeRow(idx)}
                      disabled={mode === 'build'}
                      className="text-red-500 hover:text-red-700 text-xs px-1"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={addRow}
          disabled={mode === 'build'}
          className="mt-2 text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add Paracentesis
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
          SBP Assessment
        </h4>
        <div className="space-y-2">
          <div>
            <label htmlFor="ascites-wbc" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              Fluid WBC (cells/µL)
            </label>
            <input
              id="ascites-wbc"
              type="number"
              min={0}
              value={d.fluidWbc ?? 0}
              onChange={e => onDataChange({ ...d, fluidWbc: parseInt(e.target.value) || 0 })}
              disabled={mode === 'build'}
              className="w-32 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="ascites-sbp-dx"
              type="checkbox"
              checked={d.sbpDiagnosed ?? false}
              onChange={e => onDataChange({ ...d, sbpDiagnosed: e.target.checked })}
              disabled={mode === 'build'}
              className="rounded"
            />
            <label htmlFor="ascites-sbp-dx" className="text-xs text-gray-600 dark:text-gray-300">
              SBP Diagnosed
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="ascites-sbp-tx"
              type="checkbox"
              checked={d.sbpTreatmentStarted ?? false}
              onChange={e => onDataChange({ ...d, sbpTreatmentStarted: e.target.checked })}
              disabled={mode === 'build'}
              className="rounded"
            />
            <label htmlFor="ascites-sbp-tx" className="text-xs text-gray-600 dark:text-gray-300">
              Treatment Started
            </label>
          </div>
        </div>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/ascites-tracker/Editor.tsx`:

```tsx
import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const AscitesEditor: React.FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Ascites Tracker Settings</h4>
      <div className="flex items-center gap-2">
        <input
          id="ascites-show-sbp"
          type="checkbox"
          checked={(config.showSbpSection as boolean) ?? true}
          onChange={e => onConfigChange({ ...config, showSbpSection: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="ascites-show-sbp" className="text-sm text-gray-600 dark:text-gray-300">
          Show SBP section
        </label>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/ascites-tracker/PrintView.tsx`:

```tsx
import React from 'react'

const CITATION = 'EASL Clinical Practice Guidelines on the management of ascites. J Hepatol. 2010;52(5):691-694'

interface Paracentesis {
  date: string
  volumeL: number
  albuminGiven: boolean
}

interface AscitesData {
  paracenteses: Paracentesis[]
  fluidWbc: number
  sbpDiagnosed: boolean
  sbpTreatmentStarted: boolean
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const AscitesPrintView: React.FC<Props> = ({ data }) => {
  const d = data as AscitesData
  const paracenteses = d.paracenteses ?? []

  return (
    <div className="print-module">
      <h3 className="font-semibold text-sm mb-2">Ascites / Paracentesis Log</h3>
      {paracenteses.length > 0 && (
        <table className="text-xs mb-2 w-full">
          <thead>
            <tr>
              <th className="text-left pr-3">Date</th>
              <th className="text-left pr-3">Volume (L)</th>
              <th className="text-left">Albumin Given</th>
            </tr>
          </thead>
          <tbody>
            {paracenteses.map((p, i) => (
              <tr key={i}>
                <td className="pr-3">{p.date || '—'}</td>
                <td className="pr-3">{p.volumeL}</td>
                <td>{p.albuminGiven ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="text-xs">Fluid WBC: {d.fluidWbc ?? 0} cells/µL</p>
      <p className="text-xs">SBP: {d.sbpDiagnosed ? 'Yes' : 'No'} | Treatment: {d.sbpTreatmentStarted ? 'Started' : 'Not started'}</p>
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/ascites-tracker/index.ts`:

```ts
import { ModulePlugin } from '../../../../core/plugin/types'
import { AscitesRenderer, needsAlbumin } from './Renderer'
import { AscitesEditor } from './Editor'
import { AscitesPrintView } from './PrintView'

export { needsAlbumin }

export const ascitesTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'ascites-tracker',
    name: 'Ascites Tracker',
    version: '1.0.0',
    author: 'Patient Templates',
    description: 'Paracentesis log with large-volume albumin warning and SBP assessment',
    tags: ['hepatology', 'ascites', 'paracentesis', 'sbp', 'gi'],
    pack: 'gi',
  },
  schema: {
    config: {
      showSbpSection: { type: 'boolean', default: true },
    },
    data: {
      paracenteses: { type: 'array' },
      fluidWbc: { type: 'number' },
      sbpDiagnosed: { type: 'boolean' },
      sbpTreatmentStarted: { type: 'boolean' },
    },
  },
  defaultConfig: {
    showSbpSection: true,
  },
  minSize: { w: 4, h: 6 },
  Renderer: AscitesRenderer,
  Editor: AscitesEditor,
  PrintView: AscitesPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run:
```bash
npx vitest run src/modules/packs/gi/ascites-tracker/ascites-tracker.test.tsx
```
All tests must pass.

### Step 5: Commit

- [ ] Run:
```bash
git -C ~/projects/patient-templates add src/modules/packs/gi/ascites-tracker/
git -C ~/projects/patient-templates commit -m "feat(gi): add ascites-tracker module with LVP albumin warning and SBP section"
```

---

## Task 3: encephalopathy

**Goal:** West Haven grade selector with full diagnostic criteria, lactulose log, rifaximin status, and stool count.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/gi/encephalopathy/encephalopathy.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EncephalopathyRenderer } from './Renderer'

const defaultData = {
  westHavenGrade: 0,
  laxuloseLog: [],
  rifaximin: false,
  rifaximinDose: '',
  stoolsPerDay: 0,
}

describe('EncephalopathyRenderer', () => {
  it('renders West Haven grade label', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/West Haven/i)).toBeTruthy()
  })

  it('renders all five grade options (0 through IV)', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Grade 0/i)).toBeTruthy()
    expect(screen.getByText(/Grade I/i)).toBeTruthy()
    expect(screen.getByText(/Grade II/i)).toBeTruthy()
    expect(screen.getByText(/Grade III/i)).toBeTruthy()
    expect(screen.getByText(/Grade IV/i)).toBeTruthy()
  })

  it('displays criteria text for selected grade', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-3"
        config={{}}
        data={{ ...defaultData, westHavenGrade: 0 }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Normal/i)).toBeTruthy()
  })

  it('displays Grade II criteria when grade is 2', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-4"
        config={{}}
        data={{ ...defaultData, westHavenGrade: 2 }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Lethargy|apathy/i)).toBeTruthy()
  })

  it('renders lactulose log section', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Lactulose/i)).toBeTruthy()
    expect(screen.getByText(/Add Entry/i)).toBeTruthy()
  })

  it('renders rifaximin toggle', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-6"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/Rifaximin/i)).toBeTruthy()
  })

  it('shows rifaximin dose input when rifaximin is true', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-7"
        config={{}}
        data={{ ...defaultData, rifaximin: true }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/Rifaximin dose/i)).toBeTruthy()
  })

  it('renders stools per day input', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-8"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/Stools per day/i)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-9"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Conn HO/i)).toBeTruthy()
  })

  it('calls onDataChange when grade changes', () => {
    const onDataChange = vi.fn()
    render(
      <EncephalopathyRenderer
        instanceId="test-10"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
    expect(onDataChange).toHaveBeenCalledWith(expect.objectContaining({ westHavenGrade: 2 }))
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run:
```bash
npx vitest run src/modules/packs/gi/encephalopathy/encephalopathy.test.tsx
```
Confirm failure.

### Step 3: Implement all files

- [ ] Create `src/modules/packs/gi/encephalopathy/Renderer.tsx`:

```tsx
import React from 'react'

const CITATION = 'Conn HO et al. Dig Dis Sci. 1977;22(2):103-108'

const WEST_HAVEN_GRADES = [
  {
    grade: 0,
    label: 'Grade 0',
    criteria: 'Normal — no detectable changes in personality or behavior.',
  },
  {
    grade: 1,
    label: 'Grade I',
    criteria:
      'Trivial lack of awareness, euphoria or anxiety, shortened attention span, impaired addition or subtraction.',
  },
  {
    grade: 2,
    label: 'Grade II',
    criteria:
      'Lethargy or apathy, minimal disorientation to time or place, subtle personality change, inappropriate behavior.',
  },
  {
    grade: 3,
    label: 'Grade III',
    criteria: 'Somnolent but arousable, gross disorientation, bizarre behavior.',
  },
  {
    grade: 4,
    label: 'Grade IV',
    criteria: 'Coma — no response to painful stimuli.',
  },
]

interface LactuloseDose {
  datetime: string
  bm: boolean
  dose: string
}

interface EncephalopathyData {
  westHavenGrade: number
  laxuloseLog: LactuloseDose[]
  rifaximin: boolean
  rifaximinDose: string
  stoolsPerDay: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const EncephalopathyRenderer: React.FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as EncephalopathyData
  const log = d.laxuloseLog ?? []
  const selectedGrade = WEST_HAVEN_GRADES.find(g => g.grade === (d.westHavenGrade ?? 0)) ?? WEST_HAVEN_GRADES[0]

  const addLogEntry = () => {
    const entry: LactuloseDose = { datetime: new Date().toISOString().slice(0, 16), bm: false, dose: '' }
    onDataChange({ ...d, laxuloseLog: [...log, entry] })
  }

  const updateLogEntry = (idx: number, field: keyof LactuloseDose, value: string | boolean) => {
    const updated = log.map((entry, i) => i === idx ? { ...entry, [field]: value } : entry)
    onDataChange({ ...d, laxuloseLog: updated })
  }

  const removeLogEntry = (idx: number) => {
    onDataChange({ ...d, laxuloseLog: log.filter((_, i) => i !== idx) })
  }

  const gradeColor = ['text-green-600', 'text-yellow-600', 'text-orange-500', 'text-red-500', 'text-red-800'][d.westHavenGrade ?? 0]

  return (
    <div className="p-3 space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Hepatic Encephalopathy</h3>

      <div>
        <label htmlFor="wh-grade" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
          West Haven Grade
        </label>
        <select
          id="wh-grade"
          value={d.westHavenGrade ?? 0}
          onChange={e => onDataChange({ ...d, westHavenGrade: parseInt(e.target.value) })}
          disabled={mode === 'build'}
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
        >
          {WEST_HAVEN_GRADES.map(g => (
            <option key={g.grade} value={g.grade}>{g.label}</option>
          ))}
        </select>

        <div className={`mt-2 rounded-md p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}>
          <p className={`text-xs font-semibold mb-0.5 ${gradeColor}`}>{selectedGrade.label}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">{selectedGrade.criteria}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
          Lactulose Log
        </h4>
        {log.length > 0 && (
          <div className="space-y-1 mb-2">
            {log.map((entry, idx) => (
              <div key={idx} className="flex gap-2 items-center text-xs">
                <input
                  type="datetime-local"
                  value={entry.datetime}
                  onChange={e => updateLogEntry(idx, 'datetime', e.target.value)}
                  disabled={mode === 'build'}
                  className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 bg-white dark:bg-gray-800"
                />
                <input
                  type="text"
                  placeholder="Dose (e.g. 30mL TID)"
                  value={entry.dose}
                  onChange={e => updateLogEntry(idx, 'dose', e.target.value)}
                  disabled={mode === 'build'}
                  className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-1 bg-white dark:bg-gray-800"
                />
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={entry.bm}
                    onChange={e => updateLogEntry(idx, 'bm', e.target.checked)}
                    disabled={mode === 'build'}
                    className="rounded"
                  />
                  <span>BM</span>
                </label>
                <button
                  onClick={() => removeLogEntry(idx)}
                  disabled={mode === 'build'}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={addLogEntry}
          disabled={mode === 'build'}
          className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add Entry
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            id="rifaximin-toggle"
            type="checkbox"
            checked={d.rifaximin ?? false}
            onChange={e => onDataChange({ ...d, rifaximin: e.target.checked })}
            disabled={mode === 'build'}
            className="rounded"
          />
          <label htmlFor="rifaximin-toggle" className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Rifaximin on board
          </label>
        </div>
        {d.rifaximin && (
          <div>
            <label htmlFor="rifaximin-dose" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              Rifaximin dose
            </label>
            <input
              id="rifaximin-dose"
              type="text"
              placeholder="e.g. 550mg BID"
              value={d.rifaximinDose ?? ''}
              onChange={e => onDataChange({ ...d, rifaximinDose: e.target.value })}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
            />
          </div>
        )}

        <div>
          <label htmlFor="stools-per-day" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
            Stools per day
          </label>
          <input
            id="stools-per-day"
            type="number"
            min={0}
            max={30}
            value={d.stoolsPerDay ?? 0}
            onChange={e => onDataChange({ ...d, stoolsPerDay: parseInt(e.target.value) || 0 })}
            disabled={mode === 'build'}
            className="w-24 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
          />
        </div>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/encephalopathy/Editor.tsx`:

```tsx
import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const EncephalopathyEditor: React.FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Encephalopathy Settings</h4>
      <div className="flex items-center gap-2">
        <input
          id="he-show-log"
          type="checkbox"
          checked={(config.showLactulosLog as boolean) ?? true}
          onChange={e => onConfigChange({ ...config, showLactulosLog: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="he-show-log" className="text-sm text-gray-600 dark:text-gray-300">
          Show lactulose log
        </label>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/encephalopathy/PrintView.tsx`:

```tsx
import React from 'react'

const CITATION = 'Conn HO et al. Dig Dis Sci. 1977;22(2):103-108'

const GRADE_LABELS = ['Grade 0 — Normal', 'Grade I', 'Grade II', 'Grade III', 'Grade IV — Coma']

interface LactuloseDose {
  datetime: string
  bm: boolean
  dose: string
}

interface EncephalopathyData {
  westHavenGrade: number
  laxuloseLog: LactuloseDose[]
  rifaximin: boolean
  rifaximinDose: string
  stoolsPerDay: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const EncephalopathyPrintView: React.FC<Props> = ({ data }) => {
  const d = data as EncephalopathyData
  const log = d.laxuloseLog ?? []

  return (
    <div className="print-module">
      <h3 className="font-semibold text-sm mb-2">Hepatic Encephalopathy</h3>
      <p className="text-xs font-medium mb-1">
        West Haven: {GRADE_LABELS[d.westHavenGrade ?? 0]}
      </p>
      <p className="text-xs">Stools/day: {d.stoolsPerDay ?? 0}</p>
      <p className="text-xs">Rifaximin: {d.rifaximin ? `Yes — ${d.rifaximinDose || 'dose not recorded'}` : 'No'}</p>
      {log.length > 0 && (
        <div className="mt-1">
          <p className="text-xs font-medium">Lactulose Log:</p>
          {log.map((entry, i) => (
            <p key={i} className="text-xs ml-2">
              {entry.datetime} — {entry.dose} {entry.bm ? '(BM)' : ''}
            </p>
          ))}
        </div>
      )}
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/encephalopathy/index.ts`:

```ts
import { ModulePlugin } from '../../../../core/plugin/types'
import { EncephalopathyRenderer } from './Renderer'
import { EncephalopathyEditor } from './Editor'
import { EncephalopathyPrintView } from './PrintView'

export const encephalopathyPlugin: ModulePlugin = {
  meta: {
    id: 'encephalopathy',
    name: 'Hepatic Encephalopathy',
    version: '1.0.0',
    author: 'Patient Templates',
    description: 'West Haven grading with lactulose log and rifaximin tracking',
    tags: ['hepatology', 'encephalopathy', 'liver', 'gi', 'west-haven'],
    pack: 'gi',
  },
  schema: {
    config: {
      showLactulosLog: { type: 'boolean', default: true },
    },
    data: {
      westHavenGrade: { type: 'number' },
      laxuloseLog: { type: 'array' },
      rifaximin: { type: 'boolean' },
      rifaximinDose: { type: 'string' },
      stoolsPerDay: { type: 'number' },
    },
  },
  defaultConfig: {
    showLactulosLog: true,
  },
  minSize: { w: 4, h: 7 },
  Renderer: EncephalopathyRenderer,
  Editor: EncephalopathyEditor,
  PrintView: EncephalopathyPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run:
```bash
npx vitest run src/modules/packs/gi/encephalopathy/encephalopathy.test.tsx
```
All tests must pass.

### Step 5: Commit

- [ ] Run:
```bash
git -C ~/projects/patient-templates add src/modules/packs/gi/encephalopathy/
git -C ~/projects/patient-templates commit -m "feat(gi): add encephalopathy module with West Haven grading and lactulose log"
```

---

## Task 4: gi-bleed

**Goal:** Glasgow-Blatchford Score (pre-endoscopy) and Rockall Score (post-endoscopy) risk stratification.

### Step 1: Write failing test

- [ ] Create `src/modules/packs/gi/gi-bleed/gi-bleed.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcGBS, calcRockall, GiBleedRenderer } from './Renderer'
import type { GBSInputs, RockallInputs } from './Renderer'

describe('calcGBS', () => {
  it('returns 0 for low-risk presentation', () => {
    const inputs: GBSInputs = {
      bun: 10,        // <18.2 → 0
      hgb: 14,        // male ≥13 → 0
      sbp: 120,       // ≥110 → 0
      hr: 80,         // <100 → 0
      melena: false,
      syncope: false,
      liverDisease: false,
      heartFailure: false,
      sex: 'male',
    }
    expect(calcGBS(inputs)).toBe(0)
  })

  it('adds correct points for BUN 18.2-22.3', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, bun: 20 })).toBe(2)
  })

  it('adds correct points for BUN 22.4-28', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, bun: 25 })).toBe(3)
  })

  it('adds correct points for BUN 28.1-70', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, bun: 50 })).toBe(4)
  })

  it('adds 6 points for BUN >70', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, bun: 80 })).toBe(6)
  })

  it('adds correct points for male Hgb 12-12.9', () => {
    const base: GBSInputs = { bun: 0, hgb: 13, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, hgb: 12.5 })).toBe(1)
  })

  it('adds 3 points for male Hgb 10-11.9', () => {
    const base: GBSInputs = { bun: 0, hgb: 13, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, hgb: 11 })).toBe(3)
  })

  it('adds 6 points for male Hgb <10', () => {
    const base: GBSInputs = { bun: 0, hgb: 13, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, hgb: 9 })).toBe(6)
  })

  it('uses female Hgb cutoffs for females', () => {
    const base: GBSInputs = { bun: 0, hgb: 13, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'female' }
    // female ≥12 → 0
    expect(calcGBS({ ...base, hgb: 12 })).toBe(0)
    // female 10-11.9 → 1
    expect(calcGBS({ ...base, hgb: 11 })).toBe(1)
    // female <10 → 6
    expect(calcGBS({ ...base, hgb: 9 })).toBe(6)
  })

  it('adds 1 for SBP 100-109', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, sbp: 105 })).toBe(1)
  })

  it('adds 2 for SBP 90-99', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, sbp: 95 })).toBe(2)
  })

  it('adds 3 for SBP <90', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, sbp: 85 })).toBe(3)
  })

  it('adds 1 for HR ≥100', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, hr: 100 })).toBe(1)
  })

  it('adds points for melena, syncope, liver disease, heart failure', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, melena: true })).toBe(1)
    expect(calcGBS({ ...base, syncope: true })).toBe(2)
    expect(calcGBS({ ...base, liverDisease: true })).toBe(2)
    expect(calcGBS({ ...base, heartFailure: true })).toBe(2)
  })

  it('calculates a high-risk scenario correctly', () => {
    const highRisk: GBSInputs = {
      bun: 80,         // +6
      hgb: 9,          // male <10 → +6
      sbp: 85,         // <90 → +3
      hr: 110,         // ≥100 → +1
      melena: true,    // +1
      syncope: true,   // +2
      liverDisease: true,   // +2
      heartFailure: true,   // +2
      sex: 'male',
    }
    expect(calcGBS(highRisk)).toBe(23)
  })
})

describe('calcRockall', () => {
  it('returns 0 for lowest-risk profile', () => {
    const inputs: RockallInputs = {
      age: 50,          // <60 → 0
      shock: 0,         // no shock → 0
      comorbidity: 0,   // none → 0
      diagnosis: 0,     // Mallory-Weiss / no SRH → 0
      majorSRH: false,  // none/dark spot → 0
    }
    expect(calcRockall(inputs)).toBe(0)
  })

  it('adds 1 for age 60-79', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, age: 70 })).toBe(1)
  })

  it('adds 2 for age ≥80', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, age: 82 })).toBe(2)
  })

  it('adds correct shock points', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, shock: 1 })).toBe(1)
    expect(calcRockall({ ...base, shock: 2 })).toBe(2)
  })

  it('adds correct comorbidity points', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, comorbidity: 2 })).toBe(2)
    expect(calcRockall({ ...base, comorbidity: 3 })).toBe(3)
  })

  it('adds correct diagnosis points', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, diagnosis: 1 })).toBe(1)
    expect(calcRockall({ ...base, diagnosis: 2 })).toBe(2)
  })

  it('adds 2 for major SRH', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, majorSRH: true })).toBe(2)
  })

  it('calculates a high-risk profile', () => {
    const highRisk: RockallInputs = {
      age: 82,          // +2
      shock: 2,         // +2
      comorbidity: 3,   // +3
      diagnosis: 2,     // +2
      majorSRH: true,   // +2
    }
    expect(calcRockall(highRisk)).toBe(11)
  })
})

describe('GiBleedRenderer', () => {
  const defaultData = {
    sex: 'male' as const,
    bun: 10,
    hgb: 14,
    sbp: 120,
    hr: 80,
    melena: false,
    syncope: false,
    liverDisease: false,
    heartFailure: false,
    age: 45,
    shock: 0 as const,
    comorbidity: 0 as const,
    diagnosis: 0 as const,
    majorSRH: false,
  }

  it('renders Glasgow-Blatchford Score section', () => {
    render(
      <GiBleedRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Glasgow-Blatchford/i)).toBeTruthy()
  })

  it('renders Rockall Score section', () => {
    render(
      <GiBleedRenderer
        instanceId="test-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Rockall/i)).toBeTruthy()
  })

  it('renders GBS score output', () => {
    render(
      <GiBleedRenderer
        instanceId="test-3"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/GBS/i)).toBeTruthy()
  })

  it('renders Blatchford citation', () => {
    render(
      <GiBleedRenderer
        instanceId="test-4"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Blatchford/i)).toBeTruthy()
  })

  it('renders Rockall citation', () => {
    render(
      <GiBleedRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Rockall TA/i)).toBeTruthy()
  })

  it('calls onDataChange when BUN input changes', () => {
    const onDataChange = vi.fn()
    render(
      <GiBleedRenderer
        instanceId="test-6"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.change(screen.getByLabelText(/BUN/i), { target: { value: '25' } })
    expect(onDataChange).toHaveBeenCalled()
  })

  it('shows low-risk label when GBS is 0', () => {
    render(
      <GiBleedRenderer
        instanceId="test-7"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Low risk/i)).toBeTruthy()
  })
})
```

### Step 2: Run test — expect FAIL

- [ ] Run:
```bash
npx vitest run src/modules/packs/gi/gi-bleed/gi-bleed.test.tsx
```
Confirm failure.

### Step 3: Implement all files

- [ ] Create `src/modules/packs/gi/gi-bleed/Renderer.tsx`:

```tsx
import React from 'react'

const GBS_CITATION = 'Blatchford O et al. Lancet. 2000;356(9238):1318-1321'
const ROCKALL_CITATION = 'Rockall TA et al. Gut. 1996;38(3):316-321'

export interface GBSInputs {
  sex: 'male' | 'female'
  bun: number
  hgb: number
  sbp: number
  hr: number
  melena: boolean
  syncope: boolean
  liverDisease: boolean
  heartFailure: boolean
}

export interface RockallInputs {
  age: number
  shock: 0 | 1 | 2
  comorbidity: 0 | 2 | 3
  diagnosis: 0 | 1 | 2
  majorSRH: boolean
}

export function calcGBS(inputs: GBSInputs): number {
  let score = 0

  // BUN
  if (inputs.bun >= 18.2 && inputs.bun <= 22.3) score += 2
  else if (inputs.bun >= 22.4 && inputs.bun <= 28) score += 3
  else if (inputs.bun >= 28.1 && inputs.bun <= 70) score += 4
  else if (inputs.bun > 70) score += 6

  // Hgb
  if (inputs.sex === 'male') {
    if (inputs.hgb >= 12 && inputs.hgb <= 12.9) score += 1
    else if (inputs.hgb >= 10 && inputs.hgb <= 11.9) score += 3
    else if (inputs.hgb < 10) score += 6
  } else {
    if (inputs.hgb >= 10 && inputs.hgb <= 11.9) score += 1
    else if (inputs.hgb < 10) score += 6
  }

  // SBP
  if (inputs.sbp >= 100 && inputs.sbp <= 109) score += 1
  else if (inputs.sbp >= 90 && inputs.sbp <= 99) score += 2
  else if (inputs.sbp < 90) score += 3

  // HR
  if (inputs.hr >= 100) score += 1

  // Other
  if (inputs.melena) score += 1
  if (inputs.syncope) score += 2
  if (inputs.liverDisease) score += 2
  if (inputs.heartFailure) score += 2

  return score
}

export function calcRockall(inputs: RockallInputs): number {
  let score = 0

  // Age
  if (inputs.age >= 60 && inputs.age <= 79) score += 1
  else if (inputs.age >= 80) score += 2

  // Shock
  score += inputs.shock

  // Comorbidity
  score += inputs.comorbidity

  // Diagnosis
  score += inputs.diagnosis

  // Major SRH
  if (inputs.majorSRH) score += 2

  return score
}

interface GiBleedData extends GBSInputs, RockallInputs {}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const GiBleedRenderer: React.FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as GiBleedData

  const gbsInputs: GBSInputs = {
    sex: d.sex ?? 'male',
    bun: d.bun ?? 0,
    hgb: d.hgb ?? 13,
    sbp: d.sbp ?? 120,
    hr: d.hr ?? 80,
    melena: d.melena ?? false,
    syncope: d.syncope ?? false,
    liverDisease: d.liverDisease ?? false,
    heartFailure: d.heartFailure ?? false,
  }

  const rockallInputs: RockallInputs = {
    age: d.age ?? 50,
    shock: d.shock ?? 0,
    comorbidity: d.comorbidity ?? 0,
    diagnosis: d.diagnosis ?? 0,
    majorSRH: d.majorSRH ?? false,
  }

  const gbs = calcGBS(gbsInputs)
  const rockall = calcRockall(rockallInputs)

  const gbsRisk = gbs === 0 ? 'Low risk — may not need endoscopy' : 'High risk — inpatient management'
  const gbsColor = gbs === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

  const rockallRisk = rockall <= 1 ? 'Low' : rockall <= 3 ? 'Intermediate' : 'High'
  const rockallColor =
    rockall <= 1 ? 'text-green-600 dark:text-green-400' :
    rockall <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
    'text-red-600 dark:text-red-400'

  const update = (field: string, value: unknown) => {
    onDataChange({ ...d, [field]: value })
  }

  return (
    <div className="p-3 space-y-5">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">GI Bleed Risk</h3>

      {/* GBS Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            Glasgow-Blatchford Score (Pre-endoscopy)
          </h4>
          <div className="text-right">
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">GBS: {gbs}</span>
            <p className={`text-xs font-semibold ${gbsColor}`}>{gbsRisk}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">Sex</label>
            <select
              value={d.sex ?? 'male'}
              onChange={e => update('sex', e.target.value)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label htmlFor="gbs-bun" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              BUN (mg/dL)
            </label>
            <input
              id="gbs-bun"
              type="number"
              min={0}
              step={0.1}
              value={d.bun ?? 0}
              onChange={e => update('bun', parseFloat(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            />
          </div>

          <div>
            <label htmlFor="gbs-hgb" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              Hgb (g/dL)
            </label>
            <input
              id="gbs-hgb"
              type="number"
              min={0}
              step={0.1}
              value={d.hgb ?? 13}
              onChange={e => update('hgb', parseFloat(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            />
          </div>

          <div>
            <label htmlFor="gbs-sbp" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              SBP (mmHg)
            </label>
            <input
              id="gbs-sbp"
              type="number"
              min={0}
              value={d.sbp ?? 120}
              onChange={e => update('sbp', parseInt(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            />
          </div>

          <div>
            <label htmlFor="gbs-hr" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              HR (bpm)
            </label>
            <input
              id="gbs-hr"
              type="number"
              min={0}
              value={d.hr ?? 80}
              onChange={e => update('hr', parseInt(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            { field: 'melena', label: 'Melena' },
            { field: 'syncope', label: 'Syncope (+2)' },
            { field: 'liverDisease', label: 'Liver disease (+2)' },
            { field: 'heartFailure', label: 'Heart failure (+2)' },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={(d as Record<string, unknown>)[field] as boolean ?? false}
                onChange={e => update(field, e.target.checked)}
                disabled={mode === 'build'}
                className="rounded"
              />
              {label}
            </label>
          ))}
        </div>

        <p className="text-xs italic text-gray-400">{GBS_CITATION}</p>
      </div>

      {/* Rockall Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            Rockall Score (Post-endoscopy)
          </h4>
          <div className="text-right">
            <span className="text-lg font-bold text-purple-700 dark:text-purple-300">Rockall: {rockall}</span>
            <p className={`text-xs font-semibold ${rockallColor}`}>{rockallRisk} rebleed risk</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="rockall-age" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              Age (years)
            </label>
            <input
              id="rockall-age"
              type="number"
              min={0}
              max={120}
              value={d.age ?? 50}
              onChange={e => update('age', parseInt(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">Shock</label>
            <select
              value={d.shock ?? 0}
              onChange={e => update('shock', parseInt(e.target.value) as 0 | 1 | 2)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            >
              <option value={0}>No shock (SBP≥100, HR&lt;100)</option>
              <option value={1}>Tachycardia (HR≥100, SBP≥100)</option>
              <option value={2}>Hypotension (SBP&lt;100)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">Comorbidity</label>
            <select
              value={d.comorbidity ?? 0}
              onChange={e => update('comorbidity', parseInt(e.target.value) as 0 | 2 | 3)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            >
              <option value={0}>None</option>
              <option value={2}>Cardiac / renal / hepatic disease</option>
              <option value={3}>Metastatic cancer / renal or hepatic failure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">Diagnosis</label>
            <select
              value={d.diagnosis ?? 0}
              onChange={e => update('diagnosis', parseInt(e.target.value) as 0 | 1 | 2)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            >
              <option value={0}>Mallory-Weiss / no SRH</option>
              <option value={1}>All other diagnoses</option>
              <option value={2}>GI malignancy</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={d.majorSRH ?? false}
            onChange={e => update('majorSRH', e.target.checked)}
            disabled={mode === 'build'}
            className="rounded"
          />
          Major SRH (active bleeding / visible vessel / clot) — +2
        </label>

        <p className="text-xs italic text-gray-400">{ROCKALL_CITATION}</p>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/gi-bleed/Editor.tsx`:

```tsx
import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const GiBleedEditor: React.FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">GI Bleed Settings</h4>
      <div className="flex items-center gap-2">
        <input
          id="gib-show-rockall"
          type="checkbox"
          checked={(config.showRockall as boolean) ?? true}
          onChange={e => onConfigChange({ ...config, showRockall: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="gib-show-rockall" className="text-sm text-gray-600 dark:text-gray-300">
          Show Rockall Score section
        </label>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/gi-bleed/PrintView.tsx`:

```tsx
import React from 'react'
import { calcGBS, calcRockall } from './Renderer'
import type { GBSInputs, RockallInputs } from './Renderer'

const GBS_CITATION = 'Blatchford O et al. Lancet. 2000;356(9238):1318-1321'
const ROCKALL_CITATION = 'Rockall TA et al. Gut. 1996;38(3):316-321'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const GiBleedPrintView: React.FC<Props> = ({ data }) => {
  const d = data as GBSInputs & RockallInputs
  const gbs = calcGBS(d)
  const rockall = calcRockall(d)

  return (
    <div className="print-module">
      <h3 className="font-semibold text-sm mb-2">GI Bleed Risk Scores</h3>
      <p className="text-xs font-medium">Glasgow-Blatchford Score (GBS): {gbs}</p>
      <p className="text-xs mb-1">
        {gbs === 0 ? 'Low risk — may not need endoscopy' : 'High risk — inpatient management'}
      </p>
      <p className="text-xs italic text-gray-500 mb-2">{GBS_CITATION}</p>
      <p className="text-xs font-medium">Rockall Score: {rockall}</p>
      <p className="text-xs mb-1">
        {rockall <= 1 ? 'Low' : rockall <= 3 ? 'Intermediate' : 'High'} rebleed risk
      </p>
      <p className="text-xs italic text-gray-500">{ROCKALL_CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/gi/gi-bleed/index.ts`:

```ts
import { ModulePlugin } from '../../../../core/plugin/types'
import { GiBleedRenderer, calcGBS, calcRockall } from './Renderer'
import type { GBSInputs, RockallInputs } from './Renderer'
import { GiBleedEditor } from './Editor'
import { GiBleedPrintView } from './PrintView'

export { calcGBS, calcRockall }
export type { GBSInputs, RockallInputs }

export const giBleedPlugin: ModulePlugin = {
  meta: {
    id: 'gi-bleed',
    name: 'GI Bleed Risk (GBS + Rockall)',
    version: '1.0.0',
    author: 'Patient Templates',
    description: 'Glasgow-Blatchford pre-endoscopy triage and Rockall post-endoscopy rebleed risk',
    tags: ['gi', 'bleed', 'gastroenterology', 'endoscopy', 'score'],
    pack: 'gi',
  },
  schema: {
    config: {
      showRockall: { type: 'boolean', default: true },
    },
    data: {
      sex: { type: 'string' },
      bun: { type: 'number' },
      hgb: { type: 'number' },
      sbp: { type: 'number' },
      hr: { type: 'number' },
      melena: { type: 'boolean' },
      syncope: { type: 'boolean' },
      liverDisease: { type: 'boolean' },
      heartFailure: { type: 'boolean' },
      age: { type: 'number' },
      shock: { type: 'number' },
      comorbidity: { type: 'number' },
      diagnosis: { type: 'number' },
      majorSRH: { type: 'boolean' },
    },
  },
  defaultConfig: {
    showRockall: true,
  },
  minSize: { w: 4, h: 8 },
  Renderer: GiBleedRenderer,
  Editor: GiBleedEditor,
  PrintView: GiBleedPrintView,
}
```

### Step 4: Run test — expect PASS

- [ ] Run:
```bash
npx vitest run src/modules/packs/gi/gi-bleed/gi-bleed.test.tsx
```
All tests must pass.

### Step 5: Commit

- [ ] Run:
```bash
git -C ~/projects/patient-templates add src/modules/packs/gi/gi-bleed/
git -C ~/projects/patient-templates commit -m "feat(gi): add gi-bleed module with Glasgow-Blatchford and Rockall scores"
```

---

## Task 5: Pack Registration

**Goal:** Wire all four modules into `src/modules/packs/gi/index.ts` so they are importable by the central pack registry.

### Step 1: Implement pack index

- [ ] Create `src/modules/packs/gi/index.ts`:

```ts
export { meldNaPlugin } from './meld-na'
export { ascitesTrackerPlugin } from './ascites-tracker'
export { encephalopathyPlugin } from './encephalopathy'
export { giBleedPlugin } from './gi-bleed'

import { meldNaPlugin } from './meld-na'
import { ascitesTrackerPlugin } from './ascites-tracker'
import { encephalopathyPlugin } from './encephalopathy'
import { giBleedPlugin } from './gi-bleed'
import type { ModulePlugin } from '../../../core/plugin/types'

export const giPack: ModulePlugin[] = [
  meldNaPlugin,
  ascitesTrackerPlugin,
  encephalopathyPlugin,
  giBleedPlugin,
]
```

### Step 2: Register in central packs index

- [ ] Open `src/modules/packs/index.ts`. Add the GI pack import and spread its plugins alongside any existing packs. If the file does not exist yet, create it:

```ts
// src/modules/packs/index.ts  (add or create)
import { giPack } from './gi'
// ... other pack imports

export const allPacks = [
  ...giPack,
  // ...otherPacks
]
```

> **Note for executor:** If `src/modules/packs/index.ts` already exists from a prior plan, add only the `import { giPack }` line and spread `...giPack` into the existing array — do not overwrite the file.

### Step 3: Smoke-test the pack index

- [ ] Run the full GI test suite to confirm nothing is broken:
```bash
npx vitest run src/modules/packs/gi/
```
All 4 test files must pass.

### Step 4: Commit

- [ ] Run:
```bash
git -C ~/projects/patient-templates add src/modules/packs/gi/index.ts src/modules/packs/index.ts
git -C ~/projects/patient-templates commit -m "feat(gi): register GI pack in central packs index"
```

---

## Completion Checklist

- [ ] `meld-na` — all tests pass, `calcMELD` and `calcMELDNa` exported
- [ ] `ascites-tracker` — all tests pass, `needsAlbumin` exported, amber warning fires correctly
- [ ] `encephalopathy` — all tests pass, all 5 West Haven grades with full criteria text
- [ ] `gi-bleed` — all tests pass, `calcGBS` and `calcRockall` exported, all scoring edge cases covered
- [ ] `src/modules/packs/gi/index.ts` — exports all 4 plugins as `giPack` array
- [ ] Central `src/modules/packs/index.ts` — includes `giPack`
- [ ] Every file with a clinical formula has `const CITATION = '...'` at top and renders it in UI
- [ ] No placeholder comments — all code is complete and working
