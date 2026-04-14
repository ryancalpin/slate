import React, { FC } from 'react'

interface Pressor {
  agent: string
  dose: number
  unit: string
  mapTarget: number
}

interface MapReading {
  timestamp: string
  map: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const VasopressorPrintView: FC<Props> = ({ data }) => {
  const pressors: Pressor[] = (data.pressors as Pressor[]) ?? []
  const mapReadings: MapReading[] = (data.mapReadings as MapReading[]) ?? []
  const latest =
    mapReadings.length > 0
      ? [...mapReadings].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-1)[0]
      : null

  return (
    <div className="font-mono text-sm">
      <h3 className="font-bold text-base mb-2">Vasopressor Tracker</h3>
      {latest && (
        <p className="mb-2">
          Latest MAP: <strong>{latest.map} mmHg</strong>
        </p>
      )}
      <table className="w-full border border-gray-300 text-xs mb-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">Agent</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Dose</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Unit</th>
            <th className="border border-gray-300 px-2 py-1 text-left">MAP Target</th>
          </tr>
        </thead>
        <tbody>
          {pressors.map((p, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-2 py-1">{p.agent}</td>
              <td className="border border-gray-300 px-2 py-1">{p.dose}</td>
              <td className="border border-gray-300 px-2 py-1">{p.unit}</td>
              <td className="border border-gray-300 px-2 py-1">{p.mapTarget} mmHg</td>
            </tr>
          ))}
          {pressors.length === 0 && (
            <tr>
              <td colSpan={4} className="border border-gray-300 px-2 py-1 text-gray-400 italic">
                No pressors recorded
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {mapReadings.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1">MAP Log</p>
          <ul className="text-xs space-y-0.5">
            {[...mapReadings]
              .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
              .map((r, i) => (
                <li key={i}>
                  {new Date(r.timestamp).toLocaleTimeString()} — {r.map} mmHg
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
