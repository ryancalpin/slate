import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const EncephalopathyEditor: React.FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Encephalopathy Settings</h4>
      <div className="flex items-center gap-2">
        <input
          id="he-show-log"
          type="checkbox"
          checked={(config.showLactulosLog as boolean) ?? true}
          onChange={e => onConfigChange({ ...config, showLactulosLog: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="he-show-log" className="text-sm text-gray-600 dark:text-gray-300">
          Show lactulose log
        </label>
      </div>
    </div>
  )
}
