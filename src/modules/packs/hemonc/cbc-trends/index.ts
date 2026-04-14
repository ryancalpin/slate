import type { ModulePlugin } from '../../../../core/plugin/types'
import { CBCTrendsRenderer } from './Renderer'
import { CBCTrendsEditor } from './Editor'
import { CBCTrendsPrintView } from './PrintView'

export const cbcTrendsPlugin: ModulePlugin = {
  meta: {
    id: 'cbc-trends',
    name: 'CBC Trends',
    version: '1.0.0',
    author: 'HemOnc Pack',
    description: 'Daily CBC table with sparklines, nadir detection, and recovery tracking.',
    tags: ['hemonc', 'labs', 'CBC', 'oncology'],
    pack: 'hemonc',
  },
  schema: {
    config: {},
    data: { entries: 'array' },
  },
  defaultConfig: { showSparklines: true, showUnits: true },
  minSize: { w: 4, h: 3 },
  Renderer: CBCTrendsRenderer,
  Editor: CBCTrendsEditor,
  PrintView: CBCTrendsPrintView,
}
