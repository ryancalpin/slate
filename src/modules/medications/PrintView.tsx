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
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const PRINT_COLOR_MAP: Record<string, string> = {
  red: 'bg-red-100',
  yellow: 'bg-yellow-100',
  green: 'bg-green-100',
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
}

function getColor(drug: string, cats: Category[]): string | null {
  const lower = drug.toLowerCase()
  for (const cat of cats) {
    const kws = cat.keywords.split(',').map(k => k.trim().toLowerCase())
    if (kws.some(kw => lower.includes(kw))) return cat.color
  }
  return null
}

export const PrintView: FC<Props> = ({ config, data }) => {
  const medications: Medication[] = (data.medications as Medication[]) ?? []
  const categories: Category[] = (config.categories as Category[]) ?? []

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-xs font-semibold">
          <th className="p-1 border border-gray-300">Drug</th>
          <th className="p-1 border border-gray-300">Dose</th>
          <th className="p-1 border border-gray-300">Route</th>
          <th className="p-1 border border-gray-300">Frequency</th>
          <th className="p-1 border border-gray-300">Indication</th>
        </tr>
      </thead>
      <tbody>
        {medications.map(med => {
          const color = getColor(med.drug, categories)
          const rowClass = color ? (PRINT_COLOR_MAP[color] ?? '') : ''
          return (
            <tr key={med.id} className={rowClass}>
              <td className="p-1 border border-gray-300">{med.drug}</td>
              <td className="p-1 border border-gray-300">{med.dose}</td>
              <td className="p-1 border border-gray-300">{med.route}</td>
              <td className="p-1 border border-gray-300">{med.frequency}</td>
              <td className="p-1 border border-gray-300">{med.indication}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
