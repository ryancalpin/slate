import type { FC } from 'react'
import { CITATION, NAS_ITEMS, calcNAS } from './index'

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const items: number[] = (data.items as number[]) ?? new Array(NAS_ITEMS.length).fill(0)
  const readOnly = mode === 'build'
  const total = calcNAS(items)
  const needsPharmacotherapy = total >= 8

  const setItem = (idx: number, val: number) => {
    const next = [...items]
    next[idx] = val
    onDataChange({ ...data, items: next })
  }

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">NAS / Finnegan Scoring</h3>
        <div className={`px-3 py-1 rounded font-bold text-lg ${needsPharmacotherapy ? 'bg-red-900/50 text-red-300' : 'bg-surface-raised'}`}>
          {total}
          {needsPharmacotherapy ? <span className="text-xs font-normal ml-1">≥8: pharmacotherapy considered</span> : null}
        </div>
      </div>

      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {NAS_ITEMS.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-300 flex-1">{item.label}</span>
            <div className="flex gap-1">
              {item.options.map(opt => (
                <button
                  key={opt}
                  disabled={readOnly}
                  onClick={() => setItem(idx, opt)}
                  className={`w-8 h-7 rounded text-xs font-medium border transition-colors ${
                    items[idx] === opt
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
