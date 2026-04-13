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
