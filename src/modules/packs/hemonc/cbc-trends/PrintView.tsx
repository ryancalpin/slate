import React from 'react'
import type { FC } from 'react'
import { findNadir } from './Renderer'
import type { CBCEntry } from './Renderer'

interface CBCData {
  entries: CBCEntry[]
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const COLUMNS = [
  { key: 'wbc' as keyof CBCEntry, label: 'WBC (×10³/µL)' },
  { key: 'anc' as keyof CBCEntry, label: 'ANC (×10³/µL)' },
  { key: 'hgb' as keyof CBCEntry, label: 'Hgb (g/dL)' },
  { key: 'plt' as keyof CBCEntry, label: 'Plt (×10³/µL)' },
]

export const CBCTrendsPrintView: FC<Props> = ({ data }) => {
  const d = data as CBCData
  const entries = d.entries ?? []
  const nadirMap: Record<string, number> = {}
  for (const col of COLUMNS) {
    const vals = entries.map(e => Number(e[col.key]))
    if (vals.length > 0) nadirMap[col.key] = findNadir(vals).index
  }
  return (
    <div className="text-xs space-y-1">
      <div className="font-bold text-sm">CBC Trends</div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left pb-1 pr-2">Date</th>
            {COLUMNS.map(col => (
              <th key={col.key} className="text-left pb-1 pr-2">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className="border-b last:border-0">
              <td className="py-0.5 pr-2">{entry.date}</td>
              {COLUMNS.map(col => (
                <td
                  key={col.key}
                  className={`py-0.5 pr-2 ${nadirMap[col.key] === idx ? 'font-bold underline' : ''}`}
                >
                  {entry[col.key]}
                  {nadirMap[col.key] === idx ? ' *' : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {entries.length > 0 ? <p className="text-gray-400 mt-1">* Nadir value</p> : null}
    </div>
  )
}
