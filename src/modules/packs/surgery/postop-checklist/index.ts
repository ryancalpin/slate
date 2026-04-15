import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export type Milestone = { id: string; label: string; completed: boolean; completedAt: string }
export type PostopChecklistData = { milestones: Milestone[] }

export const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'm-1', label: 'Ambulation', completed: false, completedAt: '' },
  { id: 'm-2', label: 'Foley removal', completed: false, completedAt: '' },
  { id: 'm-3', label: 'Diet advancement (NPO → clears → regular)', completed: false, completedAt: '' },
  { id: 'm-4', label: 'Oral pain control tolerating', completed: false, completedAt: '' },
  { id: 'm-5', label: 'Incentive spirometry ×10/hr', completed: false, completedAt: '' },
  { id: 'm-6', label: 'DVT prophylaxis started', completed: false, completedAt: '' },
  { id: 'm-7', label: 'Surgical drain removal criteria met', completed: false, completedAt: '' },
  { id: 'm-8', label: 'Staple/suture removal date set', completed: false, completedAt: '' },
  { id: 'm-9', label: 'Discharge criteria met', completed: false, completedAt: '' },
]

export const postopChecklistPlugin: ModulePlugin = {
  meta: {
    id: 'postop-checklist',
    name: 'Post-Op Checklist',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Configurable post-operative milestone checklist with progress tracking and completion timestamps.',
    tags: ['surgery', 'post-op', 'checklist', 'milestones'],
    pack: 'surgery',
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {},
  minSize: { w: 3, h: 5 },
  Renderer,
  Editor,
  PrintView,
}
