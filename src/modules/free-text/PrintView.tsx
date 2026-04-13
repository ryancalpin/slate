// src/modules/free-text/PrintView.tsx
interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function PrintView({ config, data }: Props) {
  const label = (config.label as string) ?? 'Notes'
  const text = (data.text as string) ?? ''

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">{label}</h3>
      <div className="whitespace-pre-wrap">{text || <span className="text-gray-400 italic">No content.</span>}</div>
    </div>
  )
}
