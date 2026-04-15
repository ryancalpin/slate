import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const CBCTrendsEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showSparklines ?? true)}
          onChange={e => onConfigChange({ ...config, showSparklines: e.target.checked })}
        />
        Show sparklines
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(config.showUnits ?? true)}
          onChange={e => onConfigChange({ ...config, showUnits: e.target.checked })}
        />
        Show units in header
      </label>
    </div>
  )
}
