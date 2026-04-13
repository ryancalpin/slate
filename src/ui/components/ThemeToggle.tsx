import { useTheme, type Theme } from '../../hooks/useTheme'

const options: { value: Theme; label: string }[] = [
  { value: 'dark', label: '🌙 Dark' },
  { value: 'light', label: '☀️ Light' },
  { value: 'system', label: '💻 System' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <select
      value={theme}
      onChange={e => setTheme(e.target.value as Theme)}
      className="bg-transparent text-xs text-gray-400 border border-gray-700 rounded px-2 py-1 cursor-pointer"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
