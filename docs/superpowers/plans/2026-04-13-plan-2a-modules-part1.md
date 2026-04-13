# Patient Template Builder — Plan 2a: Core Modules (Part 1 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the first 7 of 14 first-party core modules using the plugin interface established in Plan 1.

**Architecture:** Each module is a self-contained directory exporting a ModulePlugin object with Renderer, Editor, and PrintView React components. All modules are registered with the global PluginRegistry on app startup via src/modules/index.ts.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/modules/
├── index.ts
├── patient-header/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── patient-header.test.tsx
├── vitals/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── vitals.test.tsx
├── labs-panel/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── labs-panel.test.tsx
├── labs-fishbone/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── labs-fishbone.test.tsx
├── assessment-plan/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── assessment-plan.test.tsx
├── medications/
│   ├── index.ts
│   ├── Renderer.tsx
│   ├── Editor.tsx
│   ├── PrintView.tsx
│   └── medications.test.tsx
└── intake-output/
    ├── index.ts
    ├── Renderer.tsx
    ├── Editor.tsx
    ├── PrintView.tsx
    └── intake-output.test.tsx
```

---

## Task 0: Bootstrap index.ts and wire main.tsx

**Files:**
- Create: `src/modules/index.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create `src/modules/index.ts`**

```ts
import { registry } from '../core/plugin/registry'
import { patientHeaderPlugin } from './patient-header'
import { vitalsPlugin } from './vitals'
import { labsPanelPlugin } from './labs-panel'
import { labsFishbonePlugin } from './labs-fishbone'
import { assessmentPlanPlugin } from './assessment-plan'
import { medicationsPlugin } from './medications'
import { intakeOutputPlugin } from './intake-output'

// Plan 2b will add the remaining 7 modules and register them here
registry.register(patientHeaderPlugin)
registry.register(vitalsPlugin)
registry.register(labsPanelPlugin)
registry.register(labsFishbonePlugin)
registry.register(assessmentPlanPlugin)
registry.register(medicationsPlugin)
registry.register(intakeOutputPlugin)
```

- [ ] **Step 2: Add modules import to `src/main.tsx`**

Add `import './modules/index'` after the existing imports in `src/main.tsx`. The file should look like:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import './modules/index'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 3: Git commit**

```bash
cd ~/projects/patient-templates
git add src/modules/index.ts src/main.tsx
git commit -m "feat: add modules index bootstrap and wire to main.tsx"
```

---

## Task 1: patient-header module

**Files:**
- `src/modules/patient-header/index.ts`
- `src/modules/patient-header/Renderer.tsx`
- `src/modules/patient-header/Editor.tsx`
- `src/modules/patient-header/PrintView.tsx`
- `src/modules/patient-header/patient-header.test.tsx`

- [ ] **Step 1: Write test file (run first — expect fail)**

```tsx
// src/modules/patient-header/patient-header.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { patientHeaderPlugin } from './index'

const defaultConfig = patientHeaderPlugin.defaultConfig
const emptyData = {}

describe('patient-header Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="test-1"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows field values when data provided', () => {
    render(
      <Renderer
        instanceId="test-2"
        config={defaultConfig}
        data={{ room: '4B', patient: 'J.D.', age: 45, sex: 'M' }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('4B')).toBeInTheDocument()
    expect(screen.getByDisplayValue('J.D.')).toBeInTheDocument()
  })

  it('shows placeholder values in build mode', () => {
    render(
      <Renderer
        instanceId="test-3"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getByPlaceholderText('Room')).toBeInTheDocument()
  })
})

describe('patient-header PrintView', () => {
  it('renders without crashing', () => {
    render(<PrintView config={defaultConfig} data={{ room: '4B', patient: 'J.D.' }} />)
  })
})
```

Run: `npx vitest run src/modules/patient-header/patient-header.test.tsx` — expect failure (module not yet implemented).

- [ ] **Step 2: Write `src/modules/patient-header/Renderer.tsx`**

```tsx
import { useState, useCallback } from 'react'
import type { FC } from 'react'

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const CODE_STATUS_OPTIONS = ['Full Code', 'DNR', 'DNI', 'DNR-DNI']
const SEX_OPTIONS = ['M', 'F', 'Other']
const ISOLATION_OPTIONS = ['None', 'Contact', 'Droplet', 'Airborne', 'Contact+Droplet']

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const cfg = config as {
    showRoom?: boolean; showPatient?: boolean; showAge?: boolean; showSex?: boolean
    showAdmitDate?: boolean; showAttending?: boolean; showService?: boolean
    showDiagnosis?: boolean; showCodeStatus?: boolean; showIsolation?: boolean
    customLabels?: Array<{ name: string }>
  }

  const handleChange = useCallback(
    (field: string, value: unknown) => {
      onDataChange({ ...data, [field]: value })
    },
    [data, onDataChange]
  )

  const isLive = mode === 'live'

  const textField = (field: string, label: string, type = 'text') =>
    (cfg[`show${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof cfg] !== false) ? (
      <div key={field} className="flex flex-col min-w-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</span>
        <input
          type={type}
          placeholder={label}
          value={(data[field] as string) ?? ''}
          onChange={e => handleChange(field, e.target.value)}
          readOnly={!isLive}
          className="text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none py-0.5 min-w-0"
        />
      </div>
    ) : null

  const selectField = (field: string, label: string, options: string[]) =>
    (cfg[`show${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof cfg] !== false) ? (
      <div key={field} className="flex flex-col min-w-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</span>
        <select
          value={(data[field] as string) ?? ''}
          onChange={e => handleChange(field, e.target.value)}
          disabled={!isLive}
          className="text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none py-0.5"
        >
          <option value="">—</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    ) : null

  const customLabels = (cfg.customLabels ?? []) as Array<{ name: string }>

  return (
    <div className="p-2 flex flex-wrap gap-3 items-end bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
      {textField('room', 'Room')}
      {textField('patient', 'Patient')}
      {textField('age', 'Age', 'number')}
      {selectField('sex', 'Sex', SEX_OPTIONS)}
      {textField('admitDate', 'Admit Date', 'date')}
      {textField('attending', 'Attending')}
      {textField('service', 'Service')}
      {textField('diagnosis', 'Primary Dx')}
      {selectField('codeStatus', 'Code Status', CODE_STATUS_OPTIONS)}
      {cfg.showIsolation !== false && (
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Isolation</span>
          <select
            value={(data.isolation as string) ?? 'None'}
            onChange={e => handleChange('isolation', e.target.value)}
            disabled={!isLive}
            className="text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none py-0.5"
          >
            {ISOLATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}
      {customLabels.map((cl, i) =>
        cl.name ? (
          <div key={i} className="flex flex-col min-w-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{cl.name}</span>
            <input
              type="text"
              placeholder={cl.name}
              value={(data[`custom_${i}`] as string) ?? ''}
              onChange={e => handleChange(`custom_${i}`, e.target.value)}
              readOnly={!isLive}
              className="text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none py-0.5"
            />
          </div>
        ) : null
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/modules/patient-header/Editor.tsx`**

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const FIELDS = [
  { key: 'showRoom', label: 'Room' },
  { key: 'showPatient', label: 'Patient Label' },
  { key: 'showAge', label: 'Age' },
  { key: 'showSex', label: 'Sex' },
  { key: 'showAdmitDate', label: 'Admit Date' },
  { key: 'showAttending', label: 'Attending' },
  { key: 'showService', label: 'Service' },
  { key: 'showDiagnosis', label: 'Primary Diagnosis' },
  { key: 'showCodeStatus', label: 'Code Status' },
  { key: 'showIsolation', label: 'Isolation' },
]

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const toggle = (key: string) => {
    onConfigChange({ ...config, [key]: !(config[key] !== false) })
  }

  const customLabels = (config.customLabels as Array<{ name: string }>) ?? [{name:''},{name:''},{name:''}]

  const updateCustomLabel = (i: number, value: string) => {
    const next = [...customLabels]
    next[i] = { name: value }
    onConfigChange({ ...config, customLabels: next })
  }

  return (
    <div className="space-y-4 p-3">
      <div>
        <h3 className="text-sm font-semibold mb-2">Visible Fields</h3>
        <div className="space-y-1">
          {FIELDS.map(f => (
            <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config[f.key] !== false}
                onChange={() => toggle(f.key)}
                className="rounded"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Custom Label Fields (up to 3)</h3>
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <input
              key={i}
              type="text"
              placeholder={`Custom field ${i + 1} name`}
              value={customLabels[i]?.name ?? ''}
              onChange={e => updateCustomLabel(i, e.target.value)}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/modules/patient-header/PrintView.tsx`**

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ config, data }) => {
  const cfg = config as Record<string, unknown>
  const customLabels = (cfg.customLabels as Array<{ name: string }>) ?? []

  const fields: Array<{ label: string; value: unknown; show: boolean }> = [
    { label: 'Room', value: data.room, show: cfg.showRoom !== false },
    { label: 'Patient', value: data.patient, show: cfg.showPatient !== false },
    { label: 'Age', value: data.age, show: cfg.showAge !== false },
    { label: 'Sex', value: data.sex, show: cfg.showSex !== false },
    { label: 'Admit Date', value: data.admitDate, show: cfg.showAdmitDate !== false },
    { label: 'Attending', value: data.attending, show: cfg.showAttending !== false },
    { label: 'Service', value: data.service, show: cfg.showService !== false },
    { label: 'Primary Dx', value: data.diagnosis, show: cfg.showDiagnosis !== false },
    { label: 'Code Status', value: data.codeStatus, show: cfg.showCodeStatus !== false },
    { label: 'Isolation', value: data.isolation, show: cfg.showIsolation !== false },
    ...customLabels.map((cl, i) => ({ label: cl.name, value: data[`custom_${i}`], show: !!cl.name })),
  ]

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 p-2 border-b-2 border-gray-800 text-sm">
      {fields.filter(f => f.show && f.value).map(f => (
        <span key={f.label}>
          <strong>{f.label}:</strong> {String(f.value)}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Write `src/modules/patient-header/index.ts`**

```ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const patientHeaderPlugin: ModulePlugin = {
  meta: {
    id: 'patient-header',
    name: 'Patient Header',
    version: '1.0.0',
    author: 'core',
    description: 'Compact patient identification header with configurable fields.',
    tags: ['header', 'patient', 'identification'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    showRoom: true,
    showPatient: true,
    showAge: true,
    showSex: true,
    showAdmitDate: true,
    showAttending: true,
    showService: true,
    showDiagnosis: true,
    showCodeStatus: true,
    showIsolation: true,
    customLabels: [{ name: '' }, { name: '' }, { name: '' }],
  },
  minSize: { w: 6, h: 3 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 6: Run vitest — expect pass**

```bash
npx vitest run src/modules/patient-header/patient-header.test.tsx
```

- [ ] **Step 7: Git commit**

```bash
cd ~/projects/patient-templates
git add src/modules/patient-header/
git commit -m "feat: add patient-header module"
```

---

## Task 2: vitals module

**Files:**
- `src/modules/vitals/index.ts`
- `src/modules/vitals/Renderer.tsx`
- `src/modules/vitals/Editor.tsx`
- `src/modules/vitals/PrintView.tsx`
- `src/modules/vitals/vitals.test.tsx`

- [ ] **Step 1: Write test file (run first — expect fail)**

```tsx
// src/modules/vitals/vitals.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { vitalsPlugin } from './index'
import { getTrendArrow, getRangeClass } from './Renderer'

const defaultConfig = vitalsPlugin.defaultConfig

describe('vitals Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="v1"
        config={defaultConfig}
        data={{}}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows HR value when provided', () => {
    render(
      <Renderer
        instanceId="v2"
        config={defaultConfig}
        data={{ hr: 72 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('72')).toBeInTheDocument()
  })

  it('shows build mode dashes', () => {
    render(
      <Renderer
        instanceId="v3"
        config={defaultConfig}
        data={{}}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})

describe('vitals calculations', () => {
  it('getTrendArrow returns ↑ when current > prev', () => {
    expect(getTrendArrow(80, 70)).toBe('↑')
  })
  it('getTrendArrow returns ↓ when current < prev', () => {
    expect(getTrendArrow(60, 70)).toBe('↓')
  })
  it('getTrendArrow returns → when equal', () => {
    expect(getTrendArrow(70, 70)).toBe('→')
  })
  it('getRangeClass returns red for critical high HR', () => {
    expect(getRangeClass(150, { min: 60, max: 100 })).toBe('text-red-600')
  })
  it('getRangeClass returns amber for borderline HR', () => {
    expect(getRangeClass(105, { min: 60, max: 100 })).toBe('text-amber-500')
  })
  it('getRangeClass returns empty string for normal HR', () => {
    expect(getRangeClass(75, { min: 60, max: 100 })).toBe('')
  })
})

describe('vitals PrintView', () => {
  it('renders without crashing', () => {
    render(<PrintView config={defaultConfig} data={{ hr: 72, spo2: 98 }} />)
  })
})
```

Run: `npx vitest run src/modules/vitals/vitals.test.tsx` — expect failure.

- [ ] **Step 2: Write `src/modules/vitals/Renderer.tsx`**

```tsx
import { useCallback } from 'react'
import type { FC } from 'react'

interface NormalRange { min?: number; max?: number }

interface VitalsConfig {
  showHr?: boolean; showBp?: boolean; showRr?: boolean
  showTemp?: boolean; showSpo2?: boolean; showWeight?: boolean
  showTrends?: boolean
  tempUnit?: 'F' | 'C'
  weightUnit?: 'kg' | 'lbs'
  normalRanges?: {
    hr?: NormalRange; sbp?: NormalRange; dbp?: NormalRange
    rr?: NormalRange; temp?: NormalRange; spo2?: NormalRange
  }
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function getTrendArrow(current: number, prev: number): '↑' | '↓' | '→' {
  if (current > prev) return '↑'
  if (current < prev) return '↓'
  return '→'
}

export function getRangeClass(value: number, range: NormalRange): string {
  const { min, max } = range
  const criticalMargin = 0.1
  if (max !== undefined && value > max) {
    return value > max * (1 + criticalMargin) ? 'text-red-600' : 'text-amber-500'
  }
  if (min !== undefined && value < min) {
    return value < min * (1 - criticalMargin) ? 'text-red-600' : 'text-amber-500'
  }
  return ''
}

const DEFAULT_RANGES = {
  hr: { min: 60, max: 100 },
  sbp: { min: 90, max: 140 },
  dbp: { min: 60, max: 90 },
  rr: { min: 12, max: 20 },
  temp: { min: 97, max: 99 },
  spo2: { min: 95 },
}

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const cfg = config as VitalsConfig
  const isLive = mode === 'live'
  const ranges = { ...DEFAULT_RANGES, ...(cfg.normalRanges ?? {}) }

  const handleChange = useCallback(
    (field: string, value: string) => {
      const num = value === '' ? undefined : Number(value)
      onDataChange({ ...data, [field]: num })
    },
    [data, onDataChange]
  )

  const VitalCell = ({
    field, label, unit, show = true, prevField,
  }: { field: string; label: string; unit: string; show?: boolean; prevField?: string }) => {
    if (!show) return null
    const val = data[field] as number | undefined
    const prev = prevField ? (data[prevField] as number | undefined) : undefined
    const rangeKey = field as keyof typeof ranges
    const rangeClass = val !== undefined && ranges[rangeKey]
      ? getRangeClass(val, ranges[rangeKey])
      : ''
    const trendArrow = cfg.showTrends && val !== undefined && prev !== undefined
      ? getTrendArrow(val, prev)
      : null

    return (
      <div className="flex flex-col items-center p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-w-[80px]">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        {isLive ? (
          <input
            type="number"
            value={val ?? ''}
            onChange={e => handleChange(field, e.target.value)}
            className={`w-full text-center text-lg font-semibold bg-transparent border-none outline-none ${rangeClass}`}
          />
        ) : (
          <span className="text-lg font-semibold text-gray-400">—</span>
        )}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">{unit}</span>
          {trendArrow !== null && (
            <span className={`text-sm ${trendArrow === '↑' ? 'text-red-500' : trendArrow === '↓' ? 'text-blue-500' : 'text-gray-400'}`}>
              {trendArrow}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 flex flex-wrap gap-2">
      <VitalCell field="hr" label="HR" unit="bpm" show={cfg.showHr !== false} prevField="prevHr" />
      {cfg.showBp !== false && (
        <div className="flex flex-col items-center p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-w-[80px]">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">BP</span>
          <div className="flex items-center gap-1">
            {isLive ? (
              <>
                <input
                  type="number"
                  value={(data.sbp as number) ?? ''}
                  onChange={e => handleChange('sbp', e.target.value)}
                  className="w-12 text-center text-lg font-semibold bg-transparent border-none outline-none"
                  placeholder="—"
                />
                <span className="text-gray-400">/</span>
                <input
                  type="number"
                  value={(data.dbp as number) ?? ''}
                  onChange={e => handleChange('dbp', e.target.value)}
                  className="w-12 text-center text-lg font-semibold bg-transparent border-none outline-none"
                  placeholder="—"
                />
              </>
            ) : (
              <span className="text-lg font-semibold text-gray-400">—/—</span>
            )}
          </div>
          <span className="text-xs text-gray-400">mmHg</span>
        </div>
      )}
      <VitalCell field="rr" label="RR" unit="br/min" show={cfg.showRr !== false} prevField="prevRr" />
      <VitalCell
        field="temp"
        label="Temp"
        unit={cfg.tempUnit === 'C' ? '°C' : '°F'}
        show={cfg.showTemp !== false}
        prevField="prevTemp"
      />
      <VitalCell field="spo2" label="SpO2" unit="%" show={cfg.showSpo2 !== false} prevField="prevSpo2" />
      <VitalCell
        field="weight"
        label="Weight"
        unit={cfg.weightUnit === 'lbs' ? 'lbs' : 'kg'}
        show={cfg.showWeight !== false}
      />
    </div>
  )
}
```

- [ ] **Step 3: Write `src/modules/vitals/Editor.tsx`**

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const VITALS = [
  { key: 'showHr', label: 'Heart Rate (HR)', rangeKey: 'hr' },
  { key: 'showBp', label: 'Blood Pressure (BP)', rangeKey: 'sbp' },
  { key: 'showRr', label: 'Respiratory Rate (RR)', rangeKey: 'rr' },
  { key: 'showTemp', label: 'Temperature', rangeKey: 'temp' },
  { key: 'showSpo2', label: 'SpO2', rangeKey: 'spo2' },
  { key: 'showWeight', label: 'Weight', rangeKey: null },
]

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const ranges = (config.normalRanges as Record<string, { min?: number; max?: number }>) ?? {}

  const toggle = (key: string) =>
    onConfigChange({ ...config, [key]: !(config[key] !== false) })

  const updateRange = (vitalKey: string, bound: 'min' | 'max', val: string) => {
    const next = { ...ranges, [vitalKey]: { ...(ranges[vitalKey] ?? {}), [bound]: val === '' ? undefined : Number(val) } }
    onConfigChange({ ...config, normalRanges: next })
  }

  return (
    <div className="space-y-4 p-3">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={config.showTrends !== false} onChange={() => toggle('showTrends')} className="rounded" />
          Show Trends
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          Temp:
          <select
            value={(config.tempUnit as string) ?? 'F'}
            onChange={e => onConfigChange({ ...config, tempUnit: e.target.value })}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-1 bg-transparent"
          >
            <option value="F">°F</option>
            <option value="C">°C</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          Weight:
          <select
            value={(config.weightUnit as string) ?? 'kg'}
            onChange={e => onConfigChange({ ...config, weightUnit: e.target.value })}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-1 bg-transparent"
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </label>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 text-left">
            <th className="pb-1 pr-3">Vital</th>
            <th className="pb-1 pr-2">Show</th>
            <th className="pb-1 pr-2">Min</th>
            <th className="pb-1">Max</th>
          </tr>
        </thead>
        <tbody className="space-y-1">
          {VITALS.map(v => (
            <tr key={v.key}>
              <td className="pr-3 py-0.5">{v.label}</td>
              <td className="pr-2">
                <input
                  type="checkbox"
                  checked={config[v.key] !== false}
                  onChange={() => toggle(v.key)}
                  className="rounded"
                />
              </td>
              {v.rangeKey ? (
                <>
                  <td className="pr-2">
                    <input
                      type="number"
                      value={ranges[v.rangeKey]?.min ?? ''}
                      onChange={e => updateRange(v.rangeKey!, 'min', e.target.value)}
                      className="w-16 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-transparent text-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={ranges[v.rangeKey]?.max ?? ''}
                      onChange={e => updateRange(v.rangeKey!, 'max', e.target.value)}
                      className="w-16 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-transparent text-sm"
                    />
                  </td>
                </>
              ) : (
                <td colSpan={2} className="text-gray-400 text-xs">no range</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/modules/vitals/PrintView.tsx`**

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ config, data }) => {
  const cfg = config as Record<string, unknown>
  const tempUnit = (cfg.tempUnit as string) ?? 'F'
  const weightUnit = (cfg.weightUnit as string) ?? 'kg'

  const rows: Array<{ label: string; value: unknown; unit: string; show: boolean }> = [
    { label: 'HR', value: data.hr, unit: 'bpm', show: cfg.showHr !== false },
    { label: 'BP', value: data.sbp !== undefined ? `${data.sbp}/${data.dbp}` : undefined, unit: 'mmHg', show: cfg.showBp !== false },
    { label: 'RR', value: data.rr, unit: 'br/min', show: cfg.showRr !== false },
    { label: 'Temp', value: data.temp, unit: `°${tempUnit}`, show: cfg.showTemp !== false },
    { label: 'SpO2', value: data.spo2, unit: '%', show: cfg.showSpo2 !== false },
    { label: 'Weight', value: data.weight, unit: weightUnit, show: cfg.showWeight !== false },
  ]

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-1 p-2 text-sm">
      {rows.filter(r => r.show).map(r => (
        <div key={r.label} className="flex justify-between">
          <span className="font-medium">{r.label}</span>
          <span>{r.value !== undefined ? `${r.value} ${r.unit}` : '—'}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Write `src/modules/vitals/index.ts`**

```ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const vitalsPlugin: ModulePlugin = {
  meta: {
    id: 'vitals',
    name: 'Vitals',
    version: '1.0.0',
    author: 'core',
    description: 'Vital signs grid with configurable normal ranges and trend indicators.',
    tags: ['vitals', 'nursing', 'critical-care'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    showHr: true,
    showBp: true,
    showRr: true,
    showTemp: true,
    showSpo2: true,
    showWeight: true,
    showTrends: true,
    tempUnit: 'F',
    weightUnit: 'kg',
    normalRanges: {
      hr: { min: 60, max: 100 },
      sbp: { min: 90, max: 140 },
      dbp: { min: 60, max: 90 },
      rr: { min: 12, max: 20 },
      temp: { min: 97, max: 99 },
      spo2: { min: 95 },
    },
  },
  minSize: { w: 4, h: 3 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 6: Run vitest — expect pass**

```bash
npx vitest run src/modules/vitals/vitals.test.tsx
```

- [ ] **Step 7: Git commit**

```bash
cd ~/projects/patient-templates
git add src/modules/vitals/
git commit -m "feat: add vitals module"
```

---

## Task 3: labs-panel module

**Files:**
- `src/modules/labs-panel/index.ts`
- `src/modules/labs-panel/Renderer.tsx`
- `src/modules/labs-panel/Editor.tsx`
- `src/modules/labs-panel/PrintView.tsx`
- `src/modules/labs-panel/labs-panel.test.tsx`

- [ ] **Step 1: Write test file (run first — expect fail)**

```tsx
// src/modules/labs-panel/labs-panel.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { labsPanelPlugin } from './index'
import { getRangeClass } from './Renderer'

const defaultConfig = labsPanelPlugin.defaultConfig

describe('labs-panel Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="lp1"
        config={defaultConfig}
        data={{}}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows Na value when provided', () => {
    render(
      <Renderer
        instanceId="lp2"
        config={defaultConfig}
        data={{ na: 138 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('138')).toBeInTheDocument()
  })

  it('highlights out-of-range Na', () => {
    expect(getRangeClass(160, { min: 136, max: 145 })).toBe('text-red-600')
  })

  it('returns empty string for normal value', () => {
    expect(getRangeClass(140, { min: 136, max: 145 })).toBe('')
  })
})

describe('labs-panel PrintView', () => {
  it('renders without crashing', () => {
    render(<PrintView config={defaultConfig} data={{ na: 138, k: 4.0 }} />)
  })
})
```

Run: `npx vitest run src/modules/labs-panel/labs-panel.test.tsx` — expect failure.

- [ ] **Step 2: Write `src/modules/labs-panel/Renderer.tsx`**

```tsx
import { useCallback } from 'react'
import type { FC } from 'react'

interface NormalRange { min?: number; max?: number }

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function getRangeClass(value: number, range: NormalRange): string {
  const { min, max } = range
  const criticalMargin = 0.1
  if (max !== undefined && value > max) {
    return value > max * (1 + criticalMargin) ? 'text-red-600' : 'text-amber-500'
  }
  if (min !== undefined && value < min) {
    return value < min * (1 - criticalMargin) ? 'text-red-600' : 'text-amber-500'
  }
  return ''
}

const DEFAULT_RANGES: Record<string, NormalRange> = {
  na: { min: 136, max: 145 },
  k: { min: 3.5, max: 5.0 },
  cl: { min: 98, max: 106 },
  co2: { min: 22, max: 29 },
  bun: { min: 7, max: 20 },
  cr: { min: 0.6, max: 1.2 },
  glucose: { min: 70, max: 100 },
  wbc: { min: 4.5, max: 11.0 },
  hgb: { min: 12, max: 17.5 },
  hct: { min: 36, max: 50 },
  plt: { min: 150, max: 400 },
}

const PANELS = {
  bmp: {
    label: 'BMP',
    labs: [
      { key: 'na', label: 'Na', unit: 'mEq/L' },
      { key: 'k', label: 'K', unit: 'mEq/L' },
      { key: 'cl', label: 'Cl', unit: 'mEq/L' },
      { key: 'co2', label: 'CO2', unit: 'mEq/L' },
      { key: 'bun', label: 'BUN', unit: 'mg/dL' },
      { key: 'cr', label: 'Cr', unit: 'mg/dL' },
      { key: 'glucose', label: 'Glucose', unit: 'mg/dL' },
    ],
  },
  cbc: {
    label: 'CBC',
    labs: [
      { key: 'wbc', label: 'WBC', unit: 'K/µL' },
      { key: 'hgb', label: 'Hgb', unit: 'g/dL' },
      { key: 'hct', label: 'Hct', unit: '%' },
      { key: 'plt', label: 'Plt', unit: 'K/µL' },
    ],
  },
  lfts: {
    label: 'LFTs',
    labs: [
      { key: 'alt', label: 'ALT', unit: 'U/L' },
      { key: 'ast', label: 'AST', unit: 'U/L' },
      { key: 'alp', label: 'ALP', unit: 'U/L' },
      { key: 'tbili', label: 'TBili', unit: 'mg/dL' },
      { key: 'alb', label: 'Alb', unit: 'g/dL' },
    ],
  },
  coags: {
    label: 'Coags',
    labs: [
      { key: 'pt', label: 'PT', unit: 'sec' },
      { key: 'inr', label: 'INR', unit: '' },
      { key: 'ptt', label: 'PTT', unit: 'sec' },
    ],
  },
} as const

type PanelKey = keyof typeof PANELS

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const cfg = config as { showBmp?: boolean; showCbc?: boolean; showLfts?: boolean; showCoags?: boolean; showTrend?: boolean; normalRanges?: Record<string, NormalRange> }
  const isLive = mode === 'live'
  const ranges = { ...DEFAULT_RANGES, ...(cfg.normalRanges ?? {}) }

  const handleChange = useCallback(
    (field: string, value: string) => {
      onDataChange({ ...data, [field]: value === '' ? undefined : Number(value) })
    },
    [data, onDataChange]
  )

  const panelVisible: Record<PanelKey, boolean> = {
    bmp: cfg.showBmp !== false,
    cbc: cfg.showCbc !== false,
    lfts: cfg.showLfts === true,
    coags: cfg.showCoags === true,
  }

  return (
    <div className="p-2 flex flex-wrap gap-4">
      {(Object.keys(PANELS) as PanelKey[]).map(panelKey =>
        panelVisible[panelKey] ? (
          <div key={panelKey} className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {PANELS[panelKey].label}
            </h4>
            {PANELS[panelKey].labs.map(lab => {
              const val = data[lab.key] as number | undefined
              const prev = data[`prev_${lab.key}`] as number | undefined
              const rangeClass = val !== undefined && ranges[lab.key]
                ? getRangeClass(val, ranges[lab.key])
                : ''
              return (
                <div key={lab.key} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-14 text-right">{lab.label}</span>
                  {isLive ? (
                    <input
                      type="number"
                      value={val ?? ''}
                      onChange={e => handleChange(lab.key, e.target.value)}
                      className={`w-16 text-sm border-b border-gray-300 dark:border-gray-600 bg-transparent outline-none text-center ${rangeClass}`}
                      placeholder="—"
                    />
                  ) : (
                    <span className="w-16 text-sm text-gray-400 text-center">—</span>
                  )}
                  <span className="text-xs text-gray-400">{lab.unit}</span>
                  {cfg.showTrend && prev !== undefined && val !== undefined && (
                    <span className="text-xs text-gray-400">({prev})</span>
                  )}
                </div>
              )
            })}
          </div>
        ) : null
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/modules/labs-panel/Editor.tsx`**

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const toggle = (key: string) =>
    onConfigChange({ ...config, [key]: !(config[key] !== false) })

  return (
    <div className="space-y-4 p-3">
      <div>
        <h3 className="text-sm font-semibold mb-2">Panels</h3>
        <div className="space-y-1">
          {[
            { key: 'showBmp', label: 'BMP (Basic Metabolic Panel)' },
            { key: 'showCbc', label: 'CBC (Complete Blood Count)' },
            { key: 'showLfts', label: 'LFTs (Liver Function Tests)' },
            { key: 'showCoags', label: 'Coags (PT/INR/PTT)' },
          ].map(p => (
            <label key={p.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config[p.key] !== false && config[p.key] !== undefined ? !!config[p.key] : p.key === 'showBmp' || p.key === 'showCbc'}
                onChange={() => toggle(p.key)}
                className="rounded"
              />
              {p.label}
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={config.showTrend !== false}
          onChange={() => toggle('showTrend')}
          className="rounded"
        />
        Show prior value below each field
      </label>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/modules/labs-panel/PrintView.tsx`**

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const PANELS = {
  bmp: { label: 'BMP', configKey: 'showBmp', labs: [
    { key: 'na', label: 'Na', unit: 'mEq/L' }, { key: 'k', label: 'K', unit: 'mEq/L' },
    { key: 'cl', label: 'Cl', unit: 'mEq/L' }, { key: 'co2', label: 'CO2', unit: 'mEq/L' },
    { key: 'bun', label: 'BUN', unit: 'mg/dL' }, { key: 'cr', label: 'Cr', unit: 'mg/dL' },
    { key: 'glucose', label: 'Glucose', unit: 'mg/dL' },
  ]},
  cbc: { label: 'CBC', configKey: 'showCbc', labs: [
    { key: 'wbc', label: 'WBC', unit: 'K/µL' }, { key: 'hgb', label: 'Hgb', unit: 'g/dL' },
    { key: 'hct', label: 'Hct', unit: '%' }, { key: 'plt', label: 'Plt', unit: 'K/µL' },
  ]},
  lfts: { label: 'LFTs', configKey: 'showLfts', labs: [
    { key: 'alt', label: 'ALT', unit: 'U/L' }, { key: 'ast', label: 'AST', unit: 'U/L' },
    { key: 'alp', label: 'ALP', unit: 'U/L' }, { key: 'tbili', label: 'TBili', unit: 'mg/dL' },
    { key: 'alb', label: 'Alb', unit: 'g/dL' },
  ]},
  coags: { label: 'Coags', configKey: 'showCoags', labs: [
    { key: 'pt', label: 'PT', unit: 'sec' }, { key: 'inr', label: 'INR', unit: '' },
    { key: 'ptt', label: 'PTT', unit: 'sec' },
  ]},
}

export const PrintView: FC<Props> = ({ config, data }) => (
  <div className="p-2 flex flex-wrap gap-6 text-sm">
    {Object.values(PANELS).map(panel =>
      config[panel.configKey] !== false ? (
        <div key={panel.label}>
          <h4 className="font-semibold border-b border-gray-300 mb-1">{panel.label}</h4>
          {panel.labs.map(lab => (
            <div key={lab.key} className="flex justify-between gap-4">
              <span>{lab.label}</span>
              <span>{data[lab.key] !== undefined ? `${data[lab.key]} ${lab.unit}` : '—'}</span>
            </div>
          ))}
        </div>
      ) : null
    )}
  </div>
)
```

- [ ] **Step 5: Write `src/modules/labs-panel/index.ts`**

```ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const labsPanelPlugin: ModulePlugin = {
  meta: {
    id: 'labs-panel',
    name: 'Labs Panel',
    version: '1.0.0',
    author: 'core',
    description: 'BMP, CBC, LFTs, and Coags panels with out-of-range highlighting.',
    tags: ['labs', 'bmp', 'cbc', 'critical-care'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    showBmp: true,
    showCbc: true,
    showLfts: false,
    showCoags: false,
    showTrend: true,
    normalRanges: {
      na: { min: 136, max: 145 }, k: { min: 3.5, max: 5.0 },
      cl: { min: 98, max: 106 }, co2: { min: 22, max: 29 },
      bun: { min: 7, max: 20 }, cr: { min: 0.6, max: 1.2 },
      glucose: { min: 70, max: 100 }, wbc: { min: 4.5, max: 11.0 },
      hgb: { min: 12, max: 17.5 }, hct: { min: 36, max: 50 },
      plt: { min: 150, max: 400 },
    },
  },
  minSize: { w: 4, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 6: Run vitest — expect pass**

```bash
npx vitest run src/modules/labs-panel/labs-panel.test.tsx
```

- [ ] **Step 7: Git commit**

```bash
cd ~/projects/patient-templates
git add src/modules/labs-panel/
git commit -m "feat: add labs-panel module"
```

---

## Task 4: labs-fishbone module

**Files:**
- `src/modules/labs-fishbone/index.ts`
- `src/modules/labs-fishbone/Renderer.tsx`
- `src/modules/labs-fishbone/Editor.tsx`
- `src/modules/labs-fishbone/PrintView.tsx`
- `src/modules/labs-fishbone/labs-fishbone.test.tsx`

- [ ] **Step 1: Write test file (run first — expect fail)**

```tsx
// src/modules/labs-fishbone/labs-fishbone.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { labsFishbonePlugin } from './index'

const defaultConfig = labsFishbonePlugin.defaultConfig

describe('labs-fishbone Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="lf1"
        config={defaultConfig}
        data={{}}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows Na value when provided', () => {
    render(
      <Renderer
        instanceId="lf2"
        config={defaultConfig}
        data={{ na: 138 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('138')).toBeInTheDocument()
  })

  it('shows placeholder labels in build mode', () => {
    render(
      <Renderer
        instanceId="lf3"
        config={defaultConfig}
        data={{}}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getByPlaceholderText('Na')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('K')).toBeInTheDocument()
  })

  it('shows Glucose when showGlucose is true', () => {
    render(
      <Renderer
        instanceId="lf4"
        config={{ ...defaultConfig, showGlucose: true }}
        data={{}}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByPlaceholderText('Glu')).toBeInTheDocument()
  })
})

describe('labs-fishbone PrintView', () => {
  it('renders without crashing', () => {
    render(<PrintView config={defaultConfig} data={{ na: 138, k: 4.0 }} />)
  })
})
```

Run: `npx vitest run src/modules/labs-fishbone/labs-fishbone.test.tsx` — expect failure.

- [ ] **Step 2: Write `src/modules/labs-fishbone/Renderer.tsx`**

```tsx
import { useCallback } from 'react'
import type { FC } from 'react'

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const CellInput: FC<{
  field: string
  placeholder: string
  value: string
  onChange: (field: string, val: string) => void
  readOnly: boolean
}> = ({ field, placeholder, value, onChange, readOnly }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(field, e.target.value)}
    readOnly={readOnly}
    className="w-full text-center text-sm bg-transparent outline-none border-none focus:bg-blue-50 dark:focus:bg-blue-950/30 rounded p-1"
  />
)

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const cfg = config as { showGlucose?: boolean; showMgPhos?: boolean }
  const isLive = mode === 'live'

  const handleChange = useCallback(
    (field: string, val: string) => {
      onDataChange({ ...data, [field]: val })
    },
    [data, onDataChange]
  )

  const val = (f: string) => (data[f] as string) ?? ''

  const cell = (field: string, placeholder: string) => (
    <CellInput
      field={field}
      placeholder={placeholder}
      value={val(field)}
      onChange={handleChange}
      readOnly={!isLive}
    />
  )

  return (
    <div className="p-2 flex flex-col gap-2 font-mono text-sm">
      {/* Main fishbone grid */}
      <div className="flex items-stretch gap-0">
        {/* Left 2x2: Na/K | Cl/CO2 */}
        <div className="grid grid-cols-2 border border-gray-400 dark:border-gray-600" style={{ width: 120 }}>
          <div className="border-b border-r border-gray-400 dark:border-gray-600 p-0.5">{cell('na', 'Na')}</div>
          <div className="border-b border-gray-400 dark:border-gray-600 p-0.5">{cell('cl', 'Cl')}</div>
          <div className="border-r border-gray-400 dark:border-gray-600 p-0.5">{cell('k', 'K')}</div>
          <div className="p-0.5">{cell('co2', 'CO2')}</div>
        </div>
        {/* Right 2x2: BUN/Cr with divider */}
        <div className="grid grid-cols-2 border-t border-b border-r border-gray-400 dark:border-gray-600" style={{ width: 100 }}>
          <div className="border-b border-r border-gray-400 dark:border-gray-600 p-0.5">{cell('bun', 'BUN')}</div>
          <div className="border-b border-gray-400 dark:border-gray-600 p-0.5 text-center">
            {cfg.showGlucose !== false ? cell('glucose', 'Glu') : null}
          </div>
          <div className="border-r border-gray-400 dark:border-gray-600 p-0.5">{cell('cr', 'Cr')}</div>
          <div className="p-0.5" />
        </div>
      </div>

      {/* Mg / Phos row */}
      {cfg.showMgPhos && (
        <div className="flex gap-2 pt-1 border-t border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Mg</span>
            {cell('mg', 'Mg')}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Phos</span>
            {cell('phos', 'Phos')}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/modules/labs-fishbone/Editor.tsx`**

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const toggle = (key: string) =>
    onConfigChange({ ...config, [key]: !config[key] })

  return (
    <div className="space-y-2 p-3">
      <h3 className="text-sm font-semibold mb-2">Display Options</h3>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={!!config.showGlucose}
          onChange={() => toggle('showGlucose')}
          className="rounded"
        />
        Show Glucose
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={!!config.showMgPhos}
          onChange={() => toggle('showMgPhos')}
          className="rounded"
        />
        Show Mg / Phos row
      </label>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/modules/labs-fishbone/PrintView.tsx`**

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ config, data }) => {
  const cfg = config as { showGlucose?: boolean; showMgPhos?: boolean }
  const v = (f: string) => (data[f] !== undefined ? String(data[f]) : '—')

  return (
    <div className="p-2 font-mono text-sm">
      <div className="inline-grid border border-gray-800" style={{ gridTemplateColumns: '60px 60px 60px 60px' }}>
        <div className="border-b border-r border-gray-800 text-center p-1">{v('na')}</div>
        <div className="border-b border-r border-gray-800 text-center p-1">{v('cl')}</div>
        <div className="border-b border-r border-gray-800 text-center p-1">{v('bun')}</div>
        <div className="border-b border-gray-800 text-center p-1">{cfg.showGlucose !== false ? v('glucose') : ''}</div>
        <div className="border-r border-gray-800 text-center p-1">{v('k')}</div>
        <div className="border-r border-gray-800 text-center p-1">{v('co2')}</div>
        <div className="border-r border-gray-800 text-center p-1">{v('cr')}</div>
        <div className="text-center p-1" />
      </div>
      {cfg.showMgPhos && (
        <div className="flex gap-4 mt-2 text-xs">
          <span>Mg: {v('mg')}</span>
          <span>Phos: {v('phos')}</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Write `src/modules/labs-fishbone/index.ts`**

```ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const labsFishbonePlugin: ModulePlugin = {
  meta: {
    id: 'labs-fishbone',
    name: 'Labs Fishbone',
    version: '1.0.0',
    author: 'core',
    description: 'Classic electrolyte fishbone (Tic-tac-toe) diagram for quick lab entry.',
    tags: ['labs', 'fishbone', 'electrolytes'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    showGlucose: true,
    showMgPhos: false,
  },
  minSize: { w: 3, h: 3 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 6: Run vitest — expect pass**

```bash
npx vitest run src/modules/labs-fishbone/labs-fishbone.test.tsx
```

- [ ] **Step 7: Git commit**

```bash
cd ~/projects/patient-templates
git add src/modules/labs-fishbone/
git commit -m "feat: add labs-fishbone module"
```

---

## Task 5: assessment-plan module

**Files:**
- `src/modules/assessment-plan/index.ts`
- `src/modules/assessment-plan/Renderer.tsx`
- `src/modules/assessment-plan/Editor.tsx`
- `src/modules/assessment-plan/PrintView.tsx`
- `src/modules/assessment-plan/assessment-plan.test.tsx`

- [ ] **Step 1: Write test file (run first — expect fail)**

```tsx
// src/modules/assessment-plan/assessment-plan.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { assessmentPlanPlugin } from './index'

const defaultConfig = assessmentPlanPlugin.defaultConfig
const emptyData = { problems: [] }

describe('assessment-plan Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="ap1"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows problem fields when problems provided', () => {
    render(
      <Renderer
        instanceId="ap2"
        config={defaultConfig}
        data={{ problems: [{ id: '1', name: 'Sepsis', assessment: 'Improving', plan: 'Continue abx' }] }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Sepsis')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Improving')).toBeInTheDocument()
  })

  it('shows one placeholder problem in build mode', () => {
    render(
      <Renderer
        instanceId="ap3"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getByPlaceholderText('Problem name')).toBeInTheDocument()
  })

  it('calls onDataChange when add problem clicked', async () => {
    const user = userEvent.setup()
    const onDataChange = vi.fn()
    render(
      <Renderer
        instanceId="ap4"
        config={defaultConfig}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    await user.click(screen.getByText('+ Add Problem'))
    expect(onDataChange).toHaveBeenCalled()
  })
})

describe('assessment-plan PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={defaultConfig}
        data={{ problems: [{ id: '1', name: 'HTN', assessment: 'Stable', plan: 'Continue home meds' }] }}
      />
    )
  })
})
```

Run: `npx vitest run src/modules/assessment-plan/assessment-plan.test.tsx` — expect failure.

- [ ] **Step 2: Write `src/modules/assessment-plan/Renderer.tsx`**

```tsx
import { useCallback } from 'react'
import type { FC } from 'react'

interface Problem {
  id: string
  name: string
  assessment: string
  plan: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const isLive = mode === 'live'
  const problems: Problem[] = (data.problems as Problem[]) ?? []

  const updateProblem = useCallback(
    (id: string, field: keyof Problem, value: string) => {
      const next = problems.map(p => p.id === id ? { ...p, [field]: value } : p)
      onDataChange({ ...data, problems: next })
    },
    [data, onDataChange, problems]
  )

  const addProblem = useCallback(() => {
    const next = [...problems, { id: generateId(), name: '', assessment: '', plan: '' }]
    onDataChange({ ...data, problems: next })
  }, [data, onDataChange, problems])

  const removeProblem = useCallback(
    (id: string) => {
      onDataChange({ ...data, problems: problems.filter(p => p.id !== id) })
    },
    [data, onDataChange, problems]
  )

  const displayProblems: Problem[] = mode === 'build' && problems.length === 0
    ? [{ id: '__placeholder__', name: '', assessment: '', plan: '' }]
    : problems

  return (
    <div className="p-2 space-y-3">
      {displayProblems.map((problem, idx) => {
        const isPlaceholder = problem.id === '__placeholder__'
        return (
          <div key={problem.id} className="border border-gray-200 dark:border-gray-700 rounded p-2 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400 w-6">#{idx + 1}</span>
              <input
                type="text"
                placeholder="Problem name"
                value={problem.name}
                onChange={e => !isPlaceholder && updateProblem(problem.id, 'name', e.target.value)}
                readOnly={!isLive || isPlaceholder}
                className="flex-1 text-sm font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none py-0.5"
              />
              {isLive && !isPlaceholder && (
                <button
                  onClick={() => removeProblem(problem.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-1"
                  aria-label="Remove problem"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="pl-8 space-y-1">
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Assessment</span>
                <textarea
                  placeholder="Assessment"
                  value={problem.assessment}
                  onChange={e => !isPlaceholder && updateProblem(problem.id, 'assessment', e.target.value)}
                  readOnly={!isLive || isPlaceholder}
                  rows={2}
                  className="w-full text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded p-1 outline-none resize-none focus:border-blue-400 mt-0.5"
                />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Plan</span>
                <textarea
                  placeholder="Plan"
                  value={problem.plan}
                  onChange={e => !isPlaceholder && updateProblem(problem.id, 'plan', e.target.value)}
                  readOnly={!isLive || isPlaceholder}
                  rows={3}
                  className="w-full text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded p-1 outline-none resize-none focus:border-blue-400 mt-0.5"
                />
              </div>
            </div>
          </div>
        )
      })}
      {isLive && (
        <button
          onClick={addProblem}
          className="text-sm text-blue-500 hover:text-blue-700 font-medium"
        >
          + Add Problem
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/modules/assessment-plan/Editor.tsx`**

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => (
  <div className="p-3 space-y-3">
    <div>
      <label className="text-sm font-medium block mb-1">
        Default blank problems on open
      </label>
      <select
        value={(config.defaultProblems as number) ?? 1}
        onChange={e => onConfigChange({ ...config, defaultProblems: Number(e.target.value) })}
        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent"
      >
        {[1, 2, 3, 4, 5].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  </div>
)
```

- [ ] **Step 4: Write `src/modules/assessment-plan/PrintView.tsx`**

```tsx
import type { FC } from 'react'

interface Problem {
  id: string
  name: string
  assessment: string
  plan: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const problems: Problem[] = (data.problems as Problem[]) ?? []

  return (
    <div className="p-2 space-y-4 text-sm">
      {problems.map((p, idx) => (
        <div key={p.id} className="space-y-1">
          <h4 className="font-bold">#{idx + 1} {p.name}</h4>
          {p.assessment && (
            <div>
              <span className="font-medium">Assessment: </span>
              {p.assessment}
            </div>
          )}
          {p.plan && (
            <div>
              <span className="font-medium">Plan:</span>
              <ul className="list-disc list-inside ml-2">
                {p.plan.split('\n').filter(Boolean).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Write `src/modules/assessment-plan/index.ts`**

```ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const assessmentPlanPlugin: ModulePlugin = {
  meta: {
    id: 'assessment-plan',
    name: 'Assessment & Plan',
    version: '1.0.0',
    author: 'core',
    description: 'Numbered problem list with assessment and plan fields per problem.',
    tags: ['assessment', 'plan', 'soap', 'rounding'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    defaultProblems: 1,
  },
  minSize: { w: 5, h: 5 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 6: Run vitest — expect pass**

```bash
npx vitest run src/modules/assessment-plan/assessment-plan.test.tsx
```

- [ ] **Step 7: Git commit**

```bash
cd ~/projects/patient-templates
git add src/modules/assessment-plan/
git commit -m "feat: add assessment-plan module"
```

---

## Task 6: medications module

**Files:**
- `src/modules/medications/index.ts`
- `src/modules/medications/Renderer.tsx`
- `src/modules/medications/Editor.tsx`
- `src/modules/medications/PrintView.tsx`
- `src/modules/medications/medications.test.tsx`

- [ ] **Step 1: Write test file (run first — expect fail)**

```tsx
// src/modules/medications/medications.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { medicationsPlugin } from './index'
import { getCategoryColor } from './Renderer'

const defaultConfig = medicationsPlugin.defaultConfig
const emptyData = { medications: [] }

describe('medications Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="m1"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows 2 placeholder rows in build mode', () => {
    const { container } = render(
      <Renderer
        instanceId="m2"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="build"
      />
    )
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(2)
  })

  it('calls onDataChange when add medication clicked', async () => {
    const user = userEvent.setup()
    const onDataChange = vi.fn()
    render(
      <Renderer
        instanceId="m3"
        config={defaultConfig}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    await user.click(screen.getByText('+ Add Medication'))
    expect(onDataChange).toHaveBeenCalled()
  })
})

describe('medications category highlighting', () => {
  const categories = defaultConfig.categories as Array<{ name: string; keywords: string; color: string }>

  it('matches vasopressor category for norepi', () => {
    expect(getCategoryColor('norepinephrine', categories)).toBe('red')
  })

  it('matches antibiotic category for vancomycin', () => {
    expect(getCategoryColor('vancomycin', categories)).toBe('yellow')
  })

  it('returns null for unmatched drug', () => {
    expect(getCategoryColor('aspirin', categories)).toBeNull()
  })
})

describe('medications PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={defaultConfig}
        data={{ medications: [{ id: '1', drug: 'Vancomycin', dose: '1g', route: 'IV', frequency: 'q12h', indication: 'MRSA' }] }}
      />
    )
  })
})
```

Run: `npx vitest run src/modules/medications/medications.test.tsx` — expect failure.

- [ ] **Step 2: Write `src/modules/medications/Renderer.tsx`**

```tsx
import { useCallback } from 'react'
import type { FC } from 'react'

interface Medication {
  id: string
  drug: string
  dose: string
  route: string
  frequency: string
  indication: string
}

interface Category {
  name: string
  keywords: string
  color: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-50 dark:bg-red-950/40',
  yellow: 'bg-yellow-50 dark:bg-yellow-950/40',
  green: 'bg-green-50 dark:bg-green-950/40',
  blue: 'bg-blue-50 dark:bg-blue-950/40',
  purple: 'bg-purple-50 dark:bg-purple-950/40',
}

export function getCategoryColor(drugName: string, categories: Category[]): string | null {
  const lower = drugName.toLowerCase()
  for (const cat of categories) {
    const keywords = cat.keywords.split(',').map(k => k.trim().toLowerCase())
    if (keywords.some(kw => lower.includes(kw))) return cat.color
  }
  return null
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

const ROUTES = ['PO', 'IV', 'SQ', 'IM', 'topical', 'other']

const PLACEHOLDER_ROWS: Medication[] = [
  { id: '__p1__', drug: '', dose: '', route: 'IV', frequency: '', indication: '' },
  { id: '__p2__', drug: '', dose: '', route: 'PO', frequency: '', indication: '' },
]

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const isLive = mode === 'live'
  const medications: Medication[] = (data.medications as Medication[]) ?? []
  const categories: Category[] = (config.categories as Category[]) ?? []

  const displayMeds = mode === 'build' && medications.length === 0 ? PLACEHOLDER_ROWS : medications

  const updateMed = useCallback(
    (id: string, field: keyof Medication, value: string) => {
      const next = medications.map(m => m.id === id ? { ...m, [field]: value } : m)
      onDataChange({ ...data, medications: next })
    },
    [data, medications, onDataChange]
  )

  const addMed = useCallback(() => {
    const next = [...medications, { id: generateId(), drug: '', dose: '', route: 'PO', frequency: '', indication: '' }]
    onDataChange({ ...data, medications: next })
  }, [data, medications, onDataChange])

  const removeMed = useCallback(
    (id: string) => {
      onDataChange({ ...data, medications: medications.filter(m => m.id !== id) })
    },
    [data, medications, onDataChange]
  )

  return (
    <div className="p-2 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs text-gray-500 dark:text-gray-400 text-left">
            <th className="pb-1 pr-2 font-medium">Drug</th>
            <th className="pb-1 pr-2 font-medium">Dose</th>
            <th className="pb-1 pr-2 font-medium">Route</th>
            <th className="pb-1 pr-2 font-medium">Frequency</th>
            <th className="pb-1 pr-2 font-medium">Indication</th>
            {isLive && <th className="pb-1 w-6" />}
          </tr>
        </thead>
        <tbody>
          {displayMeds.map(med => {
            const isPlaceholder = med.id.startsWith('__p')
            const color = getCategoryColor(med.drug, categories)
            const rowClass = color ? (COLOR_MAP[color] ?? '') : ''
            return (
              <tr key={med.id} className={`border-t border-gray-200 dark:border-gray-700 ${rowClass}`}>
                {(['drug', 'dose', 'frequency', 'indication'] as const).map((field, fi) =>
                  fi === 1 ? (
                    // Insert route select after dose
                    <>
                      <td key="dose" className="py-0.5 pr-1">
                        <input
                          type="text"
                          value={med.dose}
                          onChange={e => !isPlaceholder && updateMed(med.id, 'dose', e.target.value)}
                          readOnly={!isLive || isPlaceholder}
                          className="w-full bg-transparent outline-none text-sm px-1"
                          placeholder="—"
                        />
                      </td>
                      <td key="route" className="py-0.5 pr-1">
                        <select
                          value={med.route}
                          onChange={e => !isPlaceholder && updateMed(med.id, 'route', e.target.value)}
                          disabled={!isLive || isPlaceholder}
                          className="bg-transparent outline-none text-sm w-full"
                        >
                          {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                    </>
                  ) : (
                    <td key={field} className="py-0.5 pr-1">
                      <input
                        type="text"
                        value={med[field]}
                        onChange={e => !isPlaceholder && updateMed(med.id, field, e.target.value)}
                        readOnly={!isLive || isPlaceholder}
                        className="w-full bg-transparent outline-none text-sm px-1"
                        placeholder="—"
                      />
                    </td>
                  )
                )}
                {isLive && (
                  <td className="py-0.5">
                    {!isPlaceholder && (
                      <button
                        onClick={() => removeMed(med.id)}
                        className="text-red-400 hover:text-red-600 text-xs px-1"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {isLive && (
        <button
          onClick={addMed}
          className="mt-2 text-sm text-blue-500 hover:text-blue-700 font-medium"
        >
          + Add Medication
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/modules/medications/Editor.tsx`**

```tsx
import type { FC } from 'react'

interface Category {
  name: string
  keywords: string
  color: string
}

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const PRESET_COLORS = ['red', 'yellow', 'green', 'blue', 'purple']

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const categories: Category[] = (config.categories as Category[]) ?? []

  const updateCategory = (i: number, field: keyof Category, value: string) => {
    const next = [...categories]
    next[i] = { ...next[i], [field]: value }
    onConfigChange({ ...config, categories: next })
  }

  const addCategory = () => {
    if (categories.length >= 5) return
    onConfigChange({ ...config, categories: [...categories, { name: '', keywords: '', color: 'red' }] })
  }

  const removeCategory = (i: number) => {
    onConfigChange({ ...config, categories: categories.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-sm font-semibold">Highlight Categories</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Rows where the drug name contains a keyword get a background color.
      </p>
      <div className="space-y-3">
        {categories.map((cat, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded p-2 space-y-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Category name"
                value={cat.name}
                onChange={e => updateCategory(i, 'name', e.target.value)}
                className="flex-1 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none"
              />
              <select
                value={cat.color}
                onChange={e => updateCategory(i, 'color', e.target.value)}
                className="text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1"
              >
                {PRESET_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => removeCategory(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
            </div>
            <input
              type="text"
              placeholder="Keywords (comma-separated)"
              value={cat.keywords}
              onChange={e => updateCategory(i, 'keywords', e.target.value)}
              className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none"
            />
          </div>
        ))}
      </div>
      {categories.length < 5 && (
        <button
          onClick={addCategory}
          className="text-sm text-blue-500 hover:text-blue-700 font-medium"
        >
          + Add Category
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Write `src/modules/medications/PrintView.tsx`**

```tsx
import type { FC } from 'react'

interface Medication {
  id: string
  drug: string
  dose: string
  route: string
  frequency: string
  indication: string
}

interface Category {
  name: string
  keywords: string
  color: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const PRINT_COLOR_MAP: Record<string, string> = {
  red: 'bg-red-100',
  yellow: 'bg-yellow-100',
  green: 'bg-green-100',
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
}

function getColor(drug: string, cats: Category[]): string | null {
  const lower = drug.toLowerCase()
  for (const cat of cats) {
    const kws = cat.keywords.split(',').map(k => k.trim().toLowerCase())
    if (kws.some(kw => lower.includes(kw))) return cat.color
  }
  return null
}

export const PrintView: FC<Props> = ({ config, data }) => {
  const medications: Medication[] = (data.medications as Medication[]) ?? []
  const categories: Category[] = (config.categories as Category[]) ?? []

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-xs font-semibold">
          <th className="p-1 border border-gray-300">Drug</th>
          <th className="p-1 border border-gray-300">Dose</th>
          <th className="p-1 border border-gray-300">Route</th>
          <th className="p-1 border border-gray-300">Frequency</th>
          <th className="p-1 border border-gray-300">Indication</th>
        </tr>
      </thead>
      <tbody>
        {medications.map(med => {
          const color = getColor(med.drug, categories)
          const rowClass = color ? (PRINT_COLOR_MAP[color] ?? '') : ''
          return (
            <tr key={med.id} className={rowClass}>
              <td className="p-1 border border-gray-300">{med.drug}</td>
              <td className="p-1 border border-gray-300">{med.dose}</td>
              <td className="p-1 border border-gray-300">{med.route}</td>
              <td className="p-1 border border-gray-300">{med.frequency}</td>
              <td className="p-1 border border-gray-300">{med.indication}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 5: Write `src/modules/medications/index.ts`**

```ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const medicationsPlugin: ModulePlugin = {
  meta: {
    id: 'medications',
    name: 'Medications',
    version: '1.0.0',
    author: 'core',
    description: 'Medication table with keyword-based highlight categories.',
    tags: ['medications', 'meds', 'pharmacy'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    categories: [
      { name: 'Vasopressors', keywords: 'norepi,epi,vasopressin,phenylephrine,dopamine', color: 'red' },
      { name: 'Antibiotics', keywords: 'vancomycin,piperacillin,cefepime,meropenem,azithromycin', color: 'yellow' },
      { name: 'Anticoagulants', keywords: 'heparin,enoxaparin,apixaban,rivaroxaban,warfarin', color: 'blue' },
    ],
  },
  minSize: { w: 6, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 6: Run vitest — expect pass**

```bash
npx vitest run src/modules/medications/medications.test.tsx
```

- [ ] **Step 7: Git commit**

```bash
cd ~/projects/patient-templates
git add src/modules/medications/
git commit -m "feat: add medications module"
```

---

## Task 7: intake-output module

**Files:**
- `src/modules/intake-output/index.ts`
- `src/modules/intake-output/Renderer.tsx`
- `src/modules/intake-output/Editor.tsx`
- `src/modules/intake-output/PrintView.tsx`
- `src/modules/intake-output/intake-output.test.tsx`

- [ ] **Step 1: Write test file (run first — expect fail)**

```tsx
// src/modules/intake-output/intake-output.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { intakeOutputPlugin } from './index'
import { calcUOP, calcNetBalance } from './Renderer'

const defaultConfig = intakeOutputPlugin.defaultConfig
const emptyData = { po: 0, ivFluids: [], urine: 0, urineHours: 0, stool: 0, drains: [] }

describe('intake-output Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="io1"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows UOP calculation when data provided', () => {
    render(
      <Renderer
        instanceId="io2"
        config={defaultConfig}
        data={{ ...emptyData, urine: 1200, urineHours: 8 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/150/)).toBeInTheDocument()
  })

  it('shows build mode placeholder zeros', () => {
    render(
      <Renderer
        instanceId="io3"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getAllByPlaceholderText('0').length).toBeGreaterThan(0)
  })
})

describe('intake-output calculations', () => {
  it('calcUOP returns mL/hr rounded to 1 decimal', () => {
    expect(calcUOP(1200, 8)).toBe(150)
    expect(calcUOP(1000, 3)).toBeCloseTo(333.3, 1)
  })

  it('calcUOP returns 0 when hours is 0', () => {
    expect(calcUOP(500, 0)).toBe(0)
  })

  it('calcNetBalance totals intake minus output', () => {
    const data = {
      po: 500,
      ivFluids: [{ label: 'NS', ml: 1000 }, { label: 'LR', ml: 500 }],
      urine: 800,
      urineHours: 8,
      stool: 100,
      drains: [{ label: 'JP', ml: 50 }],
    }
    // intake: 500 + 1000 + 500 = 2000
    // output: 800 + 100 + 50 = 950
    expect(calcNetBalance(data)).toBe(1050)
  })
})

describe('intake-output PrintView', () => {
  it('renders without crashing', () => {
    render(<PrintView config={defaultConfig} data={emptyData} />)
  })
})
```

Run: `npx vitest run src/modules/intake-output/intake-output.test.tsx` — expect failure.

- [ ] **Step 2: Write `src/modules/intake-output/Renderer.tsx`**

```tsx
import { useCallback } from 'react'
import type { FC } from 'react'

interface FluidEntry { label: string; ml: number }

interface IOData {
  po: number
  ivFluids: FluidEntry[]
  urine: number
  urineHours: number
  stool: number
  drains: FluidEntry[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function calcUOP(urine: number, hours: number): number {
  if (hours === 0) return 0
  return Math.round((urine / hours) * 10) / 10
}

export function calcNetBalance(data: Partial<IOData>): number {
  const ivTotal = (data.ivFluids ?? []).reduce((s, e) => s + (e.ml || 0), 0)
  const totalIn = (data.po ?? 0) + ivTotal
  const drainTotal = (data.drains ?? []).reduce((s, e) => s + (e.ml || 0), 0)
  const totalOut = (data.urine ?? 0) + (data.stool ?? 0) + drainTotal
  return totalIn - totalOut
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const isLive = mode === 'live'
  const cfg = config as { showUOP?: boolean; windowLabel?: string }
  const d = data as Partial<IOData>

  const po = d.po ?? 0
  const ivFluids: FluidEntry[] = d.ivFluids ?? []
  const urine = d.urine ?? 0
  const urineHours = d.urineHours ?? 0
  const stool = d.stool ?? 0
  const drains: FluidEntry[] = d.drains ?? []

  const uop = calcUOP(urine, urineHours)
  const netBalance = calcNetBalance(d)
  const netClass = netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'

  const handleField = useCallback(
    (field: string, value: unknown) => onDataChange({ ...data, [field]: value }),
    [data, onDataChange]
  )

  const updateIv = useCallback(
    (i: number, field: 'label' | 'ml', val: string) => {
      const next = [...ivFluids]
      next[i] = { ...next[i], [field]: field === 'ml' ? Number(val) : val }
      handleField('ivFluids', next)
    },
    [ivFluids, handleField]
  )

  const addIv = useCallback(() => {
    handleField('ivFluids', [...ivFluids, { label: '', ml: 0 }])
  }, [ivFluids, handleField])

  const removeIv = useCallback(
    (i: number) => handleField('ivFluids', ivFluids.filter((_, idx) => idx !== i)),
    [ivFluids, handleField]
  )

  const updateDrain = useCallback(
    (i: number, field: 'label' | 'ml', val: string) => {
      const next = [...drains]
      next[i] = { ...next[i], [field]: field === 'ml' ? Number(val) : val }
      handleField('drains', next)
    },
    [drains, handleField]
  )

  const addDrain = useCallback(() => {
    handleField('drains', [...drains, { label: '', ml: 0 }])
  }, [drains, handleField])

  const removeDrain = useCallback(
    (i: number) => handleField('drains', drains.filter((_, idx) => idx !== i)),
    [drains, handleField]
  )

  const numInput = (value: number, onChange: (v: string) => void) => (
    <input
      type="number"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      readOnly={!isLive}
      placeholder="0"
      className="w-20 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none text-right"
    />
  )

  return (
    <div className="p-2 text-sm space-y-2">
      {cfg.windowLabel && (
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {cfg.windowLabel}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {/* INTAKE */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Intake</h4>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">PO</span>
            {numInput(po, v => handleField('po', Number(v)))}
            <span className="text-xs text-gray-400 ml-1">mL</span>
          </div>
          {ivFluids.map((iv, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="text"
                value={iv.label}
                onChange={e => updateIv(i, 'label', e.target.value)}
                readOnly={!isLive}
                placeholder="IV label"
                className="flex-1 min-w-0 text-xs bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none"
              />
              {numInput(iv.ml, v => updateIv(i, 'ml', v))}
              <span className="text-xs text-gray-400">mL</span>
              {isLive && (
                <button onClick={() => removeIv(i)} className="text-red-400 text-xs">✕</button>
              )}
            </div>
          ))}
          {isLive && (
            <button onClick={addIv} className="text-xs text-blue-500 hover:text-blue-700">+ Add IV</button>
          )}
        </div>

        {/* OUTPUT */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase">Output</h4>
          <div className="flex justify-between items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">Urine</span>
            {numInput(urine, v => handleField('urine', Number(v)))}
            <span className="text-xs text-gray-400">mL</span>
          </div>
          {cfg.showUOP !== false && (
            <div className="flex justify-between items-center gap-1 pl-2">
              <span className="text-xs text-gray-500">over</span>
              {numInput(urineHours, v => handleField('urineHours', Number(v)))}
              <span className="text-xs text-gray-400">hrs</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                = {uop} mL/hr UOP
              </span>
            </div>
          )}
          <div className="flex justify-between items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">Stool</span>
            {numInput(stool, v => handleField('stool', Number(v)))}
            <span className="text-xs text-gray-400">mL</span>
          </div>
          {drains.map((drain, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="text"
                value={drain.label}
                onChange={e => updateDrain(i, 'label', e.target.value)}
                readOnly={!isLive}
                placeholder="Drain label"
                className="flex-1 min-w-0 text-xs bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none"
              />
              {numInput(drain.ml, v => updateDrain(i, 'ml', v))}
              <span className="text-xs text-gray-400">mL</span>
              {isLive && (
                <button onClick={() => removeDrain(i)} className="text-red-400 text-xs">✕</button>
              )}
            </div>
          ))}
          {isLive && (
            <button onClick={addDrain} className="text-xs text-blue-500 hover:text-blue-700">+ Add Drain</button>
          )}
        </div>
      </div>

      {/* Net Balance */}
      <div className={`text-right text-sm font-semibold border-t border-gray-200 dark:border-gray-700 pt-1 ${netClass}`}>
        Net Balance: {netBalance >= 0 ? '+' : ''}{netBalance} mL
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/modules/intake-output/Editor.tsx`**

```tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const toggle = (key: string) =>
    onConfigChange({ ...config, [key]: !config[key] })

  return (
    <div className="p-3 space-y-3">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={config.showUOP !== false}
          onChange={() => toggle('showUOP')}
          className="rounded"
        />
        Show UOP calculation (mL/hr)
      </label>
      <div>
        <label className="text-sm font-medium block mb-1">Window label</label>
        <input
          type="text"
          value={(config.windowLabel as string) ?? '24h I/O'}
          onChange={e => onConfigChange({ ...config, windowLabel: e.target.value })}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent w-full"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/modules/intake-output/PrintView.tsx`**

```tsx
import type { FC } from 'react'
import { calcUOP, calcNetBalance } from './Renderer'

interface FluidEntry { label: string; ml: number }
interface IOData {
  po: number
  ivFluids: FluidEntry[]
  urine: number
  urineHours: number
  stool: number
  drains: FluidEntry[]
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ config, data }) => {
  const cfg = config as { showUOP?: boolean; windowLabel?: string }
  const d = data as Partial<IOData>
  const po = d.po ?? 0
  const ivFluids: FluidEntry[] = d.ivFluids ?? []
  const urine = d.urine ?? 0
  const urineHours = d.urineHours ?? 0
  const stool = d.stool ?? 0
  const drains: FluidEntry[] = d.drains ?? []
  const uop = calcUOP(urine, urineHours)
  const net = calcNetBalance(d)

  return (
    <div className="p-2 text-sm">
      {cfg.windowLabel && <h4 className="font-semibold mb-2">{cfg.windowLabel}</h4>}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h5 className="font-semibold text-blue-700 border-b border-gray-300 mb-1">Intake</h5>
          <div className="flex justify-between"><span>PO</span><span>{po} mL</span></div>
          {ivFluids.map((iv, i) => (
            <div key={i} className="flex justify-between">
              <span>{iv.label || `IV ${i + 1}`}</span>
              <span>{iv.ml} mL</span>
            </div>
          ))}
        </div>
        <div>
          <h5 className="font-semibold text-orange-700 border-b border-gray-300 mb-1">Output</h5>
          <div className="flex justify-between">
            <span>Urine</span>
            <span>{urine} mL{cfg.showUOP !== false && urineHours > 0 ? ` (${uop} mL/hr)` : ''}</span>
          </div>
          <div className="flex justify-between"><span>Stool</span><span>{stool} mL</span></div>
          {drains.map((dr, i) => (
            <div key={i} className="flex justify-between">
              <span>{dr.label || `Drain ${i + 1}`}</span>
              <span>{dr.ml} mL</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`text-right font-semibold mt-2 pt-1 border-t border-gray-300 ${net >= 0 ? 'text-green-700' : 'text-red-600'}`}>
        Net Balance: {net >= 0 ? '+' : ''}{net} mL
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write `src/modules/intake-output/index.ts`**

```ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const intakeOutputPlugin: ModulePlugin = {
  meta: {
    id: 'intake-output',
    name: 'Intake & Output',
    version: '1.0.0',
    author: 'core',
    description: '24-hour I/O tracker with UOP auto-calculation and net balance.',
    tags: ['nursing', 'i/o', 'fluids', 'critical-care'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    showUOP: true,
    windowLabel: '24h I/O',
  },
  minSize: { w: 4, h: 5 },
  Renderer,
  Editor,
  PrintView,
}
```

- [ ] **Step 6: Run vitest — expect pass**

```bash
npx vitest run src/modules/intake-output/intake-output.test.tsx
```

- [ ] **Step 7: Git commit**

```bash
cd ~/projects/patient-templates
git add src/modules/intake-output/
git commit -m "feat: add intake-output module"
```

---

## Final Verification

- [ ] **Run all Plan 2a tests together**

```bash
npx vitest run src/modules/patient-header/ src/modules/vitals/ src/modules/labs-panel/ src/modules/labs-fishbone/ src/modules/assessment-plan/ src/modules/medications/ src/modules/intake-output/
```

All tests should pass.

- [ ] **Run full build**

```bash
npm run build
```

Build should complete with zero errors.

- [ ] **Git tag completion**

```bash
cd ~/projects/patient-templates
git tag plan-2a-complete
```

---

## Notes for Plan 2b

Plan 2b will implement the remaining 7 modules:
- `lines-tubes`
- `task-checklist`
- `free-text`
- `consults`
- `nursing-assessment`
- `custom-fields`
- `calculated`

Plan 2b will also update `src/modules/index.ts` to import and register all 14 modules (replacing the partial registration from this plan).
