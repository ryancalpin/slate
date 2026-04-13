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
