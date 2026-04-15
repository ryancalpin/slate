import type { FC } from 'react'
import { CITATION, COMPONENTS, calcApgar } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as { oneMin?: number[]; fiveMin?: number[]; tenMin?: number[] }
  const one = d.oneMin ?? new Array(5).fill(0)
  const five = d.fiveMin ?? new Array(5).fill(0)
  const ten = d.tenMin

  return (
    <div className="text-sm space-y-1">
      <h3 className="font-bold">Apgar Score</h3>
      <table className="text-xs w-full mt-1">
        <thead>
          <tr>
            <th className="text-left">Component</th>
            <th>1-min</th>
            <th>5-min</th>
            {ten ? <th>10-min</th> : null}
          </tr>
        </thead>
        <tbody>
          {COMPONENTS.map((comp, idx) => (
            <tr key={idx}>
              <td>{comp.label}</td>
              <td className="text-center">{one[idx] ?? 0}</td>
              <td className="text-center">{five[idx] ?? 0}</td>
              {ten ? <td className="text-center">{ten[idx] ?? 0}</td> : null}
            </tr>
          ))}
          <tr className="font-bold border-t">
            <td>Total</td>
            <td className="text-center">1-min {calcApgar(one)}</td>
            <td className="text-center">5-min {calcApgar(five)}</td>
            {ten ? <td className="text-center">10-min {calcApgar(ten)}</td> : null}
          </tr>
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
