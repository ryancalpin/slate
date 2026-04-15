import type { FC } from 'react'
import { GlucoseLogRenderer } from './Renderer'
import { GlucoseLogEditor } from './Editor'
import { GlucoseLogPrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'
import { pluginRegistry } from '../../../../core/plugin/registry'

export const TIR_CITATION =
  'Battelino T et al. Diabetes Care. 2019;42(8):1593-1603'
export const EA1C_CITATION =
  'Nathan DM et al. Diabetes Care. 2008;31(8):1473-1478'

export function calcTIR(entries: number[], low: number, high: number): number {
  if (entries.length === 0) return 0
  const inRange = entries.filter((g) => g >= low && g <= high).length
  return Math.round((inRange / entries.length) * 100)
}

export function calcEA1c(avgGlucose: number): number {
  return Math.round(((avgGlucose + 46.7) / 28.7) * 10) / 10
}

const glucoseLog: ModulePlugin = {
  meta: {
    id: 'glucose-log',
    name: 'Glucose Log',
    version: '1.0.0',
    author: 'Endo Pack',
    description: 'Timestamped glucose log with sparkline, time-in-range, and eA1c estimator.',
    tags: ['glucose', 'diabetes', 'TIR', 'A1c', 'endocrinology'],
    pack: 'endo',
  },
  schema: {
    config: {},
    data: {
      entries: 'array',
      targetLow: 'number',
      targetHigh: 'number',
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer: GlucoseLogRenderer as FC<any>,
  Editor: GlucoseLogEditor as FC<any>,
  PrintView: GlucoseLogPrintView as FC<any>,
}

pluginRegistry.register(glucoseLog)

export default glucoseLog
