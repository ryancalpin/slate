# Patient Template Builder — Plan 4a-i-b: Pulmonology/Critical Care Pack

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Pulmonology/Critical Care specialty pack (4 modules) with evidence-cited ventilator and respiratory tools.

**Architecture:** Pack lives under `src/modules/packs/pulm/`. Imported by `src/modules/packs/index.ts` (created by Plan 4a-i-a).

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/modules/packs/pulm/
├── index.ts                         — registers all 4 pulm modules
├── vent-settings/
│   ├── index.ts                     — module plugin export
│   ├── Renderer.tsx                 — live data entry view
│   ├── Editor.tsx                   — build mode config panel
│   ├── PrintView.tsx                — print/PDF output
│   └── vent-settings.test.tsx       — unit + render tests
├── abg-interpreter/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── abg-interpreter.test.tsx
├── respiratory-scores/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── respiratory-scores.test.tsx
└── weaning-readiness/
    ├── index.ts
    ├── Renderer.tsx
    ├── Editor.tsx
    ├── PrintView.tsx
    └── weaning-readiness.test.tsx
```

---

## Task 1: `vent-settings` module

**Goal:** Ventilator settings entry with ARDSnet driving pressure, P/F ratio, and TV/IBW auto-calculations.

### Step 1 — Write the failing test

- [ ] Create `src/modules/packs/pulm/vent-settings/vent-settings.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  calcDrivingPressure,
  calcPFRatio,
  calcTVperIBW,
} from './index'
import { Renderer } from './Renderer'

describe('vent-settings pure functions', () => {
  it('calcDrivingPressure: pPlat - PEEP', () => {
    expect(calcDrivingPressure(25, 8)).toBe(17)
    expect(calcDrivingPressure(20, 5)).toBe(15)
  })

  it('calcPFRatio: PaO2 / FiO2 fraction', () => {
    expect(calcPFRatio(80, 0.4)).toBeCloseTo(200)
    expect(calcPFRatio(100, 0.5)).toBeCloseTo(200)
  })

  it('calcTVperIBW: mL / kg', () => {
    expect(calcTVperIBW(420, 70)).toBe(6)
    expect(calcTVperIBW(500, 70)).toBeCloseTo(7.14, 1)
  })
})

describe('vent-settings Renderer', () => {
  const defaultData = {
    mode: 'AC/VC', fio2: 40, peep: 5, tv: 420, rr: 14,
    ie: '1:2', pPlat: 22, pao2: 84, ibwKg: 70,
  }

  it('renders mode dropdown', () => {
    render(
      <Renderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByRole('combobox')).toBeDefined()
  })

  it('shows ARDSnet warning when TV/IBW > 6', () => {
    render(
      <Renderer
        instanceId="test-2"
        config={{}}
        data={{ ...defaultData, tv: 500, ibwKg: 70 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/ARDSnet target/i)).toBeDefined()
  })

  it('does not show ARDSnet warning when TV/IBW <= 6', () => {
    render(
      <Renderer
        instanceId="test-3"
        config={{}}
        data={{ ...defaultData, tv: 420, ibwKg: 70 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.queryByText(/ARDSnet target/i)).toBeNull()
  })

  it('shows driving pressure auto-calc', () => {
    render(
      <Renderer
        instanceId="test-4"
        config={{}}
        data={{ ...defaultData, pPlat: 25, peep: 8 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/17/)).toBeDefined()
  })

  it('displays citation', () => {
    render(
      <Renderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/ARDSNet/i)).toBeDefined()
  })
})
```

### Step 2 — Run test expecting FAIL

- [ ] Run:
```bash
npx vitest run src/modules/packs/pulm/vent-settings/vent-settings.test.tsx
```
Confirm the test suite fails (module files do not exist yet).

### Step 3 — Implement all module files

- [ ] Create `src/modules/packs/pulm/vent-settings/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const CITATION = 'ARDSNet: Ventilation with lower tidal volumes. NEJM. 2000;342(18):1301-1308'

export function calcDrivingPressure(pPlat: number, peep: number): number {
  return pPlat - peep
}

export function calcPFRatio(pao2: number, fio2Fraction: number): number {
  return pao2 / fio2Fraction
}

export function calcTVperIBW(tvMl: number, ibwKg: number): number {
  return tvMl / ibwKg
}

export { CITATION }

const ventSettingsPlugin: ModulePlugin = {
  meta: {
    id: 'vent-settings',
    name: 'Ventilator Settings',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Ventilator settings entry with ARDSnet calculations and auto-derived P/F ratio and driving pressure.',
    tags: ['critical-care', 'pulmonology', 'ventilator', 'ards'],
    pack: 'pulm',
  },
  schema: {
    config: {},
    data: {
      mode: { type: 'string' },
      fio2: { type: 'number' },
      peep: { type: 'number' },
      tv: { type: 'number' },
      rr: { type: 'number' },
      ie: { type: 'string' },
      pPlat: { type: 'number' },
      pao2: { type: 'number' },
      ibwKg: { type: 'number' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default ventSettingsPlugin
```

- [ ] Create `src/modules/packs/pulm/vent-settings/Renderer.tsx`:

```tsx
import type { FC } from 'react'
import { CITATION, calcDrivingPressure, calcPFRatio, calcTVperIBW } from './index'

const VENT_MODES = ['AC/VC', 'AC/PC', 'SIMV', 'CPAP/PS', 'PRVC', 'APRV']

interface VentData {
  mode: string
  fio2: number
  peep: number
  tv: number
  rr: number
  ie: string
  pPlat: number
  pao2: number
  ibwKg: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Partial<VentData>
  const isLive = mode === 'live'

  const set = (field: keyof VentData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    onDataChange({ ...data, [field]: val })
  }

  const drivingPressure =
    d.pPlat != null && d.peep != null ? calcDrivingPressure(d.pPlat, d.peep) : null

  const pfRatio =
    d.pao2 != null && d.fio2 != null && d.fio2 > 0
      ? calcPFRatio(d.pao2, d.fio2 / 100)
      : null

  const tvIBW =
    d.tv != null && d.ibwKg != null && d.ibwKg > 0
      ? calcTVperIBW(d.tv, d.ibwKg)
      : null

  const ardsnetWarning = tvIBW != null && tvIBW > 6

  const inputCls =
    'w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <div className="p-3 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Ventilator Settings</h3>

      {/* Mode */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-28 shrink-0">Mode</label>
        <select
          className={inputCls}
          value={d.mode ?? 'AC/VC'}
          onChange={set('mode')}
          disabled={!isLive}
        >
          {VENT_MODES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* FiO2 */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-28 shrink-0">FiO₂ (%)</label>
        <input
          type="number"
          className={inputCls}
          value={d.fio2 ?? ''}
          min={21}
          max={100}
          onChange={set('fio2')}
          readOnly={!isLive}
        />
      </div>

      {/* PEEP */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-28 shrink-0">PEEP (cmH₂O)</label>
        <input
          type="number"
          className={inputCls}
          value={d.peep ?? ''}
          onChange={set('peep')}
          readOnly={!isLive}
        />
      </div>

      {/* Tidal Volume */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-28 shrink-0">Tidal Volume (mL)</label>
        <input
          type="number"
          className={inputCls}
          value={d.tv ?? ''}
          onChange={set('tv')}
          readOnly={!isLive}
        />
      </div>

      {/* Set RR */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-28 shrink-0">Set RR (br/min)</label>
        <input
          type="number"
          className={inputCls}
          value={d.rr ?? ''}
          onChange={set('rr')}
          readOnly={!isLive}
        />
      </div>

      {/* I:E ratio */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-28 shrink-0">I:E Ratio</label>
        <input
          type="text"
          className={inputCls}
          placeholder="e.g. 1:2"
          value={d.ie ?? ''}
          onChange={set('ie')}
          readOnly={!isLive}
        />
      </div>

      {/* P-plateau */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-28 shrink-0">P-plateau (cmH₂O)</label>
        <input
          type="number"
          className={inputCls}
          value={d.pPlat ?? ''}
          onChange={set('pPlat')}
          readOnly={!isLive}
        />
      </div>

      {/* PaO2 (for P/F) */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-28 shrink-0">PaO₂ (mmHg)</label>
        <input
          type="number"
          className={inputCls}
          value={d.pao2 ?? ''}
          onChange={set('pao2')}
          readOnly={!isLive}
        />
      </div>

      {/* IBW */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-28 shrink-0">IBW (kg)</label>
        <input
          type="number"
          className={inputCls}
          value={d.ibwKg ?? ''}
          onChange={set('ibwKg')}
          readOnly={!isLive}
        />
      </div>

      {/* Auto-calcs */}
      <div className="rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 space-y-1 text-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Auto-calculations</p>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Driving Pressure</span>
          <span className="font-mono font-semibold">
            {drivingPressure != null ? `${drivingPressure} cmH₂O` : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">P/F Ratio</span>
          <span className="font-mono font-semibold">
            {pfRatio != null ? pfRatio.toFixed(0) : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">TV/IBW</span>
          <span className="font-mono font-semibold">
            {tvIBW != null ? `${tvIBW.toFixed(1)} mL/kg` : '—'}
          </span>
        </div>
      </div>

      {/* ARDSnet warning */}
      {ardsnetWarning && (
        <div className="rounded bg-amber-50 border border-amber-300 px-3 py-2 text-sm text-amber-800">
          ⚠ TV exceeds ARDSnet target (6 mL/kg IBW)
        </div>
      )}

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/pulm/vent-settings/Editor.tsx`:

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-600 dark:text-gray-400">
      <p>No additional configuration for Ventilator Settings.</p>
      <p className="mt-1 text-xs text-gray-400">All fields are displayed by default.</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/pulm/vent-settings/PrintView.tsx`:

```tsx
import type { FC } from 'react'
import { CITATION, calcDrivingPressure, calcPFRatio, calcTVperIBW } from './index'

interface VentData {
  mode: string
  fio2: number
  peep: number
  tv: number
  rr: number
  ie: string
  pPlat: number
  pao2: number
  ibwKg: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Partial<VentData>

  const drivingPressure = d.pPlat != null && d.peep != null ? calcDrivingPressure(d.pPlat, d.peep) : null
  const pfRatio = d.pao2 != null && d.fio2 != null && d.fio2 > 0 ? calcPFRatio(d.pao2, d.fio2 / 100) : null
  const tvIBW = d.tv != null && d.ibwKg != null && d.ibwKg > 0 ? calcTVperIBW(d.tv, d.ibwKg) : null

  const rows: [string, string][] = [
    ['Mode', d.mode ?? '—'],
    ['FiO₂', d.fio2 != null ? `${d.fio2}%` : '—'],
    ['PEEP', d.peep != null ? `${d.peep} cmH₂O` : '—'],
    ['Tidal Volume', d.tv != null ? `${d.tv} mL` : '—'],
    ['Set RR', d.rr != null ? `${d.rr} br/min` : '—'],
    ['I:E Ratio', d.ie ?? '—'],
    ['P-plateau', d.pPlat != null ? `${d.pPlat} cmH₂O` : '—'],
    ['PaO₂', d.pao2 != null ? `${d.pao2} mmHg` : '—'],
    ['IBW', d.ibwKg != null ? `${d.ibwKg} kg` : '—'],
    ['Driving Pressure (calc)', drivingPressure != null ? `${drivingPressure} cmH₂O` : '—'],
    ['P/F Ratio (calc)', pfRatio != null ? pfRatio.toFixed(0) : '—'],
    ['TV/IBW (calc)', tvIBW != null ? `${tvIBW.toFixed(1)} mL/kg` : '—'],
  ]

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
      <h4 style={{ marginBottom: 6, fontWeight: 600 }}>Ventilator Settings</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '3px 6px', color: '#6b7280', width: '50%' }}>{label}</td>
              <td style={{ padding: '3px 6px', fontWeight: 500 }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {tvIBW != null && tvIBW > 6 && (
        <p style={{ color: '#d97706', marginTop: 6, fontSize: 11 }}>
          ⚠ TV exceeds ARDSnet target (6 mL/kg IBW)
        </p>
      )}
      <p style={{ color: '#9ca3af', fontSize: 10, fontStyle: 'italic', marginTop: 6 }}>{CITATION}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/pulm/vent-settings/index.ts` (already written above — this step writes it to disk).

- [ ] Create `src/modules/packs/pulm/index.ts` (register vent-settings, will be extended in Tasks 2-4):

```ts
import type { ModulePlugin } from '../../../core/plugin/types'
import ventSettingsPlugin from './vent-settings/index'

const pulmPack: ModulePlugin[] = [
  ventSettingsPlugin,
]

export default pulmPack
```

### Step 4 — Run test expecting PASS

- [ ] Run:
```bash
npx vitest run src/modules/packs/pulm/vent-settings/vent-settings.test.tsx
```
All tests must pass before proceeding.

### Step 5 — Commit

- [ ] Commit:
```bash
git -C ~/projects/patient-templates add src/modules/packs/pulm/
git -C ~/projects/patient-templates commit -m "feat(pulm): add vent-settings module with ARDSnet calculations"
```

---

## Task 2: `abg-interpreter` module

**Goal:** ABG entry with full acid-base interpretation, Winter's formula compensation check, A-a gradient, and P/F ratio.

### Step 1 — Write the failing test

- [ ] Create `src/modules/packs/pulm/abg-interpreter/abg-interpreter.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { interpretABG, calcAaGradient, calcPFRatio } from './index'
import { Renderer } from './Renderer'

describe('interpretABG pure function', () => {
  it('identifies respiratory acidosis', () => {
    const result = interpretABG(7.28, 55, 18)
    expect(result.disorder).toMatch(/acidosis/i)
    expect(result.type).toMatch(/respiratory/i)
  })

  it('identifies metabolic acidosis', () => {
    const result = interpretABG(7.28, 38, 16)
    expect(result.disorder).toMatch(/acidosis/i)
    expect(result.type).toMatch(/metabolic/i)
  })

  it('identifies respiratory alkalosis', () => {
    const result = interpretABG(7.50, 28, 24)
    expect(result.disorder).toMatch(/alkalosis/i)
    expect(result.type).toMatch(/respiratory/i)
  })

  it('identifies metabolic alkalosis', () => {
    const result = interpretABG(7.50, 44, 30)
    expect(result.disorder).toMatch(/alkalosis/i)
    expect(result.type).toMatch(/metabolic/i)
  })

  it('identifies normal pH', () => {
    const result = interpretABG(7.40, 40, 24)
    expect(result.disorder).toMatch(/normal/i)
  })
})

describe('calcAaGradient', () => {
  it('calculates A-a gradient correctly', () => {
    // (0.21/100 is wrong — FiO2 pct passed directly as percent)
    // A-a = (FiO2/100 * 713) - (PaCO2/0.8) - PaO2
    // FiO2=21%, PaCO2=40, PaO2=95 → (0.21*713) - 50 - 95 = 149.73-50-95 = 4.73
    const result = calcAaGradient(21, 40, 95)
    expect(result).toBeCloseTo(4.73, 1)
  })
})

describe('calcPFRatio (ABG)', () => {
  it('calculates P/F ratio from pct FiO2', () => {
    expect(calcPFRatio(80, 40)).toBeCloseTo(200)
    expect(calcPFRatio(100, 50)).toBeCloseTo(200)
  })
})

describe('abg-interpreter Renderer', () => {
  const defaultData = {
    ph: 7.38, pco2: 42, pao2: 88, hco3: 24, spo2: 97, fio2: 40, patientAge: 65,
  }

  it('renders pH input', () => {
    render(
      <Renderer
        instanceId="abg-1"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('7.38')).toBeDefined()
  })

  it('shows acid-base interpretation', () => {
    render(
      <Renderer
        instanceId="abg-2"
        config={{}}
        data={{ ...defaultData, ph: 7.28, pco2: 55, hco3: 24 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/acidosis/i)).toBeDefined()
  })

  it('displays Winter citation', () => {
    render(
      <Renderer
        instanceId="abg-3"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Albert MS/i)).toBeDefined()
  })
})
```

### Step 2 — Run test expecting FAIL

- [ ] Run:
```bash
npx vitest run src/modules/packs/pulm/abg-interpreter/abg-interpreter.test.tsx
```
Confirm failure.

### Step 3 — Implement all module files

- [ ] Create `src/modules/packs/pulm/abg-interpreter/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const CITATION_WINTERS = "Albert MS et al. Ann Intern Med. 1967;66(2):312-322"
export const CITATION_AA = "Standard respiratory physiology: A-a gradient = (FiO2/100 × 713) − (PaCO2/0.8) − PaO2"

export function interpretABG(
  ph: number,
  pco2: number,
  hco3: number
): { disorder: string; type: string } {
  if (ph >= 7.35 && ph <= 7.45) {
    return { disorder: 'Normal', type: 'Normal' }
  }

  if (ph < 7.35) {
    // Acidosis
    if (pco2 > 45) {
      return { disorder: 'Acidosis', type: 'Respiratory' }
    } else if (hco3 < 22) {
      return { disorder: 'Acidosis', type: 'Metabolic' }
    }
    return { disorder: 'Acidosis', type: 'Mixed' }
  }

  // Alkalosis (ph > 7.45)
  if (pco2 < 35) {
    return { disorder: 'Alkalosis', type: 'Respiratory' }
  } else if (hco3 > 26) {
    return { disorder: 'Alkalosis', type: 'Metabolic' }
  }
  return { disorder: 'Alkalosis', type: 'Mixed' }
}

/**
 * Winter's compensation check for metabolic acidosis:
 * Expected PaCO2 = 1.5 × HCO3 + 8 ± 2
 */
export function wintersExpectedPCO2(hco3: number): { low: number; high: number } {
  const expected = 1.5 * hco3 + 8
  return { low: expected - 2, high: expected + 2 }
}

/**
 * Metabolic alkalosis compensation:
 * Expected PaCO2 = 0.7 × (HCO3 − 24) + 40 ± 5
 */
export function metAlkalosisExpectedPCO2(hco3: number): { low: number; high: number } {
  const expected = 0.7 * (hco3 - 24) + 40
  return { low: expected - 5, high: expected + 5 }
}

/**
 * A-a gradient = (FiO2/100 × 713) − (PaCO2 / 0.8) − PaO2
 * Normal upper limit ≈ Age/4 + 4
 */
export function calcAaGradient(fio2Pct: number, pco2: number, pao2: number): number {
  return (fio2Pct / 100) * 713 - pco2 / 0.8 - pao2
}

/**
 * P/F ratio = PaO2 / (FiO2 / 100)
 */
export function calcPFRatio(pao2: number, fio2Pct: number): number {
  return pao2 / (fio2Pct / 100)
}

const abgInterpreterPlugin: ModulePlugin = {
  meta: {
    id: 'abg-interpreter',
    name: 'ABG Interpreter',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Arterial blood gas entry with automated acid-base interpretation, A-a gradient, and P/F ratio.',
    tags: ['critical-care', 'pulmonology', 'abg', 'acid-base'],
    pack: 'pulm',
  },
  schema: {
    config: {},
    data: {
      ph: { type: 'number' },
      pco2: { type: 'number' },
      pao2: { type: 'number' },
      hco3: { type: 'number' },
      spo2: { type: 'number' },
      fio2: { type: 'number' },
      patientAge: { type: 'number' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default abgInterpreterPlugin
```

- [ ] Create `src/modules/packs/pulm/abg-interpreter/Renderer.tsx`:

```tsx
import type { FC } from 'react'
import {
  CITATION_WINTERS,
  CITATION_AA,
  interpretABG,
  calcAaGradient,
  calcPFRatio,
  wintersExpectedPCO2,
  metAlkalosisExpectedPCO2,
} from './index'

interface ABGData {
  ph: number
  pco2: number
  pao2: number
  hco3: number
  spo2: number
  fio2: number
  patientAge: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Partial<ABGData>
  const isLive = mode === 'live'

  const set = (field: keyof ABGData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({ ...data, [field]: Number(e.target.value) })
  }

  const hasFullABG = d.ph != null && d.pco2 != null && d.hco3 != null
  const interpretation = hasFullABG ? interpretABG(d.ph!, d.pco2!, d.hco3!) : null

  // Compensation check
  let compensationNote: string | null = null
  if (interpretation && d.pco2 != null && d.hco3 != null) {
    if (interpretation.disorder === 'Acidosis' && interpretation.type === 'Metabolic') {
      const { low, high } = wintersExpectedPCO2(d.hco3)
      if (d.pco2 < low) compensationNote = `PaCO₂ ${d.pco2} < expected ${low.toFixed(1)}-${high.toFixed(1)}: additional respiratory alkalosis`
      else if (d.pco2 > high) compensationNote = `PaCO₂ ${d.pco2} > expected ${low.toFixed(1)}-${high.toFixed(1)}: additional respiratory acidosis`
      else compensationNote = `PaCO₂ appropriately compensated (Winter's: ${low.toFixed(1)}-${high.toFixed(1)})`
    } else if (interpretation.disorder === 'Alkalosis' && interpretation.type === 'Metabolic') {
      const { low, high } = metAlkalosisExpectedPCO2(d.hco3)
      if (d.pco2 < low) compensationNote = `PaCO₂ ${d.pco2} < expected ${low.toFixed(1)}-${high.toFixed(1)}: additional respiratory alkalosis`
      else if (d.pco2 > high) compensationNote = `PaCO₂ ${d.pco2} > expected ${low.toFixed(1)}-${high.toFixed(1)}: additional respiratory acidosis`
      else compensationNote = `PaCO₂ appropriately compensated (expected: ${low.toFixed(1)}-${high.toFixed(1)})`
    }
  }

  const aaGradient =
    d.fio2 != null && d.pco2 != null && d.pao2 != null
      ? calcAaGradient(d.fio2, d.pco2, d.pao2)
      : null

  const normalAa = d.patientAge != null ? d.patientAge / 4 + 4 : null

  const pfRatio =
    d.pao2 != null && d.fio2 != null && d.fio2 > 0
      ? calcPFRatio(d.pao2, d.fio2)
      : null

  const inputCls =
    'w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'

  const disorderColor =
    interpretation == null
      ? ''
      : interpretation.disorder === 'Normal'
      ? 'text-green-700 dark:text-green-400'
      : 'text-red-700 dark:text-red-400'

  const fields: Array<[keyof ABGData, string, string]> = [
    ['ph', 'pH', '7.35–7.45'],
    ['pco2', 'PaCO₂ (mmHg)', '35–45'],
    ['pao2', 'PaO₂ (mmHg)', '80–100'],
    ['hco3', 'HCO₃ (mEq/L)', '22–26'],
    ['spo2', 'SpO₂ (%)', '≥95'],
    ['fio2', 'FiO₂ (%)', '21–100'],
    ['patientAge', 'Patient Age (yr)', ''],
  ]

  return (
    <div className="p-3 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">ABG Interpreter</h3>

      <div className="space-y-2">
        {fields.map(([field, label, hint]) => (
          <div key={field} className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-36 shrink-0">
              {label}
              {hint && <span className="ml-1 text-gray-400">({hint})</span>}
            </label>
            <input
              type="number"
              step="any"
              className={inputCls}
              value={(d[field] as number | undefined) ?? ''}
              onChange={set(field)}
              readOnly={!isLive}
            />
          </div>
        ))}
      </div>

      {/* Interpretation */}
      {interpretation && (
        <div className="rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Interpretation</p>
          <p className={`font-semibold text-sm ${disorderColor}`}>
            {interpretation.disorder === 'Normal'
              ? 'Normal acid-base'
              : `${interpretation.type} ${interpretation.disorder}`}
          </p>
          {compensationNote && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{compensationNote}</p>
          )}
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">A-a Gradient</span>
              <span className="font-mono">
                {aaGradient != null
                  ? `${aaGradient.toFixed(1)} mmHg${normalAa != null ? ` (normal ≤${normalAa.toFixed(0)})` : ''}`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">P/F Ratio</span>
              <span className="font-mono">
                {pfRatio != null ? pfRatio.toFixed(0) : '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs italic text-gray-400 mt-1">{CITATION_WINTERS}</p>
      <p className="text-xs italic text-gray-400">{CITATION_AA}</p>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/pulm/abg-interpreter/Editor.tsx`:

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => (
  <div className="p-3 text-sm text-gray-600 dark:text-gray-400">
    <p>No additional configuration for ABG Interpreter.</p>
    <p className="mt-1 text-xs text-gray-400">All fields and interpretations are displayed by default.</p>
  </div>
)
```

- [ ] Create `src/modules/packs/pulm/abg-interpreter/PrintView.tsx`:

```tsx
import type { FC } from 'react'
import {
  CITATION_WINTERS,
  CITATION_AA,
  interpretABG,
  calcAaGradient,
  calcPFRatio,
} from './index'

interface ABGData {
  ph: number; pco2: number; pao2: number; hco3: number; spo2: number; fio2: number; patientAge: number
}
interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Partial<ABGData>
  const interpretation = d.ph != null && d.pco2 != null && d.hco3 != null
    ? interpretABG(d.ph, d.pco2, d.hco3)
    : null
  const aaGradient = d.fio2 != null && d.pco2 != null && d.pao2 != null
    ? calcAaGradient(d.fio2, d.pco2, d.pao2)
    : null
  const pfRatio = d.pao2 != null && d.fio2 != null && d.fio2 > 0
    ? calcPFRatio(d.pao2, d.fio2)
    : null

  const rows: [string, string][] = [
    ['pH', d.ph?.toString() ?? '—'],
    ['PaCO₂', d.pco2 != null ? `${d.pco2} mmHg` : '—'],
    ['PaO₂', d.pao2 != null ? `${d.pao2} mmHg` : '—'],
    ['HCO₃', d.hco3 != null ? `${d.hco3} mEq/L` : '—'],
    ['SpO₂', d.spo2 != null ? `${d.spo2}%` : '—'],
    ['FiO₂', d.fio2 != null ? `${d.fio2}%` : '—'],
    ['Interpretation', interpretation ? (interpretation.disorder === 'Normal' ? 'Normal' : `${interpretation.type} ${interpretation.disorder}`) : '—'],
    ['A-a Gradient', aaGradient != null ? `${aaGradient.toFixed(1)} mmHg` : '—'],
    ['P/F Ratio', pfRatio != null ? pfRatio.toFixed(0) : '—'],
  ]

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
      <h4 style={{ marginBottom: 6, fontWeight: 600 }}>ABG Interpretation</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '3px 6px', color: '#6b7280', width: '50%' }}>{label}</td>
              <td style={{ padding: '3px 6px', fontWeight: 500 }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color: '#9ca3af', fontSize: 10, fontStyle: 'italic', marginTop: 4 }}>{CITATION_WINTERS}</p>
      <p style={{ color: '#9ca3af', fontSize: 10, fontStyle: 'italic' }}>{CITATION_AA}</p>
    </div>
  )
}
```

- [ ] Update `src/modules/packs/pulm/index.ts` to add abg-interpreter:

```ts
import type { ModulePlugin } from '../../../core/plugin/types'
import ventSettingsPlugin from './vent-settings/index'
import abgInterpreterPlugin from './abg-interpreter/index'

const pulmPack: ModulePlugin[] = [
  ventSettingsPlugin,
  abgInterpreterPlugin,
]

export default pulmPack
```

### Step 4 — Run test expecting PASS

- [ ] Run:
```bash
npx vitest run src/modules/packs/pulm/abg-interpreter/abg-interpreter.test.tsx
```
All tests must pass.

### Step 5 — Commit

- [ ] Commit:
```bash
git -C ~/projects/patient-templates add src/modules/packs/pulm/
git -C ~/projects/patient-templates commit -m "feat(pulm): add abg-interpreter module with acid-base interpretation"
```

---

## Task 3: `respiratory-scores` module

**Goal:** CURB-65 score and Berlin ARDS Criteria with evidence citations.

### Step 1 — Write the failing test

- [ ] Create `src/modules/packs/pulm/respiratory-scores/respiratory-scores.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcCURB65 } from './index'
import { Renderer } from './Renderer'

describe('calcCURB65', () => {
  it('score 0 for no items', () => {
    expect(calcCURB65([false, false, false, false, false])).toBe(0)
  })

  it('score 5 for all items', () => {
    expect(calcCURB65([true, true, true, true, true])).toBe(5)
  })

  it('score 2 for two items', () => {
    expect(calcCURB65([true, false, true, false, false])).toBe(2)
  })
})

describe('respiratory-scores Renderer', () => {
  const defaultData = {
    curb65: [false, false, false, false, false],
    berlinOnset: false,
    berlinRadio: false,
    berlinNotCardiac: false,
    pf: 250,
    peep: 5,
  }

  it('renders CURB-65 heading', () => {
    render(
      <Renderer
        instanceId="rs-1"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/CURB-65/i)).toBeDefined()
  })

  it('renders Berlin ARDS heading', () => {
    render(
      <Renderer
        instanceId="rs-2"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Berlin/i)).toBeDefined()
  })

  it('shows low risk for CURB-65 score 0', () => {
    render(
      <Renderer
        instanceId="rs-3"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/low/i)).toBeDefined()
  })

  it('shows severe risk for CURB-65 score ≥3', () => {
    render(
      <Renderer
        instanceId="rs-4"
        config={{}}
        data={{ ...defaultData, curb65: [true, true, true, false, false] }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/severe/i)).toBeDefined()
  })

  it('shows Berlin mild ARDS when all criteria met and PF 200-300', () => {
    render(
      <Renderer
        instanceId="rs-5"
        config={{}}
        data={{
          ...defaultData,
          berlinOnset: true,
          berlinRadio: true,
          berlinNotCardiac: true,
          pf: 250,
          peep: 5,
        }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/mild/i)).toBeDefined()
  })

  it('shows Berlin severe ARDS when PF < 100', () => {
    render(
      <Renderer
        instanceId="rs-6"
        config={{}}
        data={{
          ...defaultData,
          berlinOnset: true,
          berlinRadio: true,
          berlinNotCardiac: true,
          pf: 80,
          peep: 5,
        }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/severe/i)).toBeDefined()
  })

  it('displays CURB-65 citation', () => {
    render(
      <Renderer
        instanceId="rs-7"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Lim WS/i)).toBeDefined()
  })

  it('displays Berlin citation', () => {
    render(
      <Renderer
        instanceId="rs-8"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/ARDS Definition Task Force/i)).toBeDefined()
  })
})
```

### Step 2 — Run test expecting FAIL

- [ ] Run:
```bash
npx vitest run src/modules/packs/pulm/respiratory-scores/respiratory-scores.test.tsx
```
Confirm failure.

### Step 3 — Implement all module files

- [ ] Create `src/modules/packs/pulm/respiratory-scores/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const CITATION_CURB65 = 'Lim WS et al. Thorax. 2003;58(5):377-382'
export const CITATION_BERLIN = 'ARDS Definition Task Force. JAMA. 2012;307(23):2526-2533'

/**
 * CURB-65 score — one point per criterion (max 5)
 * items[0] = Confusion, [1] = BUN >19, [2] = RR ≥30, [3] = SBP <90 or DBP ≤60, [4] = Age ≥65
 */
export function calcCURB65(items: boolean[]): number {
  return items.filter(Boolean).length
}

export function curb65Risk(score: number): { label: string; recommendation: string } {
  if (score <= 1) return { label: 'Low', recommendation: 'Consider outpatient treatment' }
  if (score === 2) return { label: 'Moderate', recommendation: 'Short inpatient stay or supervised outpatient' }
  return { label: 'Severe', recommendation: 'Inpatient; consider ICU if score 4-5' }
}

export function berlinClassify(pf: number, peep: number): string | null {
  if (peep < 5) return null // PEEP requirement not met
  if (pf > 300) return null // Not ARDS
  if (pf > 200) return 'Mild'
  if (pf > 100) return 'Moderate'
  return 'Severe'
}

const respiratoryScoresPlugin: ModulePlugin = {
  meta: {
    id: 'respiratory-scores',
    name: 'Respiratory Scores',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'CURB-65 pneumonia severity and Berlin ARDS classification.',
    tags: ['critical-care', 'pulmonology', 'pneumonia', 'ards', 'scoring'],
    pack: 'pulm',
  },
  schema: {
    config: {},
    data: {
      curb65: { type: 'array' },
      berlinOnset: { type: 'boolean' },
      berlinRadio: { type: 'boolean' },
      berlinNotCardiac: { type: 'boolean' },
      pf: { type: 'number' },
      peep: { type: 'number' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default respiratoryScoresPlugin
```

- [ ] Create `src/modules/packs/pulm/respiratory-scores/Renderer.tsx`:

```tsx
import type { FC } from 'react'
import {
  CITATION_CURB65,
  CITATION_BERLIN,
  calcCURB65,
  curb65Risk,
  berlinClassify,
} from './index'

interface RSData {
  curb65: boolean[]
  berlinOnset: boolean
  berlinRadio: boolean
  berlinNotCardiac: boolean
  pf: number
  peep: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const CURB65_LABELS = [
  'Confusion (new onset)',
  'BUN >19 mg/dL (>7 mmol/L)',
  'Respiratory Rate ≥30 br/min',
  'SBP <90 or DBP ≤60 mmHg',
  'Age ≥65 years',
]

const riskColor: Record<string, string> = {
  Low: 'text-green-700 dark:text-green-400',
  Moderate: 'text-amber-700 dark:text-amber-400',
  Severe: 'text-red-700 dark:text-red-400',
}

const berlinColor: Record<string, string> = {
  Mild: 'text-amber-600 dark:text-amber-400',
  Moderate: 'text-orange-700 dark:text-orange-400',
  Severe: 'text-red-700 dark:text-red-400',
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Partial<RSData>
  const isLive = mode === 'live'
  const curb = (d.curb65 ?? [false, false, false, false, false]) as boolean[]

  const toggleCurb = (i: number) => {
    if (!isLive) return
    const next = [...curb]
    next[i] = !next[i]
    onDataChange({ ...data, curb65: next })
  }

  const score = calcCURB65(curb)
  const risk = curb65Risk(score)

  const allBerlinMet = !!(d.berlinOnset && d.berlinRadio && d.berlinNotCardiac)
  const berlinGrade =
    allBerlinMet && d.pf != null && d.peep != null
      ? berlinClassify(d.pf, d.peep)
      : null

  const setBoolean = (field: keyof RSData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLive) return
    onDataChange({ ...data, [field]: e.target.checked })
  }

  const setNumber = (field: keyof RSData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({ ...data, [field]: Number(e.target.value) })
  }

  const inputCls = 'w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm'

  return (
    <div className="p-3 space-y-4">
      {/* CURB-65 */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">CURB-65</h3>
        <div className="space-y-1">
          {CURB65_LABELS.map((label, i) => (
            <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600"
                checked={curb[i] ?? false}
                onChange={() => toggleCurb(i)}
                disabled={!isLive}
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
            <span className="font-mono font-bold text-lg">{score} / 5</span>
          </div>
          <p className={`font-semibold text-sm mt-1 ${riskColor[risk.label]}`}>{risk.label} risk</p>
          <p className="text-xs text-gray-500 mt-0.5">{risk.recommendation}</p>
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_CURB65}</p>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Berlin ARDS */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">Berlin ARDS Criteria</h3>
        <div className="space-y-1 mb-2">
          {[
            ['berlinOnset', 'Onset within 1 week of insult or new/worsening respiratory symptoms'] as const,
            ['berlinRadio', 'Bilateral opacities on CXR/CT (not explained by effusions/collapse/nodules)'] as const,
            ['berlinNotCardiac', 'Respiratory failure not explained by cardiac failure/fluid overload'] as const,
          ].map(([field, label]) => (
            <label key={field} className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-gray-300 text-blue-600"
                checked={(d[field] as boolean | undefined) ?? false}
                onChange={setBoolean(field)}
                disabled={!isLive}
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <label className="text-xs text-gray-500 w-36 shrink-0">P/F Ratio (mmHg)</label>
          <input type="number" className={inputCls} value={d.pf ?? ''} onChange={setNumber('pf')} readOnly={!isLive} />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs text-gray-500 w-36 shrink-0">PEEP (cmH₂O)</label>
          <input type="number" className={inputCls} value={d.peep ?? ''} onChange={setNumber('peep')} readOnly={!isLive} />
        </div>

        <div className="rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2">
          {!allBerlinMet ? (
            <p className="text-sm text-gray-500">All 3 criteria must be met to classify ARDS severity.</p>
          ) : berlinGrade == null ? (
            <p className="text-sm text-gray-500">
              {d.peep != null && d.peep < 5
                ? 'PEEP <5 cmH₂O: Berlin classification requires PEEP ≥5'
                : 'P/F ratio >300: does not meet Berlin ARDS threshold'}
            </p>
          ) : (
            <p className={`font-bold text-base ${berlinColor[berlinGrade]}`}>Berlin ARDS: {berlinGrade}</p>
          )}
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_BERLIN}</p>
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/pulm/respiratory-scores/Editor.tsx`:

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => (
  <div className="p-3 text-sm text-gray-600 dark:text-gray-400">
    <p>No additional configuration for Respiratory Scores.</p>
  </div>
)
```

- [ ] Create `src/modules/packs/pulm/respiratory-scores/PrintView.tsx`:

```tsx
import type { FC } from 'react'
import { CITATION_CURB65, CITATION_BERLIN, calcCURB65, curb65Risk, berlinClassify } from './index'

const CURB65_LABELS = [
  'Confusion', 'BUN >19 mg/dL', 'RR ≥30', 'SBP <90 or DBP ≤60', 'Age ≥65',
]

interface RSData {
  curb65: boolean[]; berlinOnset: boolean; berlinRadio: boolean; berlinNotCardiac: boolean; pf: number; peep: number
}
interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Partial<RSData>
  const curb = (d.curb65 ?? []) as boolean[]
  const score = calcCURB65(curb)
  const risk = curb65Risk(score)
  const allBerlin = !!(d.berlinOnset && d.berlinRadio && d.berlinNotCardiac)
  const berlinGrade = allBerlin && d.pf != null && d.peep != null ? berlinClassify(d.pf, d.peep) : null

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
      <h4 style={{ fontWeight: 600, marginBottom: 4 }}>CURB-65</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4 }}>
        <tbody>
          {CURB65_LABELS.map((label, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '2px 6px', color: '#6b7280' }}>{label}</td>
              <td style={{ padding: '2px 6px', fontWeight: 500 }}>{curb[i] ? 'Yes (+1)' : 'No'}</td>
            </tr>
          ))}
          <tr>
            <td style={{ padding: '2px 6px', fontWeight: 600 }}>Score</td>
            <td style={{ padding: '2px 6px', fontWeight: 700 }}>{score} / 5 — {risk.label} risk</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: 10, fontStyle: 'italic', color: '#9ca3af', marginBottom: 8 }}>{CITATION_CURB65}</p>

      <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Berlin ARDS Criteria</h4>
      <p style={{ marginBottom: 2 }}>
        Onset criteria: {d.berlinOnset ? 'Met' : 'Not met'} |{' '}
        Radiologic: {d.berlinRadio ? 'Met' : 'Not met'} |{' '}
        Non-cardiac: {d.berlinNotCardiac ? 'Met' : 'Not met'}
      </p>
      <p style={{ marginBottom: 2 }}>
        P/F: {d.pf ?? '—'} | PEEP: {d.peep ?? '—'} cmH₂O
      </p>
      <p style={{ fontWeight: 700 }}>
        Classification: {berlinGrade ?? (allBerlin ? 'Does not meet ARDS threshold' : 'Criteria not met')}
      </p>
      <p style={{ fontSize: 10, fontStyle: 'italic', color: '#9ca3af', marginTop: 4 }}>{CITATION_BERLIN}</p>
    </div>
  )
}
```

- [ ] Update `src/modules/packs/pulm/index.ts`:

```ts
import type { ModulePlugin } from '../../../core/plugin/types'
import ventSettingsPlugin from './vent-settings/index'
import abgInterpreterPlugin from './abg-interpreter/index'
import respiratoryScoresPlugin from './respiratory-scores/index'

const pulmPack: ModulePlugin[] = [
  ventSettingsPlugin,
  abgInterpreterPlugin,
  respiratoryScoresPlugin,
]

export default pulmPack
```

### Step 4 — Run test expecting PASS

- [ ] Run:
```bash
npx vitest run src/modules/packs/pulm/respiratory-scores/respiratory-scores.test.tsx
```
All tests must pass.

### Step 5 — Commit

- [ ] Commit:
```bash
git -C ~/projects/patient-templates add src/modules/packs/pulm/
git -C ~/projects/patient-templates commit -m "feat(pulm): add respiratory-scores module (CURB-65 + Berlin ARDS)"
```

---

## Task 4: `weaning-readiness` module

**Goal:** Daily wean readiness checklist, RSBI calculator, and SBT attempt log with Yang & Tobin citation.

### Step 1 — Write the failing test

- [ ] Create `src/modules/packs/pulm/weaning-readiness/weaning-readiness.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcRSBI } from './index'
import { Renderer } from './Renderer'

describe('calcRSBI', () => {
  it('divides RR by TV in liters', () => {
    // RSBI = RR / (TV_mL / 1000)
    expect(calcRSBI(20, 500)).toBe(40)       // 20 / 0.5 = 40
    expect(calcRSBI(30, 300)).toBeCloseTo(100) // 30 / 0.3 = 100
  })

  it('RSBI < 105 is favorable for extubation', () => {
    expect(calcRSBI(20, 500)).toBeLessThan(105)
  })

  it('RSBI >= 105 is unfavorable', () => {
    expect(calcRSBI(30, 200)).toBeGreaterThanOrEqual(105)
  })
})

describe('weaning-readiness Renderer', () => {
  const defaultData = {
    weanChecklist: {},
    rsbiRR: 18,
    rsbiTV: 450,
    sbtLog: [],
  }

  it('renders wean readiness checklist', () => {
    render(
      <Renderer
        instanceId="wr-1"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/FiO₂/i)).toBeDefined()
  })

  it('shows RSBI value', () => {
    render(
      <Renderer
        instanceId="wr-2"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // RSBI = 18 / (450/1000) = 40
    expect(screen.getByText('40.0')).toBeDefined()
  })

  it('shows favorable message when RSBI < 105', () => {
    render(
      <Renderer
        instanceId="wr-3"
        config={{}}
        data={{ ...defaultData, rsbiRR: 18, rsbiTV: 450 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/favorable/i)).toBeDefined()
  })

  it('shows unfavorable message when RSBI >= 105', () => {
    render(
      <Renderer
        instanceId="wr-4"
        config={{}}
        data={{ ...defaultData, rsbiRR: 30, rsbiTV: 200 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/unfavorable/i)).toBeDefined()
  })

  it('renders SBT log table', () => {
    const sbtLog = [
      { date: '2026-04-13', duration: 30, outcome: 'pass' as const, reason: '' },
    ]
    render(
      <Renderer
        instanceId="wr-5"
        config={{}}
        data={{ ...defaultData, sbtLog }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText('2026-04-13')).toBeDefined()
    expect(screen.getByText(/pass/i)).toBeDefined()
  })

  it('displays Yang & Tobin citation', () => {
    render(
      <Renderer
        instanceId="wr-6"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Yang KL/i)).toBeDefined()
  })
})
```

### Step 2 — Run test expecting FAIL

- [ ] Run:
```bash
npx vitest run src/modules/packs/pulm/weaning-readiness/weaning-readiness.test.tsx
```
Confirm failure.

### Step 3 — Implement all module files

- [ ] Create `src/modules/packs/pulm/weaning-readiness/index.ts`:

```ts
import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const CITATION = 'Yang KL, Tobin MJ. NEJM. 1991;324(21):1445-1450'

/**
 * Rapid Shallow Breathing Index = RR / (TV in liters)
 * RSBI < 105 predicts successful extubation (70% sensitivity)
 */
export function calcRSBI(rr: number, tvMl: number): number {
  return rr / (tvMl / 1000)
}

export const WEAN_CHECKLIST_ITEMS: Array<{ key: string; label: string }> = [
  { key: 'oxygenation', label: 'Oxygenation adequate: FiO₂ ≤40% and SpO₂ ≥88-92%' },
  { key: 'peep', label: 'PEEP ≤5-8 cmH₂O' },
  { key: 'hemodynamics', label: 'Hemodynamically stable (no/minimal vasopressors)' },
  { key: 'drive', label: 'Adequate respiratory drive' },
  { key: 'neuro', label: 'GCS ≥8 or following commands' },
  { key: 'secretions', label: 'Secretions manageable (able to cough)' },
  { key: 'cause', label: 'Cause of respiratory failure improving' },
]

const weaningReadinessPlugin: ModulePlugin = {
  meta: {
    id: 'weaning-readiness',
    name: 'Weaning Readiness',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Daily wean readiness screen, RSBI calculator, and SBT attempt log.',
    tags: ['critical-care', 'pulmonology', 'ventilator', 'weaning', 'extubation'],
    pack: 'pulm',
  },
  schema: {
    config: {},
    data: {
      weanChecklist: { type: 'object' },
      rsbiRR: { type: 'number' },
      rsbiTV: { type: 'number' },
      sbtLog: { type: 'array' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 6 },
  Renderer,
  Editor,
  PrintView,
}

export default weaningReadinessPlugin
```

- [ ] Create `src/modules/packs/pulm/weaning-readiness/Renderer.tsx`:

```tsx
import type { FC } from 'react'
import { CITATION, WEAN_CHECKLIST_ITEMS, calcRSBI } from './index'

interface SBTEntry {
  date: string
  duration: number
  outcome: 'pass' | 'fail'
  reason: string
}

interface WeanData {
  weanChecklist: Record<string, boolean>
  rsbiRR: number
  rsbiTV: number
  sbtLog: SBTEntry[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Partial<WeanData>
  const isLive = mode === 'live'
  const checklist = d.weanChecklist ?? {}
  const sbtLog = (d.sbtLog ?? []) as SBTEntry[]

  const toggleCheck = (key: string) => {
    if (!isLive) return
    onDataChange({ ...data, weanChecklist: { ...checklist, [key]: !checklist[key] } })
  }

  const rsbi =
    d.rsbiRR != null && d.rsbiTV != null && d.rsbiTV > 0
      ? calcRSBI(d.rsbiRR, d.rsbiTV)
      : null

  const rsbiGood = rsbi != null && rsbi < 105

  const setNum = (field: keyof WeanData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({ ...data, [field]: Number(e.target.value) })
  }

  const addSBT = () => {
    if (!isLive) return
    const entry: SBTEntry = {
      date: new Date().toISOString().slice(0, 10),
      duration: 0,
      outcome: 'pass',
      reason: '',
    }
    onDataChange({ ...data, sbtLog: [...sbtLog, entry] })
  }

  const updateSBT = (i: number, patch: Partial<SBTEntry>) => {
    const next = sbtLog.map((e, idx) => (idx === i ? { ...e, ...patch } : e))
    onDataChange({ ...data, sbtLog: next })
  }

  const removeSBT = (i: number) => {
    onDataChange({ ...data, sbtLog: sbtLog.filter((_, idx) => idx !== i) })
  }

  const inputCls =
    'rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm'

  const passedAll = WEAN_CHECKLIST_ITEMS.every((item) => checklist[item.key])

  return (
    <div className="p-3 space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Weaning Readiness</h3>

      {/* Wean Checklist */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Daily Wean Screen</p>
        <div className="space-y-1">
          {WEAN_CHECKLIST_ITEMS.map(({ key, label }) => (
            <label key={key} className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-gray-300 text-blue-600"
                checked={checklist[key] ?? false}
                onChange={() => toggleCheck(key)}
                disabled={!isLive}
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
        {passedAll && (
          <div className="mt-2 rounded bg-green-50 border border-green-300 px-3 py-1 text-sm text-green-800">
            All wean criteria met — consider SBT
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* RSBI */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">RSBI (Rapid Shallow Breathing Index)</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-32 shrink-0">RR (br/min)</label>
            <input type="number" className={inputCls} value={d.rsbiRR ?? ''} onChange={setNum('rsbiRR')} readOnly={!isLive} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-32 shrink-0">Tidal Volume (mL)</label>
            <input type="number" className={inputCls} value={d.rsbiTV ?? ''} onChange={setNum('rsbiTV')} readOnly={!isLive} />
          </div>
        </div>
        {rsbi != null && (
          <div className={`mt-2 rounded border px-3 py-2 ${rsbiGood ? 'bg-green-50 border-green-300 text-green-800' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
            <span className="font-bold text-base">{rsbi.toFixed(1)}</span>
            <span className="ml-2 text-sm">
              {rsbiGood ? 'Favorable for extubation (<105)' : 'Unfavorable for extubation (≥105)'}
            </span>
          </div>
        )}
        <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* SBT Log */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SBT Log</p>
          {isLive && (
            <button
              onClick={addSBT}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add SBT
            </button>
          )}
        </div>
        {sbtLog.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No SBT attempts recorded.</p>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-1 pr-2">Date</th>
                <th className="pb-1 pr-2">Duration (min)</th>
                <th className="pb-1 pr-2">Outcome</th>
                <th className="pb-1 pr-2">Reason if fail</th>
                {isLive && <th className="pb-1"></th>}
              </tr>
            </thead>
            <tbody>
              {sbtLog.map((entry, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-1 pr-2">
                    {isLive ? (
                      <input
                        type="date"
                        className={inputCls + ' w-28'}
                        value={entry.date}
                        onChange={(e) => updateSBT(i, { date: e.target.value })}
                      />
                    ) : entry.date}
                  </td>
                  <td className="py-1 pr-2">
                    {isLive ? (
                      <input
                        type="number"
                        className={inputCls + ' w-16'}
                        value={entry.duration}
                        onChange={(e) => updateSBT(i, { duration: Number(e.target.value) })}
                      />
                    ) : entry.duration}
                  </td>
                  <td className="py-1 pr-2">
                    {isLive ? (
                      <select
                        className={inputCls}
                        value={entry.outcome}
                        onChange={(e) => updateSBT(i, { outcome: e.target.value as 'pass' | 'fail' })}
                      >
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                      </select>
                    ) : (
                      <span className={entry.outcome === 'pass' ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                        {entry.outcome}
                      </span>
                    )}
                  </td>
                  <td className="py-1 pr-2">
                    {isLive ? (
                      <input
                        type="text"
                        className={inputCls + ' w-full'}
                        value={entry.reason}
                        placeholder="—"
                        onChange={(e) => updateSBT(i, { reason: e.target.value })}
                        disabled={entry.outcome === 'pass'}
                      />
                    ) : entry.reason || '—'}
                  </td>
                  {isLive && (
                    <td className="py-1">
                      <button
                        onClick={() => removeSBT(i)}
                        className="text-red-400 hover:text-red-600 text-xs"
                        aria-label="Remove SBT entry"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] Create `src/modules/packs/pulm/weaning-readiness/Editor.tsx`:

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => (
  <div className="p-3 text-sm text-gray-600 dark:text-gray-400">
    <p>No additional configuration for Weaning Readiness.</p>
    <p className="mt-1 text-xs text-gray-400">All checklist items, RSBI, and SBT log are displayed by default.</p>
  </div>
)
```

- [ ] Create `src/modules/packs/pulm/weaning-readiness/PrintView.tsx`:

```tsx
import type { FC } from 'react'
import { CITATION, WEAN_CHECKLIST_ITEMS, calcRSBI } from './index'

interface SBTEntry { date: string; duration: number; outcome: 'pass' | 'fail'; reason: string }
interface WeanData { weanChecklist: Record<string, boolean>; rsbiRR: number; rsbiTV: number; sbtLog: SBTEntry[] }
interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Partial<WeanData>
  const checklist = d.weanChecklist ?? {}
  const sbtLog = (d.sbtLog ?? []) as SBTEntry[]
  const rsbi = d.rsbiRR != null && d.rsbiTV != null && d.rsbiTV > 0
    ? calcRSBI(d.rsbiRR, d.rsbiTV)
    : null

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
      <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Weaning Readiness</h4>

      <p style={{ fontWeight: 600, marginBottom: 2 }}>Daily Wean Screen</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 6 }}>
        <tbody>
          {WEAN_CHECKLIST_ITEMS.map(({ key, label }) => (
            <tr key={key} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '2px 6px', color: '#6b7280' }}>{label}</td>
              <td style={{ padding: '2px 6px', fontWeight: 500 }}>{checklist[key] ? '✓' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontWeight: 600, marginBottom: 2 }}>RSBI</p>
      <p style={{ marginBottom: 2 }}>
        RR: {d.rsbiRR ?? '—'} br/min | TV: {d.rsbiTV ?? '—'} mL
      </p>
      {rsbi != null && (
        <p style={{ fontWeight: 700, marginBottom: 2 }}>
          RSBI: {rsbi.toFixed(1)} — {rsbi < 105 ? 'Favorable (<105)' : 'Unfavorable (≥105)'}
        </p>
      )}
      <p style={{ fontSize: 10, fontStyle: 'italic', color: '#9ca3af', marginBottom: 8 }}>{CITATION}</p>

      {sbtLog.length > 0 && (
        <>
          <p style={{ fontWeight: 600, marginBottom: 2 }}>SBT Log</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #d1d5db' }}>
                {['Date', 'Duration (min)', 'Outcome', 'Reason'].map((h) => (
                  <th key={h} style={{ padding: '2px 6px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sbtLog.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '2px 6px' }}>{e.date}</td>
                  <td style={{ padding: '2px 6px' }}>{e.duration}</td>
                  <td style={{ padding: '2px 6px', fontWeight: 600, color: e.outcome === 'pass' ? '#16a34a' : '#dc2626' }}>{e.outcome}</td>
                  <td style={{ padding: '2px 6px', color: '#6b7280' }}>{e.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
```

- [ ] Update `src/modules/packs/pulm/index.ts` to the final version:

```ts
import type { ModulePlugin } from '../../../core/plugin/types'
import ventSettingsPlugin from './vent-settings/index'
import abgInterpreterPlugin from './abg-interpreter/index'
import respiratoryScoresPlugin from './respiratory-scores/index'
import weaningReadinessPlugin from './weaning-readiness/index'

const pulmPack: ModulePlugin[] = [
  ventSettingsPlugin,
  abgInterpreterPlugin,
  respiratoryScoresPlugin,
  weaningReadinessPlugin,
]

export default pulmPack
```

### Step 4 — Run test expecting PASS

- [ ] Run:
```bash
npx vitest run src/modules/packs/pulm/weaning-readiness/weaning-readiness.test.tsx
```
All tests must pass.

### Step 5 — Run full pack test suite

- [ ] Run the full pack to confirm no regressions:
```bash
npx vitest run src/modules/packs/pulm/
```
All tests across all 4 modules must pass.

### Step 6 — Commit

- [ ] Commit:
```bash
git -C ~/projects/patient-templates add src/modules/packs/pulm/
git -C ~/projects/patient-templates commit -m "feat(pulm): add weaning-readiness module with RSBI and SBT log"
```

---

## Verification Checklist

Before marking this plan complete, confirm:

- [ ] `npx vitest run src/modules/packs/pulm/` — all tests pass (4 modules, zero failures)
- [ ] `src/modules/packs/pulm/index.ts` exports all 4 plugins in an array
- [ ] Every module file exports a `CITATION` constant and renders it in the `Renderer` via `<p className="text-xs italic text-gray-400 mt-1">`
- [ ] `calcDrivingPressure`, `calcPFRatio`, `calcTVperIBW` exported from `vent-settings/index.ts`
- [ ] `interpretABG`, `calcAaGradient`, `calcPFRatio` exported from `abg-interpreter/index.ts`
- [ ] `calcCURB65` exported from `respiratory-scores/index.ts`
- [ ] `calcRSBI` exported from `weaning-readiness/index.ts`
- [ ] ARDSnet amber warning fires when TV/IBW > 6 mL/kg in vent-settings
- [ ] Berlin ARDS classification requires all 3 criteria met AND PEEP ≥5
- [ ] All 4 modules have `pack: 'pulm'` in their `meta`

---

## Citations Reference

| Module | Citation |
|---|---|
| vent-settings | ARDSNet: Ventilation with lower tidal volumes. NEJM. 2000;342(18):1301-1308 |
| abg-interpreter (Winter's) | Albert MS et al. Ann Intern Med. 1967;66(2):312-322 |
| abg-interpreter (A-a gradient) | Standard respiratory physiology formula |
| respiratory-scores (CURB-65) | Lim WS et al. Thorax. 2003;58(5):377-382 |
| respiratory-scores (Berlin ARDS) | ARDS Definition Task Force. JAMA. 2012;307(23):2526-2533 |
| weaning-readiness (RSBI) | Yang KL, Tobin MJ. NEJM. 1991;324(21):1445-1450 |
