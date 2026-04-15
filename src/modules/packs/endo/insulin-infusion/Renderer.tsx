import { useState } from 'react'
import { CITATION, calcTimeAtGoal } from './index'

interface GlucoseEntry {
  timestamp: string
  glucose: number
}

interface InsulinData {
  ratePerHour: number
  glucoseEntries: GlucoseEntry[]
  targetLow: number
  targetHigh: number
  protocolName: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function InsulinInfusionRenderer({ data, onDataChange, mode }: Props) {
  const d = data as unknown as InsulinData
  const entries = d.glucoseEntries ?? []
  const targetLow = d.targetLow ?? 140
  const targetHigh = d.targetHigh ?? 180
  const timeAtGoal = calcTimeAtGoal(entries.map((e) => e.glucose), targetLow, targetHigh)

  const [newTimestamp, setNewTimestamp] = useState('')
  const [newGlucose, setNewGlucose] = useState('')

  function addEntry() {
    if (!newGlucose) return
    const entry: GlucoseEntry = {
      timestamp: newTimestamp || new Date().toISOString().slice(0, 16),
      glucose: Number(newGlucose),
    }
    onDataChange({ ...d, glucoseEntries: [...entries, entry] })
    setNewTimestamp('')
    setNewGlucose('')
  }

  function removeEntry(idx: number) {
    onDataChange({
      ...d,
      glucoseEntries: entries.filter((_, i) => i !== idx),
    })
  }

  const disabled = mode === 'build'

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 dark:text-gray-300">Protocol:</label>
        <input
          className="border rounded px-2 py-1 flex-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          value={d.protocolName ?? ''}
          disabled={disabled}
          onChange={(e) => onDataChange({ ...d, protocolName: e.target.value })}
          placeholder="Protocol name"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 dark:text-gray-300">Rate (units/hr):</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          value={d.ratePerHour ?? 0}
          disabled={disabled}
          onChange={(e) => onDataChange({ ...d, ratePerHour: Number(e.target.value) })}
          min={0}
          step={0.5}
        />
        <span className="text-gray-500 dark:text-gray-400 text-xs">units/hr</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">Target:</span>
        <span className="text-gray-600 dark:text-gray-300">{targetLow}–{targetHigh} mg/dL</span>
        <span
          className={`ml-auto font-bold text-base ${
            timeAtGoal >= 70 ? 'text-green-600' : timeAtGoal >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}
        >
          {timeAtGoal}% time-at-goal
        </span>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border dark:border-gray-600 px-2 py-1 text-left">Timestamp</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-right">Glucose (mg/dL)</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-center">In Range</th>
            {!disabled && <th className="border dark:border-gray-600 px-2 py-1"></th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const inRange = entry.glucose >= targetLow && entry.glucose <= targetHigh
            return (
              <tr key={idx} className={inRange ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                <td className="border dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-300">{entry.timestamp}</td>
                <td className="border dark:border-gray-600 px-2 py-1 text-right font-mono text-gray-900 dark:text-gray-100">{entry.glucose}</td>
                <td className="border dark:border-gray-600 px-2 py-1 text-center">
                  {inRange ? '✓' : '✗'}
                </td>
                {!disabled && (
                  <td className="border dark:border-gray-600 px-2 py-1 text-center">
                    <button
                      onClick={() => removeEntry(idx)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>

      {!disabled && (
        <div className="flex gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Timestamp</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newTimestamp}
              onChange={(e) => setNewTimestamp(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Glucose</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-20 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newGlucose}
              onChange={(e) => setNewGlucose(e.target.value)}
              placeholder="mg/dL"
            />
          </div>
          <button
            onClick={addEntry}
            className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}

export default InsulinInfusionRenderer
