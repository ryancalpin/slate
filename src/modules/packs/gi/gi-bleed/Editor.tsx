import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const GiBleedEditor: React.FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">GI Bleed Settings</h4>
      <div className="flex items-center gap-2">
        <input
          id="gib-show-rockall"
          type="checkbox"
          checked={(config.showRockall as boolean) ?? true}
          onChange={e => onConfigChange({ ...config, showRockall: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="gib-show-rockall" className="text-sm text-gray-600 dark:text-gray-300">
          Show Rockall Score section
        </label>
      </div>
    </div>
  )
}
