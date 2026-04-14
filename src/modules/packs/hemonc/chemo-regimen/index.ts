import type { ModulePlugin } from '../../../../core/plugin/types'
import { ChemoRegimenRenderer } from './Renderer'
import { ChemoRegimenEditor } from './Editor'
import { ChemoRegimenPrintView } from './PrintView'

export const chemoRegimenPlugin: ModulePlugin = {
  meta: {
    id: 'chemo-regimen',
    name: 'Chemo Regimen',
    version: '1.0.0',
    author: 'HemOnc Pack',
    description: 'Chemotherapy regimen summary card with agent list, nadir, and next-cycle dates.',
    tags: ['hemonc', 'chemotherapy', 'oncology'],
    pack: 'hemonc',
  },
  schema: {
    config: {},
    data: {
      regimenName: 'string',
      cycleNum: 'number',
      dayNum: 'number',
      agents: 'array',
      nadirDate: 'string',
      nextCycleDate: 'string',
    },
  },
  defaultConfig: { showDates: true, compactAgents: false },
  minSize: { w: 3, h: 3 },
  Renderer: ChemoRegimenRenderer,
  Editor: ChemoRegimenEditor,
  PrintView: ChemoRegimenPrintView,
}
