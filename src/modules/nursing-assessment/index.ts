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
