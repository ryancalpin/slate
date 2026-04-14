import React from 'react'
import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const NeutropenicFeverEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showCoverage ?? true)}
          onChange={e => onConfigChange({ ...config, showCoverage: e.target.checked })}
        />
        Show empiric coverage checklist
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showCitation ?? true)}
          onChange={e => onConfigChange({ ...config, showCitation: e.target.checked })}
        />
        Show citation
      </label>
    </div>
  )
}
