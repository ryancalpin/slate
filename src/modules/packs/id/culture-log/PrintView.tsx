import React from 'react'

interface Culture {
  date: string
  source: string
  organism: string
  gramStain: string
  sensitivities: string
  implications: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function CulturePrintView({ data }: Props) {
  const cultures: Culture[] = (data as { cultures: Culture[] }).cultures ?? []
  return (
    <div className="p-2 text-xs">
      <h3 className="font-bold mb-1">Culture Log</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-left py-1 pr-2">Date</th>
            <th className="text-left py-1 pr-2">Source</th>
            <th className="text-left py-1 pr-2">Organism</th>
            <th className="text-left py-1 pr-2">Gram Stain</th>
            <th className="text-left py-1 pr-2">Sensitivities</th>
            <th className="text-left py-1">Implications</th>
          </tr>
        </thead>
        <tbody>
          {cultures.map((c, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-0.5 pr-2">{c.date}</td>
              <td className="py-0.5 pr-2">{c.source}</td>
              <td className="py-0.5 pr-2">{c.organism}</td>
              <td className="py-0.5 pr-2">{c.gramStain}</td>
              <td className="py-0.5 pr-2">{c.sensitivities}</td>
              <td className="py-0.5">{c.implications}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
