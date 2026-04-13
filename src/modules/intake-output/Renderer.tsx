import { useCallback } from 'react'
import type { FC } from 'react'

interface FluidEntry { label: string; ml: number }

interface IOData {
  po: number
  ivFluids: FluidEntry[]
  urine: number
  urineHours: number
  stool: number
  drains: FluidEntry[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function calcUOP(urine: number, hours: number): number {
  if (hours === 0) return 0
  return Math.round((urine / hours) * 10) / 10
}

export function calcNetBalance(data: Partial<IOData>): number {
  const ivTotal = (data.ivFluids ?? []).reduce((s, e) => s + (e.ml || 0), 0)
  const totalIn = (data.po ?? 0) + ivTotal
  const drainTotal = (data.drains ?? []).reduce((s, e) => s + (e.ml || 0), 0)
  const totalOut = (data.urine ?? 0) + (data.stool ?? 0) + drainTotal
  return totalIn - totalOut
}

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const isLive = mode === 'live'
  const cfg = config as { showUOP?: boolean; windowLabel?: string }
  const d = data as Partial<IOData>

  const po = d.po ?? 0
  const ivFluids: FluidEntry[] = d.ivFluids ?? []
  const urine = d.urine ?? 0
  const urineHours = d.urineHours ?? 0
  const stool = d.stool ?? 0
  const drains: FluidEntry[] = d.drains ?? []

  const uop = calcUOP(urine, urineHours)
  const netBalance = calcNetBalance(d)
  const netClass = netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'

  const handleField = useCallback(
    (field: string, value: unknown) => onDataChange({ ...data, [field]: value }),
    [data, onDataChange]
  )

  const updateIv = useCallback(
    (i: number, field: 'label' | 'ml', val: string) => {
      const next = [...ivFluids]
      next[i] = { ...next[i], [field]: field === 'ml' ? Number(val) : val }
      handleField('ivFluids', next)
    },
    [ivFluids, handleField]
  )

  const addIv = useCallback(() => {
    handleField('ivFluids', [...ivFluids, { label: '', ml: 0 }])
  }, [ivFluids, handleField])

  const removeIv = useCallback(
    (i: number) => handleField('ivFluids', ivFluids.filter((_, idx) => idx !== i)),
    [ivFluids, handleField]
  )

  const updateDrain = useCallback(
    (i: number, field: 'label' | 'ml', val: string) => {
      const next = [...drains]
      next[i] = { ...next[i], [field]: field === 'ml' ? Number(val) : val }
      handleField('drains', next)
    },
    [drains, handleField]
  )

  const addDrain = useCallback(() => {
    handleField('drains', [...drains, { label: '', ml: 0 }])
  }, [drains, handleField])

  const removeDrain = useCallback(
    (i: number) => handleField('drains', drains.filter((_, idx) => idx !== i)),
    [drains, handleField]
  )

  const numInput = (value: number, onChange: (v: string) => void) => (
    <input
      type="number"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      readOnly={!isLive}
      placeholder="0"
      className="w-20 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none text-right"
    />
  )

  return (
    <div className="p-2 text-sm space-y-2">
      {cfg.windowLabel && (
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {cfg.windowLabel}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {/* INTAKE */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Intake</h4>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">PO</span>
            {numInput(po, v => handleField('po', Number(v)))}
            <span className="text-xs text-gray-400 ml-1">mL</span>
          </div>
          {ivFluids.map((iv, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="text"
                value={iv.label}
                onChange={e => updateIv(i, 'label', e.target.value)}
                readOnly={!isLive}
                placeholder="IV label"
                className="flex-1 min-w-0 text-xs bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none"
              />
              {numInput(iv.ml, v => updateIv(i, 'ml', v))}
              <span className="text-xs text-gray-400">mL</span>
              {isLive && (
                <button onClick={() => removeIv(i)} className="text-red-400 text-xs">✕</button>
              )}
            </div>
          ))}
          {isLive && (
            <button onClick={addIv} className="text-xs text-blue-500 hover:text-blue-700">+ Add IV</button>
          )}
        </div>

        {/* OUTPUT */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase">Output</h4>
          <div className="flex justify-between items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">Urine</span>
            {numInput(urine, v => handleField('urine', Number(v)))}
            <span className="text-xs text-gray-400">mL</span>
          </div>
          {cfg.showUOP !== false && (
            <div className="flex justify-between items-center gap-1 pl-2">
              <span className="text-xs text-gray-500">over</span>
              {numInput(urineHours, v => handleField('urineHours', Number(v)))}
              <span className="text-xs text-gray-400">hrs</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                = {uop} mL/hr UOP
              </span>
            </div>
          )}
          <div className="flex justify-between items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">Stool</span>
            {numInput(stool, v => handleField('stool', Number(v)))}
            <span className="text-xs text-gray-400">mL</span>
          </div>
          {drains.map((drain, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="text"
                value={drain.label}
                onChange={e => updateDrain(i, 'label', e.target.value)}
                readOnly={!isLive}
                placeholder="Drain label"
                className="flex-1 min-w-0 text-xs bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none"
              />
              {numInput(drain.ml, v => updateDrain(i, 'ml', v))}
              <span className="text-xs text-gray-400">mL</span>
              {isLive && (
                <button onClick={() => removeDrain(i)} className="text-red-400 text-xs">✕</button>
              )}
            </div>
          ))}
          {isLive && (
            <button onClick={addDrain} className="text-xs text-blue-500 hover:text-blue-700">+ Add Drain</button>
          )}
        </div>
      </div>

      {/* Net Balance */}
      <div className={`text-right text-sm font-semibold border-t border-gray-200 dark:border-gray-700 pt-1 ${netClass}`}>
        Net Balance: {netBalance >= 0 ? '+' : ''}{netBalance} mL
      </div>
    </div>
  )
}
