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
