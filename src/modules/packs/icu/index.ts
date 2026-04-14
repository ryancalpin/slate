import { pluginRegistry } from '../../../core/plugin/registry'
import { vasopressorTrackerPlugin } from './vasopressor-tracker'
import { sedationTrackerPlugin } from './sedation-tracker'
import { satSbtReadinessPlugin } from './sat-sbt-readiness'
import { nutritionTrackerPlugin } from './nutrition-tracker'
import { sofaApachePlugin } from './sofa-apache'

pluginRegistry.register(vasopressorTrackerPlugin)
pluginRegistry.register(sedationTrackerPlugin)
pluginRegistry.register(satSbtReadinessPlugin)
pluginRegistry.register(nutritionTrackerPlugin)
pluginRegistry.register(sofaApachePlugin)

export const icuPack = [
  vasopressorTrackerPlugin,
  sedationTrackerPlugin,
  satSbtReadinessPlugin,
  nutritionTrackerPlugin,
  sofaApachePlugin,
]
