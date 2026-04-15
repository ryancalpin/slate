import type { FC } from 'react'

const DISCLAIMER = 'Always verify doses against institutional pharmacy guidelines and current references.'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as { drugName?: string; weightKg?: number; doseMgKg?: number; frequency?: string; concentrationMgMl?: number }
  const totalDose = d.weightKg != null && d.doseMgKg != null ? d.weightKg * d.doseMgKg : null
  const volume = totalDose != null && d.concentrationMgMl ? totalDose / d.concentrationMgMl : null

  return (
    <div className="text-sm space-y-1">
      <h3 className="font-bold">Weight-Based Dosing</h3>
      <p>Drug: {d.drugName ?? '—'}</p>
      <p>Weight: {d.weightKg ?? '—'} kg | Dose: {d.doseMgKg ?? '—'} mg/kg | Frequency: {d.frequency ?? '—'}</p>
      <p>Concentration: {d.concentrationMgMl ?? '—'} mg/mL</p>
      <p className="font-semibold">Total Dose: {totalDose != null ? `${totalDose} mg` : '—'} | Volume: {volume != null ? `${volume.toFixed(2)} mL` : '—'}</p>
      <p className="text-xs italic text-gray-500 mt-1">{DISCLAIMER}</p>
    </div>
  )
}
