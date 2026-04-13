import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const toggle = (key: string) =>
    onConfigChange({ ...config, [key]: !config[key] })

  return (
    <div className="p-3 space-y-3">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={config.showUOP !== false}
          onChange={() => toggle('showUOP')}
          className="rounded"
        />
        Show UOP calculation (mL/hr)
      </label>
      <div>
        <label className="text-sm font-medium block mb-1">Window label</label>
        <input
          type="text"
          value={(config.windowLabel as string) ?? '24h I/O'}
          onChange={e => onConfigChange({ ...config, windowLabel: e.target.value })}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent w-full"
        />
      </div>
    </div>
  )
}
