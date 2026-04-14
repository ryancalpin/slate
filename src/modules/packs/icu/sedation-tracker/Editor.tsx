import React, { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const SedationEditor: FC<Props> = ({ config, onConfigChange }) => {
  const goalMin = (config.goalRassMin as number) ?? -2
  const goalMax = (config.goalRassMax as number) ?? 0

  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">Sedation Tracker Settings</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Goal RASS Min</label>
          <input
            type="number"
            value={goalMin}
            min={-5}
            max={4}
            onChange={(e) => onConfigChange({ ...config, goalRassMin: parseInt(e.target.value) })}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-20"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Goal RASS Max</label>
          <input
            type="number"
            value={goalMax}
            min={-5}
            max={4}
            onChange={(e) => onConfigChange({ ...config, goalRassMax: parseInt(e.target.value) })}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-20"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Default goal range is -2 to 0 (light sedation to alert &amp; calm).
      </p>
    </div>
  )
}
