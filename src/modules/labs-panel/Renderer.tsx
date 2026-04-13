import { useCallback } from 'react'
import type { FC } from 'react'

interface NormalRange { min?: number; max?: number }

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function getRangeClass(value: number, range: NormalRange): string {
  const { min, max } = range
  const criticalMargin = 0.1
  if (max !== undefined && value > max) {
    return value > max * (1 + criticalMargin) ? 'text-red-600' : 'text-amber-500'
  }
  if (min !== undefined && value < min) {
    return value < min * (1 - criticalMargin) ? 'text-red-600' : 'text-amber-500'
  }
  return ''
}

const DEFAULT_RANGES: Record<string, NormalRange> = {
  na: { min: 136, max: 145 },
  k: { min: 3.5, max: 5.0 },
  cl: { min: 98, max: 106 },
  co2: { min: 22, max: 29 },
  bun: { min: 7, max: 20 },
  cr: { min: 0.6, max: 1.2 },
  glucose: { min: 70, max: 100 },
  wbc: { min: 4.5, max: 11.0 },
  hgb: { min: 12, max: 17.5 },
  hct: { min: 36, max: 50 },
  plt: { min: 150, max: 400 },
}

const PANELS = {
  bmp: {
    label: 'BMP',
    labs: [
      { key: 'na', label: 'Na', unit: 'mEq/L' },
      { key: 'k', label: 'K', unit: 'mEq/L' },
      { key: 'cl', label: 'Cl', unit: 'mEq/L' },
      { key: 'co2', label: 'CO2', unit: 'mEq/L' },
      { key: 'bun', label: 'BUN', unit: 'mg/dL' },
      { key: 'cr', label: 'Cr', unit: 'mg/dL' },
      { key: 'glucose', label: 'Glucose', unit: 'mg/dL' },
    ],
  },
  cbc: {
    label: 'CBC',
    labs: [
      { key: 'wbc', label: 'WBC', unit: 'K/µL' },
      { key: 'hgb', label: 'Hgb', unit: 'g/dL' },
      { key: 'hct', label: 'Hct', unit: '%' },
      { key: 'plt', label: 'Plt', unit: 'K/µL' },
    ],
  },
  lfts: {
    label: 'LFTs',
    labs: [
      { key: 'alt', label: 'ALT', unit: 'U/L' },
      { key: 'ast', label: 'AST', unit: 'U/L' },
      { key: 'alp', label: 'ALP', unit: 'U/L' },
      { key: 'tbili', label: 'TBili', unit: 'mg/dL' },
      { key: 'alb', label: 'Alb', unit: 'g/dL' },
    ],
  },
  coags: {
    label: 'Coags',
    labs: [
      { key: 'pt', label: 'PT', unit: 'sec' },
      { key: 'inr', label: 'INR', unit: '' },
      { key: 'ptt', label: 'PTT', unit: 'sec' },
    ],
  },
} as const

type PanelKey = keyof typeof PANELS

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const cfg = config as { showBmp?: boolean; showCbc?: boolean; showLfts?: boolean; showCoags?: boolean; showTrend?: boolean; normalRanges?: Record<string, NormalRange> }
  const isLive = mode === 'live'
  const ranges = { ...DEFAULT_RANGES, ...(cfg.normalRanges ?? {}) }

  const handleChange = useCallback(
    (field: string, value: string) => {
      onDataChange({ ...data, [field]: value === '' ? undefined : Number(value) })
    },
    [data, onDataChange]
  )

  const panelVisible: Record<PanelKey, boolean> = {
    bmp: cfg.showBmp !== false,
    cbc: cfg.showCbc !== false,
    lfts: cfg.showLfts === true,
    coags: cfg.showCoags === true,
  }

  return (
    <div className="p-2 flex flex-wrap gap-4">
      {(Object.keys(PANELS) as PanelKey[]).map(panelKey =>
        panelVisible[panelKey] ? (
          <div key={panelKey} className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {PANELS[panelKey].label}
            </h4>
            {PANELS[panelKey].labs.map(lab => {
              const val = data[lab.key] as number | undefined
              const prev = data[`prev_${lab.key}`] as number | undefined
              const rangeClass = val !== undefined && ranges[lab.key]
                ? getRangeClass(val, ranges[lab.key])
                : ''
              return (
                <div key={lab.key} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-14 text-right">{lab.label}</span>
                  {isLive ? (
                    <input
                      type="number"
                      value={val ?? ''}
                      onChange={e => handleChange(lab.key, e.target.value)}
                      className={`w-16 text-sm border-b border-gray-300 dark:border-gray-600 bg-transparent outline-none text-center ${rangeClass}`}
                      placeholder="—"
                    />
                  ) : (
                    <span className="w-16 text-sm text-gray-400 text-center">—</span>
                  )}
                  <span className="text-xs text-gray-400">{lab.unit}</span>
                  {cfg.showTrend && prev !== undefined && val !== undefined && (
                    <span className="text-xs text-gray-400">({prev})</span>
                  )}
                </div>
              )
            })}
          </div>
        ) : null
      )}
    </div>
  )
}
