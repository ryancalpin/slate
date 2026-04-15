import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export type VacSettings = { mode: string; pressure: number; dressingDate: string }
export type WoundAssessmentData = {
  location: string
  woundType: string
  vac: VacSettings | null
  dehiscence: string
  description: string
  assessmentDate: string
}

export const woundAssessmentPlugin: ModulePlugin = {
  meta: {
    id: 'wound-assessment',
    name: 'Wound Assessment',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Document wound location, type, VAC settings, dehiscence status, and narrative description.',
    tags: ['surgery', 'wound', 'post-op', 'VAC'],
    pack: 'surgery',
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
