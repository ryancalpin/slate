import React from 'react'
import type { FC } from 'react'

interface Agent {
  drug: string
  doseMgM2: number
  route: string
}

interface ChemoData {
  regimenName: string
  cycleNum: number
  dayNum: number
  agents: Agent[]
  nadirDate: string
  nextCycleDate: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const ChemoRegimenPrintView: FC<Props> = ({ data }) => {
  const d = data as ChemoData
  return (
    <div className="text-sm space-y-2">
      <div className="font-bold text-base">
        {d.regimenName || 'Chemotherapy Regimen'} — Cycle {d.cycleNum}, Day {d.dayNum}
      </div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b">
            <th className="text-left pb-1 pr-2">Drug</th>
            <th className="text-left pb-1 pr-2">Dose (mg/m²)</th>
            <th className="text-left pb-1">Route</th>
          </tr>
        </thead>
        <tbody>
          {(d.agents ?? []).map((a, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-0.5 pr-2">{a.drug}</td>
              <td className="py-0.5 pr-2">{a.doseMgM2}</td>
              <td className="py-0.5">{a.route}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(d.nadirDate || d.nextCycleDate) && (
        <div className="flex gap-4 text-xs text-gray-600 pt-1">
          {d.nadirDate ? <span>Expected Nadir: {d.nadirDate}</span> : null}
          {d.nextCycleDate ? <span>Next Cycle: {d.nextCycleDate}</span> : null}
        </div>
      )}
    </div>
  )
}
