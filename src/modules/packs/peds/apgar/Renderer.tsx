import type { FC } from 'react'
import { useState } from 'react'
import { CITATION, COMPONENTS, calcApgar } from './index'

interface Data {
  oneMin?: number[]
  fiveMin?: number[]
  tenMin?: number[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const empty = () => new Array(5).fill(0)

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Data
  const readOnly = mode === 'build'
  const [showTen, setShowTen] = useState(!!d.tenMin)

  const one = d.oneMin ?? empty()
  const five = d.fiveMin ?? empty()
  const ten = d.tenMin ?? empty()

  const set = (period: 'oneMin' | 'fiveMin' | 'tenMin', idx: number, val: number) => {
    const current = period === 'oneMin' ? [...one] : period === 'fiveMin' ? [...five] : [...ten]
    current[idx] = val
    onDataChange({ ...data, [period]: current })
  }

  return (
    <div className="p-3 space-y-3 text-sm">
      <h3 className="font-semibold text-base">Apgar Score</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left pb-1 pr-2">Component</th>
              <th className="pb-1">1-min</th>
              <th className="pb-1">5-min</th>
              {showTen ? <th className="pb-1">10-min</th> : null}
            </tr>
          </thead>
          <tbody>
            {COMPONENTS.map((comp, idx) => (
              <tr key={idx}>
                <td className="pr-2 py-1 text-gray-300 whitespace-nowrap">{comp.label}</td>
                <td className="px-1 py-1">
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map(val => (
                      <button key={val} disabled={readOnly} onClick={() => set('oneMin', idx, val)} title={comp.descriptions[val]}
                        className={`w-7 h-6 rounded text-xs font-medium border transition-colors ${one[idx] === val ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-1 py-1">
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map(val => (
                      <button key={val} disabled={readOnly} onClick={() => set('fiveMin', idx, val)} title={comp.descriptions[val]}
                        className={`w-7 h-6 rounded text-xs font-medium border transition-colors ${five[idx] === val ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </td>
                {showTen ? (
                  <td className="px-1 py-1">
                    <div className="flex gap-1 justify-center">
                      {[0, 1, 2].map(val => (
                        <button key={val} disabled={readOnly} onClick={() => set('tenMin', idx, val)} title={comp.descriptions[val]}
                          className={`w-7 h-6 rounded text-xs font-medium border transition-colors ${ten[idx] === val ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>
                          {val}
                        </button>
                      ))}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
            <tr className="border-t border-gray-700 font-bold">
              <td className="py-1 text-gray-300">Total</td>
              <td className="text-center py-1 text-lg">{calcApgar(one)}</td>
              <td className="text-center py-1 text-lg">{calcApgar(five)}</td>
              {showTen ? <td className="text-center py-1 text-lg">{calcApgar(ten)}</td> : null}
            </tr>
          </tbody>
        </table>
      </div>

      {!readOnly && !showTen ? (
        <button onClick={() => setShowTen(true)} className="text-xs text-blue-400 underline">
          + Add 10-min score
        </button>
      ) : null}

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
