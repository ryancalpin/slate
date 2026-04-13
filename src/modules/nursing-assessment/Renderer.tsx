// src/modules/nursing-assessment/Renderer.tsx
import { useState, useCallback } from 'react'

type SystemStatus = 'WNL' | 'Abnormal' | 'N/A'

interface SystemData {
  status: SystemStatus
  notes: string
  fallScore?: number
  painScale?: number
  cpot?: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const DEFAULT_SYSTEMS = [
  'Neuro', 'Cardiac', 'Respiratory', 'GI', 'GU',
  'Skin/Wound', 'Mobility', 'Fall Risk', 'Pain',
]

const STATUS_OPTIONS: SystemStatus[] = ['WNL', 'Abnormal', 'N/A']

const STATUS_COLORS: Record<SystemStatus, string> = {
  WNL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Abnormal: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'N/A': 'bg-gray-100 text-gray-500 dark:bg-gray-800',
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const alwaysShowNotes = (config.alwaysShowNotes as boolean) ?? false
  const enabledSystems = (config.enabledSystems as string[]) ?? DEFAULT_SYSTEMS
  const systemNames = (config.systemNames as Record<string, string>) ?? {}
  const systems = (data.systems as Record<string, SystemData>) ?? {}

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const getSystem = (name: string): SystemData =>
    systems[name] ?? { status: 'WNL', notes: '' }

  const updateSystem = useCallback(
    (name: string, patch: Partial<SystemData>) => {
      const current = systems[name] ?? { status: 'WNL', notes: '' }
      onDataChange({
        ...data,
        systems: { ...systems, [name]: { ...current, ...patch } },
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, systems, onDataChange]
  )

  return (
    <div className="p-2 text-sm space-y-1 overflow-auto">
      {enabledSystems.map((sysKey) => {
        const displayName = systemNames[sysKey] ?? sysKey
        const sys = getSystem(sysKey)
        const isAbnormal = sys.status === 'Abnormal'
        const showNotes = alwaysShowNotes || isAbnormal || expanded[sysKey]
        const isFallRisk = sysKey === 'Fall Risk'
        const isPain = sysKey === 'Pain'

        return (
          <div
            key={sysKey}
            className={`rounded border p-1.5 ${
              isAbnormal
                ? 'border-l-4 border-l-amber-400 border-gray-200 dark:border-gray-700'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setExpanded((e) => ({ ...e, [sysKey]: !e[sysKey] }))}
                className="font-medium text-xs min-w-[80px] text-left"
              >
                {displayName}
              </button>
              <div className="flex gap-1">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => mode === 'live' && updateSystem(sysKey, { status: s })}
                    className={`text-xs px-2 py-0.5 rounded ${
                      sys.status === s
                        ? STATUS_COLORS[s]
                        : 'bg-gray-50 text-gray-400 dark:bg-gray-800'
                    }`}
                    disabled={mode === 'build'}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {isFallRisk ? (
                <span className="flex items-center gap-1 text-xs ml-auto">
                  Morse:
                  <input
                    type="number"
                    min={0}
                    max={125}
                    className="w-14 border rounded px-1 text-xs dark:bg-gray-800"
                    value={sys.fallScore ?? 0}
                    onChange={(e) =>
                      updateSystem(sysKey, { fallScore: Number(e.target.value) })
                    }
                    disabled={mode === 'build'}
                  />
                </span>
              ) : null}
              {isPain ? (
                <span className="flex items-center gap-2 text-xs ml-auto">
                  <span>Pain 0–10:
                    <input
                      type="number"
                      min={0}
                      max={10}
                      className="w-12 border rounded px-1 ml-1 dark:bg-gray-800"
                      value={sys.painScale ?? 0}
                      onChange={(e) =>
                        updateSystem(sysKey, { painScale: Number(e.target.value) })
                      }
                      disabled={mode === 'build'}
                    />
                  </span>
                  <span>CPOT 0–8:
                    <input
                      type="number"
                      min={0}
                      max={8}
                      className="w-12 border rounded px-1 ml-1 dark:bg-gray-800"
                      value={sys.cpot ?? 0}
                      onChange={(e) =>
                        updateSystem(sysKey, { cpot: Number(e.target.value) })
                      }
                      disabled={mode === 'build'}
                    />
                  </span>
                </span>
              ) : null}
            </div>
            {showNotes ? (
              <textarea
                className="mt-1 w-full text-xs bg-gray-50 dark:bg-gray-800 rounded p-1 resize-none border border-gray-200 dark:border-gray-700"
                rows={2}
                value={sys.notes}
                onChange={(e) => updateSystem(sysKey, { notes: e.target.value })}
                placeholder="Notes"
                readOnly={mode === 'build'}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
