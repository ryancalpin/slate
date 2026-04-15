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

      <section>
        <h4 className="font-medium mb-1">TPN Components</h4>
        {lipidWarning ? (
          <div className="text-xs text-amber-400 bg-amber-900/30 border border-amber-600 rounded px-2 py-1 mb-2">
            Lipids exceed 3 g/kg/day max
          </div>
        ) : null}
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
        {!readOnly ? (
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
        ) : null}
      </section>
    </div>
  )
}
