// src/modules/task-checklist/Renderer.tsx
import { useState, useCallback } from 'react'

interface Task {
  id: string
  text: string
  completed: boolean
  role?: string
  urgent?: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const ROLE_COLORS: Record<string, string> = {
  MD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  RN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  PA: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  NP: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
}

const PLACEHOLDER_TASKS: Task[] = [
  { id: 'p1', text: 'Task 1', completed: false },
  { id: 'p2', text: 'Task 2', completed: false },
  { id: 'p3', text: 'Task 3', completed: false },
]

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const roles = (config.roles as string[]) ?? ['MD', 'RN', 'PA', 'NP']
  const showRoles = (config.showRoles as boolean) ?? true
  const showUrgent = (config.showUrgent as boolean) ?? true
  const tasks = (data.tasks as Task[]) ?? []

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [nextId, setNextId] = useState(tasks.length + 1)

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => {
      onDataChange({
        ...data,
        tasks: tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })
    },
    [data, tasks, onDataChange]
  )

  const addTask = useCallback(() => {
    const id = String(nextId)
    setNextId((n) => n + 1)
    onDataChange({ ...data, tasks: [...tasks, { id, text: '', completed: false }] })
  }, [data, tasks, nextId, onDataChange])

  const deleteTask = useCallback(
    (id: string) => {
      onDataChange({ ...data, tasks: tasks.filter((t) => t.id !== id) })
    },
    [data, tasks, onDataChange]
  )

  const displayTasks = mode === 'build' && tasks.length === 0 ? PLACEHOLDER_TASKS : tasks

  return (
    <div className="p-2 text-sm space-y-1">
      {displayTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-start gap-2 group"
          onMouseEnter={() => setHoveredId(task.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) =>
              mode === 'live' && updateTask(task.id, { completed: e.target.checked })
            }
            className="mt-0.5 shrink-0"
            disabled={mode === 'build'}
          />
          <input
            className={`flex-1 bg-transparent border-none outline-none text-sm ${
              task.completed ? 'line-through text-gray-400' : ''
            }`}
            value={task.text}
            onChange={(e) => updateTask(task.id, { text: e.target.value })}
            placeholder="Task description"
            readOnly={mode === 'build'}
          />
          {showRoles ? (
            <select
              className={`text-xs rounded px-1 py-0.5 border-none ${
                task.role && ROLE_COLORS[task.role]
                  ? ROLE_COLORS[task.role]
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
              value={task.role ?? ''}
              onChange={(e) => updateTask(task.id, { role: e.target.value || undefined })}
              disabled={mode === 'build'}
            >
              <option value="">—</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          ) : null}
          {showUrgent ? (
            <button
              onClick={() => updateTask(task.id, { urgent: !task.urgent })}
              className={`text-xs shrink-0 ${
                task.urgent ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
              }`}
              title="Toggle urgent"
              disabled={mode === 'build'}
            >
              !
            </button>
          ) : null}
          {hoveredId === task.id && mode === 'live' ? (
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-400 hover:text-red-600 text-xs shrink-0"
              aria-label="Delete task"
            >
              ✕
            </button>
          ) : null}
        </div>
      ))}
      {mode === 'live' ? (
        <button
          onClick={addTask}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 mt-1"
        >
          + Add Task
        </button>
      ) : null}
    </div>
  )
}
