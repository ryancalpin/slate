import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => (
  <div className="p-3 space-y-3">
    <div>
      <label className="text-sm font-medium block mb-1">
        Default blank problems on open
      </label>
      <select
        value={(config.defaultProblems as number) ?? 1}
        onChange={e => onConfigChange({ ...config, defaultProblems: Number(e.target.value) })}
        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent"
      >
        {[1, 2, 3, 4, 5].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  </div>
)
