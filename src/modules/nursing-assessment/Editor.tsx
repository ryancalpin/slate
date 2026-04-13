// src/modules/nursing-assessment/Editor.tsx
import { useCallback } from 'react'

const DEFAULT_SYSTEMS = [
  'Neuro', 'Cardiac', 'Respiratory', 'GI', 'GU',
  'Skin/Wound', 'Mobility', 'Fall Risk', 'Pain',
]

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function Editor({ config, onConfigChange }: Props) {
  const enabledSystems = (config.enabledSystems as string[]) ?? DEFAULT_SYSTEMS
  const alwaysShowNotes = (config.alwaysShowNotes as boolean) ?? false
  const systemNames = (config.systemNames as Record<string, string>) ?? {}

  const toggleSystem = useCallback(
    (name: string, on: boolean) => {
      const next = on
        ? [...enabledSystems, name]
        : enabledSystems.filter((s) => s !== name)
      onConfigChange({ ...config, enabledSystems: next })
    },
    [config, enabledSystems, onConfigChange]
  )

  const renameSystem = useCallback(
    (key: string, value: string) => {
      onConfigChange({ ...config, systemNames: { ...systemNames, [key]: value } })
    },
    [config, systemNames, onConfigChange]
  )

  return (
    <div className="space-y-3 p-3 text-sm">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={alwaysShowNotes}
          onChange={(e) => onConfigChange({ ...config, alwaysShowNotes: e.target.checked })}
        />
        Always show notes field
      </label>
      <div>
        <p className="font-medium mb-1">Systems</p>
        <ul className="space-y-1.5">
          {DEFAULT_SYSTEMS.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enabledSystems.includes(s)}
                onChange={(e) => toggleSystem(s, e.target.checked)}
              />
              <input
                className="flex-1 border rounded px-1 py-0.5 text-xs dark:bg-gray-800"
                value={systemNames[s] ?? s}
                onChange={(e) => renameSystem(s, e.target.value)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
