interface TempEntry {
  timestamp: string
  tempC: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function FeverPrintView({ data }: Props) {
  const typed = data as { entries: TempEntry[]; feverThresholdC: number }
  const entries = typed.entries ?? []
  const threshold = typed.feverThresholdC ?? 38.0

  return (
    <div className="p-2 text-xs">
      <h3 className="font-bold mb-1">Fever Curve (threshold: {threshold}°C)</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-left py-1 pr-2">Timestamp</th>
            <th className="text-left py-1 pr-2">Temp (°C)</th>
            <th className="text-left py-1">Flag</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} className={`border-b border-gray-200 ${e.tempC >= threshold ? 'font-bold text-red-700' : ''}`}>
              <td className="py-0.5 pr-2">{e.timestamp}</td>
              <td className="py-0.5 pr-2">{e.tempC}</td>
              <td className="py-0.5">{e.tempC >= threshold ? 'FEVER' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
