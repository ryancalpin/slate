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
