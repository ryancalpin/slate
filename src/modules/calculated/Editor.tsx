// src/modules/calculated/Editor.tsx
import { useState, useCallback } from 'react'

interface CustomFormula {
  id: string
  name: string
  formula: string
  citation: string
}

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const BUILTIN_CALCULATORS = [
  { id: 'anion-gap', name: 'Anion Gap' },
  { id: 'map', name: 'MAP' },
  { id: 'bmi', name: 'BMI' },
  { id: 'aa-gradient', name: 'A-a Gradient' },
  { id: 'ckd-epi', name: 'CKD-EPI GFR 2021' },
  { id: 'corrected-calcium', name: 'Corrected Calcium' },
]

function generateId() {
  return `cf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function Editor({ config, onConfigChange }: Props) {
  const enabledCalculators = (config.enabledCalculators as string[]) ?? ['anion-gap', 'map', 'bmi']
  const customFormulas = (config.customFormulas as CustomFormula[]) ?? []

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFormula, setNewFormula] = useState('')
  const [newCitation, setNewCitation] = useState('')
  const [citationError, setCitationError] = useState(false)

  const toggleCalculator = useCallback(
    (id: string, on: boolean) => {
      const next = on
        ? [...enabledCalculators, id]
        : enabledCalculators.filter((c) => c !== id)
      onConfigChange({ ...config, enabledCalculators: next })
    },
    [config, enabledCalculators, onConfigChange]
  )

  const saveFormula = useCallback(() => {
    if (!newCitation.trim()) {
      setCitationError(true)
      return
    }
    const formula: CustomFormula = {
      id: generateId(),
      name: newName.trim(),
      formula: newFormula.trim(),
      citation: newCitation.trim(),
    }
    onConfigChange({ ...config, customFormulas: [...customFormulas, formula] })
    setNewName('')
    setNewFormula('')
    setNewCitation('')
    setCitationError(false)
    setAdding(false)
  }, [config, customFormulas, newName, newFormula, newCitation, onConfigChange])

  const deleteFormula = useCallback(
    (id: string) => {
      onConfigChange({
        ...config,
        customFormulas: customFormulas.filter((f) => f.id !== id),
      })
    },
    [config, customFormulas, onConfigChange]
  )

  return (
    <div className="space-y-4 p-3 text-sm">
      <div>
        <p className="font-medium mb-1">Built-in Calculators</p>
        <ul className="space-y-1">
          {BUILTIN_CALCULATORS.map((calc) => (
            <li key={calc.id}>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={enabledCalculators.includes(calc.id)}
                  onChange={(e) => toggleCalculator(calc.id, e.target.checked)}
                />
                {calc.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="font-medium mb-1">Custom Formulas</p>
        <ul className="space-y-1 mb-2">
          {customFormulas.map((f) => (
            <li key={f.id} className="flex items-center gap-2 text-xs border rounded px-2 py-1">
              <span className="flex-1">{f.name}</span>
              <button
                onClick={() => deleteFormula(f.id)}
                className="text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        {adding ? (
          <div className="border rounded p-2 space-y-2 text-xs bg-gray-50 dark:bg-gray-900">
            <div>
              <label className="block font-medium mb-0.5">Name</label>
              <input
                className="border rounded px-2 py-1 w-full dark:bg-gray-800"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Net Balance"
                autoFocus
              />
            </div>
            <div>
              <label className="block font-medium mb-0.5">Formula</label>
              <input
                className="border rounded px-2 py-1 w-full dark:bg-gray-800 font-mono"
                value={newFormula}
                onChange={(e) => setNewFormula(e.target.value)}
                placeholder="e.g. Na - Cl - CO2"
              />
              <p className="text-gray-400 mt-0.5">Variables: Na, Cl, CO2, SBP, DBP, Cr, Albumin, Ca</p>
            </div>
            <div>
              <label className="block font-medium mb-0.5">
                Citation{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                className={`border rounded px-2 py-1 w-full dark:bg-gray-800 resize-none ${
                  citationError ? 'border-red-500' : ''
                }`}
                rows={2}
                value={newCitation}
                onChange={(e) => {
                  setNewCitation(e.target.value)
                  setCitationError(false)
                }}
                placeholder="Journal article, guideline name, or institutional protocol"
              />
              {citationError ? (
                <p className="text-red-500 text-[10px]">Citation is required.</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveFormula}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => { setAdding(false); setCitationError(false) }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            + Add Formula
          </button>
        )}
      </div>
    </div>
  )
}
