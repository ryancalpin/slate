import React, { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const SatSbtEditor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">SAT/SBT Readiness Settings</h4>
      <p className="text-xs text-gray-400">
        No configurable options for this module. Items are fixed per the ABC protocol
        (Girard et al. 2008).
      </p>
    </div>
  )
}
