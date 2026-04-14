import React from 'react'
import type { FC } from 'react'

export const CITATION =
  'Carney N et al. Neurosurgery. 2017;80(1):6-15'

export function calcCPP(map: number, icp: number): number {
  return map - icp
}

type Reactivity = 'brisk' | 'sluggish' | 'fixed'

interface PupilData {
  sizeMm: number
  reactivity: Reactivity
}

interface ICPData {
  icp: number
  map: number
  cppTarget: number
  pupilL: PupilData
  pupilR: PupilData
  evdEnabled: boolean
  evd: {
    refLevel: number
    drainThreshold: number
    drainRate: number
  }
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: ICPData
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function reactivityColor(r: Reactivity): string {
  return r === 'brisk' ? 'bg-green-500' : r === 'sluggish' ? 'bg-yellow-500' : 'bg-red-600'
}

function NumericField({
  label,
  unit,
  value,
  min,
  max,
  onChange,
  disabled,
  highlight,
}: {
  label: string
  unit: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  disabled: boolean
  highlight?: 'warn' | 'ok' | null
}) {
  const borderCls =
    highlight === 'warn'
      ? 'border-red-500'
      : highlight === 'ok'
      ? 'border-green-500'
      : 'border-gray-600'

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-400">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-20 text-center text-xl font-bold bg-gray-800 border ${borderCls} rounded py-1 text-white disabled:opacity-50`}
      />
      <span className="text-xs text-gray-500">{unit}</span>
    </div>
  )
}

const REACTIVITY_OPTIONS: Reactivity[] = ['brisk', 'sluggish', 'fixed']

function PupilPanel({
  side,
  pupil,
  onChange,
  disabled,
}: {
  side: 'Left' | 'Right'
  pupil: PupilData
  onChange: (p: PupilData) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <span className="text-xs font-semibold text-gray-300">{side}</span>
      <div className="flex items-center gap-1">
        <input
          type="range"
          min={1}
          max={9}
          step={0.5}
          value={pupil.sizeMm}
          disabled={disabled}
          onChange={(e) => onChange({ ...pupil, sizeMm: Number(e.target.value) })}
          className="flex-1 accent-blue-500 disabled:opacity-50"
        />
        <span className="text-xs text-white w-8 text-right">{pupil.sizeMm}mm</span>
      </div>
      <div className="flex gap-1">
        {REACTIVITY_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => !disabled && onChange({ ...pupil, reactivity: r })}
            disabled={disabled}
            className={`flex-1 text-xs rounded py-0.5 border transition-colors
              ${pupil.reactivity === r
                ? `${reactivityColor(r)} border-transparent text-white font-semibold`
                : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d: ICPData = {
    icp: data.icp ?? 15,
    map: data.map ?? 80,
    cppTarget: data.cppTarget ?? 60,
    pupilL: data.pupilL ?? { sizeMm: 3, reactivity: 'brisk' },
    pupilR: data.pupilR ?? { sizeMm: 3, reactivity: 'brisk' },
    evdEnabled: data.evdEnabled ?? false,
    evd: data.evd ?? { refLevel: 0, drainThreshold: 20, drainRate: 0 },
  }
  const disabled = mode === 'build'
  const cpp = calcCPP(d.map, d.icp)
  const icpHigh = d.icp > 20
  const cppLow = cpp < d.cppTarget

  function update(patch: Partial<ICPData>) {
    if (disabled) return
    onDataChange({ ...d, ...patch })
  }

  return (
    <div className="p-3 space-y-3 text-sm text-gray-200">

      {/* Alerts */}
      {icpHigh && (
        <div className="bg-red-900/60 border border-red-600 rounded px-2 py-1 text-xs text-red-300 font-semibold">
          ICP elevated ({d.icp} mmHg &gt; 20 mmHg)
        </div>
      )}
      {cppLow && (
        <div className="bg-orange-900/60 border border-orange-500 rounded px-2 py-1 text-xs text-orange-300 font-semibold">
          CPP low ({cpp} mmHg &lt; target {d.cppTarget} mmHg)
        </div>
      )}

      {/* ICP / MAP / CPP row */}
      <div className="flex gap-4 justify-center">
        <NumericField
          label="ICP"
          unit="mmHg"
          value={d.icp}
          min={0}
          max={100}
          onChange={(v) => update({ icp: v })}
          disabled={disabled}
          highlight={icpHigh ? 'warn' : null}
        />
        <NumericField
          label="MAP"
          unit="mmHg"
          value={d.map}
          min={0}
          max={200}
          onChange={(v) => update({ map: v })}
          disabled={disabled}
          highlight={null}
        />
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">CPP</span>
          <span
            className={`text-2xl font-bold ${
              cppLow ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {cpp}
          </span>
          <span className="text-xs text-gray-500">mmHg</span>
        </div>
      </div>

      {/* Pupil tracker */}
      <div>
        <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide border-b border-gray-700 pb-0.5 mb-1">
          Pupils
        </h4>
        <div className="flex gap-3">
          <PupilPanel
            side="Left"
            pupil={d.pupilL}
            onChange={(p) => update({ pupilL: p })}
            disabled={disabled}
          />
          <div className="w-px bg-gray-700" />
          <PupilPanel
            side="Right"
            pupil={d.pupilR}
            onChange={(p) => update({ pupilR: p })}
            disabled={disabled}
          />
        </div>
        {Math.abs(d.pupilL.sizeMm - d.pupilR.sizeMm) >= 1 && (
          <div className="mt-1 text-xs text-yellow-400 font-semibold">
            Anisocoria ({Math.abs(d.pupilL.sizeMm - d.pupilR.sizeMm).toFixed(1)} mm difference)
          </div>
        )}
      </div>

      {/* EVD toggle */}
      <div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="evd-toggle"
            checked={d.evdEnabled}
            onChange={(e) => !disabled && update({ evdEnabled: e.target.checked })}
            disabled={disabled}
            className="accent-blue-500 disabled:opacity-50"
          />
          <label htmlFor="evd-toggle" className="text-xs font-semibold text-gray-300 cursor-pointer">
            External Ventricular Drain
          </label>
        </div>
        {d.evdEnabled && (
          <div className="mt-2 space-y-1">
            <h4 className="text-xs font-semibold text-gray-300 border-b border-gray-700 pb-0.5 mb-1">
              EVD Settings
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Ref Level (cmH₂O)</span>
                <input
                  type="number"
                  value={d.evd.refLevel}
                  disabled={disabled}
                  onChange={(e) =>
                    update({ evd: { ...d.evd, refLevel: Number(e.target.value) } })
                  }
                  className="bg-gray-700 border border-gray-600 rounded text-sm text-white px-2 py-0.5 disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Drain Threshold (mmHg)</span>
                <input
                  type="number"
                  value={d.evd.drainThreshold}
                  disabled={disabled}
                  onChange={(e) =>
                    update({ evd: { ...d.evd, drainThreshold: Number(e.target.value) } })
                  }
                  className="bg-gray-700 border border-gray-600 rounded text-sm text-white px-2 py-0.5 disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Drain Rate (mL/hr)</span>
                <input
                  type="number"
                  value={d.evd.drainRate}
                  disabled={disabled}
                  onChange={(e) =>
                    update({ evd: { ...d.evd, drainRate: Number(e.target.value) } })
                  }
                  className="bg-gray-700 border border-gray-600 rounded text-sm text-white px-2 py-0.5 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
