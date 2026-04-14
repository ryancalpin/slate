import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => (
  <div className="p-3 text-sm text-gray-600 dark:text-gray-400">
    <p>No additional configuration for Weaning Readiness.</p>
    <p className="mt-1 text-xs text-gray-400">All checklist items, RSBI, and SBT log are displayed by default.</p>
  </div>
)
