import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = () => {
  return (
    <div className="p-3 text-sm text-gray-300">
      <p className="text-gray-400 italic">No configuration options for Neuro Scores.</p>
    </div>
  )
}
