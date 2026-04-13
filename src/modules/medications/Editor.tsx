import type { FC } from 'react'

interface Category {
  name: string
  keywords: string
  color: string
}

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const PRESET_COLORS = ['red', 'yellow', 'green', 'blue', 'purple']

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const categories: Category[] = (config.categories as Category[]) ?? []

  const updateCategory = (i: number, field: keyof Category, value: string) => {
    const next = [...categories]
    next[i] = { ...next[i], [field]: value }
    onConfigChange({ ...config, categories: next })
  }

  const addCategory = () => {
    if (categories.length >= 5) return
    onConfigChange({ ...config, categories: [...categories, { name: '', keywords: '', color: 'red' }] })
  }

  const removeCategory = (i: number) => {
    onConfigChange({ ...config, categories: categories.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-sm font-semibold">Highlight Categories</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Rows where the drug name contains a keyword get a background color.
      </p>
      <div className="space-y-3">
        {categories.map((cat, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded p-2 space-y-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Category name"
                value={cat.name}
                onChange={e => updateCategory(i, 'name', e.target.value)}
                className="flex-1 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none"
              />
              <select
                value={cat.color}
                onChange={e => updateCategory(i, 'color', e.target.value)}
                className="text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1"
              >
                {PRESET_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => removeCategory(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
            </div>
            <input
              type="text"
              placeholder="Keywords (comma-separated)"
              value={cat.keywords}
              onChange={e => updateCategory(i, 'keywords', e.target.value)}
              className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none"
            />
          </div>
        ))}
      </div>
      {categories.length < 5 && (
        <button
          onClick={addCategory}
          className="text-sm text-blue-500 hover:text-blue-700 font-medium"
        >
          + Add Category
        </button>
      )}
    </div>
  )
}
