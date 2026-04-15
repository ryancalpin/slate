import type { FC } from 'react'
import { CITATION, NAS_ITEMS, calcNAS } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const items: number[] = (data.items as number[]) ?? new Array(NAS_ITEMS.length).fill(0)
  const total = calcNAS(items)

  return (
    <div className="text-sm space-y-1">
      <h3 className="font-bold">NAS / Finnegan Score — Total: {total}</h3>
      {total >= 8 ? <p className="font-semibold text-red-600">Score ≥8: pharmacotherapy typically considered per institution</p> : null}
      <table className="text-xs w-full mt-1">
        <thead>
          <tr>
            <th className="text-left">Item</th>
            <th className="text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {NAS_ITEMS.map((item, idx) => (
            <tr key={idx}>
              <td>{item.label}</td>
              <td className="text-right">{items[idx] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
