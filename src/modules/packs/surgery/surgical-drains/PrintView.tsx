import type { FC } from 'react'
import { calcDailyDrainTotal, type SurgicalDrainsData } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const typedData = data as SurgicalDrainsData
  const drains = typedData.drains ?? []

  return (
    <div className="text-sm space-y-4">
      <h3 className="font-bold text-base border-b pb-1">Surgical Drains</h3>
      {drains.map((drain, i) => {
        const today = new Date().toISOString().slice(0, 10)
        const dailyTotal = calcDailyDrainTotal(drain.entries, today)
        return (
          <div key={i} className="space-y-1">
            <p className="font-semibold"><span>{drain.name}</span> — <span className="font-normal italic">{drain.character}</span></p>
            <p className="text-xs">Today's total: {dailyTotal} mL</p>
            {drain.entries.length > 0 && (
              <table className="w-full text-xs border border-gray-300 border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-0.5 text-left">Date</th>
                    <th className="border border-gray-300 px-2 py-0.5 text-left">Shift</th>
                    <th className="border border-gray-300 px-2 py-0.5 text-left">Volume (mL)</th>
                  </tr>
                </thead>
                <tbody>
                  {drain.entries.map((e, j) => (
                    <tr key={j}>
                      <td className="border border-gray-300 px-2 py-0.5">{e.date}</td>
                      <td className="border border-gray-300 px-2 py-0.5">{e.shift}</td>
                      <td className="border border-gray-300 px-2 py-0.5">{e.volumeMl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      })}
      {drains.length === 0 && <p className="text-xs text-gray-400 italic">No drains recorded.</p>}
    </div>
  )
}
