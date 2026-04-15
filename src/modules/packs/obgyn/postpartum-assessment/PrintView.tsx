import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Record<string, string | number>
  return (
    <div className="text-sm space-y-1">
      <h3 className="font-bold">Postpartum Assessment</h3>
      <p>Fundal Height: {d.fundalHeight != null ? `${d.fundalHeight} cm below umbilicus` : '—'} | Firmness: {d.fundalFirmness ?? '—'}</p>
      <p>Lochia: {d.lochiaCharacter ?? '—'} / {d.lochiaVolume ?? '—'}</p>
      <p>Perineum/Incision: {d.perineumStatus ?? '—'}</p>
      <p>Breastfeeding: {d.breastfeeding ?? '—'}</p>
      <p>Mood/Affect: {d.moodNote ?? '—'}</p>
    </div>
  )
}
