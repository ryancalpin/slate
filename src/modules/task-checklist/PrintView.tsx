// src/modules/task-checklist/PrintView.tsx
interface Task {
  id: string
  text: string
  completed: boolean
  role?: string
  urgent?: boolean
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function PrintView({ config, data }: Props) {
  const showRoles = (config.showRoles as boolean) ?? true
  const showUrgent = (config.showUrgent as boolean) ?? true
  const tasks = (data.tasks as Task[]) ?? []

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">Task Checklist</h3>
      <ul className="space-y-0.5">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start gap-1">
            <span className="shrink-0">{task.completed ? '☑' : '☐'}</span>
            <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.text}</span>
            {showRoles && task.role ? <span className="text-gray-500">({task.role})</span> : null}
            {showUrgent && task.urgent ? (
              <span className="text-red-600 font-semibold ml-1">URGENT</span>
            ) : null}
          </li>
        ))}
      </ul>
      {tasks.length === 0 ? <p className="text-gray-400 italic">No tasks.</p> : null}
    </div>
  )
}
