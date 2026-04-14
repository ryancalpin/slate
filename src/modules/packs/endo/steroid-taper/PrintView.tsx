import React from 'react'

interface ScheduleRow {
  date: string
  dose: number
  unit: string
}

interface TaperData {
  drug: string
  schedule: ScheduleRow[]
  prolongedHighDose: boolean
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const ADVISORY_NOTE =
  'Prolonged high-dose corticosteroid therapy may suppress the HPA axis. Consider adrenal insufficiency in the event of physiologic stress. Taper slowly and reassess.'

export function SteroidTaperPrintView({ data }: Props) {
  const d = data as TaperData
  const schedule = d.schedule ?? []
  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base">Steroid Taper</h3>
      {d.drug && <p><span className="font-medium">Drug:</span> {d.drug}</p>}
      <table className="w-full border-collapse text-xs mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Date</th>
            <th className="border px-2 py-1 text-right">Dose</th>
            <th className="border px-2 py-1 text-left">Unit</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, idx) => (
            <tr key={idx} className={row.date === todayStr ? 'font-bold' : ''}>
              <td className="border px-2 py-1">
                {row.date}{row.date === todayStr ? ' (Today)' : ''}
              </td>
              <td className="border px-2 py-1 text-right font-mono">{row.dose}</td>
              <td className="border px-2 py-1">{row.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {d.prolongedHighDose && (
        <p className="mt-2 text-xs italic text-gray-600 border-l-4 border-amber-400 pl-2">
          Advisory: {ADVISORY_NOTE}
        </p>
      )}
    </div>
  )
}

export default SteroidTaperPrintView
