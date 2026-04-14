import { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-600 dark:text-gray-300">
      <p className="font-semibold mb-1">AKI Staging</p>
      <p className="text-xs text-gray-400">No additional configuration. Staging is computed dynamically from patient values entered in the module.</p>
    </div>
  )
}
