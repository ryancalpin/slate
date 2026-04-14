import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function FeverEditor({ config, onConfigChange }: Props) {
  return (
    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">
      <p className="font-medium mb-1">Fever Curve</p>
      <p className="text-xs">Fever threshold is configurable directly in the module during Live Mode.</p>
    </div>
  )
}
