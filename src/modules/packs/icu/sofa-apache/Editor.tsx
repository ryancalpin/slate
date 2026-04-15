import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const SofaApacheEditor: FC<Props> = ({ config: _config, onConfigChange: _onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">SOFA / APACHE II Settings</h4>
      <p className="text-xs text-gray-400">
        No configurable options. Scoring follows published criteria (Singer et al. 2016; Knaus et al. 1985).
      </p>
    </div>
  )
}
