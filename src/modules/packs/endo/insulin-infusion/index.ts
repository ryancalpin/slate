import { FC } from 'react'
import { InsulinInfusionRenderer } from './Renderer'
import { InsulinInfusionEditor } from './Editor'
import { InsulinInfusionPrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'
import { pluginRegistry } from '../../../../core/plugin/registry'

export const CITATION =
  'ADA Standards of Diabetes Care 2024. Diabetes Care. 2024;47(Suppl 1):S1-S321'

export function calcTimeAtGoal(
  entries: number[],
  low: number,
  high: number
): number {
  if (entries.length === 0) return 0
  const inRange = entries.filter((g) => g >= low && g <= high).length
  return Math.round((inRange / entries.length) * 100)
}

const insulinInfusion: ModulePlugin = {
  meta: {
    id: 'insulin-infusion',
    name: 'Insulin Infusion',
    version: '1.0.0',
    author: 'Endo Pack',
    description: 'Track continuous insulin infusion rate and glucose entries with time-at-goal.',
    tags: ['glucose', 'insulin', 'ICU', 'endocrinology'],
    pack: 'endo',
  },
  schema: {
    config: {},
    data: {
      ratePerHour: 'number',
      glucoseEntries: 'array',
      targetLow: 'number',
      targetHigh: 'number',
      protocolName: 'string',
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer: InsulinInfusionRenderer as FC<any>,
  Editor: InsulinInfusionEditor as FC<any>,
  PrintView: InsulinInfusionPrintView as FC<any>,
}

pluginRegistry.register(insulinInfusion)

export default insulinInfusion
