import { surgicalDrainsPlugin } from './surgical-drains'
import { woundAssessmentPlugin } from './wound-assessment'
import { postopChecklistPlugin } from './postop-checklist'
import { ostomyTrackerPlugin } from './ostomy-tracker'
import { pluginRegistry } from '../../../core/plugin/registry'

pluginRegistry.register(surgicalDrainsPlugin)
pluginRegistry.register(woundAssessmentPlugin)
pluginRegistry.register(postopChecklistPlugin)
pluginRegistry.register(ostomyTrackerPlugin)
