import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const assessmentPlanPlugin: ModulePlugin = {
  meta: {
    id: 'assessment-plan',
    name: 'Assessment & Plan',
    version: '1.0.0',
    author: 'core',
    description: 'Numbered problem list with assessment and plan fields per problem.',
    tags: ['assessment', 'plan', 'soap', 'rounding'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    defaultProblems: 1,
  },
  minSize: { w: 5, h: 5 },
  Renderer,
  Editor,
  PrintView,
}
