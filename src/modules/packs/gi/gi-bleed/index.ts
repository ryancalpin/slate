import type { ModulePlugin } from '../../../../core/plugin/types'
import { GiBleedRenderer, calcGBS, calcRockall } from './Renderer'
import type { GBSInputs, RockallInputs } from './Renderer'
import { GiBleedEditor } from './Editor'
import { GiBleedPrintView } from './PrintView'

export { calcGBS, calcRockall }
export type { GBSInputs, RockallInputs }

export const giBleedPlugin: ModulePlugin = {
  meta: {
    id: 'gi-bleed',
    name: 'GI Bleed Risk (GBS + Rockall)',
    version: '1.0.0',
    author: 'Patient Templates',
    description: 'Glasgow-Blatchford pre-endoscopy triage and Rockall post-endoscopy rebleed risk',
    tags: ['gi', 'bleed', 'gastroenterology', 'endoscopy', 'score'],
    pack: 'gi',
  },
  schema: {
    config: {
      showRockall: { type: 'boolean', default: true },
    },
    data: {
      sex: { type: 'string' },
      bun: { type: 'number' },
      hgb: { type: 'number' },
      sbp: { type: 'number' },
      hr: { type: 'number' },
      melena: { type: 'boolean' },
      syncope: { type: 'boolean' },
      liverDisease: { type: 'boolean' },
      heartFailure: { type: 'boolean' },
      age: { type: 'number' },
      shock: { type: 'number' },
      comorbidity: { type: 'number' },
      diagnosis: { type: 'number' },
      majorSRH: { type: 'boolean' },
    },
  },
  defaultConfig: {
    showRockall: true,
  },
  minSize: { w: 4, h: 8 },
  Renderer: GiBleedRenderer,
  Editor: GiBleedEditor,
  PrintView: GiBleedPrintView,
}
