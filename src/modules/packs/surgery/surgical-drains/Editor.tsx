import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const threshold = (config.alertThresholdMl as number) ?? 500

  return (
    <div className="space-y-3 p-2">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
          High-output alert threshold (mL/shift)
        </label>
        <input
          type="number"
          min={0}
          className="w-28 text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
          value={threshold}
          onChange={e => onConfigChange({ ...config, alertThresholdMl: Number(e.target.value) })}
        />
        <p className="text-xs text-gray-400 mt-1">
          Entries exceeding this value are highlighted amber.
        </p>
      </div>
    </div>
  )
}
