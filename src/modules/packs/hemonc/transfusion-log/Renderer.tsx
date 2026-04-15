import type { FC } from 'react'

export interface Transfusion {
  product: string
  date: string
  time: string
  units: number
  preValue: number
  postValue: number
  reaction: boolean
  reactionType: string
}

interface TransfusionData {
  transfusions: Transfusion[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const PRODUCTS = ['pRBC', 'FFP', 'PLT', 'Cryo', 'Granulocytes']
const REACTION_TYPES = [
  'febrile non-hemolytic',
  'allergic',
  'hemolytic',
  'TRALI',
  'TACO',
  'anaphylaxis',
  'other',
]

export const TransfusionLogRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as TransfusionData
  const transfusions = d.transfusions ?? []

  const addRow = () => {
    const newRow: Transfusion = {
      product: 'pRBC',
      date: '',
      time: '',
      units: 1,
      preValue: 0,
      postValue: 0,
      reaction: false,
      reactionType: '',
    }
    onDataChange({ ...d, transfusions: [...transfusions, newRow] })
  }

  const removeRow = (idx: number) => {
    onDataChange({ ...d, transfusions: transfusions.filter((_, i) => i !== idx) })
  }

  const updateRow = (idx: number, field: keyof Transfusion, value: string | number | boolean) => {
    const updated = transfusions.map((t, i) =>
      i === idx ? { ...t, [field]: value } : t
    )
    onDataChange({ ...d, transfusions: updated })
  }

  return (
    <div className="p-3 space-y-3 overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[640px]">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-1 pr-2">Product</th>
            <th className="pb-1 pr-2">Date</th>
            <th className="pb-1 pr-2">Time</th>
            <th className="pb-1 pr-2">Units</th>
            <th className="pb-1 pr-2">Pre</th>
            <th className="pb-1 pr-2">Post</th>
            <th className="pb-1 pr-2">Reaction</th>
            {mode === 'build' ? <th className="pb-1" /> : null}
          </tr>
        </thead>
        <tbody>
          {transfusions.map((t, idx) => (
            <tr
              key={idx}
              className={`border-b last:border-0 ${t.reaction ? 'bg-red-50' : ''}`}
            >
              {mode === 'build' ? (
                <>
                  <td className="py-1 pr-2">
                    <select
                      className="border rounded px-1 py-0.5 text-xs"
                      value={t.product}
                      onChange={e => updateRow(idx, 'product', e.target.value)}
                    >
                      {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="date"
                      className="border-b border-gray-200 focus:outline-none text-xs"
                      value={t.date}
                      onChange={e => updateRow(idx, 'date', e.target.value)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="time"
                      className="border-b border-gray-200 focus:outline-none text-xs"
                      value={t.time}
                      onChange={e => updateRow(idx, 'time', e.target.value)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-12 border-b border-gray-200 focus:outline-none text-xs"
                      value={t.units}
                      onChange={e => updateRow(idx, 'units', Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className="w-14 border-b border-gray-200 focus:outline-none text-xs"
                      value={t.preValue}
                      onChange={e => updateRow(idx, 'preValue', Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className="w-14 border-b border-gray-200 focus:outline-none text-xs"
                      value={t.postValue}
                      onChange={e => updateRow(idx, 'postValue', Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1 pr-2 space-y-1">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={t.reaction}
                        onChange={e => updateRow(idx, 'reaction', e.target.checked)}
                      />
                      Reaction
                    </label>
                    {t.reaction ? (
                      <select
                        className="border rounded px-1 py-0.5 text-xs"
                        value={t.reactionType}
                        onChange={e => updateRow(idx, 'reactionType', e.target.value)}
                      >
                        <option value="">— select —</option>
                        {REACTION_TYPES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    ) : null}
                  </td>
                  <td className="py-1">
                    <button
                      onClick={() => removeRow(idx)}
                      className="text-red-400 hover:text-red-600"
                      aria-label="Remove row"
                    >
                      ✕
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className={`py-1 pr-2 font-medium ${t.reaction ? 'text-red-700' : ''}`}>
                    {t.product}
                  </td>
                  <td className="py-1 pr-2">{t.date}</td>
                  <td className="py-1 pr-2">{t.time}</td>
                  <td className="py-1 pr-2">{t.units}</td>
                  <td className="py-1 pr-2">{t.preValue}</td>
                  <td className="py-1 pr-2">{t.postValue}</td>
                  <td className={`py-1 pr-2 ${t.reaction ? 'text-red-700 font-semibold' : 'text-gray-400'}`}>
                    {t.reaction ? (t.reactionType || 'Yes') : 'None'}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {mode === 'build' ? (
        <button
          onClick={addRow}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          + Add Row
        </button>
      ) : null}
    </div>
  )
}
