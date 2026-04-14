import React, { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const VasopressorEditor: FC<Props> = ({ config, onConfigChange }) => {
  const defaultMapTarget = (config.defaultMapTarget as number) ?? 65

  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">Vasopressor Tracker Settings</h4>
      <div className="space-y-1">
        <label className="block text-xs text-gray-400">Default MAP Target (mmHg)</label>
        <input
          type="number"
          value={defaultMapTarget}
          min={40}
          max={110}
          onChange={(e) =>
            onConfigChange({ ...config, defaultMapTarget: parseInt(e.target.value) || 65 })
          }
          className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-24"
        />
        <p className="text-xs text-gray-500">Applied to each new pressor row added.</p>
      </div>
    </div>
  )
}
