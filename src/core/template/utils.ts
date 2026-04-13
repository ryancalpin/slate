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
