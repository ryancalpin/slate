// src/modules/nursing-assessment/PrintView.tsx
const DEFAULT_SYSTEMS = [
  'Neuro', 'Cardiac', 'Respiratory', 'GI', 'GU',
  'Skin/Wound', 'Mobility', 'Fall Risk', 'Pain',
]

interface SystemData {
  status: 'WNL' | 'Abnormal' | 'N/A'
  notes: string
  fallScore?: number
  painScale?: number
  cpot?: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function PrintView({ config, data }: Props) {
  const enabledSystems = (config.enabledSystems as string[]) ?? DEFAULT_SYSTEMS
  const systemNames = (config.systemNames as Record<string, string>) ?? {}
  const systems = (data.systems as Record<string, SystemData>) ?? {}

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">Nursing Assessment</h3>
      <ul className="space-y-0.5 text-xs">
        {enabledSystems.map((key) => {
          const sys = systems[key] ?? { status: 'WNL', notes: '' }
          const displayName = systemNames[key] ?? key
          const isAbnormal = sys.status === 'Abnormal'
          return (
            <li key={key}>
              <span className={isAbnormal ? 'font-bold' : ''}>{displayName}</span>
              {': '}
              <span className={isAbnormal ? 'text-amber-700' : ''}>{sys.status}</span>
              {sys.notes ? ` | ${sys.notes}` : ''}
              {key === 'Fall Risk' && sys.fallScore !== undefined
                ? ` | Morse: ${sys.fallScore}`
                : ''}
              {key === 'Pain'
                ? ` | Pain: ${sys.painScale ?? 0}/10, CPOT: ${sys.cpot ?? 0}/8`
                : ''}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
