import { pluginRegistry } from '../../../core/plugin/registry'
import { chemoRegimenPlugin } from './chemo-regimen'
import { cbcTrendsPlugin } from './cbc-trends'
import { transfusionLogPlugin } from './transfusion-log'
import { neutropenicFeverPlugin } from './neutropenic-fever'

export const hemoncPlugins = [
  chemoRegimenPlugin,
  cbcTrendsPlugin,
  transfusionLogPlugin,
  neutropenicFeverPlugin,
]

hemoncPlugins.forEach(plugin => pluginRegistry.register(plugin))
