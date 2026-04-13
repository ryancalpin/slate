# Patient Template Builder — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full app infrastructure — plugin system, grid canvas with Build/Live modes, template storage, app shell, PWA — so that modules (Plan 2) can be plugged in immediately.

**Architecture:** React + Vite SPA with a plugin-first architecture. The Plugin Registry holds all registered modules. The Canvas System renders module instances from a Template document stored in Dexie (IndexedDB). Build Mode enables drag/drop/resize via dnd-kit; Live Mode locks layout and enables fast data entry.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v3, dnd-kit, Dexie.js v4, Vitest, @testing-library/react, happy-dom, vite-plugin-pwa, react-router-dom v6

---

## File Map

```
patient-templates/
├── src/
│   ├── main.tsx                              — React entry, mounts App
│   ├── App.tsx                               — Router, global providers
│   ├── vite-env.d.ts                         — Vite type refs
│   ├── core/
│   │   ├── plugin/
│   │   │   ├── types.ts                      — ModulePlugin interface + all related types
│   │   │   ├── registry.ts                   — PluginRegistry singleton
│   │   │   └── registry.test.ts
│   │   ├── template/
│   │   │   ├── types.ts                      — Template, TemplatePage, PatientSlot, Snapshot types
│   │   │   └── utils.ts                      — createTemplate, createPage, createModuleInstance helpers
│   │   └── storage/
│   │       ├── db.ts                         — Dexie DB class (schema v1)
│   │       ├── templateStore.ts              — CRUD: list, get, save, delete, duplicate
│   │       └── templateStore.test.ts
│   ├── canvas/
│   │   ├── GridCanvas.tsx                    — Grid mode canvas (dnd-kit DndContext)
│   │   ├── GridCanvas.test.tsx
│   │   ├── CanvasModule.tsx                  — Module wrapper: drag handle, resize, lock badge, collapse
│   │   ├── CanvasModule.test.tsx
│   │   ├── ResizeHandle.tsx                  — Drag-to-resize corner/edge handle
│   │   └── canvasUtils.ts                    — px<->grid conversion, collision detection
│   ├── ui/
│   │   ├── shell/
│   │   │   ├── TopBar.tsx                    — Logo, tabs, mode badge, controls
│   │   │   ├── TabBar.tsx                    — Open template tabs (× to close)
│   │   │   └── ModulePalette.tsx             — Sidebar (desktop) / floating (tablet) module list
│   │   ├── views/
│   │   │   ├── HomeView.tsx                  — Template list + create/import/delete
│   │   │   └── CanvasView.tsx                — Wraps GridCanvas, owns Build/Live state
│   │   └── components/
│   │       ├── ModeToggle.tsx                — Build ↔ Live toggle button
│   │       └── ThemeToggle.tsx               — Dark/Light/System selector
│   ├── hooks/
│   │   ├── useTemplate.ts                    — Load/save template reactively
│   │   ├── useAppMode.ts                     — Build/Live mode state + keyboard shortcut
│   │   └── useTheme.ts                       — Dark/light mode preference
│   └── styles/
│       └── index.css                         — Tailwind directives
├── public/
│   ├── manifest.webmanifest                  — PWA manifest
│   └── icons/
│       ├── icon-192.png                      — PWA icon
│       └── icon-512.png                      — PWA icon
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── package.json
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/styles/index.css`

- [ ] **Step 1: Initialize Vite project**

```bash
cd ~/projects/patient-templates
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty. Remove existing files and continue?" — select **No, keep existing files** (the git repo and docs are already there).

- [ ] **Step 2: Install all dependencies**

```bash
npm install
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities \
  dexie \
  react-router-dom \
  tailwindcss postcss autoprefixer \
  @tailwindcss/forms \
  clsx
npm install -D \
  vitest \
  @vitest/coverage-v8 \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  happy-dom \
  vite-plugin-pwa \
  @types/react \
  @types/react-dom
```

- [ ] **Step 3: Initialize Tailwind**

```bash
npx tailwindcss init -p
```

- [ ] **Step 4: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          raised: 'rgb(var(--color-surface-raised) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config
```

- [ ] **Step 5: Write `src/styles/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-surface: 15 15 26;
    --color-surface-raised: 22 33 62;
    --color-accent: 76 201 240;
  }

  html {
    @apply bg-[rgb(var(--color-surface))] text-gray-100;
  }

  .dark {
    --color-surface: 15 15 26;
    --color-surface-raised: 22 33 62;
    --color-accent: 76 201 240;
  }

  html:not(.dark) {
    --color-surface: 248 250 252;
    --color-surface-raised: 255 255 255;
    --color-accent: 14 116 144;
    @apply text-gray-900;
  }
}
```

- [ ] **Step 6: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Patient Template Builder',
        short_name: 'PatientTemplates',
        description: 'Customizable inpatient clinical templates',
        theme_color: '#0f0f1a',
        background_color: '#0f0f1a',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 7: Write `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Patient Template Builder</title>
    <link rel="manifest" href="/manifest.webmanifest" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Write `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 10: Write `src/App.tsx` (stub — routes added in Task 6)**

```tsx
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-[rgb(var(--color-surface))]">
      <Routes>
        <Route path="/" element={<div className="p-8 text-accent-DEFAULT">Patient Template Builder — scaffold OK</div>} />
      </Routes>
    </div>
  )
}
```

- [ ] **Step 11: Add placeholder PWA icons**

```bash
mkdir -p public/icons
# Placeholder 192px icon (replace with real icon later)
curl -o public/icons/icon-192.png "https://placehold.co/192x192/0f0f1a/4cc9f0.png?text=PT"
curl -o public/icons/icon-512.png "https://placehold.co/512x512/0f0f1a/4cc9f0.png?text=PT"
```

- [ ] **Step 12: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite prints a localhost URL. Open it. See "Patient Template Builder — scaffold OK" in the accent color on a dark background.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + Tailwind + dnd-kit + Dexie + Vitest + PWA"
```

---

### Task 2: Core Types

**Files:**
- Create: `src/core/plugin/types.ts`
- Create: `src/core/template/types.ts`
- Create: `src/core/template/utils.ts`

- [ ] **Step 1: Write `src/core/plugin/types.ts`**

```ts
import type { FC } from 'react'

export interface ModulePluginMeta {
  id: string           // unique, e.g. "vitals", "labs-fishbone"
  name: string         // display name, e.g. "Vitals"
  version: string      // semver, e.g. "1.0.0"
  author: string
  description: string
  tags: string[]       // e.g. ["nursing", "labs", "critical-care"]
  pack?: string        // specialty pack id if part of a pack
}

export interface ModuleSize {
  w: number            // grid columns
  h: number            // grid rows
}

export interface ModulePosition extends ModuleSize {
  x: number
  y: number
}

// Props passed to Renderer and Editor components
export interface ModuleRenderProps {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export interface ModuleEditorProps {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export interface ModulePrintProps {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export interface ModulePlugin {
  meta: ModulePluginMeta
  schema: {
    config: Record<string, unknown>   // JSON Schema object for config fields
    data: Record<string, unknown>     // JSON Schema object for data fields
  }
  defaultConfig: Record<string, unknown>
  minSize: ModuleSize
  Renderer: FC<ModuleRenderProps>
  Editor: FC<ModuleEditorProps>
  PrintView: FC<ModulePrintProps>
}
```

- [ ] **Step 2: Write `src/core/template/types.ts`**

```ts
export type CanvasMode = 'grid' | 'freeform' | 'sections'
export type PatientMode = 'single' | 'roster'
export type AppMode = 'build' | 'live'

export interface ModulePosition {
  x: number
  y: number
  w: number
  h: number
}

export interface ModuleInstance {
  instanceId: string
  moduleId: string
  version: string
  packId?: string
  position: ModulePosition
  config: Record<string, unknown>
  locked: boolean
  collapsed: boolean
}

export interface TemplatePage {
  id: string
  name: string
  canvasMode?: CanvasMode   // overrides template-level canvasMode if set
  layout: ModuleInstance[]
}

export interface PatientSlot {
  id: string
  label: string             // e.g. "Bed 4", "JD"
  room: string
  admitDate: string         // ISO date YYYY-MM-DD
  notes: string
  // data keyed by instanceId, then field name
  data: Record<string, Record<string, unknown>>
}

export interface SnapshotPage {
  pageId: string
  data: Record<string, Record<string, unknown>>
}

export interface Snapshot {
  date: string              // ISO date YYYY-MM-DD
  slotId?: string           // undefined in single mode
  pages: SnapshotPage[]
}

export interface Template {
  id: string
  name: string
  canvasMode: CanvasMode
  patientMode: PatientMode
  defaultMode: AppMode
  createdAt: string         // ISO timestamp
  updatedAt: string         // ISO timestamp
  pages: TemplatePage[]
  patientSlots: PatientSlot[]   // empty for single mode
  singleData: Record<string, Record<string, unknown>>   // single mode data
  snapshots: Snapshot[]
}
```

- [ ] **Step 3: Write `src/core/template/utils.ts`**

```ts
import { v4 as uuid } from 'uuid'
import type {
  Template, TemplatePage, ModuleInstance, PatientSlot,
  CanvasMode, PatientMode, AppMode, ModulePosition,
} from './types'

export function createTemplate(
  name: string,
  canvasMode: CanvasMode = 'grid',
  patientMode: PatientMode = 'single',
  defaultMode: AppMode = 'build',
): Template {
  const now = new Date().toISOString()
  return {
    id: uuid(),
    name,
    canvasMode,
    patientMode,
    defaultMode,
    createdAt: now,
    updatedAt: now,
    pages: [createPage('Page 1')],
    patientSlots: [],
    singleData: {},
    snapshots: [],
  }
}

export function createPage(name: string, canvasMode?: CanvasMode): TemplatePage {
  return {
    id: uuid(),
    name,
    canvasMode,
    layout: [],
  }
}

export function createModuleInstance(
  moduleId: string,
  version: string,
  position: ModulePosition,
  config: Record<string, unknown> = {},
  packId?: string,
): ModuleInstance {
  return {
    instanceId: uuid(),
    moduleId,
    version,
    packId,
    position,
    config,
    locked: false,
    collapsed: false,
  }
}

export function createPatientSlot(label: string, room = ''): PatientSlot {
  return {
    id: uuid(),
    label,
    room,
    admitDate: new Date().toISOString().split('T')[0],
    notes: '',
    data: {},
  }
}

export function touchTemplate(template: Template): Template {
  return { ...template, updatedAt: new Date().toISOString() }
}
```

- [ ] **Step 4: Install uuid**

```bash
npm install uuid
npm install -D @types/uuid
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/core/
git commit -m "feat: add core plugin interface and template types"
```

---

### Task 3: Plugin Registry

**Files:**
- Create: `src/core/plugin/registry.ts`
- Create: `src/core/plugin/registry.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/core/plugin/registry.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { PluginRegistry } from './registry'
import type { ModulePlugin } from './types'

function makeMockPlugin(id: string): ModulePlugin {
  return {
    meta: { id, name: id, version: '1.0.0', author: 'test', description: '', tags: [] },
    schema: { config: {}, data: {} },
    defaultConfig: {},
    minSize: { w: 2, h: 2 },
    Renderer: () => null,
    Editor: () => null,
    PrintView: () => null,
  }
}

describe('PluginRegistry', () => {
  let registry: PluginRegistry

  beforeEach(() => {
    registry = new PluginRegistry()
  })

  it('registers a plugin and retrieves it by id', () => {
    const plugin = makeMockPlugin('vitals')
    registry.register(plugin)
    expect(registry.get('vitals')).toBe(plugin)
  })

  it('returns undefined for unknown plugin id', () => {
    expect(registry.get('nonexistent')).toBeUndefined()
  })

  it('lists all registered plugins', () => {
    registry.register(makeMockPlugin('vitals'))
    registry.register(makeMockPlugin('labs-panel'))
    expect(registry.list()).toHaveLength(2)
  })

  it('throws if a duplicate id is registered', () => {
    registry.register(makeMockPlugin('vitals'))
    expect(() => registry.register(makeMockPlugin('vitals'))).toThrow('already registered')
  })

  it('filters plugins by tag', () => {
    const plugin = { ...makeMockPlugin('nursing-assessment'), meta: { ...makeMockPlugin('nursing-assessment').meta, tags: ['nursing'] } }
    registry.register(plugin)
    registry.register(makeMockPlugin('vitals'))
    expect(registry.listByTag('nursing')).toHaveLength(1)
    expect(registry.listByTag('nursing')[0].meta.id).toBe('nursing-assessment')
  })

  it('filters plugins by pack', () => {
    const cardioPlugin = { ...makeMockPlugin('gdmt'), meta: { ...makeMockPlugin('gdmt').meta, pack: 'cardiology' } }
    registry.register(cardioPlugin)
    registry.register(makeMockPlugin('vitals'))
    expect(registry.listByPack('cardiology')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/core/plugin/registry.test.ts
```

Expected: FAIL — `registry.ts` does not exist.

- [ ] **Step 3: Write `src/core/plugin/registry.ts`**

```ts
import type { ModulePlugin } from './types'

export class PluginRegistry {
  private plugins = new Map<string, ModulePlugin>()

  register(plugin: ModulePlugin): void {
    if (this.plugins.has(plugin.meta.id)) {
      throw new Error(`Plugin "${plugin.meta.id}" already registered`)
    }
    this.plugins.set(plugin.meta.id, plugin)
  }

  get(id: string): ModulePlugin | undefined {
    return this.plugins.get(id)
  }

  list(): ModulePlugin[] {
    return Array.from(this.plugins.values())
  }

  listByTag(tag: string): ModulePlugin[] {
    return this.list().filter(p => p.meta.tags.includes(tag))
  }

  listByPack(packId: string): ModulePlugin[] {
    return this.list().filter(p => p.meta.pack === packId)
  }
}

// Global singleton — imported by Canvas and ModulePalette
export const pluginRegistry = new PluginRegistry()
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/core/plugin/registry.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/plugin/
git commit -m "feat: add PluginRegistry with tag and pack filtering"
```

---

### Task 4: Dexie Storage + Template CRUD

**Files:**
- Create: `src/core/storage/db.ts`
- Create: `src/core/storage/templateStore.ts`
- Create: `src/core/storage/templateStore.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/core/storage/templateStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { templateStore } from './templateStore'
import { createTemplate } from '../template/utils'

// Dexie uses IndexedDB — happy-dom provides a compatible implementation
beforeEach(async () => {
  await templateStore.clear()
})

describe('templateStore', () => {
  it('saves and retrieves a template by id', async () => {
    const t = createTemplate('ICU Rounding')
    await templateStore.save(t)
    const retrieved = await templateStore.get(t.id)
    expect(retrieved?.name).toBe('ICU Rounding')
  })

  it('lists all saved templates', async () => {
    await templateStore.save(createTemplate('Template A'))
    await templateStore.save(createTemplate('Template B'))
    const all = await templateStore.list()
    expect(all).toHaveLength(2)
  })

  it('deletes a template by id', async () => {
    const t = createTemplate('Delete Me')
    await templateStore.save(t)
    await templateStore.delete(t.id)
    const retrieved = await templateStore.get(t.id)
    expect(retrieved).toBeUndefined()
  })

  it('duplicates a template with a new id and name suffix', async () => {
    const t = createTemplate('Original')
    await templateStore.save(t)
    const copy = await templateStore.duplicate(t.id)
    expect(copy.id).not.toBe(t.id)
    expect(copy.name).toBe('Original (copy)')
    const all = await templateStore.list()
    expect(all).toHaveLength(2)
  })

  it('updates an existing template', async () => {
    const t = createTemplate('Old Name')
    await templateStore.save(t)
    await templateStore.save({ ...t, name: 'New Name' })
    const retrieved = await templateStore.get(t.id)
    expect(retrieved?.name).toBe('New Name')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/core/storage/templateStore.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/core/storage/db.ts`**

```ts
import Dexie, { type Table } from 'dexie'
import type { Template } from '../template/types'

export class PatientTemplateDB extends Dexie {
  templates!: Table<Template, string>

  constructor() {
    super('PatientTemplateDB')
    this.version(1).stores({
      templates: 'id, name, updatedAt, patientMode',
    })
  }
}

export const db = new PatientTemplateDB()
```

- [ ] **Step 4: Write `src/core/storage/templateStore.ts`**

```ts
import { v4 as uuid } from 'uuid'
import { db } from './db'
import type { Template } from '../template/types'

export const templateStore = {
  async save(template: Template): Promise<void> {
    await db.templates.put(template)
  },

  async get(id: string): Promise<Template | undefined> {
    return db.templates.get(id)
  },

  async list(): Promise<Template[]> {
    return db.templates.orderBy('updatedAt').reverse().toArray()
  },

  async delete(id: string): Promise<void> {
    await db.templates.delete(id)
  },

  async duplicate(id: string): Promise<Template> {
    const original = await db.templates.get(id)
    if (!original) throw new Error(`Template ${id} not found`)
    const now = new Date().toISOString()
    const copy: Template = {
      ...original,
      id: uuid(),
      name: `${original.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    }
    await db.templates.put(copy)
    return copy
  },

  async clear(): Promise<void> {
    await db.templates.clear()
  },
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/core/storage/templateStore.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/core/storage/
git commit -m "feat: add Dexie storage and templateStore CRUD"
```

---

### Task 5: useTemplate and useAppMode Hooks

**Files:**
- Create: `src/hooks/useTemplate.ts`
- Create: `src/hooks/useAppMode.ts`
- Create: `src/hooks/useTheme.ts`

- [ ] **Step 1: Write `src/hooks/useTemplate.ts`**

```ts
import { useState, useEffect, useCallback } from 'react'
import { templateStore } from '../core/storage/templateStore'
import { touchTemplate } from '../core/template/utils'
import type { Template } from '../core/template/types'

export function useTemplate(id: string | null) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) { setTemplate(null); return }
    setLoading(true)
    templateStore.get(id).then(t => {
      setTemplate(t ?? null)
      setLoading(false)
    })
  }, [id])

  const saveTemplate = useCallback(async (updated: Template) => {
    const stamped = touchTemplate(updated)
    await templateStore.save(stamped)
    setTemplate(stamped)
  }, [])

  return { template, loading, saveTemplate }
}
```

- [ ] **Step 2: Write `src/hooks/useAppMode.ts`**

```ts
import { useState, useEffect } from 'react'
import type { AppMode } from '../core/template/types'

export function useAppMode(initial: AppMode = 'build') {
  const [mode, setMode] = useState<AppMode>(initial)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Toggle Build/Live with 'b' key when no input is focused
      if (e.key === 'b' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setMode(m => m === 'build' ? 'live' : 'build')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { mode, setMode }
}
```

- [ ] **Step 3: Write `src/hooks/useTheme.ts`**

```ts
import { useState, useEffect } from 'react'

export type Theme = 'dark' | 'light' | 'system'

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) ?? 'dark'
  })

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Re-apply on system preference change when using 'system' mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return { theme, setTheme }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useTemplate, useAppMode, useTheme hooks"
```

---

### Task 6: App Shell — TopBar, Routing, ThemeToggle, ModeToggle

**Files:**
- Create: `src/ui/shell/TopBar.tsx`
- Create: `src/ui/components/ModeToggle.tsx`
- Create: `src/ui/components/ThemeToggle.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write `src/ui/components/ThemeToggle.tsx`**

```tsx
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
```

- [ ] **Step 2: Write `src/ui/components/ModeToggle.tsx`**

```tsx
import type { AppMode } from '../../core/template/types'

interface Props {
  mode: AppMode
  onToggle: () => void
}

export function ModeToggle({ mode, onToggle }: Props) {
  const isBuild = mode === 'build'
  return (
    <button
      onClick={onToggle}
      title="Toggle Build/Live mode (B)"
      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
        isBuild
          ? 'bg-violet-800 text-violet-200 hover:bg-violet-700'
          : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'
      }`}
    >
      {isBuild ? '🔧 Build' : '🟢 Live'}
    </button>
  )
}
```

- [ ] **Step 3: Write `src/ui/shell/TopBar.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { ModeToggle } from '../components/ModeToggle'
import { ThemeToggle } from '../components/ThemeToggle'
import type { AppMode } from '../../core/template/types'

interface Props {
  mode: AppMode
  onModeToggle: () => void
}

export function TopBar({ mode, onModeToggle }: Props) {
  return (
    <header className="flex items-center justify-between px-4 h-12 border-b border-gray-800 bg-[rgb(var(--color-surface-raised))] shrink-0">
      <Link to="/" className="text-accent-DEFAULT font-bold text-sm tracking-wide select-none">
        PatientTemplates
      </Link>
      <div className="flex items-center gap-3">
        <ModeToggle mode={mode} onToggle={onModeToggle} />
        <ThemeToggle />
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Rewrite `src/App.tsx` with shell and routing**

```tsx
import { useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { TopBar } from './ui/shell/TopBar'
import { HomeView } from './ui/views/HomeView'
import { CanvasView } from './ui/views/CanvasView'
import { useAppMode } from './hooks/useAppMode'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { mode, setMode } = useAppMode('build')
  useTheme() // initializes theme from localStorage and applies dark/light class on mount

  const handleModeToggle = useCallback(
    () => setMode(m => m === 'build' ? 'live' : 'build'),
    [setMode],
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar mode={mode} onModeToggle={handleModeToggle} />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/template/:id" element={<CanvasView mode={mode} />} />
        </Routes>
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Create stub views (fleshed out in later tasks)**

```tsx
// src/ui/views/HomeView.tsx
export function HomeView() {
  return <div className="p-8 text-gray-400">Home — template list coming in Task 7</div>
}
```

```tsx
// src/ui/views/CanvasView.tsx
import type { AppMode } from '../../core/template/types'
interface Props { mode: AppMode }
export function CanvasView({ mode }: Props) {
  return <div className="p-8 text-gray-400">Canvas — mode: {mode} — coming in Task 8</div>
}
```

- [ ] **Step 6: Verify dev server renders shell**

```bash
npm run dev
```

Open the URL. Expected: Dark background, "PatientTemplates" link top-left, Build/Live toggle top-right, theme selector top-right. Pressing `B` should toggle the mode badge.

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add app shell, TopBar, ModeToggle, ThemeToggle, routing"
```

---

### Task 7: Home View — Template List + Create/Delete

**Files:**
- Modify: `src/ui/views/HomeView.tsx`

- [ ] **Step 1: Rewrite `src/ui/views/HomeView.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { templateStore } from '../../core/storage/templateStore'
import { createTemplate } from '../../core/template/utils'
import type { Template } from '../../core/template/types'

export function HomeView() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  // useCallback so refresh is stable and safe in useEffect deps
  const refresh = useCallback(async () => {
    setTemplates(await templateStore.list())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const t = createTemplate(newName.trim())
    await templateStore.save(t)
    setCreating(false)
    setNewName('')
    navigate(`/template/${t.id}`)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await templateStore.delete(id)
    refresh()
  }

  const handleDuplicate = async (id: string) => {
    await templateStore.duplicate(id)
    refresh()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">My Templates</h1>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-accent-DEFAULT text-gray-900 rounded text-sm font-semibold hover:opacity-90"
        >
          + New Template
        </button>
      </div>

      {creating && (
        <div className="mb-4 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
            placeholder="Template name…"
            className="flex-1 px-3 py-2 bg-[rgb(var(--color-surface-raised))] border border-gray-700 rounded text-sm text-gray-100 placeholder-gray-500"
          />
          <button onClick={handleCreate} className="px-4 py-2 bg-accent-DEFAULT text-gray-900 rounded text-sm font-semibold">
            Create
          </button>
          <button onClick={() => setCreating(false)} className="px-4 py-2 text-gray-400 text-sm">
            Cancel
          </button>
        </div>
      )}

      {templates.length === 0 && !creating && (
        <p className="text-gray-500 text-sm">No templates yet. Create one to get started.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <div
            key={t.id}
            className="bg-[rgb(var(--color-surface-raised))] border border-gray-800 rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:border-gray-600 transition-colors"
            onClick={() => navigate(`/template/${t.id}`)}
          >
            <div className="font-medium text-gray-100 text-sm">{t.name}</div>
            <div className="text-xs text-gray-500">
              {t.pages.length} page{t.pages.length !== 1 ? 's' : ''} ·{' '}
              {t.patientMode === 'roster' ? 'Roster' : 'Single'} ·{' '}
              {t.canvasMode}
            </div>
            <div className="text-xs text-gray-600">
              Updated {new Date(t.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => handleDuplicate(t.id)}
                className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-800"
              >
                Duplicate
              </button>
              <button
                onClick={() => handleDelete(t.id, t.name)}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-800 ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify manually**

```bash
npm run dev
```

Open the app. Create a template named "ICU Rounding". Expected: card appears in the grid. Click it — navigates to `/template/<id>`. Return home. Duplicate it. Delete the copy.

- [ ] **Step 3: Commit**

```bash
git add src/ui/views/HomeView.tsx
git commit -m "feat: add Home view with template list, create, duplicate, delete"
```

---

### Task 8: Grid Canvas — Build Mode (dnd-kit)

**Files:**
- Create: `src/canvas/canvasUtils.ts`
- Create: `src/canvas/GridCanvas.tsx`
- Create: `src/canvas/GridCanvas.test.tsx`
- Create: `src/canvas/CanvasModule.tsx`

- [ ] **Step 1: Write `src/canvas/canvasUtils.ts`**

```ts
import type { CSSProperties } from 'react'
import type { ModulePosition } from '../core/template/types'

export const GRID_COL_WIDTH = 80   // pixels per grid column
export const GRID_ROW_HEIGHT = 60  // pixels per grid row
export const GRID_COLS = 12
export const GRID_GAP = 8

export function gridToPixel(pos: ModulePosition): CSSProperties {
  return {
    position: 'absolute',
    left: pos.x * (GRID_COL_WIDTH + GRID_GAP),
    top: pos.y * (GRID_ROW_HEIGHT + GRID_GAP),
    width: pos.w * GRID_COL_WIDTH + (pos.w - 1) * GRID_GAP,
    height: pos.h * GRID_ROW_HEIGHT + (pos.h - 1) * GRID_GAP,
  }
}

export function pixelToGrid(
  pixelX: number,
  pixelY: number,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.round(pixelX / (GRID_COL_WIDTH + GRID_GAP))),
    y: Math.max(0, Math.round(pixelY / (GRID_ROW_HEIGHT + GRID_GAP))),
  }
}

export function clampToGrid(pos: ModulePosition): ModulePosition {
  return {
    ...pos,
    x: Math.max(0, Math.min(pos.x, GRID_COLS - pos.w)),
    y: Math.max(0, pos.y),
  }
}
```

- [ ] **Step 2: Write `src/canvas/CanvasModule.tsx`**

```tsx
import { useState, type CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { gridToPixel } from './canvasUtils'
import { pluginRegistry } from '../core/plugin/registry'
import type { ModuleInstance, AppMode } from '../core/template/types'

interface Props {
  instance: ModuleInstance
  mode: AppMode
  data: Record<string, unknown>
  onDataChange: (instanceId: string, data: Record<string, unknown>) => void
  onConfigChange: (instanceId: string, config: Record<string, unknown>) => void
  onToggleLock: (instanceId: string) => void
  onToggleCollapse: (instanceId: string) => void
  onRemove: (instanceId: string) => void
}

export function CanvasModule({
  instance, mode, data, onDataChange, onConfigChange,
  onToggleLock, onToggleCollapse, onRemove,
}: Props) {
  // All hooks must be called before any early return (Rules of Hooks)
  const [showEditor, setShowEditor] = useState(false)
  const plugin = pluginRegistry.get(instance.moduleId)
  const isDraggable = mode === 'build' && !instance.locked

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: instance.instanceId,
    disabled: !isDraggable,
  })

  const style: CSSProperties = {
    ...gridToPixel(instance.position),
    ...(transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : {}),
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    transition: isDragging ? 'none' : 'box-shadow 0.15s',
  }

  if (!plugin) {
    return (
      <div style={style} className="absolute bg-red-900 border border-red-700 rounded p-2 text-xs text-red-300">
        Unknown module: {instance.moduleId}
      </div>
    )
  }

  const { Renderer, Editor } = plugin

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute flex flex-col bg-[rgb(var(--color-surface-raised))] border rounded overflow-hidden ${
        isDragging ? 'shadow-2xl border-accent-DEFAULT' : 'border-gray-800 hover:border-gray-600'
      } ${instance.locked ? 'border-yellow-800' : ''}`}
    >
      {/* Module header */}
      <div
        className="flex items-center justify-between px-2 py-1 bg-black/20 shrink-0 select-none"
        {...(isDraggable ? { ...attributes, ...listeners, style: { cursor: 'grab' } } : {})}
      >
        <span className="text-xs font-semibold text-accent-DEFAULT truncate">{plugin.meta.name.toUpperCase()}</span>
        {mode === 'build' ? (
          <div className="flex gap-1 ml-2 shrink-0">
            <button onClick={() => setShowEditor(v => !v)} title="Configure" className="text-gray-500 hover:text-gray-300 text-xs px-1">⚙️</button>
            <button onClick={() => onToggleLock(instance.instanceId)} title={instance.locked ? 'Unlock' : 'Lock'} className="text-gray-500 hover:text-gray-300 text-xs px-1">
              {instance.locked ? '🔒' : '🔓'}
            </button>
            <button onClick={() => onToggleCollapse(instance.instanceId)} title="Collapse" className="text-gray-500 hover:text-gray-300 text-xs px-1">
              {instance.collapsed ? '▼' : '▲'}
            </button>
            <button onClick={() => onRemove(instance.instanceId)} title="Remove" className="text-gray-500 hover:text-red-400 text-xs px-1">✕</button>
          </div>
        ) : (
          <button onClick={() => onToggleCollapse(instance.instanceId)} className="text-gray-600 hover:text-gray-400 text-xs px-1">
            {instance.collapsed ? '▼' : '▲'}
          </button>
        )}
      </div>

      {/* Module body */}
      {!instance.collapsed && (
        <div className="flex-1 overflow-auto p-2">
          {showEditor && mode === 'build' ? (
            <Editor
              config={instance.config}
              onConfigChange={cfg => { onConfigChange(instance.instanceId, cfg); setShowEditor(false) }}
            />
          ) : (
            <Renderer
              instanceId={instance.instanceId}
              config={instance.config}
              data={data}
              onDataChange={d => onDataChange(instance.instanceId, d)}
              mode={mode}
            />
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/canvas/GridCanvas.tsx`**

```tsx
import React, { useRef } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CanvasModule } from './CanvasModule'
import { pixelToGrid, clampToGrid, GRID_ROW_HEIGHT, GRID_COL_WIDTH, GRID_GAP } from './canvasUtils'
import type { TemplatePage, ModuleInstance, AppMode } from '../core/template/types'

interface Props {
  page: TemplatePage
  mode: AppMode
  data: Record<string, Record<string, unknown>>   // instanceId -> data
  onPageChange: (page: TemplatePage) => void
  onDataChange: (instanceId: string, data: Record<string, unknown>) => void
}

export function GridCanvas({ page, mode, data, onPageChange, onDataChange }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const updateLayout = (updater: (layout: ModuleInstance[]) => ModuleInstance[]) => {
    onPageChange({ ...page, layout: updater(page.layout) })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    if (!delta) return

    updateLayout(layout =>
      layout.map(inst => {
        if (inst.instanceId !== active.id || inst.locked) return inst
        const deltaGridX = Math.round(delta.x / (GRID_COL_WIDTH + GRID_GAP))
        const deltaGridY = Math.round(delta.y / (GRID_ROW_HEIGHT + GRID_GAP))
        return {
          ...inst,
          position: clampToGrid({
            ...inst.position,
            x: inst.position.x + deltaGridX,
            y: inst.position.y + deltaGridY,
          }),
        }
      })
    )
  }

  const handleToggleLock = (instanceId: string) => {
    updateLayout(layout =>
      layout.map(inst =>
        inst.instanceId === instanceId ? { ...inst, locked: !inst.locked } : inst
      )
    )
  }

  const handleToggleCollapse = (instanceId: string) => {
    updateLayout(layout =>
      layout.map(inst =>
        inst.instanceId === instanceId ? { ...inst, collapsed: !inst.collapsed } : inst
      )
    )
  }

  const handleRemove = (instanceId: string) => {
    updateLayout(layout => layout.filter(inst => inst.instanceId !== instanceId))
  }

  const handleConfigChange = (instanceId: string, config: Record<string, unknown>) => {
    updateLayout(layout =>
      layout.map(inst =>
        inst.instanceId === instanceId ? { ...inst, config } : inst
      )
    )
  }

  // Canvas height: enough to fit all modules plus scrolling room
  const maxBottom = page.layout.reduce(
    (max, inst) => Math.max(max, inst.position.y + inst.position.h),
    0
  )
  const canvasHeight = Math.max(600, (maxBottom + 4) * (GRID_ROW_HEIGHT + GRID_GAP))

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        ref={canvasRef}
        className="relative w-full overflow-auto"
        style={{ height: canvasHeight }}
      >
        {page.layout.map(instance => (
          <CanvasModule
            key={instance.instanceId}
            instance={instance}
            mode={mode}
            data={data[instance.instanceId] ?? {}}
            onDataChange={onDataChange}
            onConfigChange={handleConfigChange}
            onToggleLock={handleToggleLock}
            onToggleCollapse={handleToggleCollapse}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </DndContext>
  )
}
```

- [ ] **Step 4: Write `src/canvas/GridCanvas.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GridCanvas } from './GridCanvas'
import { pluginRegistry } from '../core/plugin/registry'
import { createPage, createModuleInstance } from '../core/template/utils'
import type { ModulePlugin } from '../core/plugin/types'

const mockPlugin: ModulePlugin = {
  meta: { id: 'test-module', name: 'Test Module', version: '1.0.0', author: 'test', description: '', tags: [] },
  schema: { config: {}, data: {} },
  defaultConfig: {},
  minSize: { w: 2, h: 2 },
  Renderer: ({ data }) => <div data-testid="renderer">rendered: {JSON.stringify(data)}</div>,
  Editor: () => <div>editor</div>,
  PrintView: () => <div>print</div>,
}

// Register once
if (!pluginRegistry.get('test-module')) pluginRegistry.register(mockPlugin)

describe('GridCanvas', () => {
  it('renders module instances on the canvas', () => {
    const instance = createModuleInstance('test-module', '1.0.0', { x: 0, y: 0, w: 4, h: 3 })
    const page = createPage('Test Page')
    page.layout = [instance]

    render(
      <GridCanvas
        page={page}
        mode="live"
        data={{}}
        onPageChange={vi.fn()}
        onDataChange={vi.fn()}
      />
    )

    expect(screen.getByTestId('renderer')).toBeInTheDocument()
  })

  it('shows module name in header', () => {
    const instance = createModuleInstance('test-module', '1.0.0', { x: 0, y: 0, w: 4, h: 3 })
    const page = createPage('Test Page')
    page.layout = [instance]

    render(
      <GridCanvas
        page={page}
        mode="build"
        data={{}}
        onPageChange={vi.fn()}
        onDataChange={vi.fn()}
      />
    )

    expect(screen.getByText('TEST MODULE')).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run canvas tests**

```bash
npx vitest run src/canvas/
```

Expected: Both tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/canvas/
git commit -m "feat: add GridCanvas with dnd-kit drag/drop and CanvasModule wrapper"
```

---

### Task 9: CanvasView — Wire Canvas to Template Store

**Files:**
- Modify: `src/ui/views/CanvasView.tsx`

- [ ] **Step 1: Rewrite `src/ui/views/CanvasView.tsx`**

```tsx
import { useParams } from 'react-router-dom'
import { useTemplate } from '../../hooks/useTemplate'
import { GridCanvas } from '../../canvas/GridCanvas'
import { ModulePalette } from '../shell/ModulePalette'
import type { AppMode, TemplatePage } from '../../core/template/types'

interface Props { mode: AppMode }

export function CanvasView({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const { template, loading, saveTemplate } = useTemplate(id ?? null)

  if (loading) return <div className="p-8 text-gray-500 text-sm">Loading…</div>
  if (!template) return <div className="p-8 text-gray-500 text-sm">Template not found.</div>

  // Always show first page for now (multi-page in Plan 3)
  const page = template.pages[0]
  const data = template.singleData

  const handlePageChange = async (updated: TemplatePage) => {
    const updatedTemplate = {
      ...template,
      pages: template.pages.map(p => p.id === updated.id ? updated : p),
    }
    await saveTemplate(updatedTemplate)
  }

  const handleDataChange = async (instanceId: string, fieldData: Record<string, unknown>) => {
    const updatedData = { ...data, [instanceId]: fieldData }
    await saveTemplate({ ...template, singleData: updatedData })
  }

  const handleAddModule = async (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => {
    const { createModuleInstance } = await import('../../core/template/utils')
    // Place new modules at the top-left with a small offset based on count
    const offset = page.layout.length
    const instance = createModuleInstance(moduleId, version, {
      x: (offset * 2) % 10,
      y: Math.floor(offset / 5) * 4,
      w: 4,
      h: 3,
    }, defaultConfig)
    await handlePageChange({ ...page, layout: [...page.layout, instance] })
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <GridCanvas
          page={page}
          mode={mode}
          data={data}
          onPageChange={handlePageChange}
          onDataChange={handleDataChange}
        />
      </div>
      {mode === 'build' && (
        <ModulePalette onAddModule={handleAddModule} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write `src/ui/shell/ModulePalette.tsx`**

```tsx
import { pluginRegistry } from '../../core/plugin/registry'
import type { ModulePlugin } from '../../core/plugin/types'

interface Props {
  onAddModule: (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => void
}

export function ModulePalette({ onAddModule }: Props) {
  const plugins = pluginRegistry.list()

  // Group by pack, ungrouped modules under "Core"
  const groups = plugins.reduce<Record<string, ModulePlugin[]>>((acc, p) => {
    const key = p.meta.pack ?? 'Core'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <aside className="w-56 border-l border-gray-800 bg-[rgb(var(--color-surface-raised))] flex flex-col overflow-hidden shrink-0">
      <div className="px-3 py-2 border-b border-gray-800 text-xs font-semibold text-accent-DEFAULT uppercase tracking-wide">
        Modules
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {Object.entries(groups).map(([groupName, groupPlugins]) => (
          <div key={groupName} className="mb-3">
            <div className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wide">{groupName}</div>
            {groupPlugins.map(plugin => (
              <button
                key={plugin.meta.id}
                onClick={() => onAddModule(plugin.meta.id, plugin.meta.version, plugin.defaultConfig)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors"
              >
                {plugin.meta.name}
              </button>
            ))}
          </div>
        ))}
        {plugins.length === 0 && (
          <p className="px-3 text-xs text-gray-600">No modules registered yet.</p>
        )}
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Verify end-to-end manually**

```bash
npm run dev
```

1. Create a template from Home
2. Navigate to the canvas — see empty canvas with "Modules" sidebar on the right in Build mode
3. Press `B` — sidebar disappears (Live mode)
4. Press `B` — sidebar returns (Build mode)

- [ ] **Step 4: Commit**

```bash
git add src/ui/
git commit -m "feat: wire CanvasView to template store, add ModulePalette sidebar"
```

---

### Task 10: Module Resize Handles

**Files:**
- Create: `src/canvas/ResizeHandle.tsx`
- Modify: `src/canvas/CanvasModule.tsx`

- [ ] **Step 1: Write `src/canvas/ResizeHandle.tsx`**

```tsx
import { useRef } from 'react'
import { GRID_COL_WIDTH, GRID_ROW_HEIGHT, GRID_GAP } from './canvasUtils'
import type { ModulePosition } from '../core/template/types'

interface Props {
  position: ModulePosition
  minW?: number
  minH?: number
  onResize: (pos: ModulePosition) => void
}

export function ResizeHandle({ position, minW = 2, minH = 2, onResize }: Props) {
  const startRef = useRef<{ mouseX: number; mouseY: number; pos: ModulePosition } | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startRef.current = { mouseX: e.clientX, mouseY: e.clientY, pos: { ...position } }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!startRef.current) return
      const { mouseX, mouseY, pos } = startRef.current
      const dx = moveEvent.clientX - mouseX
      const dy = moveEvent.clientY - mouseY
      const newW = Math.max(minW, pos.w + Math.round(dx / (GRID_COL_WIDTH + GRID_GAP)))
      const newH = Math.max(minH, pos.h + Math.round(dy / (GRID_ROW_HEIGHT + GRID_GAP)))
      if (newW !== pos.w || newH !== pos.h) {
        onResize({ ...pos, w: newW, h: newH })
      }
    }

    const handleMouseUp = () => {
      startRef.current = null
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 group-hover:opacity-50 transition-opacity"
      title="Drag to resize"
    >
      <svg viewBox="0 0 16 16" className="w-full h-full text-gray-500">
        <path d="M12 12L4 12M12 12L12 4M8 12L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Add resize support to `CanvasModule.tsx`**

Add `group` class to the outer div and import ResizeHandle. Insert before the closing outer div in Build mode:

```tsx
// Add 'group' to outer div className:
className={`absolute flex flex-col group bg-[rgb(var(--color-surface-raised))] border rounded overflow-hidden ...`}

// Add before closing outer div, inside build mode check:
{mode === 'build' && !instance.locked && (
  <ResizeHandle
    position={instance.position}
    minW={plugin.minSize.w}
    minH={plugin.minSize.h}
    onResize={newPos => {
      // onResize prop passed down from GridCanvas
    }}
  />
)}
```

Add `onResize` to CanvasModule Props interface and wire it through from GridCanvas:

```tsx
// In Props interface:
onResize: (instanceId: string, position: ModulePosition) => void

// In GridCanvas handleResize:
const handleResize = (instanceId: string, position: ModulePosition) => {
  updateLayout(layout =>
    layout.map(inst =>
      inst.instanceId === instanceId ? { ...inst, position: clampToGrid(position) } : inst
    )
  )
}
```

- [ ] **Step 3: Verify resize works manually**

```bash
npm run dev
```

Add a module to a template. In Build Mode, hover the bottom-right corner — resize handle appears. Drag to resize. Expected: module grows/shrinks snapping to grid.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/
git commit -m "feat: add drag-to-resize handles for grid canvas modules"
```

---

### Task 11: Keyboard Shortcuts

**Files:**
- Create: `src/hooks/useKeyboardShortcuts.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write `src/hooks/useKeyboardShortcuts.ts`**

```ts
import { useEffect } from 'react'

type ShortcutMap = Record<string, (e: KeyboardEvent) => void>

function isInputFocused() {
  const el = document.activeElement
  return el instanceof HTMLInputElement
    || el instanceof HTMLTextAreaElement
    || (el instanceof HTMLElement && el.isContentEditable)
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.metaKey || e.ctrlKey ? 'cmd' : '',
        e.shiftKey ? 'shift' : '',
        e.key.toLowerCase(),
      ].filter(Boolean).join('+')

      const action = shortcuts[key]
      if (!action) return

      // Allow cmd+shortcuts even in inputs; block bare keys when typing
      const isCmdShortcut = e.metaKey || e.ctrlKey
      if (!isCmdShortcut && isInputFocused()) return

      action(e)
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts])
}
```

- [ ] **Step 2: Wire shortcuts in `src/App.tsx`**

```tsx
// Add to App component, after useAppMode:
useKeyboardShortcuts({
  'b': () => setMode(m => m === 'build' ? 'live' : 'build'),
  'cmd+p': (e) => { e.preventDefault(); window.print() },
  'escape': () => {
    // Close any open panels — dispatched via custom event for child components to handle
    window.dispatchEvent(new CustomEvent('pt:close-panels'))
  },
})
```

Import `useKeyboardShortcuts` in `App.tsx`.

- [ ] **Step 3: Verify shortcuts**

```bash
npm run dev
```

- Press `B` when not in an input: mode toggles
- Press `Cmd+P`: browser print dialog opens
- Press `B` while typing in template name input: does NOT toggle mode

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useKeyboardShortcuts.ts src/App.tsx
git commit -m "feat: add keyboard shortcuts (B toggle, Cmd+P print, Escape)"
```

---

### Task 12: Template Tabs

**Files:**
- Create: `src/ui/shell/TabBar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write `src/ui/shell/TabBar.tsx`**

```tsx
import { useNavigate, useLocation } from 'react-router-dom'

interface Tab {
  id: string
  name: string
}

interface Props {
  tabs: Tab[]
  onClose: (id: string) => void
}

export function TabBar({ tabs, onClose }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  if (tabs.length === 0) return null

  return (
    <div className="flex items-end gap-0.5 px-4 bg-[rgb(var(--color-surface))] overflow-x-auto shrink-0">
      {tabs.map(tab => {
        const isActive = location.pathname === `/template/${tab.id}`
        return (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-t cursor-pointer border-t border-l border-r select-none max-w-[160px] ${
              isActive
                ? 'bg-[rgb(var(--color-surface-raised))] border-gray-700 text-gray-100'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
            onClick={() => navigate(`/template/${tab.id}`)}
          >
            <span className="truncate">{tab.name}</span>
            <button
              onClick={e => { e.stopPropagation(); onClose(tab.id) }}
              className="shrink-0 text-gray-500 hover:text-gray-300"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Add tab state to `src/App.tsx`**

```tsx
// Add tab state after useAppMode:
const [openTabs, setOpenTabs] = useState<Array<{ id: string; name: string }>>([])

// Add helper to open a tab (called from HomeView on template click):
const openTab = useCallback((id: string, name: string) => {
  setOpenTabs(tabs => tabs.find(t => t.id === id) ? tabs : [...tabs, { id, name }])
  navigate(`/template/${id}`)
}, [navigate])

const closeTab = useCallback((id: string) => {
  setOpenTabs(tabs => {
    const remaining = tabs.filter(t => t.id !== id)
    if (location.pathname === `/template/${id}`) {
      const idx = tabs.findIndex(t => t.id === id)
      const next = remaining[idx] ?? remaining[idx - 1]
      navigate(next ? `/template/${next.id}` : '/')
    }
    return remaining
  })
}, [location.pathname, navigate])
```

Add `<TabBar tabs={openTabs} onClose={closeTab} />` between TopBar and main in the JSX.

Pass `openTab` to HomeView via React context or props so clicking a template card opens a tab.

- [ ] **Step 3: Create AppContext for openTab**

```tsx
// src/AppContext.ts
import { createContext, useContext } from 'react'

interface AppContextValue {
  openTab: (id: string, name: string) => void
}

export const AppContext = createContext<AppContextValue>({ openTab: () => {} })
export const useAppContext = () => useContext(AppContext)
```

Wrap `<Routes>` in `<AppContext.Provider value={{ openTab }}>` in App.tsx.

Update `HomeView.tsx` to use `useAppContext().openTab` instead of `navigate` directly when clicking a template card.

- [ ] **Step 4: Verify tabs work**

```bash
npm run dev
```

Open two templates from Home. Expected: two tabs appear below the TopBar. Click each tab — canvas switches. Click × — tab closes, navigates to next tab or home.

- [ ] **Step 5: Commit**

```bash
git add src/ui/shell/TabBar.tsx src/App.tsx src/AppContext.ts src/ui/views/HomeView.tsx
git commit -m "feat: add template tabs with open/close navigation"
```

---

### Task 13: Right-Click Context Menu for Adding Modules

**Files:**
- Create: `src/ui/components/ContextMenu.tsx`
- Modify: `src/canvas/GridCanvas.tsx`

- [ ] **Step 1: Write `src/ui/components/ContextMenu.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import { pluginRegistry } from '../../core/plugin/registry'

interface Props {
  x: number
  y: number
  onAddModule: (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => void
  onClose: () => void
}

export function ContextMenu({ x, y, onAddModule, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const plugins = pluginRegistry.list()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: x, top: y, zIndex: 100 }}
      className="bg-[rgb(var(--color-surface-raised))] border border-gray-700 rounded shadow-xl py-1 min-w-[180px] max-h-80 overflow-y-auto"
    >
      <div className="px-3 py-1 text-xs text-gray-500 font-semibold uppercase tracking-wide">Add Module</div>
      {plugins.map(plugin => (
        <button
          key={plugin.meta.id}
          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
          onClick={() => { onAddModule(plugin.meta.id, plugin.meta.version, plugin.defaultConfig); onClose() }}
        >
          {plugin.meta.name}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add right-click handler to GridCanvas**

```tsx
// Add to GridCanvas state:
const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

// Add onContextMenu to outer canvas div:
onContextMenu={mode === 'build' ? (e) => {
  e.preventDefault()
  setContextMenu({ x: e.clientX, y: e.clientY })
} : undefined}

// Add below canvas div:
{contextMenu && mode === 'build' && (
  <ContextMenu
    x={contextMenu.x}
    y={contextMenu.y}
    onAddModule={/* pass onAddModule prop from CanvasView */}
    onClose={() => setContextMenu(null)}
  />
)}
```

Add `onAddModule` prop to GridCanvas and pass it from CanvasView.

- [ ] **Step 3: Verify right-click works**

```bash
npm run dev
```

In Build Mode on the canvas, right-click the empty canvas. Expected: context menu appears listing all registered modules. Click one — module added to canvas. Right-click in Live Mode — no menu.

- [ ] **Step 4: Commit**

```bash
git add src/ui/components/ContextMenu.tsx src/canvas/GridCanvas.tsx src/ui/views/CanvasView.tsx
git commit -m "feat: add right-click context menu for adding modules in Build Mode"
```

---

### Task 14: Basic Print Support

**Files:**
- Create: `src/ui/views/PrintPreview.tsx`
- Modify: `src/ui/shell/TopBar.tsx`

- [ ] **Step 1: Install react-to-print**

```bash
npm install react-to-print
```

- [ ] **Step 2: Write `src/ui/views/PrintPreview.tsx`**

```tsx
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useParams } from 'react-router-dom'
import { useTemplate } from '../../hooks/useTemplate'
import { pluginRegistry } from '../../core/plugin/registry'

export function PrintPreview() {
  const { id } = useParams<{ id: string }>()
  const { template } = useTemplate(id ?? null)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: template?.name ?? 'Patient Template',
  })

  if (!template) return null

  const page = template.pages[0]
  const data = template.singleData

  return (
    <div>
      <div className="no-print p-4 flex justify-between items-center border-b border-gray-800">
        <span className="text-sm text-gray-400">Print Preview — {template.name}</span>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-accent-DEFAULT text-gray-900 rounded text-sm font-semibold"
        >
          Print / Save PDF
        </button>
      </div>

      <div ref={printRef} className="print-container bg-white text-gray-900 p-8">
        <h1 className="text-lg font-bold mb-4">{template.name}</h1>
        {page.layout.map(instance => {
          const plugin = pluginRegistry.get(instance.moduleId)
          if (!plugin) return null
          const { PrintView } = plugin
          return (
            <div key={instance.instanceId} className="mb-4 break-inside-avoid">
              <div className="text-xs font-bold uppercase text-gray-500 mb-1">{plugin.meta.name}</div>
              <PrintView config={instance.config} data={data[instance.instanceId] ?? {}} />
            </div>
          )
        })}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { padding: 0; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 3: Add Print route in `App.tsx`**

```tsx
<Route path="/template/:id/print" element={<PrintPreview />} />
```

- [ ] **Step 4: Add print button to TopBar**

Add a print icon button to TopBar that navigates to `/template/:id/print` when on a template page.

```tsx
// In TopBar, accept optional templateId prop:
interface Props {
  mode: AppMode
  onModeToggle: () => void
  templateId?: string
}

// Add button when templateId present:
{templateId && (
  <Link to={`/template/${templateId}/print`} className="text-gray-400 hover:text-gray-200 text-xs px-2 py-1 border border-gray-700 rounded">
    Print
  </Link>
)}
```

- [ ] **Step 5: Verify print preview**

```bash
npm run dev
```

Create a template. Navigate to canvas. Click Print. Expected: print preview page with module PrintViews listed. Click "Print / Save PDF" — browser print dialog opens.

- [ ] **Step 6: Commit**

```bash
git add src/ui/views/PrintPreview.tsx src/ui/shell/TopBar.tsx src/App.tsx
git commit -m "feat: add print preview route and react-to-print integration"
```

---

### Task 15: PWA Icons + Final Check

**Files:**
- Modify: `public/icons/icon-192.png`, `public/icons/icon-512.png`

- [ ] **Step 1: Replace placeholder icons with real ones**

Generate a simple icon (dark background, "PT" text in accent color). You can use any image editor or an online tool. Save as:
- `public/icons/icon-192.png` (192×192 px)
- `public/icons/icon-512.png` (512×512 px)

These do not need to be pixel-perfect at this stage — a placeholder with a distinct shape is fine. They will be replaced before release.

- [ ] **Step 2: Run full test suite**

```bash
npx vitest run
```

Expected: All tests PASS. Note which tests exist at this point (plugin registry, template store, grid canvas).

- [ ] **Step 3: Build for production**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript or bundler errors. Output in `dist/`.

- [ ] **Step 4: Verify PWA manifest**

```bash
npm run preview
```

Open the preview URL in Chrome. Open DevTools → Application → Manifest. Expected: manifest shows correct name, icons, display: standalone.

- [ ] **Step 5: Add `.superpowers/` to .gitignore**

```bash
echo '.superpowers/' >> .gitignore
echo 'dist/' >> .gitignore
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Plan 1 — Foundation. Plugin system, grid canvas, Build/Live modes, template store, tabs, print, PWA"
```

---

## Plan 1 Complete

At the end of Plan 1, the app:
- Runs fully in the browser (no server)
- Creates, edits, duplicates, and deletes templates
- Opens multiple templates in tabs
- Shows a grid canvas in Build Mode with drag, drop, resize, lock, collapse, right-click add
- Shows Live Mode with locked layout and mode toggle (`B` key)
- Has a module palette sidebar (empty until Plan 2 registers modules)
- Has a basic print preview via react-to-print
- Is installable as a PWA

**Next:** Plan 2 implements all 14 first-party core modules using the plugin interface established here.
