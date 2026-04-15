import type { FC } from 'react'

interface Agent {
  drug: string
  doseMgM2: number
  route: string
}

interface ChemoData {
  regimenName: string
  cycleNum: number
  dayNum: number
  agents: Agent[]
  nadirDate: string
  nextCycleDate: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const ChemoRegimenRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as ChemoData

  const addAgent = () => {
    const newAgent: Agent = { drug: '', doseMgM2: 0, route: 'IV' }
    onDataChange({ ...d, agents: [...(d.agents ?? []), newAgent] })
  }

  const removeAgent = (idx: number) => {
    const agents = (d.agents ?? []).filter((_, i) => i !== idx)
    onDataChange({ ...d, agents })
  }

  const updateAgent = (idx: number, field: keyof Agent, value: string | number) => {
    const agents = (d.agents ?? []).map((a, i) =>
      i === idx ? { ...a, [field]: value } : a
    )
    onDataChange({ ...d, agents })
  }

  const updateField = (field: keyof ChemoData, value: string | number) => {
    onDataChange({ ...d, [field]: value })
  }

  const routes = ['IV', 'PO', 'SQ', 'IM']

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        {mode === 'build' ? (
          <input
            className="text-lg font-bold border-b border-gray-300 focus:outline-none focus:border-blue-500 flex-1 min-w-0"
            placeholder="Regimen name"
            value={d.regimenName ?? ''}
            onChange={e => updateField('regimenName', e.target.value)}
          />
        ) : (
          <span className="text-lg font-bold">{d.regimenName || '—'}</span>
        )}
        <span className="text-sm text-gray-600 whitespace-nowrap">
          Cycle {d.cycleNum ?? 1} · Day {d.dayNum ?? 1}
        </span>
      </div>

      {/* Cycle / Day inputs in build mode */}
      {mode === 'build' && (
        <div className="flex gap-3 text-sm">
          <label className="flex items-center gap-1">
            Cycle
            <input
              type="number"
              min={1}
              className="w-14 border rounded px-1 py-0.5"
              value={d.cycleNum ?? 1}
              onChange={e => updateField('cycleNum', Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-1">
            Day
            <input
              type="number"
              min={1}
              className="w-14 border rounded px-1 py-0.5"
              value={d.dayNum ?? 1}
              onChange={e => updateField('dayNum', Number(e.target.value))}
            />
          </label>
        </div>
      )}

      {/* Agent table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-1 pr-2">Drug</th>
            <th className="pb-1 pr-2">Dose (mg/m²)</th>
            <th className="pb-1 pr-2">Route</th>
            {mode === 'build' && <th className="pb-1" />}
          </tr>
        </thead>
        <tbody>
          {(d.agents ?? []).map((agent, idx) => (
            <tr key={idx} className="border-b last:border-0">
              {mode === 'build' ? (
                <>
                  <td className="py-1 pr-2">
                    <input
                      className="w-full border-b border-gray-200 focus:outline-none focus:border-blue-400"
                      value={agent.drug}
                      onChange={e => updateAgent(idx, 'drug', e.target.value)}
                      placeholder="Drug name"
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className="w-20 border-b border-gray-200 focus:outline-none focus:border-blue-400"
                      value={agent.doseMgM2}
                      onChange={e => updateAgent(idx, 'doseMgM2', Number(e.target.value))}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <select
                      className="border rounded px-1 py-0.5 text-sm"
                      value={agent.route}
                      onChange={e => updateAgent(idx, 'route', e.target.value)}
                    >
                      {routes.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="py-1">
                    <button
                      onClick={() => removeAgent(idx)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      aria-label="Remove agent"
                    >
                      ✕
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-1 pr-2 font-medium">{agent.drug}</td>
                  <td className="py-1 pr-2">{agent.doseMgM2}</td>
                  <td className="py-1">{agent.route}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {mode === 'build' && (
        <button
          onClick={addAgent}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          + Add Agent
        </button>
      )}

      {/* Dates */}
      <div className="flex flex-wrap gap-4 text-sm pt-1 border-t">
        <div>
          <span className="text-gray-500 mr-1">Expected Nadir:</span>
          {mode === 'build' ? (
            <input
              type="date"
              className="border rounded px-1 py-0.5 text-sm"
              value={d.nadirDate ?? ''}
              onChange={e => updateField('nadirDate', e.target.value)}
            />
          ) : (
            <span>{d.nadirDate || '—'}</span>
          )}
        </div>
        <div>
          <span className="text-gray-500 mr-1">Next Cycle:</span>
          {mode === 'build' ? (
            <input
              type="date"
              className="border rounded px-1 py-0.5 text-sm"
              value={d.nextCycleDate ?? ''}
              onChange={e => updateField('nextCycleDate', e.target.value)}
            />
          ) : (
            <span>{d.nextCycleDate || '—'}</span>
          )}
        </div>
      </div>
    </div>
  )
}
