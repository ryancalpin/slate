import type { ModulePlugin } from '../../../../core/plugin/types'
import { MeldNaRenderer, calcMELD, calcMELDNa } from './Renderer'
import { MeldNaEditor } from './Editor'
import { MeldNaPrintView } from './PrintView'

export { calcMELD, calcMELDNa }

export const meldNaPlugin: ModulePlugin = {
  meta: {
    id: 'meld-na',
    name: 'MELD / MELD-Na Calculator',
    version: '1.0.0',
    author: 'Patient Templates',
    description: 'Calculates MELD and MELD-Na scores with 90-day mortality lookup',
    tags: ['hepatology', 'liver', 'transplant', 'gi', 'score'],
    pack: 'gi',
  },
  schema: {
    config: {
      showMortalityTable: { type: 'boolean', default: true },
    },
    data: {
      creatinine: { type: 'number' },
      bilirubin: { type: 'number' },
      inr: { type: 'number' },
      sodium: { type: 'number' },
    },
  },
  defaultConfig: {
    showMortalityTable: true,
  },
  minSize: { w: 4, h: 6 },
  Renderer: MeldNaRenderer,
  Editor: MeldNaEditor,
  PrintView: MeldNaPrintView,
}
