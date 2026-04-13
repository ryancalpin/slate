// src/modules/task-checklist/Editor.tsx
import { useCallback } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function Editor({ config, onConfigChange }: Props) {
  const roles = (config.roles as string[]) ?? ['MD', 'RN', 'PA', 'NP']
  const showRoles = (config.showRoles as boolean) ?? true
  const showUrgent = (config.showUrgent as boolean) ?? true

  const setRoles = useCallback(
    (value: string) => {
      onConfigChange({
        ...config,
        roles: value.split(',').map((r) => r.trim()).filter(Boolean),
      })
    },
    [config, onConfigChange]
  )

  return (
    <div className="space-y-3 p-3 text-sm">
      <div>
        <label className="block font-medium mb-1">Role options (comma-separated)</label>
        <input
          className="border rounded px-2 py-1 w-full dark:bg-gray-800"
          value={roles.join(', ')}
          onChange={(e) => setRoles(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showRoles}
          onChange={(e) => onConfigChange({ ...config, showRoles: e.target.checked })}
        />
        Show role badges
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showUrgent}
          onChange={(e) => onConfigChange({ ...config, showUrgent: e.target.checked })}
        />
        Show urgent flags
      </label>
    </div>
  )
}
