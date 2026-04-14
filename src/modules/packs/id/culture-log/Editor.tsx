import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function CultureEditor({ config, onConfigChange }: Props) {
  return (
    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">
      <p className="font-medium mb-1">Culture Log</p>
      <p className="text-xs">No additional configuration. Add rows in Live Mode.</p>
    </div>
  )
}
