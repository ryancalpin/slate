import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const AscitesEditor: React.FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Ascites Tracker Settings</h4>
      <div className="flex items-center gap-2">
        <input
          id="ascites-show-sbp"
          type="checkbox"
          checked={(config.showSbpSection as boolean) ?? true}
          onChange={e => onConfigChange({ ...config, showSbpSection: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="ascites-show-sbp" className="text-sm text-gray-600 dark:text-gray-300">
          Show SBP section
        </label>
      </div>
    </div>
  )
}
