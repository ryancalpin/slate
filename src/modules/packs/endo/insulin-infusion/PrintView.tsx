import React from 'react'
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
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function InsulinInfusionPrintView({ data }: Props) {
  const d = data as InsulinData
  const entries = d.glucoseEntries ?? []
  const targetLow = d.targetLow ?? 140
  const targetHigh = d.targetHigh ?? 180
  const timeAtGoal = calcTimeAtGoal(entries.map((e) => e.glucose), targetLow, targetHigh)

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base">Insulin Infusion Log</h3>
      {d.protocolName && <p><span className="font-medium">Protocol:</span> {d.protocolName}</p>}
      <p><span className="font-medium">Rate:</span> {d.ratePerHour ?? 0} units/hr</p>
      <p><span className="font-medium">Target Range:</span> {targetLow}–{targetHigh} mg/dL</p>
      <p><span className="font-medium">Time at Goal:</span> {timeAtGoal}%</p>
      <table className="w-full border-collapse text-xs mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Timestamp</th>
            <th className="border px-2 py-1 text-right">Glucose (mg/dL)</th>
            <th className="border px-2 py-1 text-center">In Range</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{entry.timestamp}</td>
              <td className="border px-2 py-1 text-right font-mono">{entry.glucose}</td>
              <td className="border px-2 py-1 text-center">
                {entry.glucose >= targetLow && entry.glucose <= targetHigh ? '✓' : '✗'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}

export default InsulinInfusionPrintView
