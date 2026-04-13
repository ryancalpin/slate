import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ config, data }) => {
  const cfg = config as Record<string, unknown>
  const customLabels = (cfg.customLabels as Array<{ name: string }>) ?? []

  const fields: Array<{ label: string; value: unknown; show: boolean }> = [
    { label: 'Room', value: data.room, show: cfg.showRoom !== false },
    { label: 'Patient', value: data.patient, show: cfg.showPatient !== false },
    { label: 'Age', value: data.age, show: cfg.showAge !== false },
    { label: 'Sex', value: data.sex, show: cfg.showSex !== false },
    { label: 'Admit Date', value: data.admitDate, show: cfg.showAdmitDate !== false },
    { label: 'Attending', value: data.attending, show: cfg.showAttending !== false },
    { label: 'Service', value: data.service, show: cfg.showService !== false },
    { label: 'Primary Dx', value: data.diagnosis, show: cfg.showDiagnosis !== false },
    { label: 'Code Status', value: data.codeStatus, show: cfg.showCodeStatus !== false },
    { label: 'Isolation', value: data.isolation, show: cfg.showIsolation !== false },
    ...customLabels.map((cl, i) => ({ label: cl.name, value: data[`custom_${i}`], show: !!cl.name })),
  ]

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 p-2 border-b-2 border-gray-800 text-sm">
      {fields.filter(f => f.show && f.value).map(f => (
        <span key={f.label}>
          <strong>{f.label}:</strong> {String(f.value)}
        </span>
      ))}
    </div>
  )
}
