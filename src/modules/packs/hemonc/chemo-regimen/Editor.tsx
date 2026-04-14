import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const ChemoRegimenEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showDates ?? true)}
          onChange={e => onConfigChange({ ...config, showDates: e.target.checked })}
        />
        Show nadir / next-cycle dates
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.compactAgents ?? false)}
          onChange={e => onConfigChange({ ...config, compactAgents: e.target.checked })}
        />
        Compact agent list
      </label>
    </div>
  )
}
