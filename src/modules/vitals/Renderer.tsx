import { useCallback } from 'react'
import type { FC } from 'react'
import { SortableRows } from '../../canvas/SortableRows'

interface NormalRange { min?: number; max?: number }

interface VitalsConfig {
  showHr?: boolean; showBp?: boolean; showRr?: boolean
  showTemp?: boolean; showSpo2?: boolean; showWeight?: boolean
  showTrends?: boolean
  tempUnit?: 'F' | 'C'
  weightUnit?: 'kg' | 'lbs'
  normalRanges?: {
    hr?: NormalRange; sbp?: NormalRange; dbp?: NormalRange
    rr?: NormalRange; temp?: NormalRange; spo2?: NormalRange
  }
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function getTrendArrow(current: number, prev: number): '↑' | '↓' | '→' {
  if (current > prev) return '↑'
  if (current < prev) return '↓'
  return '→'
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

const DEFAULT_RANGES = {
  hr: { min: 60, max: 100 },
  sbp: { min: 90, max: 140 },
  dbp: { min: 60, max: 90 },
  rr: { min: 12, max: 20 },
  temp: { min: 97, max: 99 },
  spo2: { min: 95 },
}

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const cfg = config as VitalsConfig
  const isLive = mode === 'live'
  const ranges = { ...DEFAULT_RANGES, ...(cfg.normalRanges ?? {}) }

  const handleChange = useCallback(
    (field: string, value: string) => {
      const num = value === '' ? undefined : Number(value)
      onDataChange({ ...data, [field]: num })
    },
    [data, onDataChange]
  )

  const VitalCell = ({
    field, label, unit, show = true, prevField,
  }: { field: string; label: string; unit: string; show?: boolean; prevField?: string }) => {
    if (!show) return null
    const val = data[field] as number | undefined
    const prev = prevField ? (data[prevField] as number | undefined) : undefined
    const rangeKey = field as keyof typeof ranges
    const rangeClass = val !== undefined && ranges[rangeKey]
      ? getRangeClass(val, ranges[rangeKey])
      : ''
    const trendArrow = cfg.showTrends && val !== undefined && prev !== undefined
      ? getTrendArrow(val, prev)
      : null

    return (
      <div className="flex flex-col items-center p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-w-[80px]">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        {isLive ? (
          <input
            type="number"
            value={val ?? ''}
            onChange={e => handleChange(field, e.target.value)}
            className={`w-full text-center text-lg font-semibold bg-transparent border-none outline-none ${rangeClass}`}
          />
        ) : (
          <input
            type="number"
            disabled
            placeholder="—"
            className="w-full text-center text-lg font-semibold bg-transparent border-none outline-none text-gray-600 cursor-not-allowed"
          />
        )}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">{unit}</span>
          {trendArrow !== null && (
            <span className={`text-sm ${trendArrow === '↑' ? 'text-red-500' : trendArrow === '↓' ? 'text-blue-500' : 'text-gray-400'}`}>
              {trendArrow}
            </span>
          )}
        </div>
      </div>
    )
  }

  const fieldOrder = (data._fieldOrder as string[] | undefined) ?? ['hr', 'bp', 'rr', 'temp', 'spo2', 'weight']
  const isBuild = mode === 'build'

  const renderField = (fieldKey: string) => {
    switch (fieldKey) {
      case 'hr':
        return <VitalCell field="hr" label="HR" unit="bpm" show={cfg.showHr !== false} prevField="prevHr" />
      case 'bp':
        return cfg.showBp !== false ? (
          <div className="flex flex-col items-center p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-w-[80px]">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">BP</span>
            <div className="flex items-center gap-1">
              {isLive ? (
                <>
                  <input type="number" value={(data.sbp as number) ?? ''} onChange={e => handleChange('sbp', e.target.value)} className="w-12 text-center text-lg font-semibold bg-transparent border-none outline-none" placeholder="—" />
                  <span className="text-gray-400">/</span>
                  <input type="number" value={(data.dbp as number) ?? ''} onChange={e => handleChange('dbp', e.target.value)} className="w-12 text-center text-lg font-semibold bg-transparent border-none outline-none" placeholder="—" />
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <input type="number" disabled placeholder="—" className="w-12 text-center text-lg font-semibold bg-transparent border-none outline-none text-gray-600 cursor-not-allowed" />
                  <span className="text-gray-600">/</span>
                  <input type="number" disabled placeholder="—" className="w-12 text-center text-lg font-semibold bg-transparent border-none outline-none text-gray-600 cursor-not-allowed" />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">mmHg</span>
          </div>
        ) : null
      case 'rr':
        return <VitalCell field="rr" label="RR" unit="br/min" show={cfg.showRr !== false} prevField="prevRr" />
      case 'temp':
        return <VitalCell field="temp" label="Temp" unit={cfg.tempUnit === 'C' ? '°C' : '°F'} show={cfg.showTemp !== false} prevField="prevTemp" />
      case 'spo2':
        return <VitalCell field="spo2" label="SpO2" unit="%" show={cfg.showSpo2 !== false} prevField="prevSpo2" />
      case 'weight':
        return <VitalCell field="weight" label="Weight" unit={cfg.weightUnit === 'lbs' ? 'lbs' : 'kg'} show={cfg.showWeight !== false} />
      default:
        return null
    }
  }

  return (
    <div className="p-2">
      <SortableRows
        ids={fieldOrder}
        onReorder={newOrder => onDataChange({ ...data, _fieldOrder: newOrder })}
        buildMode={isBuild}
        direction="horizontal"
      >
        {(id) => {
          const content = renderField(id)
          return content ?? <></>
        }}
      </SortableRows>
    </div>
  )
}
