// src/modules/lines-tubes/PrintView.tsx
interface Line {
  id: string
  type: string
  site: string
  insertionDate: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

function daysIn(insertionDate: string): number {
  if (!insertionDate) return 0
  return Math.floor((Date.now() - new Date(insertionDate).getTime()) / (1000 * 60 * 60 * 24))
}

export function PrintView({ config, data }: Props) {
  const alertDays = (config.alertDays as number) ?? 5
  const lines = (data.lines as Line[]) ?? []

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">Lines / Tubes / Drains</h3>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-0.5 pr-2">Type</th>
            <th className="text-left py-0.5 pr-2">Site</th>
            <th className="text-left py-0.5 pr-2">Inserted</th>
            <th className="text-left py-0.5">Days In</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const days = daysIn(line.insertionDate)
            const warn = line.insertionDate && days > alertDays
            return (
              <tr key={line.id} className="border-b border-gray-100">
                <td className="py-0.5 pr-2">{line.type}</td>
                <td className="py-0.5 pr-2">{line.site}</td>
                <td className="py-0.5 pr-2">{line.insertionDate}</td>
                <td className="py-0.5">
                  {line.insertionDate ? days : '—'}
                  {warn ? ' ⚠️' : ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {lines.length === 0 ? <p className="text-gray-400 italic">No lines recorded.</p> : null}
    </div>
  )
}
