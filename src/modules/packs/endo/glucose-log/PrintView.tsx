import { TIR_CITATION, EA1C_CITATION, calcTIR, calcEA1c } from './index'

interface GlucoseEntry {
  timestamp: string
  glucose: number
}

interface GlucoseData {
  entries: GlucoseEntry[]
  targetLow: number
  targetHigh: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function GlucoseLogPrintView({ data }: Props) {
  const d = data as unknown as GlucoseData
  const entries = d.entries ?? []
  const targetLow = d.targetLow ?? 70
  const targetHigh = d.targetHigh ?? 180
  const glucoseValues = entries.map((e) => e.glucose)
  const tir = calcTIR(glucoseValues, targetLow, targetHigh)
  const avg =
    entries.length > 0
      ? glucoseValues.reduce((a, b) => a + b, 0) / entries.length
      : 0
  const ea1c = entries.length > 0 ? calcEA1c(avg) : null

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base">Glucose Log</h3>
      <p><span className="font-medium">Target Range:</span> {targetLow}–{targetHigh} mg/dL</p>
      <p><span className="font-medium">Time in Range:</span> {tir}%</p>
      {ea1c !== null && (
        <p><span className="font-medium">Estimated A1c:</span> {ea1c}%</p>
      )}
      <table className="w-full border-collapse text-xs mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Timestamp</th>
            <th className="border px-2 py-1 text-right">Glucose (mg/dL)</th>
            <th className="border px-2 py-1 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{entry.timestamp}</td>
              <td className="border px-2 py-1 text-right font-mono">{entry.glucose}</td>
              <td className="border px-2 py-1 text-center">
                {entry.glucose < targetLow ? 'Low' : entry.glucose > targetHigh ? 'High' : 'In Range'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-1">{TIR_CITATION}</p>
      <p className="text-xs italic text-gray-400">{EA1C_CITATION}</p>
    </div>
  )
}

export default GlucoseLogPrintView
