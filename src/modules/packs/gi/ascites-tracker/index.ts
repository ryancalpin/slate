import type { ModulePlugin } from '../../../../core/plugin/types'
import { AscitesRenderer, needsAlbumin } from './Renderer'
import { AscitesEditor } from './Editor'
import { AscitesPrintView } from './PrintView'

export { needsAlbumin }

export const ascitesTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'ascites-tracker',
    name: 'Ascites Tracker',
    version: '1.0.0',
    author: 'Patient Templates',
    description: 'Paracentesis log with large-volume albumin warning and SBP assessment',
    tags: ['hepatology', 'ascites', 'paracentesis', 'sbp', 'gi'],
    pack: 'gi',
  },
  schema: {
    config: {
      showSbpSection: { type: 'boolean', default: true },
    },
    data: {
      paracenteses: { type: 'array' },
      fluidWbc: { type: 'number' },
      sbpDiagnosed: { type: 'boolean' },
      sbpTreatmentStarted: { type: 'boolean' },
    },
  },
  defaultConfig: {
    showSbpSection: true,
  },
  minSize: { w: 4, h: 6 },
  Renderer: AscitesRenderer,
  Editor: AscitesEditor,
  PrintView: AscitesPrintView,
}
