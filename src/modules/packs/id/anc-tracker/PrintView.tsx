import React from 'react'
import { classifyANC } from './Renderer'

const CITATION =
  'NCCN Clinical Practice Guidelines in Oncology: Hematopoietic Growth Factors. Version 2.2023.'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function AncPrintView({ data }: Props) {
  const typed = data as {
    entries: Array<{ date: string; anc: number }>
    antifungals: string[]
    antivirals: string[]
  }
  const entries = typed.entries ?? []
  const antifungals = typed.antifungals ?? []
  const antivirals = typed.antivirals ?? []

  return (
    <div className="p-2 text-xs">
      <h3 className="font-bold mb-1">ANC Tracker</h3>
      <table className="w-full border-collapse mb-2">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-left py-1 pr-2">Date</th>
            <th className="text-left py-1 pr-2">ANC (/µL)</th>
            <th className="text-left py-1">Classification</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-0.5 pr-2">{e.date}</td>
              <td className="py-0.5 pr-2">{e.anc}</td>
              <td className="py-0.5">{classifyANC(e.anc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {antifungals.length > 0 && (
        <div className="mb-1">
          <span className="font-semibold">Antifungals: </span>
          {antifungals.join(', ')}
        </div>
      )}
      {antivirals.length > 0 && (
        <div className="mb-1">
          <span className="font-semibold">Antivirals: </span>
          {antivirals.join(', ')}
        </div>
      )}
      <p className="text-gray-400 italic mt-2">{CITATION}</p>
    </div>
  )
}
