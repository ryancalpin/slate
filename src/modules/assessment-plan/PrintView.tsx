import type { FC } from 'react'

interface Problem {
  id: string
  name: string
  assessment: string
  plan: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const problems: Problem[] = (data.problems as Problem[]) ?? []

  return (
    <div className="p-2 space-y-4 text-sm">
      {problems.map((p, idx) => (
        <div key={p.id} className="space-y-1">
          <h4 className="font-bold">#{idx + 1} {p.name}</h4>
          {p.assessment && (
            <div>
              <span className="font-medium">Assessment: </span>
              {p.assessment}
            </div>
          )}
          {p.plan && (
            <div>
              <span className="font-medium">Plan:</span>
              <ul className="list-disc list-inside ml-2">
                {p.plan.split('\n').filter(Boolean).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
