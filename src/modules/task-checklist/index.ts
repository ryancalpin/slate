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
