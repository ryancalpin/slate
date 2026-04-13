// src/modules/custom-fields/PrintView.tsx
interface FieldDef {
  id: string
  label: string
  type: 'text' | 'number' | 'checkbox' | 'dropdown' | 'date'
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function PrintView({ config, data }: Props) {
  const fields = (config.fields as FieldDef[]) ?? []
  const values = (data.values as Record<string, string | number | boolean>) ?? {}

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">Custom Fields</h3>
      {fields.length === 0 ? (
        <p className="text-gray-400 italic text-xs">No fields configured.</p>
      ) : (
        <ul className="space-y-0.5 text-xs">
          {fields.map((f) => {
            const val = values[f.id]
            const display =
              f.type === 'checkbox'
                ? val ? 'Yes' : 'No'
                : val !== undefined && val !== ''
                ? String(val)
                : '—'
            return (
              <li key={f.id}>
                <span className="font-medium">{f.label}:</span> {display}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
