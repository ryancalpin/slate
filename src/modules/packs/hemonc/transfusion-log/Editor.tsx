import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const TransfusionLogEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.highlightReactions ?? true)}
          onChange={e => onConfigChange({ ...config, highlightReactions: e.target.checked })}
        />
        Highlight reaction rows in red
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showTime ?? true)}
          onChange={e => onConfigChange({ ...config, showTime: e.target.checked })}
        />
        Show time column
      </label>
    </div>
  )
}
