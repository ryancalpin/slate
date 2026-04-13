import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const toggle = (key: string) =>
    onConfigChange({ ...config, [key]: !(config[key] !== false) })

  return (
    <div className="space-y-4 p-3">
      <div>
        <h3 className="text-sm font-semibold mb-2">Panels</h3>
        <div className="space-y-1">
          {[
            { key: 'showBmp', label: 'BMP (Basic Metabolic Panel)' },
            { key: 'showCbc', label: 'CBC (Complete Blood Count)' },
            { key: 'showLfts', label: 'LFTs (Liver Function Tests)' },
            { key: 'showCoags', label: 'Coags (PT/INR/PTT)' },
          ].map(p => (
            <label key={p.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config[p.key] !== false && config[p.key] !== undefined ? !!config[p.key] : p.key === 'showBmp' || p.key === 'showCbc'}
                onChange={() => toggle(p.key)}
                className="rounded"
              />
              {p.label}
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={config.showTrend !== false}
          onChange={() => toggle('showTrend')}
          className="rounded"
        />
        Show prior value below each field
      </label>
    </div>
  )
}
