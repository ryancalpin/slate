// src/modules/consults/PrintView.tsx
interface Consult {
  id: string
  service: string
  question: string
  status: 'Pending' | 'Responded' | 'Completed'
  response: string
}

interface Result {
  id: string
  description: string
  status: 'Pending' | 'Resulted' | 'Critical'
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function PrintView({ config, data }: Props) {
  const consultLabel = (config.consultLabel as string) ?? 'Active Consults'
  const resultsLabel = (config.resultsLabel as string) ?? 'Pending Results'
  const consults = (data.consults as Consult[]) ?? []
  const results = (data.results as Result[]) ?? []

  return (
    <div className="text-sm space-y-3">
      <div>
        <h3 className="font-bold mb-1">{consultLabel}</h3>
        {consults.length === 0 ? (
          <p className="text-gray-400 italic text-xs">None.</p>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-0.5 pr-2">Service</th>
                <th className="text-left py-0.5 pr-2">Question</th>
                <th className="text-left py-0.5 pr-2">Status</th>
                <th className="text-left py-0.5">Response</th>
              </tr>
            </thead>
            <tbody>
              {consults.map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="py-0.5 pr-2">{c.service}</td>
                  <td className="py-0.5 pr-2">{c.question}</td>
                  <td className={`py-0.5 pr-2 ${c.status === 'Pending' ? 'text-amber-600' : ''}`}>
                    {c.status}
                  </td>
                  <td className="py-0.5">{c.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div>
        <h3 className="font-bold mb-1">{resultsLabel}</h3>
        {results.length === 0 ? (
          <p className="text-gray-400 italic text-xs">None.</p>
        ) : (
          <ul className="space-y-0.5 text-xs">
            {results.map((r) => (
              <li key={r.id} className="flex gap-2">
                <span className="flex-1">{r.description}</span>
                <span
                  className={
                    r.status === 'Critical'
                      ? 'text-red-600 font-semibold'
                      : r.status === 'Pending'
                      ? 'text-amber-600'
                      : 'text-green-600'
                  }
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
