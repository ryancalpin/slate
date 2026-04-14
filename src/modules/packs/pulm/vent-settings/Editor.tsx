import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-600 dark:text-gray-400">
      <p>No additional configuration for Ventilator Settings.</p>
      <p className="mt-1 text-xs text-gray-400">All fields are displayed by default.</p>
    </div>
  )
}
