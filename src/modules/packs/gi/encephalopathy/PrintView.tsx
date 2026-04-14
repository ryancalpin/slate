import React from 'react'

const CITATION = 'Conn HO et al. Dig Dis Sci. 1977;22(2):103-108'

const GRADE_LABELS = ['Grade 0 — Normal', 'Grade I', 'Grade II', 'Grade III', 'Grade IV — Coma']

interface LactuloseDose {
  datetime: string
  bm: boolean
  dose: string
}

interface EncephalopathyData {
  westHavenGrade: number
  laxuloseLog: LactuloseDose[]
  rifaximin: boolean
  rifaximinDose: string
  stoolsPerDay: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const EncephalopathyPrintView: React.FC<Props> = ({ data }) => {
  const d = data as unknown as EncephalopathyData
  const log = d.laxuloseLog ?? []

  return (
    <div className="print-module">
      <h3 className="font-semibold text-sm mb-2">Hepatic Encephalopathy</h3>
      <p className="text-xs font-medium mb-1">
        West Haven: {GRADE_LABELS[d.westHavenGrade ?? 0]}
      </p>
      <p className="text-xs">Stools/day: {d.stoolsPerDay ?? 0}</p>
      <p className="text-xs">Rifaximin: {d.rifaximin ? `Yes — ${d.rifaximinDose || 'dose not recorded'}` : 'No'}</p>
      {log.length > 0 ? (
        <div className="mt-1">
          <p className="text-xs font-medium">Lactulose Log:</p>
          {log.map((entry, i) => (
            <p key={i} className="text-xs ml-2">
              {entry.datetime} — {entry.dose} {entry.bm ? '(BM)' : ''}
            </p>
          ))}
        </div>
      ) : null}
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
