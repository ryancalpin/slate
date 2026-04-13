import { useCallback } from 'react'
import type { FC } from 'react'

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const CODE_STATUS_OPTIONS = ['Full Code', 'DNR', 'DNI', 'DNR-DNI']
const SEX_OPTIONS = ['M', 'F', 'Other']
const ISOLATION_OPTIONS = ['None', 'Contact', 'Droplet', 'Airborne', 'Contact+Droplet']

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const cfg = config as {
    showRoom?: boolean; showPatient?: boolean; showAge?: boolean; showSex?: boolean
    showAdmitDate?: boolean; showAttending?: boolean; showService?: boolean
    showDiagnosis?: boolean; showCodeStatus?: boolean; showIsolation?: boolean
    customLabels?: Array<{ name: string }>
  }

  const handleChange = useCallback(
    (field: string, value: unknown) => {
      onDataChange({ ...data, [field]: value })
    },
    [data, onDataChange]
  )

  const isLive = mode === 'live'

  const textField = (field: string, label: string, type = 'text') =>
    (cfg[`show${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof cfg] !== false) ? (
      <div key={field} className="flex flex-col min-w-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</span>
        <input
          type={type}
          placeholder={label}
          value={(data[field] as string) ?? ''}
          onChange={e => handleChange(field, e.target.value)}
          readOnly={!isLive}
          className="text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none py-0.5 min-w-0"
        />
      </div>
    ) : null

  const selectField = (field: string, label: string, options: string[]) =>
    (cfg[`show${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof cfg] !== false) ? (
      <div key={field} className="flex flex-col min-w-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</span>
        <select
          value={(data[field] as string) ?? ''}
          onChange={e => handleChange(field, e.target.value)}
          disabled={!isLive}
          className="text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none py-0.5"
        >
          <option value="">—</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    ) : null

  const customLabels = (cfg.customLabels ?? []) as Array<{ name: string }>

  return (
    <div className="p-2 flex flex-wrap gap-3 items-end bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
      {textField('room', 'Room')}
      {textField('patient', 'Patient')}
      {textField('age', 'Age', 'number')}
      {selectField('sex', 'Sex', SEX_OPTIONS)}
      {textField('admitDate', 'Admit Date', 'date')}
      {textField('attending', 'Attending')}
      {textField('service', 'Service')}
      {textField('diagnosis', 'Primary Dx')}
      {selectField('codeStatus', 'Code Status', CODE_STATUS_OPTIONS)}
      {cfg.showIsolation !== false && (
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Isolation</span>
          <select
            value={(data.isolation as string) ?? 'None'}
            onChange={e => handleChange('isolation', e.target.value)}
            disabled={!isLive}
            className="text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none py-0.5"
          >
            {ISOLATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}
      {customLabels.map((cl, i) =>
        cl.name ? (
          <div key={i} className="flex flex-col min-w-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{cl.name}</span>
            <input
              type="text"
              placeholder={cl.name}
              value={(data[`custom_${i}`] as string) ?? ''}
              onChange={e => handleChange(`custom_${i}`, e.target.value)}
              readOnly={!isLive}
              className="text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none py-0.5"
            />
          </div>
        ) : null
      )}
    </div>
  )
}
