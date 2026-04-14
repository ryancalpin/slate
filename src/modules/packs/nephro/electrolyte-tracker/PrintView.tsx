import { FC } from 'react'

interface Entry {
  date: string
  na: number; k: number; cl: number; hco3: number
  bun: number; cr: number; ca: number; mg: number; phos: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const COLS = ['na','k','cl','hco3','bun','cr','ca','mg','phos'] as const
const LABELS = { na:'Na', k:'K', cl:'Cl', hco3:'HCO3', bun:'BUN', cr:'Cr', ca:'Ca', mg:'Mg', phos:'Phos' }

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as unknown as { entries: Entry[] }
  return (
    <div className="text-xs">
      <p className="font-bold mb-1">Electrolyte Tracker</p>
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th className="text-left pr-2 border-b border-gray-400 pb-0.5">Date</th>
            {COLS.map(k => <th key={k} className="px-2 border-b border-gray-400 pb-0.5 text-center">{LABELS[k]}</th>)}
          </tr>
        </thead>
        <tbody>
          {d.entries.map((e, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="pr-2 py-0.5">{e.date}</td>
              {COLS.map(k => <td key={k} className="px-2 py-0.5 text-center">{e[k] || '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
