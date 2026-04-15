import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">
      <p className="font-semibold mb-1">Dialysis Settings</p>
      <p className="text-xs text-gray-400">No additional configuration required. Modality and field values are set in the module directly.</p>
    </div>
  )
}
