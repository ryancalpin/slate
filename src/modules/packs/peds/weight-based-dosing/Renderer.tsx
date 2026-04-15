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
        {d.frequency && totalDose != null ? (
          <p className="text-xs text-gray-400">{d.frequency} dosing</p>
        ) : null}
      </div>
    </div>
  )
}
