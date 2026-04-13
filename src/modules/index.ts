import { registry } from '../core/plugin/registry'
import { patientHeaderPlugin } from './patient-header'
import { vitalsPlugin } from './vitals'
import { labsPanelPlugin } from './labs-panel'
import { labsFishbonePlugin } from './labs-fishbone'
import { assessmentPlanPlugin } from './assessment-plan'
import { medicationsPlugin } from './medications'
import { intakeOutputPlugin } from './intake-output'

// Plan 2b will add the remaining 7 modules and register them here
registry.register(patientHeaderPlugin)
registry.register(vitalsPlugin)
registry.register(labsPanelPlugin)
registry.register(labsFishbonePlugin)
registry.register(assessmentPlanPlugin)
registry.register(medicationsPlugin)
registry.register(intakeOutputPlugin)
