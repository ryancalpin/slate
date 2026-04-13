# Patient Template Builder — Plan 2b: Core Modules (Part 2 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the final 7 of 14 first-party core modules and complete module registration, making all modules available in the app.

**Architecture:** Each module is a self-contained directory exporting a ModulePlugin object. All 14 modules (7 from Plan 2a + 7 from Plan 2b) are registered together in src/modules/index.ts imported at app startup.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## Task 8: lines-tubes Module

**Files:**
- `src/modules/lines-tubes/index.ts`
- `src/modules/lines-tubes/Renderer.tsx`
- `src/modules/lines-tubes/Editor.tsx`
- `src/modules/lines-tubes/PrintView.tsx`
- `src/modules/lines-tubes/lines-tubes.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/modules/lines-tubes/lines-tubes.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import linesTubesPlugin from './index'

const noop = () => {}

describe('lines-tubes Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="test"
        config={linesTubesPlugin.defaultConfig}
        data={{ lines: [] }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('+ Add Line')).toBeDefined()
  })

  it('renders a line row with correct data', () => {
    const insertionDate = '2026-04-08'
    render(
      <Renderer
        instanceId="test"
        config={linesTubesPlugin.defaultConfig}
        data={{
          lines: [
            { id: '1', type: 'PIV', site: 'Right AC', insertionDate },
          ],
        }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Right AC')).toBeDefined()
  })

  it('shows build mode placeholder in build mode', () => {
    render(
      <Renderer
        instanceId="test"
        config={linesTubesPlugin.defaultConfig}
        data={{ lines: [] }}
        onDataChange={noop}
        mode="build"
      />
    )
    expect(screen.getByText('Lines / Tubes / Drains')).toBeDefined()
  })
})

describe('lines-tubes PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={linesTubesPlugin.defaultConfig}
        data={{ lines: [{ id: '1', type: 'CVC (PICC)', site: 'Left SC', insertionDate: '2026-04-01' }] }}
      />
    )
    expect(screen.getByText('CVC (PICC)')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests (expect failure)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/lines-tubes/
```

- [ ] **Step 3: Implement Renderer**

```tsx
// src/modules/lines-tubes/Renderer.tsx
import { useState, useCallback } from 'react'

interface Line {
  id: string
  type: string
  site: string
  insertionDate: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function daysIn(insertionDate: string): number {
  if (!insertionDate) return 0
  const diff = Date.now() - new Date(insertionDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const lineTypes = (config.lineTypes as string[]) ?? []
  const alertDays = (config.alertDays as number) ?? 5
  const lines = (data.lines as Line[]) ?? []

  const [nextId, setNextId] = useState(lines.length + 1)

  const updateLine = useCallback(
    (id: string, field: keyof Line, value: string) => {
      onDataChange({
        ...data,
        lines: lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
      })
    },
    [data, lines, onDataChange]
  )

  const addLine = useCallback(() => {
    const id = String(nextId)
    setNextId((n) => n + 1)
    onDataChange({
      ...data,
      lines: [
        ...lines,
        { id, type: lineTypes[0] ?? '', site: '', insertionDate: '' },
      ],
    })
  }, [data, lines, lineTypes, nextId, onDataChange])

  const deleteLine = useCallback(
    (id: string) => {
      onDataChange({ ...data, lines: lines.filter((l) => l.id !== id) })
    },
    [data, lines, onDataChange]
  )

  if (mode === 'build') {
    return (
      <div className="p-3 text-sm text-gray-500 italic">
        Lines / Tubes / Drains
        <p className="text-xs mt-1">Table with Type, Site, Insertion Date, Days In columns.</p>
      </div>
    )
  }

  return (
    <div className="p-2 overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-left">
            <th className="p-1 border border-gray-200 dark:border-gray-700">Type</th>
            <th className="p-1 border border-gray-200 dark:border-gray-700">Site</th>
            <th className="p-1 border border-gray-200 dark:border-gray-700">Insertion Date</th>
            <th className="p-1 border border-gray-200 dark:border-gray-700">Days In</th>
            <th className="p-1 border border-gray-200 dark:border-gray-700 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const days = daysIn(line.insertionDate)
            const amber = line.insertionDate && days > alertDays
            return (
              <tr
                key={line.id}
                className={amber ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
              >
                <td className="p-1 border border-gray-200 dark:border-gray-700">
                  <select
                    className="w-full bg-transparent text-sm"
                    value={line.type}
                    onChange={(e) => updateLine(line.id, 'type', e.target.value)}
                  >
                    {lineTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="p-1 border border-gray-200 dark:border-gray-700">
                  <input
                    className="w-full bg-transparent text-sm"
                    value={line.site}
                    onChange={(e) => updateLine(line.id, 'site', e.target.value)}
                    placeholder="Site"
                  />
                </td>
                <td className="p-1 border border-gray-200 dark:border-gray-700">
                  <input
                    type="date"
                    className="w-full bg-transparent text-sm"
                    value={line.insertionDate}
                    onChange={(e) => updateLine(line.id, 'insertionDate', e.target.value)}
                  />
                </td>
                <td className="p-1 border border-gray-200 dark:border-gray-700 text-center font-mono">
                  {line.insertionDate ? days : '—'}
                </td>
                <td className="p-1 border border-gray-200 dark:border-gray-700 text-center">
                  <button
                    onClick={() => deleteLine(line.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                    aria-label="Delete line"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button
        onClick={addLine}
        className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
      >
        + Add Line
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Implement Editor**

```tsx
// src/modules/lines-tubes/Editor.tsx
import { useCallback } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function Editor({ config, onConfigChange }: Props) {
  const lineTypes = (config.lineTypes as string[]) ?? []
  const alertDays = (config.alertDays as number) ?? 5

  const addType = useCallback(() => {
    const type = prompt('New line type:')
    if (type && type.trim()) {
      onConfigChange({ ...config, lineTypes: [...lineTypes, type.trim()] })
    }
  }, [config, lineTypes, onConfigChange])

  const removeType = useCallback(
    (type: string) => {
      onConfigChange({ ...config, lineTypes: lineTypes.filter((t) => t !== type) })
    },
    [config, lineTypes, onConfigChange]
  )

  return (
    <div className="space-y-4 p-3 text-sm">
      <div>
        <label className="block font-medium mb-1">Alert threshold (days)</label>
        <input
          type="number"
          min={1}
          max={30}
          className="border rounded px-2 py-1 w-24 dark:bg-gray-800"
          value={alertDays}
          onChange={(e) =>
            onConfigChange({ ...config, alertDays: Number(e.target.value) })
          }
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Available line types</label>
        <ul className="space-y-1 mb-2">
          {lineTypes.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span className="flex-1">{t}</span>
              <button
                onClick={() => removeType(t)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={addType}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          + Add type
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement PrintView**

```tsx
// src/modules/lines-tubes/PrintView.tsx
interface Line {
  id: string
  type: string
  site: string
  insertionDate: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

function daysIn(insertionDate: string): number {
  if (!insertionDate) return 0
  return Math.floor((Date.now() - new Date(insertionDate).getTime()) / (1000 * 60 * 60 * 24))
}

export function PrintView({ config, data }: Props) {
  const alertDays = (config.alertDays as number) ?? 5
  const lines = (data.lines as Line[]) ?? []

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">Lines / Tubes / Drains</h3>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-0.5 pr-2">Type</th>
            <th className="text-left py-0.5 pr-2">Site</th>
            <th className="text-left py-0.5 pr-2">Inserted</th>
            <th className="text-left py-0.5">Days In</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const days = daysIn(line.insertionDate)
            const warn = line.insertionDate && days > alertDays
            return (
              <tr key={line.id} className="border-b border-gray-100">
                <td className="py-0.5 pr-2">{line.type}</td>
                <td className="py-0.5 pr-2">{line.site}</td>
                <td className="py-0.5 pr-2">{line.insertionDate}</td>
                <td className="py-0.5">
                  {line.insertionDate ? days : '—'}
                  {warn ? ' ⚠️' : ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {lines.length === 0 ? <p className="text-gray-400 italic">No lines recorded.</p> : null}
    </div>
  )
}
```

- [ ] **Step 6: Implement plugin index**

```ts
// src/modules/lines-tubes/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const linesTubesPlugin: ModulePlugin = {
  meta: {
    id: 'lines-tubes',
    name: 'Lines / Tubes / Drains',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track IV lines, tubes, and drains with insertion dates and duration alerts.',
    tags: ['lines', 'nursing', 'procedures'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    lineTypes: [
      'PIV',
      'CVC (triple lumen)',
      'CVC (PICC)',
      'Arterial Line',
      'Foley Catheter',
      'NGT/OGT',
      'Chest Tube',
      'Surgical Drain',
      'Endotracheal Tube',
      'Other',
    ],
    alertDays: 5,
  },
  minSize: { w: 5, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default linesTubesPlugin
```

- [ ] **Step 7: Run tests (expect passing)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/lines-tubes/
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates
git add src/modules/lines-tubes/
git commit -m "feat: add lines-tubes module"
```

---

## Task 9: task-checklist Module

**Files:**
- `src/modules/task-checklist/index.ts`
- `src/modules/task-checklist/Renderer.tsx`
- `src/modules/task-checklist/Editor.tsx`
- `src/modules/task-checklist/PrintView.tsx`
- `src/modules/task-checklist/task-checklist.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/modules/task-checklist/task-checklist.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import taskChecklistPlugin from './index'

const noop = () => {}

describe('task-checklist Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="test"
        config={taskChecklistPlugin.defaultConfig}
        data={{ tasks: [] }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('+ Add Task')).toBeDefined()
  })

  it('renders a task with correct text', () => {
    render(
      <Renderer
        instanceId="test"
        config={taskChecklistPlugin.defaultConfig}
        data={{
          tasks: [{ id: '1', text: 'Order echo', completed: false, role: 'MD', urgent: false }],
        }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Order echo')).toBeDefined()
  })

  it('shows 3 placeholder tasks in build mode', () => {
    render(
      <Renderer
        instanceId="test"
        config={taskChecklistPlugin.defaultConfig}
        data={{ tasks: [] }}
        onDataChange={noop}
        mode="build"
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBe(3)
  })
})

describe('task-checklist PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={taskChecklistPlugin.defaultConfig}
        data={{
          tasks: [
            { id: '1', text: 'Follow up cultures', completed: true, role: 'MD', urgent: true },
          ],
        }}
      />
    )
    expect(screen.getByText(/Follow up cultures/)).toBeDefined()
    expect(screen.getByText(/URGENT/)).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests (expect failure)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/task-checklist/
```

- [ ] **Step 3: Implement Renderer**

```tsx
// src/modules/task-checklist/Renderer.tsx
import { useState, useCallback } from 'react'

interface Task {
  id: string
  text: string
  completed: boolean
  role?: string
  urgent?: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const ROLE_COLORS: Record<string, string> = {
  MD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  RN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  PA: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  NP: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
}

const PLACEHOLDER_TASKS: Task[] = [
  { id: 'p1', text: 'Task 1', completed: false },
  { id: 'p2', text: 'Task 2', completed: false },
  { id: 'p3', text: 'Task 3', completed: false },
]

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const roles = (config.roles as string[]) ?? ['MD', 'RN', 'PA', 'NP']
  const showRoles = (config.showRoles as boolean) ?? true
  const showUrgent = (config.showUrgent as boolean) ?? true
  const tasks = (data.tasks as Task[]) ?? []

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [nextId, setNextId] = useState(tasks.length + 1)

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => {
      onDataChange({
        ...data,
        tasks: tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })
    },
    [data, tasks, onDataChange]
  )

  const addTask = useCallback(() => {
    const id = String(nextId)
    setNextId((n) => n + 1)
    onDataChange({ ...data, tasks: [...tasks, { id, text: '', completed: false }] })
  }, [data, tasks, nextId, onDataChange])

  const deleteTask = useCallback(
    (id: string) => {
      onDataChange({ ...data, tasks: tasks.filter((t) => t.id !== id) })
    },
    [data, tasks, onDataChange]
  )

  const displayTasks = mode === 'build' && tasks.length === 0 ? PLACEHOLDER_TASKS : tasks

  return (
    <div className="p-2 text-sm space-y-1">
      {displayTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-start gap-2 group"
          onMouseEnter={() => setHoveredId(task.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) =>
              mode === 'live' && updateTask(task.id, { completed: e.target.checked })
            }
            className="mt-0.5 shrink-0"
            disabled={mode === 'build'}
          />
          <input
            className={`flex-1 bg-transparent border-none outline-none text-sm ${
              task.completed ? 'line-through text-gray-400' : ''
            }`}
            value={task.text}
            onChange={(e) => updateTask(task.id, { text: e.target.value })}
            placeholder="Task description"
            readOnly={mode === 'build'}
          />
          {showRoles ? (
            <select
              className={`text-xs rounded px-1 py-0.5 border-none ${
                task.role && ROLE_COLORS[task.role]
                  ? ROLE_COLORS[task.role]
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
              value={task.role ?? ''}
              onChange={(e) => updateTask(task.id, { role: e.target.value || undefined })}
              disabled={mode === 'build'}
            >
              <option value="">—</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          ) : null}
          {showUrgent ? (
            <button
              onClick={() => updateTask(task.id, { urgent: !task.urgent })}
              className={`text-xs shrink-0 ${
                task.urgent ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
              }`}
              title="Toggle urgent"
              disabled={mode === 'build'}
            >
              !
            </button>
          ) : null}
          {hoveredId === task.id && mode === 'live' ? (
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-400 hover:text-red-600 text-xs shrink-0"
              aria-label="Delete task"
            >
              ✕
            </button>
          ) : null}
        </div>
      ))}
      {mode === 'live' ? (
        <button
          onClick={addTask}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 mt-1"
        >
          + Add Task
        </button>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 4: Implement Editor**

```tsx
// src/modules/task-checklist/Editor.tsx
import { useCallback } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function Editor({ config, onConfigChange }: Props) {
  const roles = (config.roles as string[]) ?? ['MD', 'RN', 'PA', 'NP']
  const showRoles = (config.showRoles as boolean) ?? true
  const showUrgent = (config.showUrgent as boolean) ?? true

  const setRoles = useCallback(
    (value: string) => {
      onConfigChange({
        ...config,
        roles: value.split(',').map((r) => r.trim()).filter(Boolean),
      })
    },
    [config, onConfigChange]
  )

  return (
    <div className="space-y-3 p-3 text-sm">
      <div>
        <label className="block font-medium mb-1">Role options (comma-separated)</label>
        <input
          className="border rounded px-2 py-1 w-full dark:bg-gray-800"
          value={roles.join(', ')}
          onChange={(e) => setRoles(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showRoles}
          onChange={(e) => onConfigChange({ ...config, showRoles: e.target.checked })}
        />
        Show role badges
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showUrgent}
          onChange={(e) => onConfigChange({ ...config, showUrgent: e.target.checked })}
        />
        Show urgent flags
      </label>
    </div>
  )
}
```

- [ ] **Step 5: Implement PrintView**

```tsx
// src/modules/task-checklist/PrintView.tsx
interface Task {
  id: string
  text: string
  completed: boolean
  role?: string
  urgent?: boolean
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function PrintView({ config, data }: Props) {
  const showRoles = (config.showRoles as boolean) ?? true
  const showUrgent = (config.showUrgent as boolean) ?? true
  const tasks = (data.tasks as Task[]) ?? []

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">Task Checklist</h3>
      <ul className="space-y-0.5">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start gap-1">
            <span className="shrink-0">{task.completed ? '☑' : '☐'}</span>
            <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.text}</span>
            {showRoles && task.role ? <span className="text-gray-500">({task.role})</span> : null}
            {showUrgent && task.urgent ? (
              <span className="text-red-600 font-semibold ml-1">URGENT</span>
            ) : null}
          </li>
        ))}
      </ul>
      {tasks.length === 0 ? <p className="text-gray-400 italic">No tasks.</p> : null}
    </div>
  )
}
```

- [ ] **Step 6: Implement plugin index**

```ts
// src/modules/task-checklist/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const taskChecklistPlugin: ModulePlugin = {
  meta: {
    id: 'task-checklist',
    name: 'Task Checklist',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Checkbox task list with role assignment and urgent flags.',
    tags: ['tasks', 'nursing', 'rounding'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    roles: ['MD', 'RN', 'PA', 'NP'],
    showRoles: true,
    showUrgent: true,
  },
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default taskChecklistPlugin
```

- [ ] **Step 7: Run tests (expect passing)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/task-checklist/
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates
git add src/modules/task-checklist/
git commit -m "feat: add task-checklist module"
```

---

## Task 10: free-text Module

**Files:**
- `src/modules/free-text/index.ts`
- `src/modules/free-text/Renderer.tsx`
- `src/modules/free-text/Editor.tsx`
- `src/modules/free-text/PrintView.tsx`
- `src/modules/free-text/free-text.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/modules/free-text/free-text.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import freeTextPlugin from './index'

const noop = () => {}

describe('free-text Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="test"
        config={freeTextPlugin.defaultConfig}
        data={{ text: '' }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Notes')).toBeDefined()
  })

  it('shows existing text content', () => {
    render(
      <Renderer
        instanceId="test"
        config={freeTextPlugin.defaultConfig}
        data={{ text: 'Patient improving' }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Patient improving')).toBeDefined()
  })

  it('shows placeholder in build mode', () => {
    render(
      <Renderer
        instanceId="test"
        config={freeTextPlugin.defaultConfig}
        data={{ text: '' }}
        onDataChange={noop}
        mode="build"
      />
    )
    expect(screen.getByPlaceholderText('Enter notes here...')).toBeDefined()
  })
})

describe('free-text PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={freeTextPlugin.defaultConfig}
        data={{ text: 'Some clinical notes\nWith a second line' }}
      />
    )
    expect(screen.getByText('Notes')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests (expect failure)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/free-text/
```

- [ ] **Step 3: Implement Renderer**

```tsx
// src/modules/free-text/Renderer.tsx
import { useCallback } from 'react'

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const FONT_SIZE_CLASS: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const label = (config.label as string) ?? 'Notes'
  const fontSize = (config.fontSize as string) ?? 'base'
  const placeholder = (config.placeholder as string) ?? 'Enter notes here...'
  const text = (data.text as string) ?? ''

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onDataChange({ ...data, text: e.target.value })
    },
    [data, onDataChange]
  )

  return (
    <div className="p-2 flex flex-col h-full">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
        {label}
      </label>
      <textarea
        className={`flex-1 w-full resize-none bg-transparent border border-gray-200 dark:border-gray-700 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
          FONT_SIZE_CLASS[fontSize] ?? 'text-base'
        }`}
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={mode === 'build'}
      />
    </div>
  )
}
```

- [ ] **Step 4: Implement Editor**

```tsx
// src/modules/free-text/Editor.tsx
import { useCallback } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function Editor({ config, onConfigChange }: Props) {
  const label = (config.label as string) ?? 'Notes'
  const fontSize = (config.fontSize as string) ?? 'base'
  const placeholder = (config.placeholder as string) ?? 'Enter notes here...'

  const set = useCallback(
    (key: string, value: string) => onConfigChange({ ...config, [key]: value }),
    [config, onConfigChange]
  )

  return (
    <div className="space-y-3 p-3 text-sm">
      <div>
        <label className="block font-medium mb-1">Label</label>
        <input
          className="border rounded px-2 py-1 w-full dark:bg-gray-800"
          value={label}
          onChange={(e) => set('label', e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Font size</label>
        <select
          className="border rounded px-2 py-1 dark:bg-gray-800"
          value={fontSize}
          onChange={(e) => set('fontSize', e.target.value)}
        >
          <option value="sm">Small</option>
          <option value="base">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Placeholder text</label>
        <input
          className="border rounded px-2 py-1 w-full dark:bg-gray-800"
          value={placeholder}
          onChange={(e) => set('placeholder', e.target.value)}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement PrintView**

```tsx
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
```

- [ ] **Step 6: Implement plugin index**

```ts
// src/modules/free-text/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const freeTextPlugin: ModulePlugin = {
  meta: {
    id: 'free-text',
    name: 'Free Text / Notes',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'A resizable text area with configurable label and font size.',
    tags: ['notes', 'text', 'documentation'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    label: 'Notes',
    fontSize: 'base',
    placeholder: 'Enter notes here...',
  },
  minSize: { w: 3, h: 3 },
  Renderer,
  Editor,
  PrintView,
}

export default freeTextPlugin
```

- [ ] **Step 7: Run tests (expect passing)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/free-text/
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates
git add src/modules/free-text/
git commit -m "feat: add free-text module"
```

---

## Task 11: consults Module

**Files:**
- `src/modules/consults/index.ts`
- `src/modules/consults/Renderer.tsx`
- `src/modules/consults/Editor.tsx`
- `src/modules/consults/PrintView.tsx`
- `src/modules/consults/consults.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/modules/consults/consults.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import consultsPlugin from './index'

const noop = () => {}
const emptyData = { consults: [], results: [] }

describe('consults Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="test"
        config={consultsPlugin.defaultConfig}
        data={emptyData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Active Consults')).toBeDefined()
    expect(screen.getByText('Pending Results')).toBeDefined()
  })

  it('renders a consult row', () => {
    render(
      <Renderer
        instanceId="test"
        config={consultsPlugin.defaultConfig}
        data={{
          consults: [{ id: '1', service: 'Cardiology', question: 'Afib mgmt', status: 'Pending', response: '' }],
          results: [],
        }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Cardiology')).toBeDefined()
  })
})

describe('consults PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={consultsPlugin.defaultConfig}
        data={{
          consults: [{ id: '1', service: 'Nephrology', question: 'AKI', status: 'Responded', response: 'Hold diuretics' }],
          results: [{ id: '1', description: 'CT chest', status: 'Pending' }],
        }}
      />
    )
    expect(screen.getByText('Nephrology')).toBeDefined()
    expect(screen.getByText('CT chest')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests (expect failure)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/consults/
```

- [ ] **Step 3: Implement Renderer**

```tsx
// src/modules/consults/Renderer.tsx
import { useState, useCallback } from 'react'

interface Consult {
  id: string
  service: string
  question: string
  status: 'Pending' | 'Responded' | 'Completed'
  response: string
}

interface Result {
  id: string
  description: string
  status: 'Pending' | 'Resulted' | 'Critical'
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const consultLabel = (config.consultLabel as string) ?? 'Active Consults'
  const resultsLabel = (config.resultsLabel as string) ?? 'Pending Results'
  const consults = (data.consults as Consult[]) ?? []
  const results = (data.results as Result[]) ?? []

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [nextId, setNextId] = useState(Math.max(consults.length, results.length) + 1)

  const updateConsult = useCallback(
    (id: string, patch: Partial<Consult>) => {
      onDataChange({
        ...data,
        consults: consults.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })
    },
    [data, consults, onDataChange]
  )

  const addConsult = useCallback(() => {
    const id = String(nextId)
    setNextId((n) => n + 1)
    onDataChange({
      ...data,
      consults: [...consults, { id, service: '', question: '', status: 'Pending', response: '' }],
    })
  }, [data, consults, nextId, onDataChange])

  const deleteConsult = useCallback(
    (id: string) => {
      onDataChange({ ...data, consults: consults.filter((c) => c.id !== id) })
    },
    [data, consults, onDataChange]
  )

  const updateResult = useCallback(
    (id: string, patch: Partial<Result>) => {
      onDataChange({
        ...data,
        results: results.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      })
    },
    [data, results, onDataChange]
  )

  const addResult = useCallback(() => {
    const id = String(nextId + 100)
    setNextId((n) => n + 1)
    onDataChange({
      ...data,
      results: [...results, { id, description: '', status: 'Pending' }],
    })
  }, [data, results, nextId, onDataChange])

  const deleteResult = useCallback(
    (id: string) => {
      onDataChange({ ...data, results: results.filter((r) => r.id !== id) })
    },
    [data, results, onDataChange]
  )

  return (
    <div className="p-2 text-sm space-y-3 overflow-auto">
      {/* Consults section */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          {consultLabel}
        </h4>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="text-left p-1 border border-gray-200 dark:border-gray-700">Service</th>
              <th className="text-left p-1 border border-gray-200 dark:border-gray-700">Question</th>
              <th className="text-left p-1 border border-gray-200 dark:border-gray-700 w-24">Status</th>
              <th className="p-1 border border-gray-200 dark:border-gray-700 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {consults.map((c) => (
              <>
                <tr key={c.id}>
                  <td className="p-1 border border-gray-200 dark:border-gray-700">
                    <input
                      className="w-full bg-transparent"
                      value={c.service}
                      onChange={(e) => updateConsult(c.id, { service: e.target.value })}
                      placeholder="Service"
                      readOnly={mode === 'build'}
                    />
                  </td>
                  <td className="p-1 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <input
                        className="flex-1 bg-transparent"
                        value={c.question}
                        onChange={(e) => updateConsult(c.id, { question: e.target.value })}
                        placeholder="Question asked"
                        readOnly={mode === 'build'}
                      />
                      <button
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                        className="text-gray-400 hover:text-gray-600 shrink-0"
                        title="Show response"
                      >
                        {expandedId === c.id ? '▲' : '▼'}
                      </button>
                    </div>
                  </td>
                  <td className="p-1 border border-gray-200 dark:border-gray-700">
                    <select
                      className="w-full bg-transparent text-xs"
                      value={c.status}
                      onChange={(e) => updateConsult(c.id, { status: e.target.value as Consult['status'] })}
                      disabled={mode === 'build'}
                    >
                      <option>Pending</option>
                      <option>Responded</option>
                      <option>Completed</option>
                    </select>
                  </td>
                  <td className="p-1 border border-gray-200 dark:border-gray-700 text-center">
                    <button
                      onClick={() => deleteConsult(c.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      aria-label="Delete consult"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
                {expandedId === c.id ? (
                  <tr key={`${c.id}-response`}>
                    <td colSpan={4} className="p-1 border border-gray-200 dark:border-gray-700">
                      <textarea
                        className="w-full bg-gray-50 dark:bg-gray-800 text-xs rounded p-1 resize-none"
                        rows={3}
                        value={c.response}
                        onChange={(e) => updateConsult(c.id, { response: e.target.value })}
                        placeholder="Response / recommendations"
                        readOnly={mode === 'build'}
                      />
                    </td>
                  </tr>
                ) : null}
              </>
            ))}
          </tbody>
        </table>
        {mode === 'live' ? (
          <button
            onClick={addConsult}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            + Add Consult
          </button>
        ) : null}
      </div>

      {/* Results section */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          {resultsLabel}
        </h4>
        <ul className="space-y-1">
          {results.map((r) => (
            <li key={r.id} className="flex items-center gap-2">
              <input
                className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 text-xs"
                value={r.description}
                onChange={(e) => updateResult(r.id, { description: e.target.value })}
                placeholder="Test / result description"
                readOnly={mode === 'build'}
              />
              <select
                className={`text-xs rounded px-1 border ${
                  r.status === 'Critical'
                    ? 'border-red-400 text-red-600'
                    : r.status === 'Pending'
                    ? 'border-amber-400 text-amber-600'
                    : 'border-green-400 text-green-600'
                } bg-transparent`}
                value={r.status}
                onChange={(e) => updateResult(r.id, { status: e.target.value as Result['status'] })}
                disabled={mode === 'build'}
              >
                <option>Pending</option>
                <option>Resulted</option>
                <option>Critical</option>
              </select>
              <button
                onClick={() => deleteResult(r.id)}
                className="text-red-400 hover:text-red-600 text-xs"
                aria-label="Delete result"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        {mode === 'live' ? (
          <button
            onClick={addResult}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            + Add Result
          </button>
        ) : null}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement Editor**

```tsx
// src/modules/consults/Editor.tsx
import { useCallback } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function Editor({ config, onConfigChange }: Props) {
  const consultLabel = (config.consultLabel as string) ?? 'Active Consults'
  const resultsLabel = (config.resultsLabel as string) ?? 'Pending Results'

  const set = useCallback(
    (key: string, value: string) => onConfigChange({ ...config, [key]: value }),
    [config, onConfigChange]
  )

  return (
    <div className="space-y-3 p-3 text-sm">
      <div>
        <label className="block font-medium mb-1">Consults section label</label>
        <input
          className="border rounded px-2 py-1 w-full dark:bg-gray-800"
          value={consultLabel}
          onChange={(e) => set('consultLabel', e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Results section label</label>
        <input
          className="border rounded px-2 py-1 w-full dark:bg-gray-800"
          value={resultsLabel}
          onChange={(e) => set('resultsLabel', e.target.value)}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement PrintView**

```tsx
// src/modules/consults/PrintView.tsx
interface Consult {
  id: string
  service: string
  question: string
  status: 'Pending' | 'Responded' | 'Completed'
  response: string
}

interface Result {
  id: string
  description: string
  status: 'Pending' | 'Resulted' | 'Critical'
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function PrintView({ config, data }: Props) {
  const consultLabel = (config.consultLabel as string) ?? 'Active Consults'
  const resultsLabel = (config.resultsLabel as string) ?? 'Pending Results'
  const consults = (data.consults as Consult[]) ?? []
  const results = (data.results as Result[]) ?? []

  return (
    <div className="text-sm space-y-3">
      <div>
        <h3 className="font-bold mb-1">{consultLabel}</h3>
        {consults.length === 0 ? (
          <p className="text-gray-400 italic text-xs">None.</p>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-0.5 pr-2">Service</th>
                <th className="text-left py-0.5 pr-2">Question</th>
                <th className="text-left py-0.5 pr-2">Status</th>
                <th className="text-left py-0.5">Response</th>
              </tr>
            </thead>
            <tbody>
              {consults.map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="py-0.5 pr-2">{c.service}</td>
                  <td className="py-0.5 pr-2">{c.question}</td>
                  <td className={`py-0.5 pr-2 ${c.status === 'Pending' ? 'text-amber-600' : ''}`}>
                    {c.status}
                  </td>
                  <td className="py-0.5">{c.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div>
        <h3 className="font-bold mb-1">{resultsLabel}</h3>
        {results.length === 0 ? (
          <p className="text-gray-400 italic text-xs">None.</p>
        ) : (
          <ul className="space-y-0.5 text-xs">
            {results.map((r) => (
              <li key={r.id} className="flex gap-2">
                <span className="flex-1">{r.description}</span>
                <span
                  className={
                    r.status === 'Critical'
                      ? 'text-red-600 font-semibold'
                      : r.status === 'Pending'
                      ? 'text-amber-600'
                      : 'text-green-600'
                  }
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Implement plugin index**

```ts
// src/modules/consults/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const consultsPlugin: ModulePlugin = {
  meta: {
    id: 'consults',
    name: 'Consults & Results',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track active consults by service and monitor pending imaging/lab results.',
    tags: ['consults', 'results', 'communication'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    consultLabel: 'Active Consults',
    resultsLabel: 'Pending Results',
  },
  minSize: { w: 5, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default consultsPlugin
```

- [ ] **Step 7: Run tests (expect passing)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/consults/
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates
git add src/modules/consults/
git commit -m "feat: add consults module"
```

---

## Task 12: nursing-assessment Module

**Files:**
- `src/modules/nursing-assessment/index.ts`
- `src/modules/nursing-assessment/Renderer.tsx`
- `src/modules/nursing-assessment/Editor.tsx`
- `src/modules/nursing-assessment/PrintView.tsx`
- `src/modules/nursing-assessment/nursing-assessment.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/modules/nursing-assessment/nursing-assessment.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import nursingPlugin from './index'

const noop = () => {}

const emptyData = {
  systems: {
    Neuro: { status: 'WNL', notes: '' },
    Cardiac: { status: 'WNL', notes: '' },
    Respiratory: { status: 'WNL', notes: '' },
    GI: { status: 'WNL', notes: '' },
    GU: { status: 'WNL', notes: '' },
    'Skin/Wound': { status: 'WNL', notes: '' },
    Mobility: { status: 'WNL', notes: '' },
    'Fall Risk': { status: 'WNL', notes: '', fallScore: 0 },
    Pain: { status: 'WNL', notes: '', painScale: 0, cpot: 0 },
  },
}

describe('nursing-assessment Renderer', () => {
  it('renders without crashing', () => {
    render(
      <Renderer
        instanceId="test"
        config={nursingPlugin.defaultConfig}
        data={emptyData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Neuro')).toBeDefined()
    expect(screen.getByText('Cardiac')).toBeDefined()
  })

  it('shows WNL status buttons', () => {
    render(
      <Renderer
        instanceId="test"
        config={nursingPlugin.defaultConfig}
        data={emptyData}
        onDataChange={noop}
        mode="live"
      />
    )
    const wnlButtons = screen.getAllByText('WNL')
    expect(wnlButtons.length).toBeGreaterThan(0)
  })
})

describe('nursing-assessment PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={nursingPlugin.defaultConfig}
        data={emptyData}
      />
    )
    expect(screen.getByText('Nursing Assessment')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests (expect failure)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/nursing-assessment/
```

- [ ] **Step 3: Implement Renderer**

```tsx
// src/modules/nursing-assessment/Renderer.tsx
import { useState, useCallback } from 'react'

type SystemStatus = 'WNL' | 'Abnormal' | 'N/A'

interface SystemData {
  status: SystemStatus
  notes: string
  fallScore?: number
  painScale?: number
  cpot?: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const DEFAULT_SYSTEMS = [
  'Neuro', 'Cardiac', 'Respiratory', 'GI', 'GU',
  'Skin/Wound', 'Mobility', 'Fall Risk', 'Pain',
]

const STATUS_OPTIONS: SystemStatus[] = ['WNL', 'Abnormal', 'N/A']

const STATUS_COLORS: Record<SystemStatus, string> = {
  WNL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Abnormal: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'N/A': 'bg-gray-100 text-gray-500 dark:bg-gray-800',
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const alwaysShowNotes = (config.alwaysShowNotes as boolean) ?? false
  const enabledSystems = (config.enabledSystems as string[]) ?? DEFAULT_SYSTEMS
  const systemNames = (config.systemNames as Record<string, string>) ?? {}
  const systems = (data.systems as Record<string, SystemData>) ?? {}

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const getSystem = (name: string): SystemData =>
    systems[name] ?? { status: 'WNL', notes: '' }

  const updateSystem = useCallback(
    (name: string, patch: Partial<SystemData>) => {
      onDataChange({
        ...data,
        systems: { ...systems, [name]: { ...getSystem(name), ...patch } },
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, systems, onDataChange]
  )

  return (
    <div className="p-2 text-sm space-y-1 overflow-auto">
      {enabledSystems.map((sysKey) => {
        const displayName = systemNames[sysKey] ?? sysKey
        const sys = getSystem(sysKey)
        const isAbnormal = sys.status === 'Abnormal'
        const showNotes = alwaysShowNotes || isAbnormal || expanded[sysKey]
        const isFallRisk = sysKey === 'Fall Risk'
        const isPain = sysKey === 'Pain'

        return (
          <div
            key={sysKey}
            className={`rounded border p-1.5 ${
              isAbnormal
                ? 'border-l-4 border-l-amber-400 border-gray-200 dark:border-gray-700'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setExpanded((e) => ({ ...e, [sysKey]: !e[sysKey] }))}
                className="font-medium text-xs min-w-[80px] text-left"
              >
                {displayName}
              </button>
              <div className="flex gap-1">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => mode === 'live' && updateSystem(sysKey, { status: s })}
                    className={`text-xs px-2 py-0.5 rounded ${
                      sys.status === s
                        ? STATUS_COLORS[s]
                        : 'bg-gray-50 text-gray-400 dark:bg-gray-800'
                    }`}
                    disabled={mode === 'build'}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {isFallRisk ? (
                <span className="flex items-center gap-1 text-xs ml-auto">
                  Morse:
                  <input
                    type="number"
                    min={0}
                    max={125}
                    className="w-14 border rounded px-1 text-xs dark:bg-gray-800"
                    value={sys.fallScore ?? 0}
                    onChange={(e) =>
                      updateSystem(sysKey, { fallScore: Number(e.target.value) })
                    }
                    disabled={mode === 'build'}
                  />
                </span>
              ) : null}
              {isPain ? (
                <span className="flex items-center gap-2 text-xs ml-auto">
                  <span>Pain 0–10:
                    <input
                      type="number"
                      min={0}
                      max={10}
                      className="w-12 border rounded px-1 ml-1 dark:bg-gray-800"
                      value={sys.painScale ?? 0}
                      onChange={(e) =>
                        updateSystem(sysKey, { painScale: Number(e.target.value) })
                      }
                      disabled={mode === 'build'}
                    />
                  </span>
                  <span>CPOT 0–8:
                    <input
                      type="number"
                      min={0}
                      max={8}
                      className="w-12 border rounded px-1 ml-1 dark:bg-gray-800"
                      value={sys.cpot ?? 0}
                      onChange={(e) =>
                        updateSystem(sysKey, { cpot: Number(e.target.value) })
                      }
                      disabled={mode === 'build'}
                    />
                  </span>
                </span>
              ) : null}
            </div>
            {showNotes ? (
              <textarea
                className="mt-1 w-full text-xs bg-gray-50 dark:bg-gray-800 rounded p-1 resize-none border border-gray-200 dark:border-gray-700"
                rows={2}
                value={sys.notes}
                onChange={(e) => updateSystem(sysKey, { notes: e.target.value })}
                placeholder="Notes"
                readOnly={mode === 'build'}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Implement Editor**

```tsx
// src/modules/nursing-assessment/Editor.tsx
import { useCallback } from 'react'

const DEFAULT_SYSTEMS = [
  'Neuro', 'Cardiac', 'Respiratory', 'GI', 'GU',
  'Skin/Wound', 'Mobility', 'Fall Risk', 'Pain',
]

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function Editor({ config, onConfigChange }: Props) {
  const enabledSystems = (config.enabledSystems as string[]) ?? DEFAULT_SYSTEMS
  const alwaysShowNotes = (config.alwaysShowNotes as boolean) ?? false
  const systemNames = (config.systemNames as Record<string, string>) ?? {}

  const toggleSystem = useCallback(
    (name: string, on: boolean) => {
      const next = on
        ? [...enabledSystems, name]
        : enabledSystems.filter((s) => s !== name)
      onConfigChange({ ...config, enabledSystems: next })
    },
    [config, enabledSystems, onConfigChange]
  )

  const renameSystem = useCallback(
    (key: string, value: string) => {
      onConfigChange({ ...config, systemNames: { ...systemNames, [key]: value } })
    },
    [config, systemNames, onConfigChange]
  )

  return (
    <div className="space-y-3 p-3 text-sm">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={alwaysShowNotes}
          onChange={(e) => onConfigChange({ ...config, alwaysShowNotes: e.target.checked })}
        />
        Always show notes field
      </label>
      <div>
        <p className="font-medium mb-1">Systems</p>
        <ul className="space-y-1.5">
          {DEFAULT_SYSTEMS.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enabledSystems.includes(s)}
                onChange={(e) => toggleSystem(s, e.target.checked)}
              />
              <input
                className="flex-1 border rounded px-1 py-0.5 text-xs dark:bg-gray-800"
                value={systemNames[s] ?? s}
                onChange={(e) => renameSystem(s, e.target.value)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement PrintView**

```tsx
// src/modules/nursing-assessment/PrintView.tsx
const DEFAULT_SYSTEMS = [
  'Neuro', 'Cardiac', 'Respiratory', 'GI', 'GU',
  'Skin/Wound', 'Mobility', 'Fall Risk', 'Pain',
]

interface SystemData {
  status: 'WNL' | 'Abnormal' | 'N/A'
  notes: string
  fallScore?: number
  painScale?: number
  cpot?: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function PrintView({ config, data }: Props) {
  const enabledSystems = (config.enabledSystems as string[]) ?? DEFAULT_SYSTEMS
  const systemNames = (config.systemNames as Record<string, string>) ?? {}
  const systems = (data.systems as Record<string, SystemData>) ?? {}

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">Nursing Assessment</h3>
      <ul className="space-y-0.5 text-xs">
        {enabledSystems.map((key) => {
          const sys = systems[key] ?? { status: 'WNL', notes: '' }
          const displayName = systemNames[key] ?? key
          const isAbnormal = sys.status === 'Abnormal'
          return (
            <li key={key}>
              <span className={isAbnormal ? 'font-bold' : ''}>{displayName}</span>
              {': '}
              <span className={isAbnormal ? 'text-amber-700' : ''}>{sys.status}</span>
              {sys.notes ? ` | ${sys.notes}` : ''}
              {key === 'Fall Risk' && sys.fallScore !== undefined
                ? ` | Morse: ${sys.fallScore}`
                : ''}
              {key === 'Pain'
                ? ` | Pain: ${sys.painScale ?? 0}/10, CPOT: ${sys.cpot ?? 0}/8`
                : ''}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
```

- [ ] **Step 6: Implement plugin index**

```ts
// src/modules/nursing-assessment/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const DEFAULT_SYSTEMS = [
  'Neuro', 'Cardiac', 'Respiratory', 'GI', 'GU',
  'Skin/Wound', 'Mobility', 'Fall Risk', 'Pain',
]

const nursingAssessmentPlugin: ModulePlugin = {
  meta: {
    id: 'nursing-assessment',
    name: 'Nursing Assessment',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Accordion body systems assessment with WNL/Abnormal/N/A status, notes, and clinical scores.',
    tags: ['nursing', 'assessment', 'systems'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    enabledSystems: DEFAULT_SYSTEMS,
    alwaysShowNotes: false,
    systemNames: {},
  },
  minSize: { w: 4, h: 6 },
  Renderer,
  Editor,
  PrintView,
}

export default nursingAssessmentPlugin
```

- [ ] **Step 7: Run tests (expect passing)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/nursing-assessment/
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates
git add src/modules/nursing-assessment/
git commit -m "feat: add nursing-assessment module"
```

---

## Task 13: custom-fields Module

**Files:**
- `src/modules/custom-fields/index.ts`
- `src/modules/custom-fields/Renderer.tsx`
- `src/modules/custom-fields/Editor.tsx`
- `src/modules/custom-fields/PrintView.tsx`
- `src/modules/custom-fields/custom-fields.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/modules/custom-fields/custom-fields.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import customFieldsPlugin from './index'

const noop = () => {}

const config = {
  fields: [
    { id: 'f1', label: 'Admit Weight', type: 'number' },
    { id: 'f2', label: 'On antibiotics', type: 'checkbox' },
    { id: 'f3', label: 'Diet', type: 'dropdown', options: ['NPO', 'Clear', 'Regular'] },
  ],
}

describe('custom-fields Renderer', () => {
  it('renders without crashing with no fields', () => {
    render(
      <Renderer
        instanceId="test"
        config={customFieldsPlugin.defaultConfig}
        data={{ values: {} }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('No fields configured. Open settings to add fields.')).toBeDefined()
  })

  it('renders configured fields', () => {
    render(
      <Renderer
        instanceId="test"
        config={config}
        data={{ values: {} }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Admit Weight')).toBeDefined()
    expect(screen.getByText('On antibiotics')).toBeDefined()
    expect(screen.getByText('Diet')).toBeDefined()
  })
})

describe('custom-fields PrintView', () => {
  it('renders field values', () => {
    render(
      <PrintView
        config={config}
        data={{ values: { f1: 80, f2: true, f3: 'NPO' } }}
      />
    )
    expect(screen.getByText('Admit Weight:')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests (expect failure)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/custom-fields/
```

- [ ] **Step 3: Implement Renderer**

```tsx
// src/modules/custom-fields/Renderer.tsx
import { useCallback } from 'react'

interface FieldDef {
  id: string
  label: string
  type: 'text' | 'number' | 'checkbox' | 'dropdown' | 'date'
  options?: string[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const fields = (config.fields as FieldDef[]) ?? []
  const values = (data.values as Record<string, string | number | boolean>) ?? {}

  const setValue = useCallback(
    (id: string, value: string | number | boolean) => {
      onDataChange({ ...data, values: { ...values, [id]: value } })
    },
    [data, values, onDataChange]
  )

  if (fields.length === 0) {
    return (
      <div className="p-3 text-sm text-gray-400 italic">
        No fields configured. Open settings to add fields.
      </div>
    )
  }

  return (
    <div className="p-2 space-y-2 text-sm">
      {fields.map((field) => (
        <div key={field.id} className="flex items-center gap-2">
          <label className="w-1/3 text-xs font-medium text-gray-600 dark:text-gray-400 shrink-0">
            {field.label}
          </label>
          {field.type === 'text' ? (
            <input
              type="text"
              className="flex-1 border rounded px-2 py-0.5 text-sm dark:bg-gray-800"
              value={(values[field.id] as string) ?? ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              readOnly={mode === 'build'}
            />
          ) : field.type === 'number' ? (
            <input
              type="number"
              className="flex-1 border rounded px-2 py-0.5 text-sm dark:bg-gray-800"
              value={(values[field.id] as number) ?? ''}
              onChange={(e) => setValue(field.id, Number(e.target.value))}
              readOnly={mode === 'build'}
            />
          ) : field.type === 'checkbox' ? (
            <input
              type="checkbox"
              checked={(values[field.id] as boolean) ?? false}
              onChange={(e) => setValue(field.id, e.target.checked)}
              disabled={mode === 'build'}
            />
          ) : field.type === 'dropdown' ? (
            <select
              className="flex-1 border rounded px-2 py-0.5 text-sm dark:bg-gray-800"
              value={(values[field.id] as string) ?? ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              disabled={mode === 'build'}
            >
              <option value="">—</option>
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : field.type === 'date' ? (
            <input
              type="date"
              className="flex-1 border rounded px-2 py-0.5 text-sm dark:bg-gray-800"
              value={(values[field.id] as string) ?? ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              readOnly={mode === 'build'}
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Implement Editor**

```tsx
// src/modules/custom-fields/Editor.tsx
import { useState, useCallback } from 'react'

interface FieldDef {
  id: string
  label: string
  type: 'text' | 'number' | 'checkbox' | 'dropdown' | 'date'
  options?: string[]
}

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const FIELD_TYPES = ['text', 'number', 'checkbox', 'dropdown', 'date'] as const

function generateId() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function Editor({ config, onConfigChange }: Props) {
  const fields = (config.fields as FieldDef[]) ?? []

  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState<FieldDef['type']>('text')
  const [newOptions, setNewOptions] = useState('')
  const [adding, setAdding] = useState(false)

  const removeField = useCallback(
    (id: string) => {
      onConfigChange({ ...config, fields: fields.filter((f) => f.id !== id) })
    },
    [config, fields, onConfigChange]
  )

  const saveField = useCallback(() => {
    if (!newLabel.trim()) return
    const field: FieldDef = {
      id: generateId(),
      label: newLabel.trim(),
      type: newType,
      options:
        newType === 'dropdown'
          ? newOptions.split(',').map((o) => o.trim()).filter(Boolean)
          : undefined,
    }
    onConfigChange({ ...config, fields: [...fields, field] })
    setNewLabel('')
    setNewType('text')
    setNewOptions('')
    setAdding(false)
  }, [config, fields, newLabel, newType, newOptions, onConfigChange])

  return (
    <div className="space-y-3 p-3 text-sm">
      <p className="font-medium">Fields</p>
      <ul className="space-y-1">
        {fields.map((f) => (
          <li key={f.id} className="flex items-center gap-2 text-xs border rounded px-2 py-1">
            <span className="flex-1">{f.label}</span>
            <span className="text-gray-400">{f.type}</span>
            <button
              onClick={() => removeField(f.id)}
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
            <label className="block font-medium mb-0.5">Field Name</label>
            <input
              className="border rounded px-2 py-1 w-full dark:bg-gray-800"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Admit Weight"
              autoFocus
            />
          </div>
          <div>
            <label className="block font-medium mb-0.5">Type</label>
            <select
              className="border rounded px-2 py-1 dark:bg-gray-800"
              value={newType}
              onChange={(e) => setNewType(e.target.value as FieldDef['type'])}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {newType === 'dropdown' ? (
            <div>
              <label className="block font-medium mb-0.5">Options (comma-separated)</label>
              <textarea
                className="border rounded px-2 py-1 w-full dark:bg-gray-800 resize-none"
                rows={2}
                value={newOptions}
                onChange={(e) => setNewOptions(e.target.value)}
                placeholder="Option A, Option B, Option C"
              />
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              onClick={saveField}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setAdding(false)}
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
          + Add Field
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Implement PrintView**

```tsx
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
```

- [ ] **Step 6: Implement plugin index**

```ts
// src/modules/custom-fields/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const customFieldsPlugin: ModulePlugin = {
  meta: {
    id: 'custom-fields',
    name: 'Custom Fields',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'User-defined fields: text, number, checkbox, dropdown, and date inputs.',
    tags: ['custom', 'fields', 'data-entry'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    fields: [],
  },
  minSize: { w: 3, h: 3 },
  Renderer,
  Editor,
  PrintView,
}

export default customFieldsPlugin
```

- [ ] **Step 7: Run tests (expect passing)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/custom-fields/
```

- [ ] **Step 8: Commit**

```bash
cd ~/projects/patient-templates
git add src/modules/custom-fields/
git commit -m "feat: add custom-fields module"
```

---

## Task 14: calculated Module (Clinical Calculators)

**Files:**
- `src/modules/calculated/index.ts`
- `src/modules/calculated/Renderer.tsx`
- `src/modules/calculated/Editor.tsx`
- `src/modules/calculated/PrintView.tsx`
- `src/modules/calculated/formulas.ts`
- `src/modules/calculated/calculated.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/modules/calculated/calculated.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  calcAnionGap,
  calcMAP,
  calcBMI,
  calcAAGradient,
  calcCKDEPI,
  calcCorrectedCalcium,
} from './formulas'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import calculatedPlugin from './index'

const noop = () => {}

// Pure formula unit tests
describe('clinical calculator formulas', () => {
  it('calcAnionGap: Na=140, Cl=102, CO2=24 → 14', () => {
    expect(calcAnionGap(140, 102, 24)).toBe(14)
  })

  it('calcMAP: SBP=120, DBP=80 → 93.33...', () => {
    expect(calcMAP(120, 80)).toBeCloseTo(93.33, 1)
  })

  it('calcBMI: weight=70kg, height=1.75m → 22.86', () => {
    expect(calcBMI(70, 1.75)).toBeCloseTo(22.86, 1)
  })

  it('calcAAGradient: FiO2=0.21, PaCO2=40, PaO2=90 → ~8.65', () => {
    expect(calcAAGradient(0.21, 40, 90)).toBeCloseTo(8.65, 0)
  })

  it('calcCKDEPI female Cr≤0.7: Cr=0.6, age=50 → >60', () => {
    const gfr = calcCKDEPI(0.6, 50, 'female')
    expect(gfr).toBeGreaterThan(60)
  })

  it('calcCKDEPI male Cr>0.9: Cr=1.5, age=60 → <60', () => {
    const gfr = calcCKDEPI(1.5, 60, 'male')
    expect(gfr).toBeLessThan(60)
  })

  it('calcCorrectedCalcium: Ca=7.0, albumin=2.5 → 8.2', () => {
    expect(calcCorrectedCalcium(7.0, 2.5)).toBeCloseTo(8.2, 1)
  })
})

// React component tests
describe('calculated Renderer', () => {
  it('renders without crashing with default config', () => {
    render(
      <Renderer
        instanceId="test"
        config={calculatedPlugin.defaultConfig}
        data={{}}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Anion Gap')).toBeDefined()
  })

  it('shows — when inputs are empty', () => {
    render(
      <Renderer
        instanceId="test"
        config={calculatedPlugin.defaultConfig}
        data={{}}
        onDataChange={noop}
        mode="live"
      />
    )
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })
})

describe('calculated PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={calculatedPlugin.defaultConfig}
        data={{}}
      />
    )
    expect(screen.getByText('Clinical Calculators')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests (expect failure)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/calculated/
```

- [ ] **Step 3: Implement formulas (pure functions, fully unit-testable)**

```ts
// src/modules/calculated/formulas.ts

/** Anion Gap = Na − (Cl + CO2). Normal: 8–12.
 * Citation: Emmett M & Narins RG, Medicine 1977;56(1):38-54 */
export function calcAnionGap(na: number, cl: number, co2: number): number {
  return na - (cl + co2)
}

/** MAP = (SBP + 2×DBP) / 3.
 * Citation: Magder S, Crit Care 2016 */
export function calcMAP(sbp: number, dbp: number): number {
  return (sbp + 2 * dbp) / 3
}

/** BMI = weight(kg) / height(m)².
 * Citation: WHO, 1995 */
export function calcBMI(weightKg: number, heightM: number): number {
  return weightKg / (heightM * heightM)
}

/** A-a Gradient = (FiO2 × 713) − (PaCO2 / 0.8) − PaO2. Normal rises with age.
 * Citation: Sorbini CA et al., Respiration 1968;25(1):3-13 */
export function calcAAGradient(fio2: number, paco2: number, pao2: number): number {
  return fio2 * 713 - paco2 / 0.8 - pao2
}

/** CKD-EPI GFR 2021 (race-free).
 * Female: Cr≤0.7: 142×(Cr/0.7)^−0.241×(0.9938)^age
 *         Cr>0.7: 142×(Cr/0.7)^−1.200×(0.9938)^age
 * Male:   Cr≤0.9: 142×(Cr/0.9)^−0.302×(0.9938)^age
 *         Cr>0.9: 142×(Cr/0.9)^−1.200×(0.9938)^age
 * Citation: Inker LA et al., NEJM 2021;385(19):1737-1749 */
export function calcCKDEPI(cr: number, age: number, sex: 'male' | 'female'): number {
  if (sex === 'female') {
    const exp = cr <= 0.7 ? -0.241 : -1.200
    return 142 * Math.pow(cr / 0.7, exp) * Math.pow(0.9938, age)
  }
  const exp = cr <= 0.9 ? -0.302 : -1.200
  return 142 * Math.pow(cr / 0.9, exp) * Math.pow(0.9938, age)
}

/** Corrected Calcium = measured Ca + 0.8 × (4.0 − albumin).
 * Citation: Payne RB et al., BMJ 1973;4(5893):643-6 */
export function calcCorrectedCalcium(measuredCa: number, albumin: number): number {
  return measuredCa + 0.8 * (4.0 - albumin)
}
```

- [ ] **Step 4: Implement Renderer**

```tsx
// src/modules/calculated/Renderer.tsx
import { useState, useCallback } from 'react'
import {
  calcAnionGap,
  calcMAP,
  calcBMI,
  calcAAGradient,
  calcCKDEPI,
  calcCorrectedCalcium,
} from './formulas'

interface CustomFormula {
  id: string
  name: string
  formula: string
  citation: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

type Inputs = Record<string, string>

function fmt(n: number | null): string {
  if (n === null || isNaN(n)) return '—'
  return n.toFixed(1)
}

function numVal(inputs: Inputs, key: string): number | null {
  const v = inputs[key]
  if (v === undefined || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const enabledCalculators = (config.enabledCalculators as string[]) ?? ['anion-gap', 'map', 'bmi']
  const customFormulas = (config.customFormulas as CustomFormula[]) ?? []

  // Store calculator inputs in local component state (ephemeral, not persisted)
  const [inputs, setInputs] = useState<Inputs>({})

  const setInput = useCallback((key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }, [])

  const na = numVal(inputs, 'na')
  const cl = numVal(inputs, 'cl')
  const co2 = numVal(inputs, 'co2')
  const sbp = numVal(inputs, 'sbp')
  const dbp = numVal(inputs, 'dbp')
  const weight = numVal(inputs, 'weight')
  const height = numVal(inputs, 'height')
  const fio2 = numVal(inputs, 'fio2')
  const paco2 = numVal(inputs, 'paco2')
  const pao2 = numVal(inputs, 'pao2')
  const cr = numVal(inputs, 'cr')
  const age = numVal(inputs, 'age')
  const sex = inputs['sex'] as 'male' | 'female' | undefined
  const measuredCa = numVal(inputs, 'measuredCa')
  const albumin = numVal(inputs, 'albumin')

  const anionGap =
    na !== null && cl !== null && co2 !== null ? calcAnionGap(na, cl, co2) : null
  const map =
    sbp !== null && dbp !== null ? calcMAP(sbp, dbp) : null
  const bmi =
    weight !== null && height !== null && height > 0 ? calcBMI(weight, height) : null
  const aaGrad =
    fio2 !== null && paco2 !== null && pao2 !== null
      ? calcAAGradient(fio2, paco2, pao2)
      : null
  const gfr =
    cr !== null && age !== null && (sex === 'male' || sex === 'female')
      ? calcCKDEPI(cr, age, sex)
      : null
  const corrCa =
    measuredCa !== null && albumin !== null
      ? calcCorrectedCalcium(measuredCa, albumin)
      : null

  const inp = (key: string, placeholder: string, width = 'w-16') => (
    <input
      type="number"
      className={`${width} border rounded px-1 py-0.5 text-xs dark:bg-gray-800`}
      value={inputs[key] ?? ''}
      onChange={(e) => setInput(key, e.target.value)}
      placeholder={placeholder}
      disabled={mode === 'build'}
    />
  )

  return (
    <div className="p-2 text-xs space-y-3 overflow-auto">
      {enabledCalculators.includes('anion-gap') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Anion Gap</span>
            <span className="text-lg font-bold font-mono">{fmt(anionGap)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {inp('na', 'Na')} {inp('cl', 'Cl')} {inp('co2', 'CO₂')}
          </div>
          <p className="text-gray-400 italic text-[10px]">
            Emmett M &amp; Narins RG, Medicine 1977;56(1):38-54
          </p>
        </div>
      ) : null}

      {enabledCalculators.includes('map') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">MAP</span>
            <span className="text-lg font-bold font-mono">{fmt(map)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {inp('sbp', 'SBP')} {inp('dbp', 'DBP')}
          </div>
          <p className="text-gray-400 italic text-[10px]">Magder S, Crit Care 2016</p>
        </div>
      ) : null}

      {enabledCalculators.includes('bmi') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">BMI</span>
            <span className="text-lg font-bold font-mono">{fmt(bmi)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {inp('weight', 'kg')} {inp('height', 'm')}
          </div>
          <p className="text-gray-400 italic text-[10px]">WHO, 1995</p>
        </div>
      ) : null}

      {enabledCalculators.includes('aa-gradient') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">A-a Gradient</span>
            <span className="text-lg font-bold font-mono">{fmt(aaGrad)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {inp('fio2', 'FiO₂ (0-1)')} {inp('paco2', 'PaCO₂')} {inp('pao2', 'PaO₂')}
          </div>
          <p className="text-gray-400 italic text-[10px]">
            Sorbini CA et al., Respiration 1968;25(1):3-13
          </p>
        </div>
      ) : null}

      {enabledCalculators.includes('ckd-epi') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">CKD-EPI GFR 2021</span>
            <span className="text-lg font-bold font-mono">{fmt(gfr)}</span>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {inp('cr', 'Cr')} {inp('age', 'Age')}
            <select
              className="border rounded px-1 py-0.5 text-xs dark:bg-gray-800"
              value={inputs['sex'] ?? ''}
              onChange={(e) => setInput('sex', e.target.value)}
              disabled={mode === 'build'}
            >
              <option value="">Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <p className="text-gray-400 italic text-[10px]">
            Inker LA et al., NEJM 2021;385(19):1737-1749
          </p>
        </div>
      ) : null}

      {enabledCalculators.includes('corrected-calcium') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Corrected Calcium</span>
            <span className="text-lg font-bold font-mono">{fmt(corrCa)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {inp('measuredCa', 'Ca')} {inp('albumin', 'Albumin')}
          </div>
          <p className="text-gray-400 italic text-[10px]">
            Payne RB et al., BMJ 1973;4(5893):643-6
          </p>
        </div>
      ) : null}

      {customFormulas.length > 0 ? (
        <div>
          <p className="font-semibold mb-1">Custom Formulas</p>
          {customFormulas.map((f) => (
            <div key={f.id} className="border rounded p-2 mb-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{f.name}</span>
                <span className="text-lg font-bold font-mono">—</span>
              </div>
              <p className="text-gray-400 italic text-[10px]">{f.citation}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 5: Implement Editor**

```tsx
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
```

- [ ] **Step 6: Implement PrintView**

```tsx
// src/modules/calculated/PrintView.tsx
interface CustomFormula {
  id: string
  name: string
  citation: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const BUILTIN_LABELS: Record<string, string> = {
  'anion-gap': 'Anion Gap',
  'map': 'MAP',
  'bmi': 'BMI',
  'aa-gradient': 'A-a Gradient',
  'ckd-epi': 'CKD-EPI GFR 2021',
  'corrected-calcium': 'Corrected Calcium',
}

const CITATIONS: Record<string, string> = {
  'anion-gap': 'Emmett M & Narins RG, Medicine 1977;56(1):38-54',
  'map': 'Magder S, Crit Care 2016',
  'bmi': 'WHO, 1995',
  'aa-gradient': 'Sorbini CA et al., Respiration 1968;25(1):3-13',
  'ckd-epi': 'Inker LA et al., NEJM 2021;385(19):1737-1749',
  'corrected-calcium': 'Payne RB et al., BMJ 1973;4(5893):643-6',
}

export function PrintView({ config }: Props) {
  const enabledCalculators = (config.enabledCalculators as string[]) ?? []
  const customFormulas = (config.customFormulas as CustomFormula[]) ?? []

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">Clinical Calculators</h3>
      <ul className="space-y-1 text-xs">
        {enabledCalculators.map((id) => (
          <li key={id}>
            <span className="font-medium">{BUILTIN_LABELS[id] ?? id}:</span>{' '}
            <span className="text-gray-400">—</span>{' '}
            <span className="italic text-gray-400">({CITATIONS[id]})</span>
          </li>
        ))}
        {customFormulas.map((f) => (
          <li key={f.id}>
            <span className="font-medium">{f.name}:</span>{' '}
            <span className="text-gray-400">—</span>{' '}
            <span className="italic text-gray-400">({f.citation})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 7: Implement plugin index**

```ts
// src/modules/calculated/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const calculatedPlugin: ModulePlugin = {
  meta: {
    id: 'calculated',
    name: 'Clinical Calculators',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Evidence-based clinical calculators with mandatory citations. Custom formula editor included.',
    tags: ['calculators', 'clinical', 'evidence-based'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    enabledCalculators: ['anion-gap', 'map', 'bmi'],
    customFormulas: [],
  },
  minSize: { w: 4, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default calculatedPlugin
```

- [ ] **Step 8: Run tests (expect passing)**

```bash
cd ~/projects/patient-templates && npx vitest run src/modules/calculated/
```

- [ ] **Step 9: Commit**

```bash
cd ~/projects/patient-templates
git add src/modules/calculated/
git commit -m "feat: add calculated (clinical calculators) module"
```

---

## Task 15: Complete Module Registration

**Files:**
- `src/modules/index.ts` (create/overwrite — registers all 14 modules)
- `src/main.tsx` (add module import)

**Prerequisites:** Plan 2a Task 7 complete (modules 1–7 registered). All Plan 2b tasks (8–14) complete.

- [ ] **Step 1: Write `src/modules/index.ts` registering all 14 modules**

```ts
// src/modules/index.ts
// Plan 2a modules (1–7)
import patientHeaderPlugin from './patient-header/index'
import vitalsPlugin from './vitals/index'
import labsPanelPlugin from './labs-panel/index'
import labsFishbonePlugin from './labs-fishbone/index'
import assessmentPlanPlugin from './assessment-plan/index'
import medicationsPlugin from './medications/index'
import intakeOutputPlugin from './intake-output/index'

// Plan 2b modules (8–14)
import linesTubesPlugin from './lines-tubes/index'
import taskChecklistPlugin from './task-checklist/index'
import freeTextPlugin from './free-text/index'
import consultsPlugin from './consults/index'
import nursingAssessmentPlugin from './nursing-assessment/index'
import customFieldsPlugin from './custom-fields/index'
import calculatedPlugin from './calculated/index'

import { pluginRegistry } from '../core/plugin/registry'

pluginRegistry.register(patientHeaderPlugin)
pluginRegistry.register(vitalsPlugin)
pluginRegistry.register(labsPanelPlugin)
pluginRegistry.register(labsFishbonePlugin)
pluginRegistry.register(assessmentPlanPlugin)
pluginRegistry.register(medicationsPlugin)
pluginRegistry.register(intakeOutputPlugin)
pluginRegistry.register(linesTubesPlugin)
pluginRegistry.register(taskChecklistPlugin)
pluginRegistry.register(freeTextPlugin)
pluginRegistry.register(consultsPlugin)
pluginRegistry.register(nursingAssessmentPlugin)
pluginRegistry.register(customFieldsPlugin)
pluginRegistry.register(calculatedPlugin)
```

- [ ] **Step 2: Add module import to `src/main.tsx`**

Open `src/main.tsx`. If `import './modules/index'` is not already present, add it after the last existing import line and before `ReactDOM.createRoot(...)`:

```ts
import './modules/index'
```

- [ ] **Step 3: Run the full test suite**

```bash
cd ~/projects/patient-templates && npx vitest run
```

All tests must pass. If any test fails:
1. Read the error output carefully
2. Fix the root cause in the production code (never modify a test to make it pass)
3. Re-run until all pass

- [ ] **Step 4: Start dev server and verify all 14 modules appear in Module Palette**

```bash
cd ~/projects/patient-templates && npm run dev
```

Open the app in a browser. Switch to Build Mode. Open the Module Palette sidebar. Confirm all 14 modules appear:

1. Patient Header
2. Vitals
3. Labs Panel
4. Labs Fishbone
5. Assessment & Plan
6. Medications
7. Intake & Output
8. Lines / Tubes / Drains
9. Task Checklist
10. Free Text / Notes
11. Consults & Results
12. Nursing Assessment
13. Custom Fields
14. Clinical Calculators

- [ ] **Step 5: Commit everything**

```bash
cd ~/projects/patient-templates
git add src/modules/index.ts src/main.tsx
git commit -m "feat: register all 14 core modules in plugin registry"
```

- [ ] **Step 6: Final verification commit**

```bash
cd ~/projects/patient-templates
git log --oneline -10
```

Confirm the git log shows commits for all 7 Plan 2b modules plus the registration commit. The app is ready for Plan 3 (advanced features).

---

## Summary

Plan 2b delivers the final 7 core modules of the patient template builder:

| Task | Module | Key Features |
|---|---|---|
| 8 | lines-tubes | Line/tube/drain table, days-in auto-calc, amber alert >N days |
| 9 | task-checklist | Checkbox list, role badges, urgent flags, hover-to-delete |
| 10 | free-text | Auto-resize textarea, configurable label/font/placeholder |
| 11 | consults | Active consults table + pending results list, expandable response rows |
| 12 | nursing-assessment | Accordion body systems, WNL/Abnormal/N/A buttons, Fall Risk + Pain scores |
| 13 | custom-fields | User-defined field builder: text/number/checkbox/dropdown/date |
| 14 | calculated | 6 evidence-based calculators with citations, custom formula editor with required citation |
| 15 | Registration | All 14 modules wired into plugin registry, dev-verified |

All modules follow the identical `ModulePlugin` interface from Plan 1. Clinical calculator formulas are exported as pure functions for isolated unit testing. The citation requirement in the custom formula editor enforces the Clinical Evidence Standard defined in the spec.
