import React, { useState } from 'react'
import { TIR_CITATION, EA1C_CITATION, calcTIR, calcEA1c } from './index'

interface GlucoseEntry {
  timestamp: string
  glucose: number
}

interface GlucoseData {
  entries: GlucoseEntry[]
  targetLow: number
  targetHigh: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function Sparkline({
  entries,
  targetLow,
  targetHigh,
}: {
  entries: GlucoseEntry[]
  targetLow: number
  targetHigh: number
}) {
  if (entries.length === 0) return null
  const values = entries.map((e) => e.glucose)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-0.5 h-12 my-2" aria-label="glucose sparkline">
      {entries.map((entry, idx) => {
        const height = Math.round(((entry.glucose - min) / range) * 40) + 4
        const inRange = entry.glucose >= targetLow && entry.glucose <= targetHigh
        return (
          <div
            key={idx}
            title={`${entry.timestamp}: ${entry.glucose} mg/dL`}
            className={`w-2 rounded-sm ${inRange ? 'bg-green-500' : 'bg-red-400'}`}
            style={{ height: `${height}px` }}
          />
        )
      })}
    </div>
  )
}

export function GlucoseLogRenderer({ data, onDataChange, mode }: Props) {
  const d = data as GlucoseData
  const entries = d.entries ?? []
  const targetLow = d.targetLow ?? 70
  const targetHigh = d.targetHigh ?? 180

  const glucoseValues = entries.map((e) => e.glucose)
  const tir = calcTIR(glucoseValues, targetLow, targetHigh)
  const avgGlucose =
    entries.length > 0
      ? glucoseValues.reduce((a, b) => a + b, 0) / entries.length
      : 0
  const ea1c = entries.length > 0 ? calcEA1c(avgGlucose) : null

  const [newTimestamp, setNewTimestamp] = useState('')
  const [newGlucose, setNewGlucose] = useState('')
  const disabled = mode === 'build'

  function addEntry() {
    if (!newGlucose) return
    const entry: GlucoseEntry = {
      timestamp: newTimestamp || new Date().toISOString().slice(0, 16),
      glucose: Number(newGlucose),
    }
    onDataChange({ ...d, entries: [...entries, entry] })
    setNewTimestamp('')
    setNewGlucose('')
  }

  function removeEntry(idx: number) {
    onDataChange({ ...d, entries: entries.filter((_, i) => i !== idx) })
  }

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Target: {targetLow}–{targetHigh} mg/dL
        </span>
        <div className="flex items-center gap-4">
          <span
            className={`font-bold ${
              tir >= 70 ? 'text-green-600' : tir >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}
          >
            TIR: {tir}%
          </span>
          {ea1c !== null && (
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              eA1c: {ea1c}%
            </span>
          )}
        </div>
      </div>

      <Sparkline entries={entries} targetLow={targetLow} targetHigh={targetHigh} />

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border dark:border-gray-600 px-2 py-1 text-left">Timestamp</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-right">Glucose (mg/dL)</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-center">Status</th>
            {!disabled && <th className="border dark:border-gray-600 px-2 py-1"></th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const low = entry.glucose < targetLow
            const high = entry.glucose > targetHigh
            return (
              <tr
                key={idx}
                className={
                  low
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : high
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-green-50 dark:bg-green-900/20'
                }
              >
                <td className="border dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-300">{entry.timestamp}</td>
                <td className="border dark:border-gray-600 px-2 py-1 text-right font-mono text-gray-900 dark:text-gray-100">{entry.glucose}</td>
                <td className="border dark:border-gray-600 px-2 py-1 text-center text-xs">
                  {low ? 'Low' : high ? 'High' : 'In Range'}
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

      <p className="text-xs italic text-gray-400 mt-1">{TIR_CITATION}</p>
      <p className="text-xs italic text-gray-400">{EA1C_CITATION}</p>
    </div>
  )
}

export default GlucoseLogRenderer
