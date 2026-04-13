// src/modules/consults/Renderer.tsx
import { useState, useCallback } from 'react'

interface Consult {
  id: string
  service: string
  question: string
  status: 'Pending' | 'Responded' | 'Completed'
  response: string
}

interface Result {
  id: string
  description: string
  status: 'Pending' | 'Resulted' | 'Critical'
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const consultLabel = (config.consultLabel as string) ?? 'Active Consults'
  const resultsLabel = (config.resultsLabel as string) ?? 'Pending Results'
  const consults = (data.consults as Consult[]) ?? []
  const results = (data.results as Result[]) ?? []

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [nextId, setNextId] = useState(Math.max(consults.length, results.length) + 1)

  const updateConsult = useCallback(
    (id: string, patch: Partial<Consult>) => {
      onDataChange({
        ...data,
        consults: consults.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })
    },
    [data, consults, onDataChange]
  )

  const addConsult = useCallback(() => {
    const id = String(nextId)
    setNextId((n) => n + 1)
    onDataChange({
      ...data,
      consults: [...consults, { id, service: '', question: '', status: 'Pending', response: '' }],
    })
  }, [data, consults, nextId, onDataChange])

  const deleteConsult = useCallback(
    (id: string) => {
      onDataChange({ ...data, consults: consults.filter((c) => c.id !== id) })
    },
    [data, consults, onDataChange]
  )

  const updateResult = useCallback(
    (id: string, patch: Partial<Result>) => {
      onDataChange({
        ...data,
        results: results.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      })
    },
    [data, results, onDataChange]
  )

  const addResult = useCallback(() => {
    const id = String(nextId + 100)
    setNextId((n) => n + 1)
    onDataChange({
      ...data,
      results: [...results, { id, description: '', status: 'Pending' }],
    })
  }, [data, results, nextId, onDataChange])

  const deleteResult = useCallback(
    (id: string) => {
      onDataChange({ ...data, results: results.filter((r) => r.id !== id) })
    },
    [data, results, onDataChange]
  )

  return (
    <div className="p-2 text-sm space-y-3 overflow-auto">
      {/* Consults section */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          {consultLabel}
        </h4>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="text-left p-1 border border-gray-200 dark:border-gray-700">Service</th>
              <th className="text-left p-1 border border-gray-200 dark:border-gray-700">Question</th>
              <th className="text-left p-1 border border-gray-200 dark:border-gray-700 w-24">Status</th>
              <th className="p-1 border border-gray-200 dark:border-gray-700 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {consults.map((c) => (
              <>
                <tr key={c.id}>
                  <td className="p-1 border border-gray-200 dark:border-gray-700">
                    <input
                      className="w-full bg-transparent"
                      value={c.service}
                      onChange={(e) => updateConsult(c.id, { service: e.target.value })}
                      placeholder="Service"
                      readOnly={mode === 'build'}
                    />
                  </td>
                  <td className="p-1 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <input
                        className="flex-1 bg-transparent"
                        value={c.question}
                        onChange={(e) => updateConsult(c.id, { question: e.target.value })}
                        placeholder="Question asked"
                        readOnly={mode === 'build'}
                      />
                      <button
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                        className="text-gray-400 hover:text-gray-600 shrink-0"
                        title="Show response"
                      >
                        {expandedId === c.id ? '▲' : '▼'}
                      </button>
                    </div>
                  </td>
                  <td className="p-1 border border-gray-200 dark:border-gray-700">
                    <select
                      className="w-full bg-transparent text-xs"
                      value={c.status}
                      onChange={(e) => updateConsult(c.id, { status: e.target.value as Consult['status'] })}
                      disabled={mode === 'build'}
                    >
                      <option>Pending</option>
                      <option>Responded</option>
                      <option>Completed</option>
                    </select>
                  </td>
                  <td className="p-1 border border-gray-200 dark:border-gray-700 text-center">
                    <button
                      onClick={() => deleteConsult(c.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      aria-label="Delete consult"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
                {expandedId === c.id ? (
                  <tr key={`${c.id}-response`}>
                    <td colSpan={4} className="p-1 border border-gray-200 dark:border-gray-700">
                      <textarea
                        className="w-full bg-gray-50 dark:bg-gray-800 text-xs rounded p-1 resize-none"
                        rows={3}
                        value={c.response}
                        onChange={(e) => updateConsult(c.id, { response: e.target.value })}
                        placeholder="Response / recommendations"
                        readOnly={mode === 'build'}
                      />
                    </td>
                  </tr>
                ) : null}
              </>
            ))}
          </tbody>
        </table>
        {mode === 'live' ? (
          <button
            onClick={addConsult}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            + Add Consult
          </button>
        ) : null}
      </div>

      {/* Results section */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          {resultsLabel}
        </h4>
        <ul className="space-y-1">
          {results.map((r) => (
            <li key={r.id} className="flex items-center gap-2">
              <input
                className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 text-xs"
                value={r.description}
                onChange={(e) => updateResult(r.id, { description: e.target.value })}
                placeholder="Test / result description"
                readOnly={mode === 'build'}
              />
              <select
                className={`text-xs rounded px-1 border ${
                  r.status === 'Critical'
                    ? 'border-red-400 text-red-600'
                    : r.status === 'Pending'
                    ? 'border-amber-400 text-amber-600'
                    : 'border-green-400 text-green-600'
                } bg-transparent`}
                value={r.status}
                onChange={(e) => updateResult(r.id, { status: e.target.value as Result['status'] })}
                disabled={mode === 'build'}
              >
                <option>Pending</option>
                <option>Resulted</option>
                <option>Critical</option>
              </select>
              <button
                onClick={() => deleteResult(r.id)}
                className="text-red-400 hover:text-red-600 text-xs"
                aria-label="Delete result"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        {mode === 'live' ? (
          <button
            onClick={addResult}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            + Add Result
          </button>
        ) : null}
      </div>
    </div>
  )
}
