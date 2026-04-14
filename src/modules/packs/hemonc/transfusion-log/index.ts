import type { ModulePlugin } from '../../../../core/plugin/types'
import { TransfusionLogRenderer } from './Renderer'
import { TransfusionLogEditor } from './Editor'
import { TransfusionLogPrintView } from './PrintView'

export const transfusionLogPlugin: ModulePlugin = {
  meta: {
    id: 'transfusion-log',
    name: 'Transfusion Log',
    version: '1.0.0',
    author: 'HemOnc Pack',
    description: 'Blood product transfusion log with reaction tracking.',
    tags: ['hemonc', 'transfusion', 'blood products'],
    pack: 'hemonc',
  },
  schema: {
    config: {},
    data: { transfusions: 'array' },
  },
  defaultConfig: { highlightReactions: true, showTime: true },
  minSize: { w: 5, h: 3 },
  Renderer: TransfusionLogRenderer,
  Editor: TransfusionLogEditor,
  PrintView: TransfusionLogPrintView,
}
