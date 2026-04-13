import { useCallback } from 'react'
import type { FC } from 'react'

interface Problem {
  id: string
  name: string
  assessment: string
  plan: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const isLive = mode === 'live'
  const problems: Problem[] = (data.problems as Problem[]) ?? []

  const updateProblem = useCallback(
    (id: string, field: keyof Problem, value: string) => {
      const next = problems.map(p => p.id === id ? { ...p, [field]: value } : p)
      onDataChange({ ...data, problems: next })
    },
    [data, onDataChange, problems]
  )

  const addProblem = useCallback(() => {
    const next = [...problems, { id: generateId(), name: '', assessment: '', plan: '' }]
    onDataChange({ ...data, problems: next })
  }, [data, onDataChange, problems])

  const removeProblem = useCallback(
    (id: string) => {
      onDataChange({ ...data, problems: problems.filter(p => p.id !== id) })
    },
    [data, onDataChange, problems]
  )

  const displayProblems: Problem[] = mode === 'build' && problems.length === 0
    ? [{ id: '__placeholder__', name: '', assessment: '', plan: '' }]
    : problems

  return (
    <div className="p-2 space-y-3">
      {displayProblems.map((problem, idx) => {
        const isPlaceholder = problem.id === '__placeholder__'
        return (
          <div key={problem.id} className="border border-gray-200 dark:border-gray-700 rounded p-2 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400 w-6">#{idx + 1}</span>
              <input
                type="text"
                placeholder="Problem name"
                value={problem.name}
                onChange={e => !isPlaceholder && updateProblem(problem.id, 'name', e.target.value)}
                readOnly={!isLive || isPlaceholder}
                className="flex-1 text-sm font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none py-0.5"
              />
              {isLive && !isPlaceholder && (
                <button
                  onClick={() => removeProblem(problem.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-1"
                  aria-label="Remove problem"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="pl-8 space-y-1">
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Assessment</span>
                <textarea
                  placeholder="Assessment"
                  value={problem.assessment}
                  onChange={e => !isPlaceholder && updateProblem(problem.id, 'assessment', e.target.value)}
                  readOnly={!isLive || isPlaceholder}
                  rows={2}
                  className="w-full text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded p-1 outline-none resize-none focus:border-blue-400 mt-0.5"
                />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Plan</span>
                <textarea
                  placeholder="Plan"
                  value={problem.plan}
                  onChange={e => !isPlaceholder && updateProblem(problem.id, 'plan', e.target.value)}
                  readOnly={!isLive || isPlaceholder}
                  rows={3}
                  className="w-full text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded p-1 outline-none resize-none focus:border-blue-400 mt-0.5"
                />
              </div>
            </div>
          </div>
        )
      })}
      {isLive && (
        <button
          onClick={addProblem}
          className="text-sm text-blue-500 hover:text-blue-700 font-medium"
        >
          + Add Problem
        </button>
      )}
    </div>
  )
}
