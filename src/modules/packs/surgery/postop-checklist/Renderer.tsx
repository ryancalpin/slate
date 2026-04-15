import type { FC } from 'react'
import { type PostopChecklistData, type Milestone } from './index'

let _idCounter = 0
function uid() { return `ms-${Date.now()}-${++_idCounter}` }

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange }) => {
  const d = data as PostopChecklistData
  const milestones: Milestone[] = d.milestones ?? []

  const completed = milestones.filter(m => m.completed).length
  const total = milestones.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  function updateMilestones(next: Milestone[]) {
    onDataChange({ ...d, milestones: next })
  }

  function toggle(id: string) {
    updateMilestones(milestones.map(m => {
      if (m.id !== id) return m
      const isCompleted = !m.completed
      return { ...m, completed: isCompleted, completedAt: isCompleted ? new Date().toISOString() : '' }
    }))
  }

  function updateLabel(id: string, label: string) {
    updateMilestones(milestones.map(m => m.id === id ? { ...m, label } : m))
  }

  function addMilestone() {
    updateMilestones([...milestones, { id: uid(), label: '', completed: false, completedAt: '' }])
  }

  function removeMilestone(id: string) {
    updateMilestones(milestones.filter(m => m.id !== id))
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Post-Op Checklist</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{completed} of {total} complete</span>
      </div>

      {total > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <ul className="space-y-1.5">
        {milestones.map(m => (
          <li key={m.id} className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 cursor-pointer"
              checked={m.completed}
              onChange={() => toggle(m.id)}
            />
            <span className="sr-only">{m.label}</span>
            <input
              className="flex-1 text-sm border-0 border-b border-transparent focus:border-gray-300 bg-transparent dark:text-gray-100 outline-none"
              value={m.label}
              onChange={e => updateLabel(m.id, e.target.value)}
              placeholder="Milestone description..."
            />
            {m.completedAt && (
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(m.completedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => removeMilestone(m.id)}
              className="text-red-400 hover:text-red-600 text-xs ml-1"
              title="Remove milestone"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={addMilestone}
        className="text-xs text-blue-600 hover:underline"
      >
        + Add Milestone
      </button>
    </div>
  )
}
