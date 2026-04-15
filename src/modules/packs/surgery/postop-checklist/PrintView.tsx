import type { FC } from 'react'
import type { PostopChecklistData } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as PostopChecklistData
  const milestones = d.milestones ?? []
  const completed = milestones.filter(m => m.completed).length

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base border-b pb-1">Post-Op Checklist</h3>
      <p className="text-xs text-gray-500">{completed} of {milestones.length} complete</p>
      <ul className="space-y-1">
        {milestones.map(m => (
          <li key={m.id} className="flex items-start gap-2">
            <span className={`mt-0.5 inline-block w-4 h-4 border rounded text-center text-xs leading-4 ${m.completed ? 'bg-green-500 text-white border-green-500' : 'border-gray-400'}`}>
              {m.completed ? '✓' : ''}
            </span>
            <span className={m.completed ? 'line-through text-gray-400' : ''}>{m.label}</span>
            {m.completedAt && (
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(m.completedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
