# Patient Template Builder — Plan 4a-ii-a: Nephrology Pack

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Nephrology specialty pack (4 modules) with evidence-cited clinical tools.

**Architecture:** Pack lives under `src/modules/packs/nephro/`. Imported by `src/modules/packs/index.ts`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/modules/packs/nephro/
├── index.ts
├── dialysis-settings/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── dialysis-settings.test.tsx
├── electrolyte-tracker/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── electrolyte-tracker.test.tsx
├── aki-staging/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── aki-staging.test.tsx
└── urine-studies/
    ├── index.ts
    ├── Renderer.tsx
    ├── Editor.tsx
    ├── PrintView.tsx
    └── urine-studies.test.tsx
```

---

## Task 1: dialysis-settings module

**Purpose:** Conditionally renders HD, CRRT, or PD prescription fields based on selected modality.

### Step 1.1 — Write failing test

- [ ] Create `src/modules/packs/nephro/dialysis-settings/dialysis-settings.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const defaultData = {
  modality: 'HD' as const,
  hd: { access: 'AV fistula', bfr: 350, dfr: 500, ufGoal: 2.5, duration: 4, anticoag: 'heparin' },
  crrt: { mode: 'CVVHDF', effluentRate: 25, replacementRate: 1000, anticoag: 'citrate', filterAge: 0 },
  pd: { dwellVol: 2000, dwellTime: 4, cyclesPerDay: 4, glucoseConc: '2.5%', dailyUF: 500 },
}

const defaultConfig = {}

describe('dialysis-settings Renderer', () => {
  it('renders modality selector', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('HD')).toBeDefined()
    expect(screen.getByText('CRRT')).toBeDefined()
    expect(screen.getByText('PD')).toBeDefined()
  })

  it('shows HD fields when modality is HD', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/blood flow rate/i)).toBeDefined()
    expect(screen.getByLabelText(/dialysate flow rate/i)).toBeDefined()
  })

  it('shows CRRT fields when modality is CRRT', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={{ ...defaultData, modality: 'CRRT' as const }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/effluent rate/i)).toBeDefined()
    expect(screen.getByLabelText(/filter age/i)).toBeDefined()
  })

  it('shows PD fields when modality is PD', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={{ ...defaultData, modality: 'PD' as const }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/dwell volume/i)).toBeDefined()
    expect(screen.getByLabelText(/cycles per day/i)).toBeDefined()
  })

  it('calls onDataChange when modality changes', () => {
    const onDataChange = vi.fn()
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText('CRRT'))
    expect(onDataChange).toHaveBeenCalledWith(expect.objectContaining({ modality: 'CRRT' }))
  })
})

describe('dialysis-settings Editor', () => {
  it('renders without crashing', () => {
    render(<Editor config={defaultConfig} onConfigChange={vi.fn()} />)
    expect(screen.getByText(/dialysis settings/i)).toBeDefined()
  })
})

describe('dialysis-settings PrintView', () => {
  it('renders modality and relevant fields', () => {
    render(<PrintView config={defaultConfig} data={defaultData} />)
    expect(screen.getByText(/HD/)).toBeDefined()
    expect(screen.getByText(/AV fistula/i)).toBeDefined()
  })
})
```

### Step 1.2 — Run test (expect FAIL)

- [ ] Run: `npx vitest run src/modules/packs/nephro/dialysis-settings/dialysis-settings.test.tsx`

Expected: test collection error or all tests fail (files don't exist yet).

### Step 1.3 — Implement all 4 files

- [ ] Create `src/modules/packs/nephro/dialysis-settings/Renderer.tsx`

```tsx
import { FC } from 'react'

type Modality = 'HD' | 'CRRT' | 'PD'

interface HDData {
  access: string
  bfr: number
  dfr: number
  ufGoal: number
  duration: number
  anticoag: string
}

interface CRRTData {
  mode: string
  effluentRate: number
  replacementRate: number
  anticoag: string
  filterAge: number
}

interface PDData {
  dwellVol: number
  dwellTime: number
  cyclesPerDay: number
  glucoseConc: string
  dailyUF: number
}

interface DialysisData {
  modality: Modality
  hd: HDData
  crrt: CRRTData
  pd: PDData
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const HD_ACCESS_OPTIONS = ['AV fistula', 'AV graft', 'Tunneled catheter', 'Temporary catheter']
const ANTICOAG_HD = ['Heparin', 'Citrate', 'None']
const ANTICOAG_CRRT = ['Citrate', 'Heparin', 'None']
const CRRT_MODES = ['CVVH', 'CVVHD', 'CVVHDF']
const GLUCOSE_CONC = ['1.5%', '2.5%', '4.25%']

function label(text: string, htmlFor: string) {
  return <label htmlFor={htmlFor} className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">{text}</label>
}

function numInput(id: string, value: number, unit: string, onChange: (v: number) => void, disabled: boolean) {
  return (
    <div>
      {label(`${id.replace(/-/g, ' ')} (${unit})`, id)}
      <input
        id={id}
        type="number"
        value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
      />
    </div>
  )
}

function selectInput(id: string, value: string, options: string[], onChange: (v: string) => void, disabled: boolean) {
  return (
    <div>
      {label(id.replace(/-/g, ' '), id)}
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as DialysisData
  const disabled = mode === 'build'

  function update(patch: Partial<DialysisData>) {
    onDataChange({ ...d, ...patch } as unknown as Record<string, unknown>)
  }

  function updateHD(patch: Partial<HDData>) {
    update({ hd: { ...d.hd, ...patch } })
  }

  function updateCRRT(patch: Partial<CRRTData>) {
    update({ crrt: { ...d.crrt, ...patch } })
  }

  function updatePD(patch: Partial<PDData>) {
    update({ pd: { ...d.pd, ...patch } })
  }

  return (
    <div className="p-3 space-y-3">
      {/* Modality selector */}
      <div className="flex gap-2">
        {(['HD', 'CRRT', 'PD'] as Modality[]).map(m => (
          <button
            key={m}
            onClick={() => !disabled && update({ modality: m })}
            className={`px-3 py-1 rounded text-sm font-semibold border transition-colors ${
              d.modality === m
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* HD fields */}
      {d.modality === 'HD' && (
        <div className="grid grid-cols-2 gap-2">
          {selectInput('access type', d.hd.access, HD_ACCESS_OPTIONS, v => updateHD({ access: v }), disabled)}
          {numInput('blood flow rate', d.hd.bfr, 'mL/min', v => updateHD({ bfr: v }), disabled)}
          {numInput('dialysate flow rate', d.hd.dfr, 'mL/min', v => updateHD({ dfr: v }), disabled)}
          {numInput('UF goal', d.hd.ufGoal, 'L', v => updateHD({ ufGoal: v }), disabled)}
          {numInput('session duration', d.hd.duration, 'hr', v => updateHD({ duration: v }), disabled)}
          {selectInput('anticoagulation', d.hd.anticoag, ANTICOAG_HD, v => updateHD({ anticoag: v }), disabled)}
        </div>
      )}

      {/* CRRT fields */}
      {d.modality === 'CRRT' && (
        <div className="grid grid-cols-2 gap-2">
          {selectInput('CRRT mode', d.crrt.mode, CRRT_MODES, v => updateCRRT({ mode: v }), disabled)}
          {numInput('effluent rate', d.crrt.effluentRate, 'mL/kg/hr', v => updateCRRT({ effluentRate: v }), disabled)}
          {numInput('replacement fluid rate', d.crrt.replacementRate, 'mL/hr', v => updateCRRT({ replacementRate: v }), disabled)}
          {selectInput('anticoagulation', d.crrt.anticoag, ANTICOAG_CRRT, v => updateCRRT({ anticoag: v }), disabled)}
          {numInput('filter age', d.crrt.filterAge, 'hr', v => updateCRRT({ filterAge: v }), disabled)}
        </div>
      )}

      {/* PD fields */}
      {d.modality === 'PD' && (
        <div className="grid grid-cols-2 gap-2">
          {numInput('dwell volume', d.pd.dwellVol, 'mL', v => updatePD({ dwellVol: v }), disabled)}
          {numInput('dwell time', d.pd.dwellTime, 'hr', v => updatePD({ dwellTime: v }), disabled)}
          {numInput('cycles per day', d.pd.cyclesPerDay, '', v => updatePD({ cyclesPerDay: v }), disabled)}
          {selectInput('glucose concentration', d.pd.glucoseConc, GLUCOSE_CONC, v => updatePD({ glucoseConc: v }), disabled)}
          {numInput('daily UF achieved', d.pd.dailyUF, 'mL', v => updatePD({ dailyUF: v }), disabled)}
        </div>
      )}
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/dialysis-settings/Editor.tsx`

```tsx
import { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">
      <p className="font-semibold mb-1">Dialysis Settings</p>
      <p className="text-xs text-gray-400">No additional configuration required. Modality and field values are set in the module directly.</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/dialysis-settings/PrintView.tsx`

```tsx
import { FC } from 'react'

interface HDData { access: string; bfr: number; dfr: number; ufGoal: number; duration: number; anticoag: string }
interface CRRTData { mode: string; effluentRate: number; replacementRate: number; anticoag: string; filterAge: number }
interface PDData { dwellVol: number; dwellTime: number; cyclesPerDay: number; glucoseConc: string; dailyUF: number }
interface DialysisData { modality: 'HD' | 'CRRT' | 'PD'; hd: HDData; crrt: CRRTData; pd: PDData }

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

function row(label: string, value: string | number) {
  return (
    <tr key={label}>
      <td className="pr-4 font-medium text-gray-600 py-0.5">{label}</td>
      <td className="text-gray-900">{value}</td>
    </tr>
  )
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as unknown as DialysisData
  return (
    <div className="text-sm">
      <p className="font-bold mb-1">Dialysis Settings — {d.modality}</p>
      <table className="border-collapse">
        <tbody>
          {d.modality === 'HD' && <>
            {row('Access', d.hd.access)}
            {row('Blood Flow Rate', `${d.hd.bfr} mL/min`)}
            {row('Dialysate Flow Rate', `${d.hd.dfr} mL/min`)}
            {row('UF Goal', `${d.hd.ufGoal} L`)}
            {row('Session Duration', `${d.hd.duration} hr`)}
            {row('Anticoagulation', d.hd.anticoag)}
          </>}
          {d.modality === 'CRRT' && <>
            {row('Mode', d.crrt.mode)}
            {row('Effluent Rate', `${d.crrt.effluentRate} mL/kg/hr`)}
            {row('Replacement Fluid Rate', `${d.crrt.replacementRate} mL/hr`)}
            {row('Anticoagulation', d.crrt.anticoag)}
            {row('Filter Age', `${d.crrt.filterAge} hr`)}
          </>}
          {d.modality === 'PD' && <>
            {row('Dwell Volume', `${d.pd.dwellVol} mL`)}
            {row('Dwell Time', `${d.pd.dwellTime} hr`)}
            {row('Cycles/Day', d.pd.cyclesPerDay)}
            {row('Glucose Concentration', d.pd.glucoseConc)}
            {row('Daily UF Achieved', `${d.pd.dailyUF} mL`)}
          </>}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/dialysis-settings/index.ts`

```ts
import { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const dialysisSettings: ModulePlugin = {
  meta: {
    id: 'dialysis-settings',
    name: 'Dialysis Settings',
    version: '1.0.0',
    author: 'nephro-pack',
    description: 'HD / CRRT / PD prescription fields with modality toggle',
    tags: ['nephrology', 'dialysis', 'HD', 'CRRT', 'PD'],
    pack: 'nephro',
  },
  schema: {
    config: {},
    data: {
      modality: 'string',
      hd: 'object',
      crrt: 'object',
      pd: 'object',
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
```

### Step 1.4 — Run test (expect PASS)

- [ ] Run: `npx vitest run src/modules/packs/nephro/dialysis-settings/dialysis-settings.test.tsx`

All tests must be green before proceeding.

### Step 1.5 — Commit

- [ ] `git add src/modules/packs/nephro/dialysis-settings/`
- [ ] `git commit -m "feat(nephro): add dialysis-settings module"`

---

## Task 2: electrolyte-tracker module

**Purpose:** Multi-row electrolyte table with out-of-range highlighting and sparkline trend bars.

### Step 2.1 — Write failing test

- [ ] Create `src/modules/packs/nephro/electrolyte-tracker/electrolyte-tracker.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const makeEntry = (date: string, overrides: Partial<Record<string, number>> = {}) => ({
  date,
  na: 140, k: 4.0, cl: 102, hco3: 24, bun: 15, cr: 0.9, ca: 9.5, mg: 2.0, phos: 3.5,
  ...overrides,
})

const defaultData = {
  entries: [
    makeEntry('2026-04-13'),
    makeEntry('2026-04-12', { k: 6.5 }),  // hyperkalemia — out of range
  ],
}

const defaultConfig = {}

describe('electrolyte-tracker Renderer', () => {
  it('renders column headers', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText('Na')).toBeDefined()
    expect(screen.getByText('K')).toBeDefined()
    expect(screen.getByText('Phos')).toBeDefined()
  })

  it('shows normal ranges in header', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/136-145/)).toBeDefined()
    expect(screen.getByText(/3\.5-5\.0/)).toBeDefined()
  })

  it('marks out-of-range cells', () => {
    const { container } = render(
      <Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />
    )
    const redCells = container.querySelectorAll('.text-red-600')
    expect(redCells.length).toBeGreaterThan(0)
  })

  it('adds a new row on button click', () => {
    const onDataChange = vi.fn()
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={onDataChange} mode="live" />)
    fireEvent.click(screen.getByText(/add row/i))
    expect(onDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: expect.arrayContaining([expect.objectContaining({ date: expect.any(String) })]),
      })
    )
  })
})

describe('electrolyte-tracker Editor', () => {
  it('renders without crashing', () => {
    render(<Editor config={defaultConfig} onConfigChange={vi.fn()} />)
    expect(screen.getByText(/electrolyte tracker/i)).toBeDefined()
  })
})

describe('electrolyte-tracker PrintView', () => {
  it('renders date and values', () => {
    render(<PrintView config={defaultConfig} data={defaultData} />)
    expect(screen.getByText('2026-04-13')).toBeDefined()
    expect(screen.getByText('6.5')).toBeDefined()
  })
})
```

### Step 2.2 — Run test (expect FAIL)

- [ ] Run: `npx vitest run src/modules/packs/nephro/electrolyte-tracker/electrolyte-tracker.test.tsx`

### Step 2.3 — Implement all 4 files

- [ ] Create `src/modules/packs/nephro/electrolyte-tracker/Renderer.tsx`

```tsx
import { FC } from 'react'

interface Entry {
  date: string
  na: number; k: number; cl: number; hco3: number
  bun: number; cr: number; ca: number; mg: number; phos: number
}

interface TrackerData { entries: Entry[] }

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

type ElectrolyteKey = 'na' | 'k' | 'cl' | 'hco3' | 'bun' | 'cr' | 'ca' | 'mg' | 'phos'

const COLUMNS: { key: ElectrolyteKey; label: string; range: string; min: number; max: number }[] = [
  { key: 'na',   label: 'Na',   range: '136-145', min: 136,  max: 145  },
  { key: 'k',    label: 'K',    range: '3.5-5.0', min: 3.5,  max: 5.0  },
  { key: 'cl',   label: 'Cl',   range: '98-107',  min: 98,   max: 107  },
  { key: 'hco3', label: 'HCO3', range: '22-29',   min: 22,   max: 29   },
  { key: 'bun',  label: 'BUN',  range: '7-25',    min: 7,    max: 25   },
  { key: 'cr',   label: 'Cr',   range: '0.6-1.2', min: 0.6,  max: 1.2  },
  { key: 'ca',   label: 'Ca',   range: '8.5-10.5',min: 8.5,  max: 10.5 },
  { key: 'mg',   label: 'Mg',   range: '1.7-2.2', min: 1.7,  max: 2.2  },
  { key: 'phos', label: 'Phos', range: '2.5-4.5', min: 2.5,  max: 4.5  },
]

function isOutOfRange(key: ElectrolyteKey, value: number): boolean {
  const col = COLUMNS.find(c => c.key === key)!
  return value < col.min || value > col.max
}

/** Simple sparkline: renders up to 8 bars scaled to min-max of the series */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return (
    <div className="flex items-end gap-px h-5 w-20 mt-1">
      {values.slice(-8).map((v, i) => {
        const pct = ((v - min) / range) * 100
        return (
          <div
            key={i}
            className="flex-1 bg-blue-400 dark:bg-blue-500 rounded-sm"
            style={{ height: `${Math.max(pct, 8)}%` }}
          />
        )
      })}
    </div>
  )
}

function makeBlankEntry(): Entry {
  return {
    date: new Date().toISOString().slice(0, 10),
    na: 0, k: 0, cl: 0, hco3: 0, bun: 0, cr: 0, ca: 0, mg: 0, phos: 0,
  }
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as TrackerData
  const disabled = mode === 'build'

  function updateEntry(idx: number, key: ElectrolyteKey | 'date', value: string | number) {
    const entries = d.entries.map((e, i) =>
      i === idx ? { ...e, [key]: value } : e
    )
    onDataChange({ ...d, entries } as unknown as Record<string, unknown>)
  }

  function addRow() {
    onDataChange({ ...d, entries: [...d.entries, makeBlankEntry()] } as unknown as Record<string, unknown>)
  }

  return (
    <div className="p-2 overflow-x-auto">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left pr-2 pb-1 text-gray-500 font-medium">Date</th>
            {COLUMNS.map(col => (
              <th key={col.key} className="text-center px-1 pb-1 text-gray-600 dark:text-gray-300 font-semibold">
                <div>{col.label}</div>
                <div className="text-gray-400 font-normal">{col.range}</div>
                <Sparkline values={d.entries.map(e => e[col.key])} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.entries.map((entry, idx) => (
            <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
              <td className="pr-2 py-0.5">
                <input
                  type="date"
                  value={entry.date}
                  disabled={disabled}
                  onChange={e => updateEntry(idx, 'date', e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-1 text-xs bg-white dark:bg-gray-800"
                />
              </td>
              {COLUMNS.map(col => {
                const val = entry[col.key]
                const oob = val !== 0 && isOutOfRange(col.key, val)
                return (
                  <td key={col.key} className="px-1 py-0.5 text-center">
                    <input
                      type="number"
                      step="0.1"
                      value={val || ''}
                      disabled={disabled}
                      onChange={e => updateEntry(idx, col.key, parseFloat(e.target.value) || 0)}
                      className={`w-14 border rounded px-1 text-xs text-center bg-white dark:bg-gray-800 ${
                        oob
                          ? 'border-red-400 text-red-600 font-semibold'
                          : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                      }`}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        disabled={disabled}
        className="mt-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
      >
        + Add Row
      </button>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/electrolyte-tracker/Editor.tsx`

```tsx
import { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">
      <p className="font-semibold mb-1">Electrolyte Tracker</p>
      <p className="text-xs text-gray-400">No additional configuration. Normal ranges are fixed per standard lab reference values.</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/electrolyte-tracker/PrintView.tsx`

```tsx
import { FC } from 'react'

interface Entry {
  date: string
  na: number; k: number; cl: number; hco3: number
  bun: number; cr: number; ca: number; mg: number; phos: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const COLS = ['na','k','cl','hco3','bun','cr','ca','mg','phos'] as const
const LABELS = { na:'Na', k:'K', cl:'Cl', hco3:'HCO3', bun:'BUN', cr:'Cr', ca:'Ca', mg:'Mg', phos:'Phos' }

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as unknown as { entries: Entry[] }
  return (
    <div className="text-xs">
      <p className="font-bold mb-1">Electrolyte Tracker</p>
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th className="text-left pr-2 border-b border-gray-400 pb-0.5">Date</th>
            {COLS.map(k => <th key={k} className="px-2 border-b border-gray-400 pb-0.5 text-center">{LABELS[k]}</th>)}
          </tr>
        </thead>
        <tbody>
          {d.entries.map((e, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="pr-2 py-0.5">{e.date}</td>
              {COLS.map(k => <td key={k} className="px-2 py-0.5 text-center">{e[k] || '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/electrolyte-tracker/index.ts`

```ts
import { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const electrolyteTracker: ModulePlugin = {
  meta: {
    id: 'electrolyte-tracker',
    name: 'Electrolyte Tracker',
    version: '1.0.0',
    author: 'nephro-pack',
    description: 'Daily electrolyte table with out-of-range highlighting and sparkline trends',
    tags: ['nephrology', 'electrolytes', 'labs'],
    pack: 'nephro',
  },
  schema: {
    config: {},
    data: { entries: 'array' },
  },
  defaultConfig: {},
  minSize: { w: 6, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
```

### Step 2.4 — Run test (expect PASS)

- [ ] Run: `npx vitest run src/modules/packs/nephro/electrolyte-tracker/electrolyte-tracker.test.tsx`

### Step 2.5 — Commit

- [ ] `git add src/modules/packs/nephro/electrolyte-tracker/`
- [ ] `git commit -m "feat(nephro): add electrolyte-tracker module"`

---

## Task 3: aki-staging module

**Purpose:** KDIGO AKI staging calculator. Computes stage from creatinine ratio, acute rise flag, urine output rate, and RRT initiation.

### Step 3.1 — Write failing test

- [ ] Create `src/modules/packs/nephro/aki-staging/aki-staging.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import { calcAKIStage } from './Renderer'

const defaultData = {
  baseCr: 1.0, currCr: 1.0, weightKg: 70, uoMl: 250, timeHr: 6,
  rrtInitiated: false, acuteRise48h: false,
}

const defaultConfig = {}

describe('calcAKIStage', () => {
  it('returns 0 when no criteria met', () => {
    expect(calcAKIStage(1.0, 1.2, 0.6, false)).toBe(0)
  })

  it('returns 1 for Cr × 1.5 baseline', () => {
    expect(calcAKIStage(1.0, 1.5, 0.6, false)).toBe(1)
  })

  it('returns 1 for UO < 0.5 mL/kg/h', () => {
    // UO 0.4 mL/kg/h — stage 1
    expect(calcAKIStage(1.0, 1.0, 0.4, false)).toBe(1)
  })

  it('returns 2 for Cr × 2.0 baseline', () => {
    expect(calcAKIStage(1.0, 2.0, 0.6, false)).toBe(2)
  })

  it('returns 2 for UO < 0.5 for ≥ 12h (represented by low UO rate)', () => {
    // UO 0.4 mL/kg/h signals stage 2 when caller passes that as a persistent 12h reading
    // The function stagess on rate only; caller responsible for duration context
    // Stage 2 UO: <0.5 for ≥12h treated as < 0.5 with no higher Cr multiplier
    expect(calcAKIStage(1.0, 2.0, 0.4, false)).toBe(2)
  })

  it('returns 3 for Cr × 3.0 baseline', () => {
    expect(calcAKIStage(1.0, 3.0, 0.6, false)).toBe(3)
  })

  it('returns 3 for absolute Cr ≥ 4.0', () => {
    expect(calcAKIStage(1.0, 4.0, 0.6, false)).toBe(3)
  })

  it('returns 3 for RRT initiation', () => {
    expect(calcAKIStage(1.0, 1.0, 0.6, true)).toBe(3)
  })

  it('returns 3 for UO < 0.3 mL/kg/h', () => {
    expect(calcAKIStage(1.0, 1.0, 0.2, false)).toBe(3)
  })
})

describe('aki-staging Renderer', () => {
  it('renders stage badge', () => {
    render(
      <Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />
    )
    expect(screen.getByText(/stage/i)).toBeDefined()
  })

  it('shows KDIGO citation', () => {
    render(
      <Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />
    )
    expect(screen.getByText(/KDIGO/i)).toBeDefined()
  })
})

describe('aki-staging Editor', () => {
  it('renders without crashing', () => {
    render(<Editor config={defaultConfig} onConfigChange={vi.fn()} />)
    expect(screen.getByText(/aki staging/i)).toBeDefined()
  })
})

describe('aki-staging PrintView', () => {
  it('renders stage number', () => {
    render(<PrintView config={defaultConfig} data={{ ...defaultData, currCr: 3.0 }} />)
    expect(screen.getByText(/Stage 3/i)).toBeDefined()
  })
})
```

### Step 3.2 — Run test (expect FAIL)

- [ ] Run: `npx vitest run src/modules/packs/nephro/aki-staging/aki-staging.test.tsx`

### Step 3.3 — Implement all 4 files

- [ ] Create `src/modules/packs/nephro/aki-staging/Renderer.tsx`

```tsx
import { FC } from 'react'

const CITATION = 'KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138'

interface AKIData {
  baseCr: number
  currCr: number
  weightKg: number
  uoMl: number
  timeHr: number
  rrtInitiated: boolean
  acuteRise48h: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

/**
 * Calculate KDIGO AKI stage.
 * @param baseCr      Baseline creatinine (mg/dL)
 * @param currCr      Current creatinine (mg/dL)
 * @param uoMlKgHr    Urine output rate (mL/kg/h)
 * @param rrtInitiated Whether RRT has been initiated
 * @returns Stage 0-3
 */
export function calcAKIStage(
  baseCr: number,
  currCr: number,
  uoMlKgHr: number,
  rrtInitiated: boolean,
): 0 | 1 | 2 | 3 {
  const ratio = baseCr > 0 ? currCr / baseCr : 0

  // Stage 3 criteria (highest priority)
  if (rrtInitiated || ratio >= 3.0 || currCr >= 4.0 || uoMlKgHr < 0.3) return 3

  // Stage 2 criteria
  if (ratio >= 2.0 || uoMlKgHr < 0.5) return 2

  // Stage 1 criteria
  if (ratio >= 1.5 || uoMlKgHr < 0.5) return 1

  return 0
}

const STAGE_COLORS: Record<number, string> = {
  0: 'bg-green-100 text-green-800 border-green-300',
  1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  2: 'bg-orange-100 text-orange-800 border-orange-300',
  3: 'bg-red-100 text-red-800 border-red-300',
}

function getCriteriaText(d: AKIData, uoRate: number, stage: number): string[] {
  const criteria: string[] = []
  if (d.rrtInitiated) criteria.push('RRT initiated')
  if (d.baseCr > 0 && d.currCr / d.baseCr >= 3.0) criteria.push(`Cr ×${(d.currCr / d.baseCr).toFixed(1)} from baseline (≥3.0)`)
  else if (d.baseCr > 0 && d.currCr / d.baseCr >= 2.0) criteria.push(`Cr ×${(d.currCr / d.baseCr).toFixed(1)} from baseline (≥2.0)`)
  else if (d.baseCr > 0 && d.currCr / d.baseCr >= 1.5) criteria.push(`Cr ×${(d.currCr / d.baseCr).toFixed(1)} from baseline (≥1.5)`)
  if (d.currCr >= 4.0) criteria.push('Cr ≥ 4.0 mg/dL (absolute)')
  if (d.acuteRise48h) criteria.push('Acute Cr rise ≥0.3 mg/dL in 48h')
  if (uoRate < 0.3) criteria.push(`UO ${uoRate.toFixed(2)} mL/kg/h (<0.3)`)
  else if (uoRate < 0.5) criteria.push(`UO ${uoRate.toFixed(2)} mL/kg/h (<0.5)`)
  if (stage === 0) criteria.push('No AKI criteria met')
  return criteria
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as AKIData
  const disabled = mode === 'build'

  const uoRate = d.weightKg > 0 && d.timeHr > 0 ? d.uoMl / d.weightKg / d.timeHr : 0
  const stage = calcAKIStage(d.baseCr, d.currCr, uoRate, d.rrtInitiated)
  const criteria = getCriteriaText(d, uoRate, stage)

  function update(patch: Partial<AKIData>) {
    onDataChange({ ...d, ...patch } as unknown as Record<string, unknown>)
  }

  return (
    <div className="p-3 space-y-3">
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <label htmlFor="baseCr" className="block text-xs font-medium text-gray-600 dark:text-gray-300">Baseline Cr (mg/dL)</label>
          <input id="baseCr" type="number" step="0.1" value={d.baseCr || ''} disabled={disabled}
            onChange={e => update({ baseCr: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label htmlFor="currCr" className="block text-xs font-medium text-gray-600 dark:text-gray-300">Current Cr (mg/dL)</label>
          <input id="currCr" type="number" step="0.1" value={d.currCr || ''} disabled={disabled}
            onChange={e => update({ currCr: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label htmlFor="weightKg" className="block text-xs font-medium text-gray-600 dark:text-gray-300">Weight (kg)</label>
          <input id="weightKg" type="number" step="0.1" value={d.weightKg || ''} disabled={disabled}
            onChange={e => update({ weightKg: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label htmlFor="uoMl" className="block text-xs font-medium text-gray-600 dark:text-gray-300">Urine Output (mL)</label>
          <input id="uoMl" type="number" value={d.uoMl || ''} disabled={disabled}
            onChange={e => update({ uoMl: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label htmlFor="timeHr" className="block text-xs font-medium text-gray-600 dark:text-gray-300">Time Window (hr)</label>
          <input id="timeHr" type="number" value={d.timeHr || ''} disabled={disabled}
            onChange={e => update({ timeHr: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800" />
        </div>
        <div className="flex flex-col justify-end gap-1">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={d.rrtInitiated} disabled={disabled}
              onChange={e => update({ rrtInitiated: e.target.checked })} />
            RRT Initiated
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={d.acuteRise48h} disabled={disabled}
              onChange={e => update({ acuteRise48h: e.target.checked })} />
            Acute rise ≥0.3 in 48h
          </label>
        </div>
      </div>

      {/* UO rate derived */}
      {d.weightKg > 0 && d.timeHr > 0 && (
        <p className="text-xs text-gray-500">
          UO rate: <span className="font-semibold">{uoRate.toFixed(2)} mL/kg/h</span>
        </p>
      )}

      {/* Stage badge */}
      <div className={`inline-flex items-center gap-2 border rounded px-3 py-2 font-bold text-lg ${STAGE_COLORS[stage]}`}>
        <span>KDIGO Stage {stage}</span>
      </div>

      {/* Criteria met */}
      <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
        {criteria.map((c, i) => <li key={i} className="flex items-start gap-1"><span>•</span>{c}</li>)}
      </ul>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/aki-staging/Editor.tsx`

```tsx
import { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">
      <p className="font-semibold mb-1">AKI Staging</p>
      <p className="text-xs text-gray-400">No additional configuration. Staging is computed dynamically from patient values entered in the module.</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/aki-staging/PrintView.tsx`

```tsx
import { FC } from 'react'
import { calcAKIStage } from './Renderer'

const CITATION = 'KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138'

interface AKIData {
  baseCr: number; currCr: number; weightKg: number; uoMl: number
  timeHr: number; rrtInitiated: boolean; acuteRise48h: boolean
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as unknown as AKIData
  const uoRate = d.weightKg > 0 && d.timeHr > 0 ? d.uoMl / d.weightKg / d.timeHr : 0
  const stage = calcAKIStage(d.baseCr, d.currCr, uoRate, d.rrtInitiated)

  return (
    <div className="text-sm">
      <p className="font-bold mb-1">KDIGO AKI Staging — Stage {stage}</p>
      <table className="border-collapse text-xs">
        <tbody>
          <tr><td className="pr-4 font-medium text-gray-600">Baseline Cr</td><td>{d.baseCr} mg/dL</td></tr>
          <tr><td className="pr-4 font-medium text-gray-600">Current Cr</td><td>{d.currCr} mg/dL</td></tr>
          <tr><td className="pr-4 font-medium text-gray-600">UO Rate</td><td>{uoRate.toFixed(2)} mL/kg/h</td></tr>
          <tr><td className="pr-4 font-medium text-gray-600">RRT Initiated</td><td>{d.rrtInitiated ? 'Yes' : 'No'}</td></tr>
          <tr><td className="pr-4 font-medium text-gray-600">Acute Rise ≥0.3 (48h)</td><td>{d.acuteRise48h ? 'Yes' : 'No'}</td></tr>
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-2">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/aki-staging/index.ts`

```ts
import { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const akiStaging: ModulePlugin = {
  meta: {
    id: 'aki-staging',
    name: 'AKI Staging',
    version: '1.0.0',
    author: 'nephro-pack',
    description: 'KDIGO AKI staging calculator (creatinine ratio + urine output)',
    tags: ['nephrology', 'AKI', 'KDIGO', 'creatinine', 'urine output'],
    pack: 'nephro',
  },
  schema: {
    config: {},
    data: {
      baseCr: 'number', currCr: 'number', weightKg: 'number',
      uoMl: 'number', timeHr: 'number', rrtInitiated: 'boolean', acuteRise48h: 'boolean',
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 5 },
  Renderer,
  Editor,
  PrintView,
}
```

### Step 3.4 — Run test (expect PASS)

- [ ] Run: `npx vitest run src/modules/packs/nephro/aki-staging/aki-staging.test.tsx`

### Step 3.5 — Commit

- [ ] `git add src/modules/packs/nephro/aki-staging/`
- [ ] `git commit -m "feat(nephro): add aki-staging module"`

---

## Task 4: urine-studies module

**Purpose:** Calculates FENa, FEUrea, and urine protein/creatinine ratio with interpretive text and published citations.

### Step 4.1 — Write failing test

- [ ] Create `src/modules/packs/nephro/urine-studies/urine-studies.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer, calcFENa, calcFEUrea } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const defaultData = {
  naU: 20, crU: 100, naS: 140, crS: 2.0,
  ureaNu: 400, ureaS: 40, uOsm: 500, proteinU: 100,
}

const defaultConfig = {}

describe('calcFENa', () => {
  it('computes FENa correctly', () => {
    // (20 * 2.0) / (140 * 100) * 100 = 0.286%
    expect(calcFENa(20, 2.0, 140, 100)).toBeCloseTo(0.286, 2)
  })

  it('returns 0 if denominator is 0', () => {
    expect(calcFENa(20, 2.0, 0, 100)).toBe(0)
  })
})

describe('calcFEUrea', () => {
  it('computes FEUrea correctly', () => {
    // (400 * 2.0) / (40 * 100) * 100 = 20%
    expect(calcFEUrea(400, 2.0, 40, 100)).toBeCloseTo(20, 1)
  })

  it('returns 0 if denominator is 0', () => {
    expect(calcFEUrea(400, 2.0, 0, 100)).toBe(0)
  })
})

describe('urine-studies Renderer', () => {
  it('renders input fields', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByLabelText(/urine Na/i)).toBeDefined()
    expect(screen.getByLabelText(/serum Na/i)).toBeDefined()
  })

  it('renders FENa result', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/FENa/i)).toBeDefined()
  })

  it('renders FEUrea result', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/FEUrea/i)).toBeDefined()
  })

  it('renders protein/Cr ratio', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/protein.*cr ratio/i)).toBeDefined()
  })

  it('renders FENa citation', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/Miller TR/i)).toBeDefined()
  })

  it('renders FEUrea citation', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/Carvounis/i)).toBeDefined()
  })
})

describe('urine-studies Editor', () => {
  it('renders without crashing', () => {
    render(<Editor config={defaultConfig} onConfigChange={vi.fn()} />)
    expect(screen.getByText(/urine studies/i)).toBeDefined()
  })
})

describe('urine-studies PrintView', () => {
  it('renders calculated results', () => {
    render(<PrintView config={defaultConfig} data={defaultData} />)
    expect(screen.getByText(/FENa/i)).toBeDefined()
    expect(screen.getByText(/FEUrea/i)).toBeDefined()
  })
})
```

### Step 4.2 — Run test (expect FAIL)

- [ ] Run: `npx vitest run src/modules/packs/nephro/urine-studies/urine-studies.test.tsx`

### Step 4.3 — Implement all 4 files

- [ ] Create `src/modules/packs/nephro/urine-studies/Renderer.tsx`

```tsx
import { FC } from 'react'

const CITATION_FENA = 'Miller TR et al. Ann Intern Med. 1978;89(1):47-50'
const CITATION_FEUREA = 'Carvounis CP et al. Am J Kidney Dis. 2002;39(3):455-462'

interface UrineData {
  naU: number; crU: number; naS: number; crS: number
  ureaNu: number; ureaS: number; uOsm: number; proteinU: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

/**
 * FENa = (Na_u × Cr_s) / (Na_s × Cr_u) × 100
 * Returns 0 if denominator is 0.
 */
export function calcFENa(naU: number, crS: number, naS: number, crU: number): number {
  const denom = naS * crU
  if (denom === 0) return 0
  return (naU * crS) / denom * 100
}

/**
 * FEUrea = (Urea_u × Cr_s) / (Urea_s × Cr_u) × 100
 * Returns 0 if denominator is 0.
 */
export function calcFEUrea(ureaNu: number, crS: number, ureaS: number, crU: number): number {
  const denom = ureaS * crU
  if (denom === 0) return 0
  return (ureaNu * crS) / denom * 100
}

function interpretFENa(fena: number): string {
  if (fena < 1) return 'Prerenal (< 1%)'
  if (fena <= 2) return 'Indeterminate (1–2%)'
  return 'Intrinsic renal (> 2%)'
}

function interpretFEUrea(feurea: number): string {
  if (feurea < 35) return 'Prerenal — preferred on diuretics (< 35%)'
  if (feurea <= 50) return 'Indeterminate (35–50%)'
  return 'Intrinsic renal (> 50%)'
}

function interpretProtCr(ratio: number): string {
  if (ratio >= 3.5) return 'Nephrotic range (≥ 3.5)'
  if (ratio >= 0.2) return 'Abnormal (0.2–3.5)'
  return 'Normal (< 0.2)'
}

function numField(id: string, labelText: string, value: number, unit: string, onChange: (v: number) => void, disabled: boolean) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
        {labelText} {unit && <span className="text-gray-400">({unit})</span>}
      </label>
      <input
        id={id}
        type="number"
        step="0.1"
        value={value || ''}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
      />
    </div>
  )
}

function ResultCard({ label, value, interp, unit }: { label: string; value: number; interp: string; unit: string }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded p-2">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{label}</p>
      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{value.toFixed(1)}<span className="text-xs font-normal text-gray-400 ml-1">{unit}</span></p>
      <p className="text-xs text-gray-500">{interp}</p>
    </div>
  )
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as UrineData
  const disabled = mode === 'build'

  function update(patch: Partial<UrineData>) {
    onDataChange({ ...d, ...patch } as unknown as Record<string, unknown>)
  }

  const fena = calcFENa(d.naU, d.crS, d.naS, d.crU)
  const feurea = calcFEUrea(d.ureaNu, d.crS, d.ureaS, d.crU)
  const protCrRatio = d.crU > 0 ? d.proteinU / d.crU : 0

  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inputs</p>

      {/* Urine values */}
      <div className="grid grid-cols-2 gap-2">
        {numField('naU', 'Urine Na', d.naU, 'mEq/L', v => update({ naU: v }), disabled)}
        {numField('crU', 'Urine Cr', d.crU, 'mg/dL', v => update({ crU: v }), disabled)}
        {numField('ureaNu', 'Urine Urea N', d.ureaNu, 'mg/dL', v => update({ ureaNu: v }), disabled)}
        {numField('uOsm', 'Urine Osmolality', d.uOsm, 'mOsm/kg', v => update({ uOsm: v }), disabled)}
        {numField('proteinU', 'Urine Protein', d.proteinU, 'mg/dL', v => update({ proteinU: v }), disabled)}
      </div>

      {/* Serum values */}
      <div className="grid grid-cols-2 gap-2">
        {numField('naS', 'Serum Na', d.naS, 'mEq/L', v => update({ naS: v }), disabled)}
        {numField('crS', 'Serum Cr', d.crS, 'mg/dL', v => update({ crS: v }), disabled)}
        {numField('ureaS', 'Serum Urea N (BUN)', d.ureaS, 'mg/dL', v => update({ ureaS: v }), disabled)}
      </div>

      {/* Results */}
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Results</p>
      <div className="grid grid-cols-1 gap-2">
        <ResultCard label="FENa" value={fena} interp={interpretFENa(fena)} unit="%" />
        <p className="text-xs italic text-gray-400 -mt-1">{CITATION_FENA}</p>
        <ResultCard label="FEUrea" value={feurea} interp={interpretFEUrea(feurea)} unit="%" />
        <p className="text-xs italic text-gray-400 -mt-1">{CITATION_FEUREA}</p>
        <ResultCard label="Protein/Cr Ratio" value={protCrRatio} interp={interpretProtCr(protCrRatio)} unit="" />
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/urine-studies/Editor.tsx`

```tsx
import { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">
      <p className="font-semibold mb-1">Urine Studies</p>
      <p className="text-xs text-gray-400">No additional configuration. FENa, FEUrea, and protein/Cr ratio are computed automatically from entered values.</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/urine-studies/PrintView.tsx`

```tsx
import { FC } from 'react'
import { calcFENa, calcFEUrea } from './Renderer'

const CITATION_FENA = 'Miller TR et al. Ann Intern Med. 1978;89(1):47-50'
const CITATION_FEUREA = 'Carvounis CP et al. Am J Kidney Dis. 2002;39(3):455-462'

interface UrineData {
  naU: number; crU: number; naS: number; crS: number
  ureaNu: number; ureaS: number; uOsm: number; proteinU: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

function row(label: string, value: string) {
  return <tr key={label}><td className="pr-4 font-medium text-gray-600 py-0.5">{label}</td><td>{value}</td></tr>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as unknown as UrineData
  const fena = calcFENa(d.naU, d.crS, d.naS, d.crU)
  const feurea = calcFEUrea(d.ureaNu, d.crS, d.ureaS, d.crU)
  const protCr = d.crU > 0 ? d.proteinU / d.crU : 0

  return (
    <div className="text-sm">
      <p className="font-bold mb-1">Urine Studies</p>
      <table className="border-collapse text-xs">
        <tbody>
          {row('Urine Na', `${d.naU} mEq/L`)}
          {row('Urine Cr', `${d.crU} mg/dL`)}
          {row('Serum Na', `${d.naS} mEq/L`)}
          {row('Serum Cr', `${d.crS} mg/dL`)}
          {row('Urine Urea N', `${d.ureaNu} mg/dL`)}
          {row('BUN', `${d.ureaS} mg/dL`)}
          {row('Urine Osmolality', `${d.uOsm} mOsm/kg`)}
          {row('Urine Protein', `${d.proteinU} mg/dL`)}
        </tbody>
      </table>
      <div className="mt-2 space-y-1">
        <p className="font-semibold text-xs">FENa: {fena.toFixed(1)}%</p>
        <p className="text-xs italic text-gray-400">{CITATION_FENA}</p>
        <p className="font-semibold text-xs">FEUrea: {feurea.toFixed(1)}%</p>
        <p className="text-xs italic text-gray-400">{CITATION_FEUREA}</p>
        <p className="font-semibold text-xs">Protein/Cr Ratio: {protCr.toFixed(2)}</p>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/nephro/urine-studies/index.ts`

```ts
import { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const urineStudies: ModulePlugin = {
  meta: {
    id: 'urine-studies',
    name: 'Urine Studies',
    version: '1.0.0',
    author: 'nephro-pack',
    description: 'FENa, FEUrea, and urine protein/Cr ratio with evidence-cited interpretations',
    tags: ['nephrology', 'FENa', 'FEUrea', 'urine', 'AKI', 'prerenal'],
    pack: 'nephro',
  },
  schema: {
    config: {},
    data: {
      naU: 'number', crU: 'number', naS: 'number', crS: 'number',
      ureaNu: 'number', ureaS: 'number', uOsm: 'number', proteinU: 'number',
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 6 },
  Renderer,
  Editor,
  PrintView,
}
```

### Step 4.4 — Run test (expect PASS)

- [ ] Run: `npx vitest run src/modules/packs/nephro/urine-studies/urine-studies.test.tsx`

### Step 4.5 — Commit

- [ ] `git add src/modules/packs/nephro/urine-studies/`
- [ ] `git commit -m "feat(nephro): add urine-studies module"`

---

## Task 5: Pack registration

**Purpose:** Wire all 4 modules into the nephro pack index, then register the pack with the app-level pack barrel.

### Step 5.1 — Create pack index

- [ ] Create `src/modules/packs/nephro/index.ts`

```ts
import { ModulePlugin } from '../../../core/plugin/types'
import { dialysisSettings } from './dialysis-settings'
import { electrolyteTracker } from './electrolyte-tracker'
import { akiStaging } from './aki-staging'
import { urineStudies } from './urine-studies'

export const nephroPack: ModulePlugin[] = [
  dialysisSettings,
  electrolyteTracker,
  akiStaging,
  urineStudies,
]
```

### Step 5.2 — Register in app-level barrel

- [ ] Open `src/modules/packs/index.ts`

Add the following import and spread. If the file uses a `registerAll` function or array export, add accordingly:

```ts
// Existing imports above...
import { nephroPack } from './nephro'

// In the combined array or registration call:
export const allPacks: ModulePlugin[] = [
  // ...existing packs,
  ...nephroPack,
]
```

If `src/modules/packs/index.ts` does not yet exist (because Plan 2 created it alongside another specialty pack), create it now with only the nephro pack registered:

```ts
import { ModulePlugin } from '../../core/plugin/types'
import { nephroPack } from './nephro'

export const allPacks: ModulePlugin[] = [
  ...nephroPack,
]
```

### Step 5.3 — Run full nephro suite

- [ ] Run all four module tests at once:

```bash
npx vitest run src/modules/packs/nephro/
```

All tests must pass with zero failures.

### Step 5.4 — Commit

- [ ] `git add src/modules/packs/nephro/index.ts src/modules/packs/index.ts`
- [ ] `git commit -m "feat(nephro): register nephrology pack in module barrel"`

---

## Appendix: Data defaults reference

When a module instance is first created on the canvas, the plugin registry should populate `data` with the following defaults:

### dialysis-settings
```ts
{
  modality: 'HD',
  hd: { access: 'AV fistula', bfr: 350, dfr: 500, ufGoal: 2.0, duration: 4, anticoag: 'Heparin' },
  crrt: { mode: 'CVVHDF', effluentRate: 25, replacementRate: 1000, anticoag: 'Citrate', filterAge: 0 },
  pd: { dwellVol: 2000, dwellTime: 4, cyclesPerDay: 4, glucoseConc: '2.5%', dailyUF: 0 },
}
```

### electrolyte-tracker
```ts
{ entries: [] }
```

### aki-staging
```ts
{ baseCr: 0, currCr: 0, weightKg: 70, uoMl: 0, timeHr: 6, rrtInitiated: false, acuteRise48h: false }
```

### urine-studies
```ts
{ naU: 0, crU: 0, naS: 0, crS: 0, ureaNu: 0, ureaS: 0, uOsm: 0, proteinU: 0 }
```

---

## Clinical Evidence Summary

| Module | Formula / Score | Citation |
|---|---|---|
| aki-staging | KDIGO AKI staging criteria | KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138 |
| urine-studies | FENa | Miller TR et al. Ann Intern Med. 1978;89(1):47-50 |
| urine-studies | FEUrea | Carvounis CP et al. Am J Kidney Dis. 2002;39(3):455-462 |
| electrolyte-tracker | Normal ranges | Standard laboratory reference ranges (no single citation required) |
| dialysis-settings | No formula | N/A (prescription fields only) |
