import type { ModulePlugin } from '../../../../core/plugin/types'
import { EncephalopathyRenderer } from './Renderer'
import { EncephalopathyEditor } from './Editor'
import { EncephalopathyPrintView } from './PrintView'

export const encephalopathyPlugin: ModulePlugin = {
  meta: {
    id: 'encephalopathy',
    name: 'Hepatic Encephalopathy',
    version: '1.0.0',
    author: 'Patient Templates',
    description: 'West Haven grading with lactulose log and rifaximin tracking',
    tags: ['hepatology', 'encephalopathy', 'liver', 'gi', 'west-haven'],
    pack: 'gi',
  },
  schema: {
    config: {
      showLactulosLog: { type: 'boolean', default: true },
    },
    data: {
      westHavenGrade: { type: 'number' },
      laxuloseLog: { type: 'array' },
      rifaximin: { type: 'boolean' },
      rifaximinDose: { type: 'string' },
      stoolsPerDay: { type: 'number' },
    },
  },
  defaultConfig: {
    showLactulosLog: true,
  },
  minSize: { w: 4, h: 7 },
  Renderer: EncephalopathyRenderer,
  Editor: EncephalopathyEditor,
  PrintView: EncephalopathyPrintView,
}
