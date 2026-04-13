import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const toggle = (key: string) =>
    onConfigChange({ ...config, [key]: !config[key] })

  return (
    <div className="space-y-2 p-3">
      <h3 className="text-sm font-semibold mb-2">Display Options</h3>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={!!config.showGlucose}
          onChange={() => toggle('showGlucose')}
          className="rounded"
        />
        Show Glucose
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={!!config.showMgPhos}
          onChange={() => toggle('showMgPhos')}
          className="rounded"
        />
        Show Mg / Phos row
      </label>
    </div>
  )
}
