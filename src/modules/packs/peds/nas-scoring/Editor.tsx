import type { FC } from 'react'

export const Editor: FC<{ config: Record<string, unknown>; onConfigChange: (c: Record<string, unknown>) => void }> = () => (
  <div className="p-3 text-sm text-gray-400">No configuration options.</div>
)
