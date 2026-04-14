import type { ModulePlugin } from '../../../../core/plugin/types'
import { NutritionRenderer } from './Renderer'
import { NutritionEditor } from './Editor'
import { NutritionPrintView } from './PrintView'

export const nutritionTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'nutrition-tracker',
    name: 'Nutrition Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'EN/PN mode; weight-based kcal and protein goal tracking with progress bars.',
    tags: ['icu', 'critical-care', 'nutrition', 'enteral', 'parenteral'],
    pack: 'icu',
  },
  schema: {
    config: {
      type: 'object',
      properties: {
        defaultKcalPerKg: { type: 'number', default: 25 },
        defaultProteinPerKg: { type: 'number', default: 1.2 },
      },
    },
    data: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['EN', 'PN'] },
        weightKg: { type: 'number' },
        kcalGoalPerKg: { type: 'number' },
        proteinGoalPerKg: { type: 'number' },
        kcalCurrentPerDay: { type: 'number' },
        proteinCurrentPerDay: { type: 'number' },
      },
    },
  },
  defaultConfig: { defaultKcalPerKg: 25, defaultProteinPerKg: 1.2 },
  minSize: { w: 3, h: 4 },
  Renderer: NutritionRenderer,
  Editor: NutritionEditor,
  PrintView: NutritionPrintView,
}
