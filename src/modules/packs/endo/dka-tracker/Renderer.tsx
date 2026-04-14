import React, { useState } from 'react'
import { CITATION, calcAnionGap, isDKAClosed } from './index'

type Ketones = 'trace' | 'moderate' | 'large' | 'negative'

interface DKAEntry {
  timestamp: string
  glucose: number
  na: number
  cl: number
  hco3: number
  ketones: Ketones
}

interface DKAData {
  entries: DKAEntry[]
  patientEating: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const EMPTY_ROW = {
  timestamp: '',
  glucose: '' as unknown as number,
  na: '' as unknown as number,
  cl: '' as unknown as number,
  hco3: '' as unknown as number,
  ketones: 'moderate' as Ketones,
}

function CriterionRow({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
          met
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
        }`}
      >
        {met ? '✓' : '—'}
      </span>
      <span className={met ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
        {label}
      </span>
    </div>
  )
}

export function DKATrackerRenderer({ data, onDataChange, mode }: Props) {
  const d = data as DKAData
  const entries = d.entries ?? []
  const patientEating = d.patientEating ?? false
  const disabled = mode === 'build'

  const [newRow, setNewRow] = useState({ ...EMPTY_ROW })

  const lastEntry = entries[entries.length - 1]
  const lastAG = lastEntry
    ? calcAnionGap(lastEntry.na, lastEntry.cl, lastEntry.hco3)
    : null
  const closed =
    lastEntry !== undefined && lastAG !== null
      ? isDKAClosed(lastAG, lastEntry.hco3, lastEntry.glucose, patientEating)
      : false

  function addEntry() {
    if (!newRow.glucose || !newRow.na || !newRow.cl || !newRow.hco3) return
    const entry: DKAEntry = {
      timestamp: newRow.timestamp || new Date().toISOString().slice(0, 16),
      glucose: Number(newRow.glucose),
      na: Number(newRow.na),
      cl: Number(newRow.cl),
      hco3: Number(newRow.hco3),
      ketones: newRow.ketones,
    }
    onDataChange({ ...d, entries: [...entries, entry] })
    setNewRow({ ...EMPTY_ROW })
  }

  function removeEntry(idx: number) {
    onDataChange({ ...d, entries: entries.filter((_, i) => i !== idx) })
  }

  const agOK = lastAG !== null && lastAG < 12
  const hco3OK = lastEntry ? lastEntry.hco3 >= 18 : false
  const glucoseOK = lastEntry ? lastEntry.glucose < 200 : false

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200">DKA Closure Criteria</h4>
          {closed && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              CLOSED
            </span>
          )}
        </div>
        <CriterionRow
          label={`Anion gap < 12 mEq/L${lastAG !== null ? ` (current: ${lastAG})` : ' (no data)'}`}
          met={agOK}
        />
        <CriterionRow
          label={`HCO3 ≥ 18 mEq/L${lastEntry ? ` (current: ${lastEntry.hco3})` : ' (no data)'}`}
          met={hco3OK}
        />
        <CriterionRow
          label={`Glucose < 200 mg/dL${lastEntry ? ` (current: ${lastEntry.glucose})` : ' (no data)'}`}
          met={glucoseOK}
        />
        <div className="flex items-center gap-2">
          <CriterionRow label="Patient tolerating PO" met={patientEating} />
          {!disabled && (
            <input
              type="checkbox"
              className="ml-auto"
              checked={patientEating}
              onChange={(e) => onDataChange({ ...d, patientEating: e.target.checked })}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs min-w-[600px]">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border dark:border-gray-600 px-2 py-1 text-left">Timestamp</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-right">Glucose</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-right">Na</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-right">Cl</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-right">HCO3</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-right">AG</th>
              <th className="border dark:border-gray-600 px-2 py-1 text-center">Ketones</th>
              {!disabled && <th className="border dark:border-gray-600 px-2 py-1"></th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => {
              const ag = calcAnionGap(entry.na, entry.cl, entry.hco3)
              const agHigh = ag >= 12
              return (
                <tr key={idx}>
                  <td className="border dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-300">{entry.timestamp}</td>
                  <td className={`border dark:border-gray-600 px-2 py-1 text-right font-mono ${entry.glucose >= 200 ? 'text-red-600 font-bold' : 'text-gray-900 dark:text-gray-100'}`}>{entry.glucose}</td>
                  <td className="border dark:border-gray-600 px-2 py-1 text-right font-mono text-gray-900 dark:text-gray-100">{entry.na}</td>
                  <td className="border dark:border-gray-600 px-2 py-1 text-right font-mono text-gray-900 dark:text-gray-100">{entry.cl}</td>
                  <td className={`border dark:border-gray-600 px-2 py-1 text-right font-mono ${entry.hco3 < 18 ? 'text-red-600 font-bold' : 'text-gray-900 dark:text-gray-100'}`}>{entry.hco3}</td>
                  <td className={`border dark:border-gray-600 px-2 py-1 text-right font-mono font-bold ${agHigh ? 'text-red-600' : 'text-green-600'}`}>{ag}</td>
                  <td className="border dark:border-gray-600 px-2 py-1 text-center text-gray-700 dark:text-gray-300">{entry.ketones}</td>
                  {!disabled && (
                    <td className="border dark:border-gray-600 px-2 py-1 text-center">
                      <button onClick={() => removeEntry(idx)} className="text-red-500 hover:text-red-700 text-xs">×</button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!disabled && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Timestamp</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newRow.timestamp}
              onChange={(e) => setNewRow({ ...newRow, timestamp: e.target.value })}
            />
          </div>
          {(['glucose', 'na', 'cl', 'hco3'] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{field}</label>
              <input
                type="number"
                className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                value={newRow[field] as unknown as string}
                onChange={(e) => setNewRow({ ...newRow, [field]: e.target.value as unknown as number })}
                placeholder={field.toUpperCase()}
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Ketones</label>
            <select
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newRow.ketones}
              onChange={(e) => setNewRow({ ...newRow, ketones: e.target.value as Ketones })}
            >
              <option value="negative">Negative</option>
              <option value="trace">Trace</option>
              <option value="moderate">Moderate</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={addEntry}
              className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700 w-full"
            >
              Add Row
            </button>
          </div>
        </div>
      )}

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}

export default DKATrackerRenderer
