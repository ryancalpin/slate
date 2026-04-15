const CITATION =
  'NCCN Clinical Practice Guidelines in Oncology: Hematopoietic Growth Factors. Version 2.2023.'

interface AncEntry {
  date: string
  anc: number
}

interface AncData {
  entries: AncEntry[]
  antifungals: string[]
  antivirals: string[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function classifyANC(anc: number): string {
  if (anc < 500) return 'Severe neutropenia'
  if (anc < 1000) return 'Moderate neutropenia'
  if (anc < 1500) return 'Mild neutropenia'
  return 'Normal'
}

function classColor(classification: string): string {
  switch (classification) {
    case 'Severe neutropenia': return 'text-red-600 font-bold'
    case 'Moderate neutropenia': return 'text-orange-600 font-semibold'
    case 'Mild neutropenia': return 'text-yellow-600'
    default: return 'text-green-700'
  }
}

const emptyEntry = (): AncEntry => ({
  date: new Date().toISOString().split('T')[0],
  anc: 0,
})

export function AncRenderer({ data, onDataChange, mode }: Props) {
  const typed = data as unknown as AncData
  const entries: AncEntry[] = typed.entries ?? []
  const antifungals: string[] = typed.antifungals ?? []
  const antivirals: string[] = typed.antivirals ?? []

  function updateEntry(index: number, field: keyof AncEntry, value: unknown) {
    const updated = entries.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    onDataChange({ entries: updated, antifungals, antivirals })
  }

  function addEntry() {
    onDataChange({ entries: [...entries, emptyEntry()], antifungals, antivirals })
  }

  function removeEntry(index: number) {
    onDataChange({ entries: entries.filter((_, i) => i !== index), antifungals, antivirals })
  }

  function updateList(list: string[], index: number, value: string, listKey: 'antifungals' | 'antivirals') {
    const updated = list.map((item, i) => (i === index ? value : item))
    onDataChange({ entries, antifungals, antivirals, [listKey]: updated })
  }

  function addListItem(listKey: 'antifungals' | 'antivirals') {
    const currentList = listKey === 'antifungals' ? antifungals : antivirals
    onDataChange({ entries, antifungals, antivirals, [listKey]: [...currentList, ''] })
  }

  function removeListItem(listKey: 'antifungals' | 'antivirals', index: number) {
    const currentList = listKey === 'antifungals' ? antifungals : antivirals
    onDataChange({
      entries,
      antifungals,
      antivirals,
      [listKey]: currentList.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="p-2 text-sm space-y-3">
      {/* ANC Log */}
      <div>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left">
              <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Date</th>
              <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">ANC</th>
              <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Classification</th>
              {mode === 'live' && (
                <th className="px-2 py-1 border border-gray-300 dark:border-gray-600"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const classification = classifyANC(e.anc)
              return (
                <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-900">
                  <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                    <input
                      type="date"
                      className="bg-transparent outline-none"
                      value={e.date}
                      onChange={ev => updateEntry(i, 'date', ev.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                    <input
                      type="number"
                      min={0}
                      className="w-20 bg-transparent outline-none"
                      value={e.anc}
                      onChange={ev => updateEntry(i, 'anc', Number(ev.target.value))}
                    />
                    <span className="text-xs text-gray-400 ml-1">/µL</span>
                  </td>
                  <td className={`px-2 py-1 border border-gray-300 dark:border-gray-600 ${classColor(classification)}`}>
                    {classification}
                  </td>
                  {mode === 'live' && (
                    <td className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-center">
                      <button
                        className="text-red-500 hover:text-red-700 text-xs"
                        onClick={() => removeEntry(i)}
                        aria-label="Remove ANC entry"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        {mode === 'live' && (
          <button
            className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={addEntry}
          >
            + Add ANC Entry
          </button>
        )}
      </div>

      {/* Antifungals */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Antifungals</p>
        {antifungals.map((af, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <input
              className="border border-gray-300 rounded px-1 text-sm flex-1"
              value={af}
              onChange={e => updateList(antifungals, i, e.target.value, 'antifungals')}
              placeholder="Antifungal agent"
            />
            {mode === 'live' && (
              <button
                className="text-red-500 hover:text-red-700 text-xs"
                onClick={() => removeListItem('antifungals', i)}
                aria-label="Remove antifungal"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {mode === 'live' && (
          <button
            className="mt-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
            onClick={() => addListItem('antifungals')}
          >
            + Add antifungal
          </button>
        )}
      </div>

      {/* Antivirals */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Antivirals</p>
        {antivirals.map((av, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <input
              className="border border-gray-300 rounded px-1 text-sm flex-1"
              value={av}
              onChange={e => updateList(antivirals, i, e.target.value, 'antivirals')}
              placeholder="Antiviral agent"
            />
            {mode === 'live' && (
              <button
                className="text-red-500 hover:text-red-700 text-xs"
                onClick={() => removeListItem('antivirals', i)}
                aria-label="Remove antiviral"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {mode === 'live' && (
          <button
            className="mt-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
            onClick={() => addListItem('antivirals')}
          >
            + Add antiviral
          </button>
        )}
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
