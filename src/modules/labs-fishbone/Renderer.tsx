import { useCallback } from 'react'
import type { FC } from 'react'

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const CellInput: FC<{
  field: string
  placeholder: string
  value: string
  onChange: (field: string, val: string) => void
  readOnly: boolean
}> = ({ field, placeholder, value, onChange, readOnly }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(field, e.target.value)}
    readOnly={readOnly}
    className="w-full text-center text-sm bg-transparent outline-none border-none focus:bg-blue-50 dark:focus:bg-blue-950/30 rounded p-1"
  />
)

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const cfg = config as { showGlucose?: boolean; showMgPhos?: boolean }
  const isLive = mode === 'live'

  const handleChange = useCallback(
    (field: string, val: string) => {
      onDataChange({ ...data, [field]: val })
    },
    [data, onDataChange]
  )

  const val = (f: string) => (data[f] as string) ?? ''

  const cell = (field: string, placeholder: string) => (
    <CellInput
      field={field}
      placeholder={placeholder}
      value={val(field)}
      onChange={handleChange}
      readOnly={!isLive}
    />
  )

  return (
    <div className="p-2 flex flex-col gap-2 font-mono text-sm">
      {/* Main fishbone grid */}
      <div className="flex items-stretch gap-0">
        {/* Left 2x2: Na/K | Cl/CO2 */}
        <div className="grid grid-cols-2 border border-gray-400 dark:border-gray-600" style={{ width: 120 }}>
          <div className="border-b border-r border-gray-400 dark:border-gray-600 p-0.5">{cell('na', 'Na')}</div>
          <div className="border-b border-gray-400 dark:border-gray-600 p-0.5">{cell('cl', 'Cl')}</div>
          <div className="border-r border-gray-400 dark:border-gray-600 p-0.5">{cell('k', 'K')}</div>
          <div className="p-0.5">{cell('co2', 'CO2')}</div>
        </div>
        {/* Right 2x2: BUN/Cr with divider */}
        <div className="grid grid-cols-2 border-t border-b border-r border-gray-400 dark:border-gray-600" style={{ width: 100 }}>
          <div className="border-b border-r border-gray-400 dark:border-gray-600 p-0.5">{cell('bun', 'BUN')}</div>
          <div className="border-b border-gray-400 dark:border-gray-600 p-0.5 text-center">
            {cfg.showGlucose !== false ? cell('glucose', 'Glu') : null}
          </div>
          <div className="border-r border-gray-400 dark:border-gray-600 p-0.5">{cell('cr', 'Cr')}</div>
          <div className="p-0.5" />
        </div>
      </div>

      {/* Mg / Phos row */}
      {cfg.showMgPhos && (
        <div className="flex gap-2 pt-1 border-t border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Mg</span>
            {cell('mg', 'Mg')}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Phos</span>
            {cell('phos', 'Phos')}
          </div>
        </div>
      )}
    </div>
  )
}
