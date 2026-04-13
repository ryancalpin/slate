// src/modules/free-text/Renderer.tsx
import { useCallback } from 'react'

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const FONT_SIZE_CLASS: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const label = (config.label as string) ?? 'Notes'
  const fontSize = (config.fontSize as string) ?? 'base'
  const placeholder = (config.placeholder as string) ?? 'Enter notes here...'
  const text = (data.text as string) ?? ''

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onDataChange({ ...data, text: e.target.value })
    },
    [data, onDataChange]
  )

  return (
    <div className="p-2 flex flex-col h-full">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
        {label}
      </label>
      <textarea
        className={`flex-1 w-full resize-none bg-transparent border border-gray-200 dark:border-gray-700 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
          FONT_SIZE_CLASS[fontSize] ?? 'text-base'
        }`}
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={mode === 'build'}
      />
    </div>
  )
}
