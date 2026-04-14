import React from 'react'

interface Culture {
  date: string
  source: string
  organism: string
  gramStain: string
  sensitivities: string
  implications: string
}

interface CultureData {
  cultures: Culture[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const SOURCES = ['blood', 'urine', 'BAL', 'wound', 'sputum', 'other']

const emptyCulture = (): Culture => ({
  date: new Date().toISOString().split('T')[0],
  source: 'blood',
  organism: '',
  gramStain: '',
  sensitivities: '',
  implications: '',
})

export function CultureRenderer({ data, onDataChange, mode }: Props) {
  const cultures: Culture[] = (data as CultureData).cultures ?? []

  function update(index: number, field: keyof Culture, value: string) {
    const updated = cultures.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    onDataChange({ cultures: updated })
  }

  function addRow() {
    onDataChange({ cultures: [...cultures, emptyCulture()] })
  }

  function removeRow(index: number) {
    onDataChange({ cultures: cultures.filter((_, i) => i !== index) })
  }

  return (
    <div className="overflow-x-auto p-2">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-left">
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Date</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Source</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Organism</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Gram Stain</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Sensitivities</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Treatment Implications</th>
            {mode === 'live' && (
              <th className="px-2 py-1 border border-gray-300 dark:border-gray-600"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {cultures.map((c, i) => (
            <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-900">
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <input
                  type="date"
                  className="bg-transparent outline-none"
                  value={c.date}
                  onChange={e => update(i, 'date', e.target.value)}
                />
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <select
                  className="bg-transparent outline-none"
                  value={c.source}
                  onChange={e => update(i, 'source', e.target.value)}
                >
                  {SOURCES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <input
                  className="w-full bg-transparent outline-none"
                  value={c.organism}
                  onChange={e => update(i, 'organism', e.target.value)}
                  placeholder="Organism"
                />
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <input
                  className="w-full bg-transparent outline-none"
                  value={c.gramStain}
                  onChange={e => update(i, 'gramStain', e.target.value)}
                  placeholder="Gram stain result"
                />
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <input
                  className="w-full bg-transparent outline-none"
                  value={c.sensitivities}
                  onChange={e => update(i, 'sensitivities', e.target.value)}
                  placeholder="Amp S, Pip-Tazo R..."
                />
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <input
                  className="w-full bg-transparent outline-none"
                  value={c.implications}
                  onChange={e => update(i, 'implications', e.target.value)}
                  placeholder="Treatment implications"
                />
              </td>
              {mode === 'live' && (
                <td className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-center">
                  <button
                    className="text-red-500 hover:text-red-700 text-xs"
                    onClick={() => removeRow(i)}
                    aria-label="Remove culture"
                  >
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {mode === 'live' && (
        <button
          className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={addRow}
        >
          + Add Culture
        </button>
      )}
    </div>
  )
}
