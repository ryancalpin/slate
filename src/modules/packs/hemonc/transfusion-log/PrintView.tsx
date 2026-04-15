import type { FC } from 'react'
import type { Transfusion } from './Renderer'

interface TransfusionData {
  transfusions: Transfusion[]
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const TransfusionLogPrintView: FC<Props> = ({ data }) => {
  const d = data as unknown as TransfusionData
  const transfusions = d.transfusions ?? []
  return (
    <div className="text-xs space-y-1">
      <div className="font-bold text-sm">Transfusion Log</div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left pb-1 pr-2">Product</th>
            <th className="text-left pb-1 pr-2">Date/Time</th>
            <th className="text-left pb-1 pr-2">Units</th>
            <th className="text-left pb-1 pr-2">Pre</th>
            <th className="text-left pb-1 pr-2">Post</th>
            <th className="text-left pb-1">Reaction</th>
          </tr>
        </thead>
        <tbody>
          {transfusions.map((t, i) => (
            <tr key={i} className={`border-b last:border-0 ${t.reaction ? 'font-semibold' : ''}`}>
              <td className="py-0.5 pr-2">{t.product}</td>
              <td className="py-0.5 pr-2">{t.date} {t.time}</td>
              <td className="py-0.5 pr-2">{t.units}</td>
              <td className="py-0.5 pr-2">{t.preValue}</td>
              <td className="py-0.5 pr-2">{t.postValue}</td>
              <td className="py-0.5">{t.reaction ? (t.reactionType || 'Yes') : 'None'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
