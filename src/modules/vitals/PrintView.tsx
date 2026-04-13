import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ config, data }) => {
  const cfg = config as Record<string, unknown>
  const tempUnit = (cfg.tempUnit as string) ?? 'F'
  const weightUnit = (cfg.weightUnit as string) ?? 'kg'

  const rows: Array<{ label: string; value: unknown; unit: string; show: boolean }> = [
    { label: 'HR', value: data.hr, unit: 'bpm', show: cfg.showHr !== false },
    { label: 'BP', value: data.sbp !== undefined ? `${data.sbp}/${data.dbp}` : undefined, unit: 'mmHg', show: cfg.showBp !== false },
    { label: 'RR', value: data.rr, unit: 'br/min', show: cfg.showRr !== false },
    { label: 'Temp', value: data.temp, unit: `°${tempUnit}`, show: cfg.showTemp !== false },
    { label: 'SpO2', value: data.spo2, unit: '%', show: cfg.showSpo2 !== false },
    { label: 'Weight', value: data.weight, unit: weightUnit, show: cfg.showWeight !== false },
  ]

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-1 p-2 text-sm">
      {rows.filter(r => r.show).map(r => (
        <div key={r.label} className="flex justify-between">
          <span className="font-medium">{r.label}</span>
          <span>{r.value !== undefined ? `${r.value} ${r.unit}` : '—'}</span>
        </div>
      ))}
    </div>
  )
}
