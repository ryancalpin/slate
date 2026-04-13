import { useCallback } from 'react'
import type { FC } from 'react'

interface Medication {
  id: string
  drug: string
  dose: string
  route: string
  frequency: string
  indication: string
}

interface Category {
  name: string
  keywords: string
  color: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-50 dark:bg-red-950/40',
  yellow: 'bg-yellow-50 dark:bg-yellow-950/40',
  green: 'bg-green-50 dark:bg-green-950/40',
  blue: 'bg-blue-50 dark:bg-blue-950/40',
  purple: 'bg-purple-50 dark:bg-purple-950/40',
}

export function getCategoryColor(drugName: string, categories: Category[]): string | null {
  const lower = drugName.toLowerCase()
  for (const cat of categories) {
    const keywords = cat.keywords.split(',').map(k => k.trim().toLowerCase())
    if (keywords.some(kw => lower.includes(kw))) return cat.color
  }
  return null
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

const ROUTES = ['PO', 'IV', 'SQ', 'IM', 'topical', 'other']

const PLACEHOLDER_ROWS: Medication[] = [
  { id: '__p1__', drug: '', dose: '', route: 'IV', frequency: '', indication: '' },
  { id: '__p2__', drug: '', dose: '', route: 'PO', frequency: '', indication: '' },
]

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const isLive = mode === 'live'
  const medications: Medication[] = (data.medications as Medication[]) ?? []
  const categories: Category[] = (config.categories as Category[]) ?? []

  const displayMeds = mode === 'build' && medications.length === 0 ? PLACEHOLDER_ROWS : medications

  const updateMed = useCallback(
    (id: string, field: keyof Medication, value: string) => {
      const next = medications.map(m => m.id === id ? { ...m, [field]: value } : m)
      onDataChange({ ...data, medications: next })
    },
    [data, medications, onDataChange]
  )

  const addMed = useCallback(() => {
    const next = [...medications, { id: generateId(), drug: '', dose: '', route: 'PO', frequency: '', indication: '' }]
    onDataChange({ ...data, medications: next })
  }, [data, medications, onDataChange])

  const removeMed = useCallback(
    (id: string) => {
      onDataChange({ ...data, medications: medications.filter(m => m.id !== id) })
    },
    [data, medications, onDataChange]
  )

  return (
    <div className="p-2 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs text-gray-500 dark:text-gray-400 text-left">
            <th className="pb-1 pr-2 font-medium">Drug</th>
            <th className="pb-1 pr-2 font-medium">Dose</th>
            <th className="pb-1 pr-2 font-medium">Route</th>
            <th className="pb-1 pr-2 font-medium">Frequency</th>
            <th className="pb-1 pr-2 font-medium">Indication</th>
            {isLive && <th className="pb-1 w-6" />}
          </tr>
        </thead>
        <tbody>
          {displayMeds.map(med => {
            const isPlaceholder = med.id.startsWith('__p')
            const color = getCategoryColor(med.drug, categories)
            const rowClass = color ? (COLOR_MAP[color] ?? '') : ''
            return (
              <tr key={med.id} className={`border-t border-gray-200 dark:border-gray-700 ${rowClass}`}>
                {(['drug', 'dose', 'frequency', 'indication'] as const).map((field, fi) =>
                  fi === 1 ? (
                    <>
                      <td key="dose" className="py-0.5 pr-1">
                        <input
                          type="text"
                          value={med.dose}
                          onChange={e => !isPlaceholder && updateMed(med.id, 'dose', e.target.value)}
                          readOnly={!isLive || isPlaceholder}
                          className="w-full bg-transparent outline-none text-sm px-1"
                          placeholder="—"
                        />
                      </td>
                      <td key="route" className="py-0.5 pr-1">
                        <select
                          value={med.route}
                          onChange={e => !isPlaceholder && updateMed(med.id, 'route', e.target.value)}
                          disabled={!isLive || isPlaceholder}
                          className="bg-transparent outline-none text-sm w-full"
                        >
                          {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                    </>
                  ) : (
                    <td key={field} className="py-0.5 pr-1">
                      <input
                        type="text"
                        value={med[field]}
                        onChange={e => !isPlaceholder && updateMed(med.id, field, e.target.value)}
                        readOnly={!isLive || isPlaceholder}
                        className="w-full bg-transparent outline-none text-sm px-1"
                        placeholder="—"
                      />
                    </td>
                  )
                )}
                {isLive && (
                  <td className="py-0.5">
                    {!isPlaceholder && (
                      <button
                        onClick={() => removeMed(med.id)}
                        className="text-red-400 hover:text-red-600 text-xs px-1"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {isLive && (
        <button
          onClick={addMed}
          className="mt-2 text-sm text-blue-500 hover:text-blue-700 font-medium"
        >
          + Add Medication
        </button>
      )}
    </div>
  )
}
