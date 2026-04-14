import { pluginRegistry } from '../../../core/plugin/registry'
import { antibioticTrackerPlugin } from './antibiotic-tracker'
import { cultureLogPlugin } from './culture-log'
import { feverCurvePlugin } from './fever-curve'
import { sepsisTrackerPlugin } from './sepsis-tracker'
import { ancTrackerPlugin } from './anc-tracker'

export function registerIDPack() {
  pluginRegistry.register(antibioticTrackerPlugin)
  pluginRegistry.register(cultureLogPlugin)
  pluginRegistry.register(feverCurvePlugin)
  pluginRegistry.register(sepsisTrackerPlugin)
  pluginRegistry.register(ancTrackerPlugin)
}

// Auto-register on import (side-effect import from packs/index.ts)
registerIDPack()

export {
  antibioticTrackerPlugin,
  cultureLogPlugin,
  feverCurvePlugin,
  sepsisTrackerPlugin,
  ancTrackerPlugin,
}
