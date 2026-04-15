import type { FC } from 'react'
import type { OstomyTrackerData } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as OstomyTrackerData
  const entries = d.entries ?? []
  const today = new Date().toISOString().slice(0, 10)
  const total = entries.filter(e => e.date === today).reduce((s, e) => s + e.volumeMl, 0)

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base border-b pb-1">Ostomy Tracker</h3>
      <p><span className="font-semibold">Stoma Type:</span> {d.stomaType}</p>
      <p><span className="font-semibold">Peristomal Skin:</span> {d.skinStatus}</p>
      <p><span className="font-semibold">Last Appliance Change:</span> {d.lastApplianceChange || '—'}</p>
      <p><span className="font-semibold">Today's Total Output:</span> {total} mL</p>
      {entries.length > 0 && (
        <table className="w-full text-xs border border-gray-300 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-2 py-0.5 text-left">Date</th>
              <th className="border border-gray-300 px-2 py-0.5 text-left">Shift</th>
              <th className="border border-gray-300 px-2 py-0.5 text-left">Volume (mL)</th>
              <th className="border border-gray-300 px-2 py-0.5 text-left">Character</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td className="border border-gray-300 px-2 py-0.5">{e.date}</td>
                <td className="border border-gray-300 px-2 py-0.5">{e.shift}</td>
                <td className="border border-gray-300 px-2 py-0.5">{e.volumeMl}</td>
                <td className="border border-gray-300 px-2 py-0.5">{e.character}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
