import { pluginRegistry } from '../../../core/plugin/registry'
import { dialysisSettings } from './dialysis-settings'
import { electrolyteTracker } from './electrolyte-tracker'
import { akiStaging } from './aki-staging'
import { urineStudies } from './urine-studies'

pluginRegistry.register(dialysisSettings)
pluginRegistry.register(electrolyteTracker)
pluginRegistry.register(akiStaging)
pluginRegistry.register(urineStudies)

export const nephroPack = [
  dialysisSettings,
  electrolyteTracker,
  akiStaging,
  urineStudies,
]
