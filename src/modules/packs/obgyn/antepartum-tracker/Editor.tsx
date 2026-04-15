import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => (
  <div className="p-3 text-sm text-gray-400">
    No configuration options for Antepartum Tracker.
  </div>
)
