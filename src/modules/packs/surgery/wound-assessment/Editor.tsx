import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-2 text-xs text-gray-500 dark:text-gray-400 italic">
      No configuration options for this module.
    </div>
  )
}
