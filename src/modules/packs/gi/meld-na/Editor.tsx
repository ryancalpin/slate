import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const MeldNaEditor: React.FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">MELD-Na Settings</h4>
      <div className="flex items-center gap-2">
        <input
          id="meld-show-table"
          type="checkbox"
          checked={(config.showMortalityTable as boolean) ?? true}
          onChange={e => onConfigChange({ ...config, showMortalityTable: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="meld-show-table" className="text-sm text-gray-600 dark:text-gray-300">
          Show 90-day mortality table
        </label>
      </div>
    </div>
  )
}
