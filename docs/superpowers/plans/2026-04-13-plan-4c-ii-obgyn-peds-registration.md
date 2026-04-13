# Patient Template Builder — Plan 4c-ii: Specialty Packs (OB/GYN + Peds) + Final Pack Registration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement OB/GYN and Pediatrics/Neonatology packs, then wire all 12 specialty packs into the global registry.

**Architecture:** Each pack lives under `src/modules/packs/<pack>/`, registers via `src/modules/packs/index.ts`. Each module follows the identical ModulePlugin interface from Plan 1.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## Task 1: OB/GYN — antepartum-tracker

**Files:**
- `src/modules/packs/obgyn/antepartum-tracker/antepartum-tracker.test.tsx`
- `src/modules/packs/obgyn/antepartum-tracker/index.ts`
- `src/modules/packs/obgyn/antepartum-tracker/Renderer.tsx`
- `src/modules/packs/obgyn/antepartum-tracker/Editor.tsx`
- `src/modules/packs/obgyn/antepartum-tracker/PrintView.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/modules/packs/obgyn/antepartum-tracker/antepartum-tracker.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcGA } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

describe('calcGA', () => {
  it('returns correct weeks and days', () => {
    // LMP 2026-01-01, today 2026-04-13 => 101 days => 14 weeks 3 days
    const result = calcGA('2026-01-01', '2026-04-13')
    expect(result.weeks).toBe(14)
    expect(result.days).toBe(3)
  })

  it('returns 0 weeks 0 days for same day', () => {
    const result = calcGA('2026-04-13', '2026-04-13')
    expect(result.weeks).toBe(0)
    expect(result.days).toBe(0)
  })
})

describe('Renderer', () => {
  it('renders GA and FHR fields', () => {
    render(
      <Renderer
        instanceId="test-1"
        config={{}}
        data={{ lmpDate: '2026-01-01', fhr: 145, contractionFreq: 5, contractionDuration: 40, contractionRegularity: 'regular', presentation: 'cephalic', gbsStatus: 'negative', gbsProphylaxis: false }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/14 weeks/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('145')).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders citation', () => {
    render(
      <PrintView
        config={{}}
        data={{ lmpDate: '2026-01-01', fhr: 140, contractionFreq: 5, contractionDuration: 40, contractionRegularity: 'regular', presentation: 'cephalic', gbsStatus: 'negative', gbsProphylaxis: false }}
      />
    )
    expect(screen.getByText(/ACOG/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — confirm failure**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/obgyn/antepartum-tracker/antepartum-tracker.test.tsx 2>&1 | tail -20
```

- [ ] **Step 3: Write `index.ts`**

```ts
// src/modules/packs/obgyn/antepartum-tracker/index.ts
import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

export function calcGA(lmpDate: string, today: string): { weeks: number; days: number } {
  const lmp = new Date(lmpDate).getTime()
  const now = new Date(today).getTime()
  const totalDays = Math.max(0, Math.floor((now - lmp) / (1000 * 60 * 60 * 24)))
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 }
}

const plugin: ModulePlugin = {
  meta: {
    id: 'antepartum-tracker',
    name: 'Antepartum Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Tracks gestational age, FHR, contraction pattern, fetal presentation, and GBS status.',
    tags: ['obgyn', 'antepartum', 'obstetrics'],
    pack: 'obgyn',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        lmpDate: { type: 'string' },
        fhr: { type: 'number' },
        contractionFreq: { type: 'number' },
        contractionDuration: { type: 'number' },
        contractionRegularity: { type: 'string' },
        presentation: { type: 'string' },
        gbsStatus: { type: 'string' },
        gbsProphylaxis: { type: 'boolean' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
```

- [ ] **Step 4: Write `Renderer.tsx`**

```tsx
// src/modules/packs/obgyn/antepartum-tracker/Renderer.tsx
import type { FC } from 'react'
import { calcGA } from './index'

const CITATION = 'ACOG Practice Bulletin No. 230. Obstet Gynecol. 2021;137(6):e172-e197'

interface Data {
  lmpDate?: string
  fhr?: number
  contractionFreq?: number
  contractionDuration?: number
  contractionRegularity?: string
  presentation?: string
  gbsStatus?: string
  gbsProphylaxis?: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Data
  const today = new Date().toISOString().split('T')[0]
  const ga = d.lmpDate ? calcGA(d.lmpDate, today) : null
  const readOnly = mode === 'build'

  const set = (key: keyof Data, value: unknown) =>
    onDataChange({ ...data, [key]: value })

  return (
    <div className="p-3 space-y-3 text-sm">
      <h3 className="font-semibold text-base">Antepartum Tracker</h3>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">LMP Date</span>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm bg-transparent"
            value={d.lmpDate ?? ''}
            disabled={readOnly}
            onChange={e => set('lmpDate', e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Gestational Age</span>
          <span className="font-bold text-lg">
            {ga ? `${ga.weeks} weeks ${ga.days} days` : '—'}
          </span>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">FHR (BPM)</span>
          <input
            type="number"
            className="border rounded px-2 py-1 bg-transparent"
            value={d.fhr ?? ''}
            disabled={readOnly}
            onChange={e => set('fhr', Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Fetal Presentation</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={d.presentation ?? 'cephalic'}
            disabled={readOnly}
            onChange={e => set('presentation', e.target.value)}
          >
            {['cephalic', 'breech', 'transverse', 'oblique'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Contraction Freq (per min)</span>
          <input
            type="number"
            className="border rounded px-2 py-1 bg-transparent"
            value={d.contractionFreq ?? ''}
            disabled={readOnly}
            onChange={e => set('contractionFreq', Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Duration (sec)</span>
          <input
            type="number"
            className="border rounded px-2 py-1 bg-transparent"
            value={d.contractionDuration ?? ''}
            disabled={readOnly}
            onChange={e => set('contractionDuration', Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Regularity</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={d.contractionRegularity ?? 'regular'}
            disabled={readOnly}
            onChange={e => set('contractionRegularity', e.target.value)}
          >
            <option value="regular">Regular</option>
            <option value="irregular">Irregular</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">GBS Status</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={d.gbsStatus ?? 'unknown'}
            disabled={readOnly}
            onChange={e => set('gbsStatus', e.target.value)}
          >
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={d.gbsProphylaxis ?? false}
          disabled={readOnly}
          onChange={e => set('gbsProphylaxis', e.target.checked)}
        />
        <span className="text-xs">GBS Prophylaxis Given</span>
      </label>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 5: Write `Editor.tsx`**

```tsx
// src/modules/packs/obgyn/antepartum-tracker/Editor.tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => (
  <div className="p-3 text-sm text-gray-400">
    No configuration options for Antepartum Tracker.
  </div>
)
```

- [ ] **Step 6: Write `PrintView.tsx`**

```tsx
// src/modules/packs/obgyn/antepartum-tracker/PrintView.tsx
import type { FC } from 'react'
import { calcGA } from './index'

const CITATION = 'ACOG Practice Bulletin No. 230. Obstet Gynecol. 2021;137(6):e172-e197'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Record<string, unknown>
  const today = new Date().toISOString().split('T')[0]
  const ga = d.lmpDate ? calcGA(d.lmpDate as string, today) : null

  return (
    <div className="text-sm space-y-1">
      <h3 className="font-bold">Antepartum Tracker</h3>
      <p>GA: {ga ? `${ga.weeks}w ${ga.days}d` : '—'}</p>
      <p>FHR: {d.fhr != null ? `${d.fhr} BPM` : '—'}</p>
      <p>Presentation: {(d.presentation as string) ?? '—'}</p>
      <p>Contractions: {d.contractionFreq != null ? `${d.contractionFreq}/min, ${d.contractionDuration}s, ${d.contractionRegularity}` : '—'}</p>
      <p>GBS: {(d.gbsStatus as string) ?? '—'} | Prophylaxis: {d.gbsProphylaxis ? 'Yes' : 'No'}</p>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — confirm passing**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/obgyn/antepartum-tracker/antepartum-tracker.test.tsx 2>&1 | tail -20
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates && git add src/modules/packs/obgyn/antepartum-tracker/ && git commit -m "feat(obgyn): add antepartum-tracker module"
```

---

## Task 2: OB/GYN — postpartum-assessment

**Files:**
- `src/modules/packs/obgyn/postpartum-assessment/postpartum-assessment.test.tsx`
- `src/modules/packs/obgyn/postpartum-assessment/index.ts`
- `src/modules/packs/obgyn/postpartum-assessment/Renderer.tsx`
- `src/modules/packs/obgyn/postpartum-assessment/Editor.tsx`
- `src/modules/packs/obgyn/postpartum-assessment/PrintView.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/modules/packs/obgyn/postpartum-assessment/postpartum-assessment.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const baseData = {
  fundalHeight: 2,
  fundalFirmness: 'firm',
  lochiaCharacter: 'rubra',
  lochiaVolume: 'light',
  perineumStatus: 'intact',
  breastfeeding: 'exclusive',
  moodNote: 'Appears well',
}

describe('Renderer', () => {
  it('renders postpartum fields', () => {
    render(
      <Renderer
        instanceId="pp-1"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Postpartum Assessment/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders all postpartum fields', () => {
    render(<PrintView config={{}} data={baseData} />)
    expect(screen.getByText(/Postpartum Assessment/i)).toBeInTheDocument()
    expect(screen.getByText(/rubra/i)).toBeInTheDocument()
    expect(screen.getByText(/Appears well/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — confirm failure**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/obgyn/postpartum-assessment/postpartum-assessment.test.tsx 2>&1 | tail -20
```

- [ ] **Step 3: Write `index.ts`**

```ts
// src/modules/packs/obgyn/postpartum-assessment/index.ts
import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

const plugin: ModulePlugin = {
  meta: {
    id: 'postpartum-assessment',
    name: 'Postpartum Assessment',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Fundal assessment, lochia, perineum, breastfeeding, and mood documentation.',
    tags: ['obgyn', 'postpartum', 'obstetrics'],
    pack: 'obgyn',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        fundalHeight: { type: 'number' },
        fundalFirmness: { type: 'string' },
        lochiaCharacter: { type: 'string' },
        lochiaVolume: { type: 'string' },
        perineumStatus: { type: 'string' },
        breastfeeding: { type: 'string' },
        moodNote: { type: 'string' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
```

- [ ] **Step 4: Write `Renderer.tsx`**

```tsx
// src/modules/packs/obgyn/postpartum-assessment/Renderer.tsx
import type { FC } from 'react'

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Record<string, unknown>
  const readOnly = mode === 'build'
  const set = (key: string, value: unknown) => onDataChange({ ...data, [key]: value })

  return (
    <div className="p-3 space-y-3 text-sm">
      <h3 className="font-semibold text-base">Postpartum Assessment</h3>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Fundal Height (cm below umbilicus)</span>
          <input
            type="number"
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.fundalHeight as number) ?? ''}
            disabled={readOnly}
            onChange={e => set('fundalHeight', Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Fundal Firmness</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.fundalFirmness as string) ?? 'firm'}
            disabled={readOnly}
            onChange={e => set('fundalFirmness', e.target.value)}
          >
            <option value="firm">Firm</option>
            <option value="boggy">Boggy</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Lochia Character</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.lochiaCharacter as string) ?? 'rubra'}
            disabled={readOnly}
            onChange={e => set('lochiaCharacter', e.target.value)}
          >
            <option value="rubra">Rubra</option>
            <option value="serosa">Serosa</option>
            <option value="alba">Alba</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Lochia Volume</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.lochiaVolume as string) ?? 'light'}
            disabled={readOnly}
            onChange={e => set('lochiaVolume', e.target.value)}
          >
            {['scant', 'light', 'moderate', 'heavy'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Perineum / Incision</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.perineumStatus as string) ?? 'intact'}
            disabled={readOnly}
            onChange={e => set('perineumStatus', e.target.value)}
          >
            {['intact', 'ecchymosis', 'edema', 'hematoma', 'dehiscence'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Breastfeeding</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.breastfeeding as string) ?? 'exclusive'}
            disabled={readOnly}
            onChange={e => set('breastfeeding', e.target.value)}
          >
            <option value="exclusive">Exclusive</option>
            <option value="supplementing">Supplementing</option>
            <option value="formula only">Formula Only</option>
            <option value="not attempting">Not Attempting</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-gray-400 text-xs">Mood / Affect Note</span>
        <textarea
          className="border rounded px-2 py-1 bg-transparent w-full"
          rows={2}
          value={(d.moodNote as string) ?? ''}
          disabled={readOnly}
          onChange={e => set('moodNote', e.target.value)}
        />
      </label>
    </div>
  )
}
```

- [ ] **Step 5: Write `Editor.tsx`**

```tsx
// src/modules/packs/obgyn/postpartum-assessment/Editor.tsx
import type { FC } from 'react'

export const Editor: FC<{ config: Record<string, unknown>; onConfigChange: (c: Record<string, unknown>) => void }> = () => (
  <div className="p-3 text-sm text-gray-400">No configuration options.</div>
)
```

- [ ] **Step 6: Write `PrintView.tsx`**

```tsx
// src/modules/packs/obgyn/postpartum-assessment/PrintView.tsx
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Record<string, string | number>
  return (
    <div className="text-sm space-y-1">
      <h3 className="font-bold">Postpartum Assessment</h3>
      <p>Fundal Height: {d.fundalHeight != null ? `${d.fundalHeight} cm below umbilicus` : '—'} | Firmness: {d.fundalFirmness ?? '—'}</p>
      <p>Lochia: {d.lochiaCharacter ?? '—'} / {d.lochiaVolume ?? '—'}</p>
      <p>Perineum/Incision: {d.perineumStatus ?? '—'}</p>
      <p>Breastfeeding: {d.breastfeeding ?? '—'}</p>
      <p>Mood/Affect: {d.moodNote ?? '—'}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — confirm passing**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/obgyn/postpartum-assessment/postpartum-assessment.test.tsx 2>&1 | tail -20
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates && git add src/modules/packs/obgyn/postpartum-assessment/ && git commit -m "feat(obgyn): add postpartum-assessment module"
```

---

## Task 3: OB/GYN — preeclampsia-tracker

**Files:**
- `src/modules/packs/obgyn/preeclampsia-tracker/preeclampsia-tracker.test.tsx`
- `src/modules/packs/obgyn/preeclampsia-tracker/index.ts`
- `src/modules/packs/obgyn/preeclampsia-tracker/Renderer.tsx`
- `src/modules/packs/obgyn/preeclampsia-tracker/Editor.tsx`
- `src/modules/packs/obgyn/preeclampsia-tracker/PrintView.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/modules/packs/obgyn/preeclampsia-tracker/preeclampsia-tracker.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcMAP, hasSevereRange } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

describe('calcMAP', () => {
  it('calculates MAP correctly', () => {
    // MAP = (120 + 2*80) / 3 = 280/3 = 93.3
    expect(calcMAP(120, 80)).toBeCloseTo(93.3, 0)
  })

  it('calculates severe MAP', () => {
    expect(calcMAP(170, 115)).toBeCloseTo(133.3, 0)
  })
})

describe('hasSevereRange', () => {
  it('returns true for 2 severe readings ≥4h apart', () => {
    const log = [
      { sbp: 165, dbp: 112, timestamp: '2026-04-13T08:00:00Z' },
      { sbp: 162, dbp: 111, timestamp: '2026-04-13T12:30:00Z' },
    ]
    expect(hasSevereRange(log)).toBe(true)
  })

  it('returns false for 2 severe readings <4h apart', () => {
    const log = [
      { sbp: 165, dbp: 112, timestamp: '2026-04-13T08:00:00Z' },
      { sbp: 162, dbp: 111, timestamp: '2026-04-13T10:00:00Z' },
    ]
    expect(hasSevereRange(log)).toBe(false)
  })

  it('returns false when no severe readings', () => {
    const log = [
      { sbp: 140, dbp: 90, timestamp: '2026-04-13T08:00:00Z' },
    ]
    expect(hasSevereRange(log)).toBe(false)
  })
})

describe('Renderer', () => {
  it('renders preeclampsia tracker', () => {
    render(
      <Renderer
        instanceId="pe-1"
        config={{}}
        data={{ bpLog: [], proteinuria: false, severeFeatures: {}, magDrip: {} }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Preeclampsia Tracker/i)).toBeInTheDocument()
    expect(screen.getByText(/ACOG Practice Bulletin No. 222/i)).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders citation', () => {
    render(<PrintView config={{}} data={{ bpLog: [], proteinuria: false, severeFeatures: {}, magDrip: {} }} />)
    expect(screen.getByText(/ACOG Practice Bulletin No. 222/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — confirm failure**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/obgyn/preeclampsia-tracker/preeclampsia-tracker.test.tsx 2>&1 | tail -20
```

- [ ] **Step 3: Write `index.ts`**

```ts
// src/modules/packs/obgyn/preeclampsia-tracker/index.ts
import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

export const CITATION = 'ACOG Practice Bulletin No. 222. Obstet Gynecol. 2020;135(6):e237-e260'

export function calcMAP(sbp: number, dbp: number): number {
  return (sbp + 2 * dbp) / 3
}

export function hasSevereRange(
  bpLog: Array<{ sbp: number; dbp: number; timestamp: string }>
): boolean {
  const severe = bpLog.filter(r => r.sbp >= 160 || r.dbp >= 110)
  if (severe.length < 2) return false
  for (let i = 0; i < severe.length; i++) {
    for (let j = i + 1; j < severe.length; j++) {
      const diffMs =
        Math.abs(new Date(severe[j].timestamp).getTime() - new Date(severe[i].timestamp).getTime())
      if (diffMs >= 4 * 60 * 60 * 1000) return true
    }
  }
  return false
}

const plugin: ModulePlugin = {
  meta: {
    id: 'preeclampsia-tracker',
    name: 'Preeclampsia Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'BP log, severe-range detection, severe features checklist, and mag drip tracker per ACOG 2020.',
    tags: ['obgyn', 'preeclampsia', 'obstetrics', 'hypertension'],
    pack: 'obgyn',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        bpLog: { type: 'array' },
        proteinuria: { type: 'boolean' },
        severeFeatures: { type: 'object' },
        magDrip: { type: 'object' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 6 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
```

- [ ] **Step 4: Write `Renderer.tsx`**

```tsx
// src/modules/packs/obgyn/preeclampsia-tracker/Renderer.tsx
import type { FC } from 'react'
import { useState } from 'react'
import { CITATION, calcMAP, hasSevereRange } from './index'

interface BPEntry { timestamp: string; systolic: number; diastolic: number }
interface SevereFeatures {
  thrombocytopenia?: boolean
  impairedRenal?: boolean
  impairedLiver?: boolean
  pulmonaryEdema?: boolean
  severeHeadache?: boolean
  visualDisturbances?: boolean
}
interface MagDrip {
  loadingDone?: boolean
  maintenanceRate?: number
  urineOutput?: number
  reflexes?: string
  respiratoryRate?: number
}
interface Data {
  bpLog?: BPEntry[]
  proteinuria?: boolean
  severeFeatures?: SevereFeatures
  magDrip?: MagDrip
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Data
  const readOnly = mode === 'build'
  const bpLog = d.bpLog ?? []
  const sf = d.severeFeatures ?? {}
  const mag = d.magDrip ?? {}

  const [newSBP, setNewSBP] = useState('')
  const [newDBP, setNewDBP] = useState('')

  const set = (key: string, value: unknown) => onDataChange({ ...data, [key]: value })
  const setSF = (key: keyof SevereFeatures, value: boolean) =>
    set('severeFeatures', { ...sf, [key]: value })
  const setMag = (key: keyof MagDrip, value: unknown) =>
    set('magDrip', { ...mag, [key]: value })

  const addBP = () => {
    if (!newSBP || !newDBP) return
    const entry: BPEntry = {
      timestamp: new Date().toISOString(),
      systolic: Number(newSBP),
      diastolic: Number(newDBP),
    }
    set('bpLog', [...bpLog, entry])
    setNewSBP('')
    setNewDBP('')
  }

  const severeFlag = hasSevereRange(
    bpLog.map(r => ({ sbp: r.systolic, dbp: r.diastolic, timestamp: r.timestamp }))
  )

  const lowUOP = (mag.urineOutput ?? 999) < 25
  const lowRR = (mag.respiratoryRate ?? 999) < 12

  return (
    <div className="p-3 space-y-4 text-sm">
      <h3 className="font-semibold text-base">Preeclampsia Tracker</h3>

      {severeFlag && (
        <div className="bg-red-900/40 border border-red-500 rounded p-2 text-red-300 font-semibold text-xs">
          SEVERE RANGE: ≥2 readings with SBP≥160 or DBP≥110, ≥4h apart
        </div>
      )}

      {/* BP Log */}
      <section>
        <h4 className="font-medium mb-1">BP Log</h4>
        {bpLog.length === 0 && <p className="text-gray-500 text-xs">No readings recorded.</p>}
        <table className="w-full text-xs border-collapse mb-2">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left pb-1">Time</th>
              <th className="text-left pb-1">SBP</th>
              <th className="text-left pb-1">DBP</th>
              <th className="text-left pb-1">MAP</th>
            </tr>
          </thead>
          <tbody>
            {bpLog.map((r, i) => (
              <tr key={i} className={r.systolic >= 160 || r.diastolic >= 110 ? 'text-red-400' : ''}>
                <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                <td>{r.systolic}</td>
                <td>{r.diastolic}</td>
                <td>{calcMAP(r.systolic, r.diastolic).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!readOnly && (
          <div className="flex gap-2 items-end">
            <label className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs">SBP</span>
              <input type="number" className="border rounded px-2 py-1 w-16 bg-transparent" value={newSBP} onChange={e => setNewSBP(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs">DBP</span>
              <input type="number" className="border rounded px-2 py-1 w-16 bg-transparent" value={newDBP} onChange={e => setNewDBP(e.target.value)} />
            </label>
            <button onClick={addBP} className="px-3 py-1 bg-blue-600 rounded text-white text-xs">Add</button>
          </div>
        )}
      </section>

      {/* Proteinuria */}
      <section>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={d.proteinuria ?? false} disabled={readOnly} onChange={e => set('proteinuria', e.target.checked)} />
          <span>Proteinuria: ≥300mg/24hr or spot PCR ≥0.3</span>
        </label>
      </section>

      {/* Severe Features */}
      <section>
        <h4 className="font-medium mb-1">Severe Features (ACOG 2020)</h4>
        {([
          ['thrombocytopenia', 'Thrombocytopenia (<100k)'],
          ['impairedRenal', 'Impaired renal (Cr >1.1 or 2× baseline)'],
          ['impairedLiver', 'Impaired liver (AST/ALT >2× normal)'],
          ['pulmonaryEdema', 'Pulmonary edema'],
          ['severeHeadache', 'New severe headache'],
          ['visualDisturbances', 'Visual disturbances'],
        ] as [keyof SevereFeatures, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={sf[key] ?? false}
              disabled={readOnly}
              onChange={e => setSF(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </section>

      {/* Mag Drip */}
      <section>
        <h4 className="font-medium mb-1">Magnesium Drip Tracker</h4>
        <label className="flex items-center gap-2 text-xs mb-2">
          <input type="checkbox" checked={mag.loadingDone ?? false} disabled={readOnly} onChange={e => setMag('loadingDone', e.target.checked)} />
          Loading dose given (4g IV)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Maintenance Rate (g/hr)</span>
            <input type="number" step="0.5" className="border rounded px-2 py-1 bg-transparent" value={mag.maintenanceRate ?? ''} disabled={readOnly} onChange={e => setMag('maintenanceRate', Number(e.target.value))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={`text-xs ${lowUOP ? 'text-red-400 font-bold' : 'text-gray-400'}`}>Urine Output (mL/hr){lowUOP ? ' ⚠ <25' : ''}</span>
            <input type="number" className={`border rounded px-2 py-1 bg-transparent ${lowUOP ? 'border-red-500' : ''}`} value={mag.urineOutput ?? ''} disabled={readOnly} onChange={e => setMag('urineOutput', Number(e.target.value))} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Reflexes</span>
            <select className="border rounded px-2 py-1 bg-transparent" value={mag.reflexes ?? 'present'} disabled={readOnly} onChange={e => setMag('reflexes', e.target.value)}>
              <option value="present">Present</option>
              <option value="diminished">Diminished</option>
              <option value="absent">Absent</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={`text-xs ${lowRR ? 'text-red-400 font-bold' : 'text-gray-400'}`}>Respiratory Rate{lowRR ? ' ⚠ <12' : ''}</span>
            <input type="number" className={`border rounded px-2 py-1 bg-transparent ${lowRR ? 'border-red-500' : ''}`} value={mag.respiratoryRate ?? ''} disabled={readOnly} onChange={e => setMag('respiratoryRate', Number(e.target.value))} />
          </label>
        </div>
      </section>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 5: Write `Editor.tsx`**

```tsx
// src/modules/packs/obgyn/preeclampsia-tracker/Editor.tsx
import type { FC } from 'react'

export const Editor: FC<{ config: Record<string, unknown>; onConfigChange: (c: Record<string, unknown>) => void }> = () => (
  <div className="p-3 text-sm text-gray-400">No configuration options.</div>
)
```

- [ ] **Step 6: Write `PrintView.tsx`**

```tsx
// src/modules/packs/obgyn/preeclampsia-tracker/PrintView.tsx
import type { FC } from 'react'
import { CITATION, calcMAP, hasSevereRange } from './index'

interface BPEntry { timestamp: string; systolic: number; diastolic: number }

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as { bpLog?: BPEntry[]; proteinuria?: boolean; severeFeatures?: Record<string, boolean>; magDrip?: Record<string, unknown> }
  const bpLog = d.bpLog ?? []
  const sf = d.severeFeatures ?? {}
  const mag = d.magDrip ?? {}
  const severeFlag = hasSevereRange(bpLog.map(r => ({ sbp: r.systolic, dbp: r.diastolic, timestamp: r.timestamp })))

  const sfLabels: Record<string, string> = {
    thrombocytopenia: 'Thrombocytopenia',
    impairedRenal: 'Impaired Renal',
    impairedLiver: 'Impaired Liver',
    pulmonaryEdema: 'Pulmonary Edema',
    severeHeadache: 'Severe Headache',
    visualDisturbances: 'Visual Disturbances',
  }

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold">Preeclampsia Tracker</h3>
      {severeFlag && <p className="font-bold text-red-600">SEVERE RANGE DETECTED</p>}
      <div>
        <strong>BP Log:</strong>
        {bpLog.length === 0 ? ' None' : (
          <table className="text-xs mt-1 w-full">
            <thead><tr><th className="text-left">Time</th><th>SBP</th><th>DBP</th><th>MAP</th></tr></thead>
            <tbody>
              {bpLog.map((r, i) => (
                <tr key={i}>
                  <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                  <td>{r.systolic}</td>
                  <td>{r.diastolic}</td>
                  <td>{calcMAP(r.systolic, r.diastolic).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p>Proteinuria: {d.proteinuria ? 'Yes' : 'No'}</p>
      <p>Severe Features: {Object.entries(sf).filter(([, v]) => v).map(([k]) => sfLabels[k] ?? k).join(', ') || 'None'}</p>
      <p>Mag Drip — Loading: {mag.loadingDone ? 'Given' : 'Not given'} | Maintenance: {mag.maintenanceRate ?? '—'} g/hr | UOP: {mag.urineOutput ?? '—'} mL/hr | Reflexes: {mag.reflexes ?? '—'} | RR: {mag.respiratoryRate ?? '—'}</p>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — confirm passing**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/obgyn/preeclampsia-tracker/preeclampsia-tracker.test.tsx 2>&1 | tail -20
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates && git add src/modules/packs/obgyn/preeclampsia-tracker/ && git commit -m "feat(obgyn): add preeclampsia-tracker module"
```

---

## Task 4: OB/GYN — pack index

**Files:**
- `src/modules/packs/obgyn/index.ts`

- [ ] **Step 1: Write `src/modules/packs/obgyn/index.ts`**

```ts
// src/modules/packs/obgyn/index.ts
import './antepartum-tracker'
import './postpartum-assessment'
import './preeclampsia-tracker'
```

- [ ] **Step 2: Commit**

```bash
cd ~/projects/patient-templates && git add src/modules/packs/obgyn/index.ts && git commit -m "feat(obgyn): wire obgyn pack index"
```

---

## Task 5: Peds — weight-based-dosing

**Files:**
- `src/modules/packs/peds/weight-based-dosing/weight-based-dosing.test.tsx`
- `src/modules/packs/peds/weight-based-dosing/index.ts`
- `src/modules/packs/peds/weight-based-dosing/Renderer.tsx`
- `src/modules/packs/peds/weight-based-dosing/Editor.tsx`
- `src/modules/packs/peds/weight-based-dosing/PrintView.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/modules/packs/peds/weight-based-dosing/weight-based-dosing.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const baseData = {
  drugName: 'Amoxicillin',
  weightKg: 20,
  doseMgKg: 25,
  frequency: 'q8h',
  concentrationMgMl: 250,
}

describe('Renderer', () => {
  it('calculates total dose and volume', () => {
    render(
      <Renderer
        instanceId="wbd-1"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // total dose = 20 * 25 = 500 mg
    expect(screen.getByText(/500(\s*)mg/i)).toBeInTheDocument()
    // volume = 500 / 250 = 2 mL
    expect(screen.getByText(/2(\s*)mL/i)).toBeInTheDocument()
  })

  it('renders disclaimer', () => {
    render(
      <Renderer instanceId="wbd-2" config={{}} data={baseData} onDataChange={() => {}} mode="live" />
    )
    expect(screen.getByText(/verify doses against institutional pharmacy/i)).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders drug name and disclaimer', () => {
    render(<PrintView config={{}} data={baseData} />)
    expect(screen.getByText(/Amoxicillin/i)).toBeInTheDocument()
    expect(screen.getByText(/verify doses against institutional pharmacy/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — confirm failure**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/peds/weight-based-dosing/weight-based-dosing.test.tsx 2>&1 | tail -20
```

- [ ] **Step 3: Write `index.ts`**

```ts
// src/modules/packs/peds/weight-based-dosing/index.ts
import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

const plugin: ModulePlugin = {
  meta: {
    id: 'weight-based-dosing',
    name: 'Weight-Based Dosing',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Calculates total dose (mg) and volume (mL) from weight, dose per kg, and concentration.',
    tags: ['peds', 'dosing', 'neonatology', 'pharmacology'],
    pack: 'peds',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        drugName: { type: 'string' },
        weightKg: { type: 'number' },
        doseMgKg: { type: 'number' },
        frequency: { type: 'string' },
        concentrationMgMl: { type: 'number' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 3 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
```

- [ ] **Step 4: Write `Renderer.tsx`**

```tsx
// src/modules/packs/peds/weight-based-dosing/Renderer.tsx
import type { FC } from 'react'

const DISCLAIMER = 'Always verify doses against institutional pharmacy guidelines and current references.'

interface Data {
  drugName?: string
  weightKg?: number
  doseMgKg?: number
  frequency?: string
  concentrationMgMl?: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Data
  const readOnly = mode === 'build'
  const set = (key: keyof Data, value: unknown) => onDataChange({ ...data, [key]: value })

  const totalDose =
    d.weightKg != null && d.doseMgKg != null ? d.weightKg * d.doseMgKg : null
  const volume =
    totalDose != null && d.concentrationMgMl ? totalDose / d.concentrationMgMl : null

  return (
    <div className="p-3 space-y-3 text-sm">
      <h3 className="font-semibold text-base">Weight-Based Dosing</h3>

      <div className="bg-amber-900/30 border border-amber-500 rounded p-2 text-amber-300 text-xs font-medium">
        {DISCLAIMER}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 col-span-2">
          <span className="text-gray-400 text-xs">Drug Name</span>
          <input
            type="text"
            className="border rounded px-2 py-1 bg-transparent"
            value={d.drugName ?? ''}
            disabled={readOnly}
            onChange={e => set('drugName', e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Weight (kg)</span>
          <input
            type="number"
            step="0.1"
            className="border rounded px-2 py-1 bg-transparent"
            value={d.weightKg ?? ''}
            disabled={readOnly}
            onChange={e => set('weightKg', Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Dose (mg/kg)</span>
          <input
            type="number"
            step="0.1"
            className="border rounded px-2 py-1 bg-transparent"
            value={d.doseMgKg ?? ''}
            disabled={readOnly}
            onChange={e => set('doseMgKg', Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Frequency</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={d.frequency ?? 'q8h'}
            disabled={readOnly}
            onChange={e => set('frequency', e.target.value)}
          >
            {['q4h', 'q6h', 'q8h', 'q12h', 'q24h'].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Concentration (mg/mL)</span>
          <input
            type="number"
            step="0.1"
            className="border rounded px-2 py-1 bg-transparent"
            value={d.concentrationMgMl ?? ''}
            disabled={readOnly}
            onChange={e => set('concentrationMgMl', Number(e.target.value))}
          />
        </label>
      </div>

      <div className="bg-surface-raised rounded p-3 space-y-1">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Calculated</p>
        <p className="text-lg font-bold">
          {totalDose != null ? `${totalDose} mg` : '—'}
          <span className="text-sm font-normal text-gray-400 ml-2">total dose</span>
        </p>
        <p className="text-lg font-bold">
          {volume != null ? `${volume.toFixed(2)} mL` : '—'}
          <span className="text-sm font-normal text-gray-400 ml-2">volume</span>
        </p>
        {d.frequency && totalDose != null && (
          <p className="text-xs text-gray-400">{d.frequency} dosing</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write `Editor.tsx`**

```tsx
// src/modules/packs/peds/weight-based-dosing/Editor.tsx
import type { FC } from 'react'

export const Editor: FC<{ config: Record<string, unknown>; onConfigChange: (c: Record<string, unknown>) => void }> = () => (
  <div className="p-3 text-sm text-gray-400">No configuration options.</div>
)
```

- [ ] **Step 6: Write `PrintView.tsx`**

```tsx
// src/modules/packs/peds/weight-based-dosing/PrintView.tsx
import type { FC } from 'react'

const DISCLAIMER = 'Always verify doses against institutional pharmacy guidelines and current references.'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as { drugName?: string; weightKg?: number; doseMgKg?: number; frequency?: string; concentrationMgMl?: number }
  const totalDose = d.weightKg != null && d.doseMgKg != null ? d.weightKg * d.doseMgKg : null
  const volume = totalDose != null && d.concentrationMgMl ? totalDose / d.concentrationMgMl : null

  return (
    <div className="text-sm space-y-1">
      <h3 className="font-bold">Weight-Based Dosing</h3>
      <p>Drug: {d.drugName ?? '—'}</p>
      <p>Weight: {d.weightKg ?? '—'} kg | Dose: {d.doseMgKg ?? '—'} mg/kg | Frequency: {d.frequency ?? '—'}</p>
      <p>Concentration: {d.concentrationMgMl ?? '—'} mg/mL</p>
      <p className="font-semibold">Total Dose: {totalDose != null ? `${totalDose} mg` : '—'} | Volume: {volume != null ? `${volume.toFixed(2)} mL` : '—'}</p>
      <p className="text-xs italic text-gray-500 mt-1">{DISCLAIMER}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — confirm passing**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/peds/weight-based-dosing/weight-based-dosing.test.tsx 2>&1 | tail -20
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates && git add src/modules/packs/peds/weight-based-dosing/ && git commit -m "feat(peds): add weight-based-dosing module"
```

---

## Task 6: Peds — nas-scoring

**Files:**
- `src/modules/packs/peds/nas-scoring/nas-scoring.test.tsx`
- `src/modules/packs/peds/nas-scoring/index.ts`
- `src/modules/packs/peds/nas-scoring/Renderer.tsx`
- `src/modules/packs/peds/nas-scoring/Editor.tsx`
- `src/modules/packs/peds/nas-scoring/PrintView.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/modules/packs/peds/nas-scoring/nas-scoring.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcNAS } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

describe('calcNAS', () => {
  it('sums all item scores', () => {
    // 25 items, all zeros
    expect(calcNAS(new Array(25).fill(0))).toBe(0)
  })

  it('sums mixed scores', () => {
    const items = new Array(25).fill(0)
    items[0] = 2   // crying
    items[4] = 3   // tremors undisturbed
    items[8] = 5   // generalized convulsions
    expect(calcNAS(items)).toBe(10)
  })

  it('handles threshold ≥8', () => {
    const items = new Array(25).fill(0)
    items[0] = 2
    items[1] = 3
    items[2] = 3
    expect(calcNAS(items)).toBeGreaterThanOrEqual(8)
  })
})

describe('Renderer', () => {
  it('renders NAS scoring form', () => {
    render(
      <Renderer
        instanceId="nas-1"
        config={{}}
        data={{ items: new Array(25).fill(0) }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/NAS.*Finnegan/i)).toBeInTheDocument()
  })

  it('renders citation', () => {
    render(
      <Renderer instanceId="nas-2" config={{}} data={{ items: new Array(25).fill(0) }} onDataChange={() => {}} mode="live" />
    )
    expect(screen.getByText(/Finnegan LP/i)).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders citation and total', () => {
    render(<PrintView config={{}} data={{ items: new Array(25).fill(0) }} />)
    expect(screen.getByText(/Finnegan LP/i)).toBeInTheDocument()
    expect(screen.getByText(/Total.*0/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — confirm failure**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/peds/nas-scoring/nas-scoring.test.tsx 2>&1 | tail -20
```

- [ ] **Step 3: Write `index.ts`**

```ts
// src/modules/packs/peds/nas-scoring/index.ts
import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

export const CITATION = 'Finnegan LP et al. J Perinat Med. 1975;3(2):61-75'

// 25-item Finnegan NAS score
// Items in order: crying, sleep, moro, tremors-disturbed, tremors-undisturbed,
// muscle-tone, excoriation, myoclonic-jerks, convulsions, sweating,
// hyperthermia-low, hyperthermia-high, yawning, mottling, nasal-stuffiness,
// sneezing, nasal-flaring, resp-rate-60, resp-rate-60-retractions,
// excessive-sucking, poor-feeding, regurgitation, projectile-vomiting,
// liquid-stools, watery-stools
export function calcNAS(items: number[]): number {
  return items.reduce((sum, v) => sum + (v ?? 0), 0)
}

export const NAS_ITEMS: { label: string; options: number[] }[] = [
  { label: 'Crying', options: [0, 2, 3] },
  { label: 'Sleep (<1h=3, 1-2h=2, >2h=1)', options: [0, 1, 2, 3] },
  { label: 'Moro Reflex', options: [0, 2, 3] },
  { label: 'Tremors (disturbed)', options: [0, 1, 2, 3] },
  { label: 'Tremors (undisturbed)', options: [0, 1, 2, 3] },
  { label: 'Increased Muscle Tone', options: [0, 1] },
  { label: 'Excoriation', options: [0, 1] },
  { label: 'Myoclonic Jerks', options: [0, 3] },
  { label: 'Generalized Convulsions', options: [0, 5] },
  { label: 'Sweating', options: [0, 1] },
  { label: 'Hyperthermia 37.2–38.3°C', options: [0, 1] },
  { label: 'Hyperthermia >38.4°C', options: [0, 2] },
  { label: 'Yawning (>3-4×/interval)', options: [0, 1] },
  { label: 'Mottling', options: [0, 1] },
  { label: 'Nasal Stuffiness', options: [0, 1] },
  { label: 'Sneezing (>3-4×/interval)', options: [0, 1] },
  { label: 'Nasal Flaring', options: [0, 2] },
  { label: 'Respiratory Rate >60/min', options: [0, 1] },
  { label: 'Resp Rate >60/min + Retractions', options: [0, 2] },
  { label: 'Excessive Sucking', options: [0, 1] },
  { label: 'Poor Feeding', options: [0, 2] },
  { label: 'Regurgitation', options: [0, 2] },
  { label: 'Projectile Vomiting', options: [0, 3] },
  { label: 'Liquid Stools', options: [0, 2] },
  { label: 'Watery Stools', options: [0, 3] },
]

const plugin: ModulePlugin = {
  meta: {
    id: 'nas-scoring',
    name: 'NAS / Finnegan Scoring',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Full 21-item Finnegan Neonatal Abstinence Syndrome scoring tool with auto-total.',
    tags: ['peds', 'neonatology', 'nas', 'finnegan', 'nicu'],
    pack: 'peds',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { type: 'number' } },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 6 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
```

- [ ] **Step 4: Write `Renderer.tsx`**

```tsx
// src/modules/packs/peds/nas-scoring/Renderer.tsx
import type { FC } from 'react'
import { CITATION, NAS_ITEMS, calcNAS } from './index'

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const items: number[] = (data.items as number[]) ?? new Array(NAS_ITEMS.length).fill(0)
  const readOnly = mode === 'build'
  const total = calcNAS(items)
  const needsPharmacotherapy = total >= 8

  const setItem = (idx: number, val: number) => {
    const next = [...items]
    next[idx] = val
    onDataChange({ ...data, items: next })
  }

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">NAS / Finnegan Scoring</h3>
        <div className={`px-3 py-1 rounded font-bold text-lg ${needsPharmacotherapy ? 'bg-red-900/50 text-red-300' : 'bg-surface-raised'}`}>
          {total}
          {needsPharmacotherapy && <span className="text-xs font-normal ml-1">≥8: pharmacotherapy considered</span>}
        </div>
      </div>

      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {NAS_ITEMS.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-300 flex-1">{item.label}</span>
            <div className="flex gap-1">
              {item.options.map(opt => (
                <button
                  key={opt}
                  disabled={readOnly}
                  onClick={() => setItem(idx, opt)}
                  className={`w-8 h-7 rounded text-xs font-medium border transition-colors ${
                    items[idx] === opt
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 5: Write `Editor.tsx`**

```tsx
// src/modules/packs/peds/nas-scoring/Editor.tsx
import type { FC } from 'react'

export const Editor: FC<{ config: Record<string, unknown>; onConfigChange: (c: Record<string, unknown>) => void }> = () => (
  <div className="p-3 text-sm text-gray-400">No configuration options.</div>
)
```

- [ ] **Step 6: Write `PrintView.tsx`**

```tsx
// src/modules/packs/peds/nas-scoring/PrintView.tsx
import type { FC } from 'react'
import { CITATION, NAS_ITEMS, calcNAS } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const items: number[] = (data.items as number[]) ?? new Array(NAS_ITEMS.length).fill(0)
  const total = calcNAS(items)

  return (
    <div className="text-sm space-y-1">
      <h3 className="font-bold">NAS / Finnegan Score — Total: {total}</h3>
      {total >= 8 && <p className="font-semibold text-red-600">Score ≥8: pharmacotherapy typically considered per institution</p>}
      <table className="text-xs w-full mt-1">
        <thead>
          <tr>
            <th className="text-left">Item</th>
            <th className="text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {NAS_ITEMS.map((item, idx) => (
            <tr key={idx}>
              <td>{item.label}</td>
              <td className="text-right">{items[idx] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — confirm passing**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/peds/nas-scoring/nas-scoring.test.tsx 2>&1 | tail -20
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates && git add src/modules/packs/peds/nas-scoring/ && git commit -m "feat(peds): add nas-scoring module"
```

---

## Task 7: Peds — nicu-flowsheet

**Files:**
- `src/modules/packs/peds/nicu-flowsheet/nicu-flowsheet.test.tsx`
- `src/modules/packs/peds/nicu-flowsheet/index.ts`
- `src/modules/packs/peds/nicu-flowsheet/Renderer.tsx`
- `src/modules/packs/peds/nicu-flowsheet/Editor.tsx`
- `src/modules/packs/peds/nicu-flowsheet/PrintView.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/modules/packs/peds/nicu-flowsheet/nicu-flowsheet.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const baseData = {
  tpn: { dextrose: 10, aa: 3, lipids: 2, calcium: 1.5, phosphate: 1, zinc: 400 },
  uac: { position: 'high T6-T9', insertDate: '2026-04-10', complications: 'None' },
  uvc: { position: 'junction of RA/IVC', insertDate: '2026-04-10', complications: 'None' },
  weights: [{ date: '2026-04-12', weightG: 1250 }, { date: '2026-04-13', weightG: 1260 }],
}

describe('Renderer', () => {
  it('renders NICU flowsheet sections', () => {
    render(
      <Renderer instanceId="nicu-1" config={{}} data={baseData} onDataChange={() => {}} mode="live" />
    )
    expect(screen.getByText(/NICU Flowsheet/i)).toBeInTheDocument()
    expect(screen.getByText(/TPN/i)).toBeInTheDocument()
    expect(screen.getByText(/UAC/i)).toBeInTheDocument()
    expect(screen.getByText(/UVC/i)).toBeInTheDocument()
  })

  it('renders lipid citation', () => {
    render(
      <Renderer instanceId="nicu-2" config={{}} data={baseData} onDataChange={() => {}} mode="live" />
    )
    expect(screen.getByText(/Koletzko/i)).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders weight trend', () => {
    render(<PrintView config={{}} data={baseData} />)
    expect(screen.getByText(/1250/)).toBeInTheDocument()
    expect(screen.getByText(/1260/)).toBeInTheDocument()
    expect(screen.getByText(/Koletzko/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — confirm failure**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/peds/nicu-flowsheet/nicu-flowsheet.test.tsx 2>&1 | tail -20
```

- [ ] **Step 3: Write `index.ts`**

```ts
// src/modules/packs/peds/nicu-flowsheet/index.ts
import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

export const CITATION = 'Koletzko B et al. J Pediatr Gastroenterol Nutr. 2005;41(Suppl 2):S1-S87'

const plugin: ModulePlugin = {
  meta: {
    id: 'nicu-flowsheet',
    name: 'NICU Flowsheet',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'TPN components, UAC/UVC line tracking, and weight trend table for NICU patients.',
    tags: ['peds', 'nicu', 'neonatology', 'tpn'],
    pack: 'peds',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        tpn: { type: 'object' },
        uac: { type: 'object' },
        uvc: { type: 'object' },
        weights: { type: 'array' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
```

- [ ] **Step 4: Write `Renderer.tsx`**

```tsx
// src/modules/packs/peds/nicu-flowsheet/Renderer.tsx
import type { FC } from 'react'
import { useState } from 'react'
import { CITATION } from './index'

interface TPN { dextrose?: number; aa?: number; lipids?: number; calcium?: number; phosphate?: number; zinc?: number }
interface LineStatus { position?: string; insertDate?: string; removalDate?: string; complications?: string }
interface WeightEntry { date: string; weightG: number }
interface Data { tpn?: TPN; uac?: LineStatus; uvc?: LineStatus; weights?: WeightEntry[] }

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Data
  const readOnly = mode === 'build'
  const tpn = d.tpn ?? {}
  const uac = d.uac ?? {}
  const uvc = d.uvc ?? {}
  const weights = d.weights ?? []
  const [newDate, setNewDate] = useState('')
  const [newWeight, setNewWeight] = useState('')

  const setTPN = (key: keyof TPN, val: number) =>
    onDataChange({ ...data, tpn: { ...tpn, [key]: val } })
  const setLine = (line: 'uac' | 'uvc', key: keyof LineStatus, val: string) =>
    onDataChange({ ...data, [line]: { ...(line === 'uac' ? uac : uvc), [key]: val } })
  const addWeight = () => {
    if (!newDate || !newWeight) return
    onDataChange({ ...data, weights: [...weights, { date: newDate, weightG: Number(newWeight) }] })
    setNewDate('')
    setNewWeight('')
  }

  const lipidWarning = (tpn.lipids ?? 0) > 3

  return (
    <div className="p-3 space-y-4 text-sm">
      <h3 className="font-semibold text-base">NICU Flowsheet</h3>

      {/* TPN */}
      <section>
        <h4 className="font-medium mb-1">TPN Components</h4>
        {lipidWarning && (
          <div className="text-xs text-amber-400 bg-amber-900/30 border border-amber-600 rounded px-2 py-1 mb-2">
            Lipids exceed 3 g/kg/day max
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {([
            ['dextrose', 'Dextrose (g/kg/d)'],
            ['aa', 'Amino Acids (g/kg/d)'],
            ['lipids', 'Lipids (g/kg/d, max 3)'],
            ['calcium', 'Calcium (mEq/kg/d)'],
            ['phosphate', 'Phosphate (mmol/kg/d)'],
            ['zinc', 'Zinc (mcg/kg/d)'],
          ] as [keyof TPN, string][]).map(([key, label]) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs">{label}</span>
              <input
                type="number"
                step="0.1"
                className={`border rounded px-2 py-1 bg-transparent ${key === 'lipids' && lipidWarning ? 'border-amber-500' : ''}`}
                value={tpn[key] ?? ''}
                disabled={readOnly}
                onChange={e => setTPN(key, Number(e.target.value))}
              />
            </label>
          ))}
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
      </section>

      {/* UAC */}
      <section>
        <h4 className="font-medium mb-1">UAC Status</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Position</span>
            <select className="border rounded px-2 py-1 bg-transparent" value={uac.position ?? 'low T10-L1'} disabled={readOnly} onChange={e => setLine('uac', 'position', e.target.value)}>
              <option value="low T10-L1">Low T10-L1</option>
              <option value="high T6-T9">High T6-T9</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Insert Date</span>
            <input type="date" className="border rounded px-2 py-1 bg-transparent" value={uac.insertDate ?? ''} disabled={readOnly} onChange={e => setLine('uac', 'insertDate', e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Removal Date</span>
            <input type="date" className="border rounded px-2 py-1 bg-transparent" value={uac.removalDate ?? ''} disabled={readOnly} onChange={e => setLine('uac', 'removalDate', e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Complications</span>
            <input type="text" className="border rounded px-2 py-1 bg-transparent" value={uac.complications ?? ''} disabled={readOnly} onChange={e => setLine('uac', 'complications', e.target.value)} />
          </label>
        </div>
      </section>

      {/* UVC */}
      <section>
        <h4 className="font-medium mb-1">UVC Status</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Position</span>
            <select className="border rounded px-2 py-1 bg-transparent" value={uvc.position ?? 'junction of RA/IVC'} disabled={readOnly} onChange={e => setLine('uvc', 'position', e.target.value)}>
              <option value="junction of RA/IVC">Junction of RA/IVC</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Insert Date</span>
            <input type="date" className="border rounded px-2 py-1 bg-transparent" value={uvc.insertDate ?? ''} disabled={readOnly} onChange={e => setLine('uvc', 'insertDate', e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Removal Date</span>
            <input type="date" className="border rounded px-2 py-1 bg-transparent" value={uvc.removalDate ?? ''} disabled={readOnly} onChange={e => setLine('uvc', 'removalDate', e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Complications</span>
            <input type="text" className="border rounded px-2 py-1 bg-transparent" value={uvc.complications ?? ''} disabled={readOnly} onChange={e => setLine('uvc', 'complications', e.target.value)} />
          </label>
        </div>
      </section>

      {/* Weight Trend */}
      <section>
        <h4 className="font-medium mb-1">Weight Trend</h4>
        <table className="w-full text-xs border-collapse mb-2">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left pb-1">Date</th>
              <th className="text-left pb-1">Weight (g)</th>
            </tr>
          </thead>
          <tbody>
            {weights.map((w, i) => (
              <tr key={i}>
                <td>{w.date}</td>
                <td>{w.weightG}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!readOnly && (
          <div className="flex gap-2 items-end">
            <label className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs">Date</span>
              <input type="date" className="border rounded px-2 py-1 bg-transparent" value={newDate} onChange={e => setNewDate(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs">Weight (g)</span>
              <input type="number" className="border rounded px-2 py-1 w-20 bg-transparent" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
            </label>
            <button onClick={addWeight} className="px-3 py-1 bg-blue-600 rounded text-white text-xs">Add</button>
          </div>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Write `Editor.tsx`**

```tsx
// src/modules/packs/peds/nicu-flowsheet/Editor.tsx
import type { FC } from 'react'

export const Editor: FC<{ config: Record<string, unknown>; onConfigChange: (c: Record<string, unknown>) => void }> = () => (
  <div className="p-3 text-sm text-gray-400">No configuration options.</div>
)
```

- [ ] **Step 6: Write `PrintView.tsx`**

```tsx
// src/modules/packs/peds/nicu-flowsheet/PrintView.tsx
import type { FC } from 'react'
import { CITATION } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as { tpn?: Record<string, number>; uac?: Record<string, string>; uvc?: Record<string, string>; weights?: { date: string; weightG: number }[] }
  const tpn = d.tpn ?? {}
  const uac = d.uac ?? {}
  const uvc = d.uvc ?? {}
  const weights = d.weights ?? []

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold">NICU Flowsheet</h3>

      <div>
        <strong>TPN:</strong> Dextrose {tpn.dextrose ?? '—'} g/kg/d | AA {tpn.aa ?? '—'} g/kg/d | Lipids {tpn.lipids ?? '—'} g/kg/d | Ca {tpn.calcium ?? '—'} mEq/kg/d | Phos {tpn.phosphate ?? '—'} mmol/kg/d | Zn {tpn.zinc ?? '—'} mcg/kg/d
        <p className="text-xs italic text-gray-400">{CITATION}</p>
      </div>

      <div>
        <strong>UAC:</strong> {uac.position ?? '—'} | Inserted {uac.insertDate ?? '—'} | Removed {uac.removalDate ?? '—'} | Cx: {uac.complications ?? '—'}
      </div>

      <div>
        <strong>UVC:</strong> {uvc.position ?? '—'} | Inserted {uvc.insertDate ?? '—'} | Removed {uvc.removalDate ?? '—'} | Cx: {uvc.complications ?? '—'}
      </div>

      <div>
        <strong>Weight Trend:</strong>
        {weights.length === 0 ? ' None' : (
          <table className="text-xs mt-1">
            <thead><tr><th className="text-left pr-4">Date</th><th>Weight (g)</th></tr></thead>
            <tbody>
              {weights.map((w, i) => <tr key={i}><td className="pr-4">{w.date}</td><td>{w.weightG}</td></tr>)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — confirm passing**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/peds/nicu-flowsheet/nicu-flowsheet.test.tsx 2>&1 | tail -20
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates && git add src/modules/packs/peds/nicu-flowsheet/ && git commit -m "feat(peds): add nicu-flowsheet module"
```

---

## Task 8: Peds — apgar

**Files:**
- `src/modules/packs/peds/apgar/apgar.test.tsx`
- `src/modules/packs/peds/apgar/index.ts`
- `src/modules/packs/peds/apgar/Renderer.tsx`
- `src/modules/packs/peds/apgar/Editor.tsx`
- `src/modules/packs/peds/apgar/PrintView.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/modules/packs/peds/apgar/apgar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcApgar, COMPONENTS } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

describe('calcApgar', () => {
  it('returns 0 for all zeros', () => {
    expect(calcApgar([0, 0, 0, 0, 0])).toBe(0)
  })

  it('returns 10 for all twos', () => {
    expect(calcApgar([2, 2, 2, 2, 2])).toBe(10)
  })

  it('returns correct partial score', () => {
    expect(calcApgar([1, 2, 1, 2, 1])).toBe(7)
  })
})

describe('Renderer', () => {
  it('renders Apgar score table', () => {
    render(
      <Renderer
        instanceId="apgar-1"
        config={{}}
        data={{ oneMin: [2, 2, 2, 2, 2], fiveMin: [2, 2, 2, 2, 2] }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Apgar Score/i)).toBeInTheDocument()
    expect(screen.getByText(/1-min/i)).toBeInTheDocument()
    expect(screen.getByText(/5-min/i)).toBeInTheDocument()
  })

  it('renders citation', () => {
    render(
      <Renderer instanceId="apgar-2" config={{}} data={{ oneMin: [0,0,0,0,0], fiveMin: [0,0,0,0,0] }} onDataChange={() => {}} mode="live" />
    )
    expect(screen.getByText(/Apgar V\./i)).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders scores and citation', () => {
    render(<PrintView config={{}} data={{ oneMin: [1,2,1,2,1], fiveMin: [2,2,2,2,2] }} />)
    expect(screen.getByText(/1-min.*7/i)).toBeInTheDocument()
    expect(screen.getByText(/5-min.*10/i)).toBeInTheDocument()
    expect(screen.getByText(/Apgar V\./i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — confirm failure**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/peds/apgar/apgar.test.tsx 2>&1 | tail -20
```

- [ ] **Step 3: Write `index.ts`**

```ts
// src/modules/packs/peds/apgar/index.ts
import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

export const CITATION = 'Apgar V. Curr Res Anesth Analg. 1953;32(4):260-267'

export const COMPONENTS: { label: string; descriptions: string[] }[] = [
  {
    label: 'Appearance',
    descriptions: ['Blue all over', 'Blue extremities', 'Pink all over'],
  },
  {
    label: 'Pulse',
    descriptions: ['Absent', '<100 bpm', '≥100 bpm'],
  },
  {
    label: 'Grimace',
    descriptions: ['No response', 'Grimace', 'Cry / cough / sneeze'],
  },
  {
    label: 'Activity',
    descriptions: ['Limp', 'Some flexion', 'Active motion'],
  },
  {
    label: 'Respiration',
    descriptions: ['Absent', 'Weak / irregular', 'Strong cry'],
  },
]

export function calcApgar(scores: number[]): number {
  return scores.reduce((sum, v) => sum + (v ?? 0), 0)
}

const plugin: ModulePlugin = {
  meta: {
    id: 'apgar',
    name: 'Apgar Score',
    version: '1.0.0',
    author: 'patient-templates',
    description: '5-component Apgar scoring at 1-min, 5-min, and optional 10-min with auto-totals.',
    tags: ['peds', 'neonatology', 'apgar', 'delivery', 'nicu'],
    pack: 'peds',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        oneMin: { type: 'array', items: { type: 'number' } },
        fiveMin: { type: 'array', items: { type: 'number' } },
        tenMin: { type: 'array', items: { type: 'number' } },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
```

- [ ] **Step 4: Write `Renderer.tsx`**

```tsx
// src/modules/packs/peds/apgar/Renderer.tsx
import type { FC } from 'react'
import { useState } from 'react'
import { CITATION, COMPONENTS, calcApgar } from './index'

interface Data {
  oneMin?: number[]
  fiveMin?: number[]
  tenMin?: number[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const empty = () => new Array(5).fill(0)

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Data
  const readOnly = mode === 'build'
  const [showTen, setShowTen] = useState(!!d.tenMin)

  const one = d.oneMin ?? empty()
  const five = d.fiveMin ?? empty()
  const ten = d.tenMin ?? empty()

  const set = (period: 'oneMin' | 'fiveMin' | 'tenMin', idx: number, val: number) => {
    const current = period === 'oneMin' ? [...one] : period === 'fiveMin' ? [...five] : [...ten]
    current[idx] = val
    onDataChange({ ...data, [period]: current })
  }

  const ScoreCol: FC<{ period: 'oneMin' | 'fiveMin' | 'tenMin'; scores: number[] }> = ({ period, scores }) => (
    <>
      {COMPONENTS.map((comp, idx) => (
        <td key={idx} className="px-1 py-1">
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map(val => (
              <button
                key={val}
                disabled={readOnly}
                onClick={() => set(period, idx, val)}
                title={comp.descriptions[val]}
                className={`w-7 h-6 rounded text-xs font-medium border transition-colors ${
                  scores[idx] === val
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-gray-400'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </td>
      ))}
    </>
  )

  return (
    <div className="p-3 space-y-3 text-sm">
      <h3 className="font-semibold text-base">Apgar Score</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left pb-1 pr-2">Component</th>
              <th className="pb-1">1-min</th>
              <th className="pb-1">5-min</th>
              {showTen && <th className="pb-1">10-min</th>}
            </tr>
          </thead>
          <tbody>
            {COMPONENTS.map((comp, idx) => (
              <tr key={idx}>
                <td className="pr-2 py-1 text-gray-300 whitespace-nowrap">{comp.label}</td>
                <td className="px-1 py-1">
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map(val => (
                      <button key={val} disabled={readOnly} onClick={() => set('oneMin', idx, val)} title={comp.descriptions[val]}
                        className={`w-7 h-6 rounded text-xs font-medium border transition-colors ${one[idx] === val ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-1 py-1">
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map(val => (
                      <button key={val} disabled={readOnly} onClick={() => set('fiveMin', idx, val)} title={comp.descriptions[val]}
                        className={`w-7 h-6 rounded text-xs font-medium border transition-colors ${five[idx] === val ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </td>
                {showTen && (
                  <td className="px-1 py-1">
                    <div className="flex gap-1 justify-center">
                      {[0, 1, 2].map(val => (
                        <button key={val} disabled={readOnly} onClick={() => set('tenMin', idx, val)} title={comp.descriptions[val]}
                          className={`w-7 h-6 rounded text-xs font-medium border transition-colors ${ten[idx] === val ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>
                          {val}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            <tr className="border-t border-gray-700 font-bold">
              <td className="py-1 text-gray-300">Total</td>
              <td className="text-center py-1 text-lg">{calcApgar(one)}</td>
              <td className="text-center py-1 text-lg">{calcApgar(five)}</td>
              {showTen && <td className="text-center py-1 text-lg">{calcApgar(ten)}</td>}
            </tr>
          </tbody>
        </table>
      </div>

      {!readOnly && !showTen && (
        <button onClick={() => setShowTen(true)} className="text-xs text-blue-400 underline">
          + Add 10-min score
        </button>
      )}

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 5: Write `Editor.tsx`**

```tsx
// src/modules/packs/peds/apgar/Editor.tsx
import type { FC } from 'react'

export const Editor: FC<{ config: Record<string, unknown>; onConfigChange: (c: Record<string, unknown>) => void }> = () => (
  <div className="p-3 text-sm text-gray-400">No configuration options.</div>
)
```

- [ ] **Step 6: Write `PrintView.tsx`**

```tsx
// src/modules/packs/peds/apgar/PrintView.tsx
import type { FC } from 'react'
import { CITATION, COMPONENTS, calcApgar } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as { oneMin?: number[]; fiveMin?: number[]; tenMin?: number[] }
  const one = d.oneMin ?? new Array(5).fill(0)
  const five = d.fiveMin ?? new Array(5).fill(0)
  const ten = d.tenMin

  return (
    <div className="text-sm space-y-1">
      <h3 className="font-bold">Apgar Score</h3>
      <table className="text-xs w-full mt-1">
        <thead>
          <tr>
            <th className="text-left">Component</th>
            <th>1-min</th>
            <th>5-min</th>
            {ten && <th>10-min</th>}
          </tr>
        </thead>
        <tbody>
          {COMPONENTS.map((comp, idx) => (
            <tr key={idx}>
              <td>{comp.label}</td>
              <td className="text-center">{one[idx] ?? 0}</td>
              <td className="text-center">{five[idx] ?? 0}</td>
              {ten && <td className="text-center">{ten[idx] ?? 0}</td>}
            </tr>
          ))}
          <tr className="font-bold border-t">
            <td>Total</td>
            <td className="text-center">1-min {calcApgar(one)}</td>
            <td className="text-center">5-min {calcApgar(five)}</td>
            {ten && <td className="text-center">10-min {calcApgar(ten)}</td>}
          </tr>
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — confirm passing**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/peds/apgar/apgar.test.tsx 2>&1 | tail -20
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates && git add src/modules/packs/peds/apgar/ && git commit -m "feat(peds): add apgar module"
```

---

## Task 9: Peds — pack index

**Files:**
- `src/modules/packs/peds/index.ts`

- [ ] **Step 1: Write `src/modules/packs/peds/index.ts`**

```ts
// src/modules/packs/peds/index.ts
import './weight-based-dosing'
import './nas-scoring'
import './nicu-flowsheet'
import './apgar'
```

- [ ] **Step 2: Commit**

```bash
cd ~/projects/patient-templates && git add src/modules/packs/peds/index.ts && git commit -m "feat(peds): wire peds pack index"
```

---

## Task 10: Final — All-12 Pack Registration + Integration Test

This is the capstone task. It finalizes the global pack registry, verifies the module barrel from Plan 2b, and proves all 12 specialty packs register correctly.

**Files:**
- `src/modules/packs/index.ts` (finalize — was created by Plan 4a-i and appended by subsequent plans)
- `src/modules/index.ts` (verify existing import from Plan 2b)
- `src/modules/packs/packs.integration.test.ts`

- [ ] **Step 1: Write integration test**

```ts
// src/modules/packs/packs.integration.test.ts
import { pluginRegistry } from '../../core/plugin/registry'
import './index'

it('registers all 12 specialty packs', () => {
  const packIds = new Set(pluginRegistry.list().map(p => p.meta.pack).filter(Boolean))
  expect(packIds).toContain('cardiology')
  expect(packIds).toContain('pulm')
  expect(packIds).toContain('nephro')
  expect(packIds).toContain('neuro')
  expect(packIds).toContain('id')
  expect(packIds).toContain('icu')
  expect(packIds).toContain('hemonc')
  expect(packIds).toContain('gi')
  expect(packIds).toContain('endo')
  expect(packIds).toContain('surgery')
  expect(packIds).toContain('obgyn')
  expect(packIds).toContain('peds')
})
```

- [ ] **Step 2: Run — confirm failure (missing packs index content)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/packs.integration.test.ts 2>&1 | tail -20
```

- [ ] **Step 3: Finalize `src/modules/packs/index.ts`**

Replace the entire file with the complete 12-pack import list:

```ts
// src/modules/packs/index.ts — all 12 specialty packs
import './cardiology'  // Plan 4a-i
import './pulm'        // Plan 4a-i
import './nephro'      // Plan 4a-ii
import './neuro'       // Plan 4a-ii
import './id'          // Plan 4b-i
import './icu'         // Plan 4b-i
import './hemonc'      // Plan 4b-ii
import './gi'          // Plan 4b-ii
import './endo'        // Plan 4c-i
import './surgery'     // Plan 4c-i
import './obgyn'       // Plan 4c-ii
import './peds'        // Plan 4c-ii
```

- [ ] **Step 4: Verify `src/modules/index.ts` imports packs**

Open `src/modules/index.ts` (created by Plan 2b). Confirm it contains:

```ts
import './packs/index'
```

If it is missing, add that line. This wires all specialty packs into the root module barrel that the app imports at startup.

- [ ] **Step 5: Run integration test — confirm all 12 packs pass**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/packs.integration.test.ts 2>&1 | tail -30
```

Expected output: `✓ registers all 12 specialty packs`

- [ ] **Step 6: Run full pack test suite**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/packs/ 2>&1 | tail -40
```

All tests across all 12 pack directories must pass before committing.

- [ ] **Step 7: Commit**

```bash
cd ~/projects/patient-templates && git add src/modules/packs/index.ts src/modules/packs/packs.integration.test.ts && git commit -m "feat(packs): finalize all-12 specialty pack registration"
```

---

## Summary

| Task | Module | Pack | Tests |
|------|--------|------|-------|
| 1 | antepartum-tracker | obgyn | calcGA, Renderer, PrintView |
| 2 | postpartum-assessment | obgyn | Renderer, PrintView |
| 3 | preeclampsia-tracker | obgyn | calcMAP, hasSevereRange, Renderer, PrintView |
| 4 | obgyn/index.ts | — | (wiring) |
| 5 | weight-based-dosing | peds | Renderer (dose calc, disclaimer), PrintView |
| 6 | nas-scoring | peds | calcNAS, Renderer, PrintView |
| 7 | nicu-flowsheet | peds | Renderer, PrintView |
| 8 | apgar | peds | calcApgar, Renderer, PrintView |
| 9 | peds/index.ts | — | (wiring) |
| 10 | All-12 registration | all | packs.integration.test.ts |

**Exports required by interface:**
- `calcGA(lmpDate, today)` → `{ weeks, days }`
- `calcMAP(sbp, dbp)` → `number`
- `hasSevereRange(bpLog)` → `boolean`
- `calcNAS(items)` → `number`
- `calcApgar(scores)` → `number`

**Citations (all rendered in UI):**
- antepartum-tracker: `ACOG Practice Bulletin No. 230. Obstet Gynecol. 2021;137(6):e172-e197`
- preeclampsia-tracker: `ACOG Practice Bulletin No. 222. Obstet Gynecol. 2020;135(6):e237-e260`
- nas-scoring: `Finnegan LP et al. J Perinat Med. 1975;3(2):61-75`
- nicu-flowsheet: `Koletzko B et al. J Pediatr Gastroenterol Nutr. 2005;41(Suppl 2):S1-S87`
- apgar: `Apgar V. Curr Res Anesth Analg. 1953;32(4):260-267`
- weight-based-dosing: disclaimer rendered prominently (no clinical formula, no citation needed)
