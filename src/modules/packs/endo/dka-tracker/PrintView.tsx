import React from 'react'
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
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function DKATrackerPrintView({ data }: Props) {
  const d = data as DKAData
  const entries = d.entries ?? []
  const patientEating = d.patientEating ?? false
  const lastEntry = entries[entries.length - 1]
  const lastAG = lastEntry ? calcAnionGap(lastEntry.na, lastEntry.cl, lastEntry.hco3) : null
  const closed =
    lastEntry && lastAG !== null
      ? isDKAClosed(lastAG, lastEntry.hco3, lastEntry.glucose, patientEating)
      : false

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base">DKA Tracker</h3>
      <p>
        <span className="font-medium">DKA Status:</span>{' '}
        <span className={closed ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
          {closed ? 'CLOSED' : 'ACTIVE / NOT CLOSED'}
        </span>
      </p>
      <p><span className="font-medium">Patient Tolerating PO:</span> {patientEating ? 'Yes' : 'No'}</p>
      <table className="w-full border-collapse text-xs mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Timestamp</th>
            <th className="border px-2 py-1 text-right">Glucose</th>
            <th className="border px-2 py-1 text-right">Na</th>
            <th className="border px-2 py-1 text-right">Cl</th>
            <th className="border px-2 py-1 text-right">HCO3</th>
            <th className="border px-2 py-1 text-right">AG</th>
            <th className="border px-2 py-1 text-center">Ketones</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const ag = calcAnionGap(entry.na, entry.cl, entry.hco3)
            return (
              <tr key={idx}>
                <td className="border px-2 py-1">{entry.timestamp}</td>
                <td className="border px-2 py-1 text-right font-mono">{entry.glucose}</td>
                <td className="border px-2 py-1 text-right font-mono">{entry.na}</td>
                <td className="border px-2 py-1 text-right font-mono">{entry.cl}</td>
                <td className="border px-2 py-1 text-right font-mono">{entry.hco3}</td>
                <td className="border px-2 py-1 text-right font-mono">{ag}</td>
                <td className="border px-2 py-1 text-center">{entry.ketones}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}

export default DKATrackerPrintView
