import type { FC } from 'react'
import { calcGA } from './index'

const CITATION = 'ACOG Practice Bulletin No. 230. Obstet Gynecol. 2021;137(6):e172-e197'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Record<string, unknown>
  const today = new Date().toISOString().split('T')[0]
  const ga = d.lmpDate ? calcGA(d.lmpDate as string, today) : null

  return (
    <div className="text-sm space-y-1">
      <h3 className="font-bold">Antepartum Tracker</h3>
      <p>GA: {ga ? `${ga.weeks}w ${ga.days}d` : '—'}</p>
      <p>FHR: {d.fhr != null ? `${d.fhr} BPM` : '—'}</p>
      <p>Presentation: {(d.presentation as string) ?? '—'}</p>
      <p>Contractions: {d.contractionFreq != null ? `${d.contractionFreq}/min, ${d.contractionDuration}s, ${d.contractionRegularity}` : '—'}</p>
      <p>GBS: {(d.gbsStatus as string) ?? '—'} | Prophylaxis: {d.gbsProphylaxis ? 'Yes' : 'No'}</p>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
