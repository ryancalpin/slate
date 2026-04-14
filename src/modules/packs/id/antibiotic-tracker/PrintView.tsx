import React from 'react'

interface Antibiotic {
  agent: string
  dose: string
  route: string
  startDate: string
  durationDays: number
  renalAdjust: boolean
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

function calcDayNumber(startDate: string): number {
  if (!startDate) return 1
  const start = new Date(startDate + 'T00:00:00Z')
  const todayStr = new Date().toISOString().split('T')[0]
  const today = new Date(todayStr + 'T00:00:00Z')
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff + 1
}

export function AntibioticPrintView({ data }: Props) {
  const antibiotics: Antibiotic[] = (data as { antibiotics: Antibiotic[] }).antibiotics ?? []
  return (
    <div className="p-2 text-xs">
      <h3 className="font-bold mb-1">Antibiotic Tracker</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-left py-1 pr-2">Agent</th>
            <th className="text-left py-1 pr-2">Dose</th>
            <th className="text-left py-1 pr-2">Route</th>
            <th className="text-left py-1 pr-2">Start</th>
            <th className="text-left py-1 pr-2">Duration</th>
            <th className="text-left py-1 pr-2">Day #</th>
            <th className="text-left py-1">Renal Adj.</th>
          </tr>
        </thead>
        <tbody>
          {antibiotics.map((ab, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-0.5 pr-2">{ab.agent}</td>
              <td className="py-0.5 pr-2">{ab.dose}</td>
              <td className="py-0.5 pr-2">{ab.route}</td>
              <td className="py-0.5 pr-2">{ab.startDate}</td>
              <td className="py-0.5 pr-2">{ab.durationDays}d</td>
              <td className="py-0.5 pr-2">{calcDayNumber(ab.startDate)}</td>
              <td className="py-0.5">{ab.renalAdjust ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
