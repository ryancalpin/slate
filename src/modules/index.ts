// src/modules/index.ts
// Plan 2a modules (1–7) — named exports
import { patientHeaderPlugin } from './patient-header/index'
import { vitalsPlugin } from './vitals/index'
import { labsPanelPlugin } from './labs-panel/index'
import { labsFishbonePlugin } from './labs-fishbone/index'
import { assessmentPlanPlugin } from './assessment-plan/index'
import { medicationsPlugin } from './medications/index'
import { intakeOutputPlugin } from './intake-output/index'

// Plan 2b modules (8–14) — default exports
import linesTubesPlugin from './lines-tubes/index'
import taskChecklistPlugin from './task-checklist/index'
import freeTextPlugin from './free-text/index'
import consultsPlugin from './consults/index'
import nursingAssessmentPlugin from './nursing-assessment/index'
import customFieldsPlugin from './custom-fields/index'
import calculatedPlugin from './calculated/index'

import { pluginRegistry } from '../core/plugin/registry'

pluginRegistry.register(patientHeaderPlugin)
pluginRegistry.register(vitalsPlugin)
pluginRegistry.register(labsPanelPlugin)
pluginRegistry.register(labsFishbonePlugin)
pluginRegistry.register(assessmentPlanPlugin)
pluginRegistry.register(medicationsPlugin)
pluginRegistry.register(intakeOutputPlugin)
pluginRegistry.register(linesTubesPlugin)
pluginRegistry.register(taskChecklistPlugin)
pluginRegistry.register(freeTextPlugin)
pluginRegistry.register(consultsPlugin)
pluginRegistry.register(nursingAssessmentPlugin)
pluginRegistry.register(customFieldsPlugin)
pluginRegistry.register(calculatedPlugin)
