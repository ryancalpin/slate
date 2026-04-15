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

      {severeFlag ? (
        <div className="bg-red-900/40 border border-red-500 rounded p-2 text-red-300 font-semibold text-xs">
          SEVERE RANGE: ≥2 readings with SBP≥160 or DBP≥110, ≥4h apart
        </div>
      ) : null}

      <section>
        <h4 className="font-medium mb-1">BP Log</h4>
        {bpLog.length === 0 ? <p className="text-gray-500 text-xs">No readings recorded.</p> : null}
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
        {!readOnly ? (
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
        ) : null}
      </section>

      <section>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={d.proteinuria ?? false} disabled={readOnly} onChange={e => set('proteinuria', e.target.checked)} />
          <span>Proteinuria: ≥300mg/24hr or spot PCR ≥0.3</span>
        </label>
      </section>

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
