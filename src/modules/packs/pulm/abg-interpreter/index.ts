import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const CITATION_WINTERS = "Albert MS et al. Ann Intern Med. 1967;66(2):312-322"
export const CITATION_AA = "Standard respiratory physiology: A-a gradient = (FiO2/100 × 713) − (PaCO2/0.8) − PaO2"

export function interpretABG(
  ph: number,
  pco2: number,
  hco3: number
): { disorder: string; type: string } {
  if (ph >= 7.35 && ph <= 7.45) {
    return { disorder: 'Normal', type: 'Normal' }
  }

  if (ph < 7.35) {
    // Acidosis
    if (pco2 > 45) {
      return { disorder: 'Acidosis', type: 'Respiratory' }
    } else if (hco3 < 22) {
      return { disorder: 'Acidosis', type: 'Metabolic' }
    }
    return { disorder: 'Acidosis', type: 'Mixed' }
  }

  // Alkalosis (ph > 7.45)
  if (pco2 < 35) {
    return { disorder: 'Alkalosis', type: 'Respiratory' }
  } else if (hco3 > 26) {
    return { disorder: 'Alkalosis', type: 'Metabolic' }
  }
  return { disorder: 'Alkalosis', type: 'Mixed' }
}

/**
 * Winter's compensation check for metabolic acidosis:
 * Expected PaCO2 = 1.5 × HCO3 + 8 ± 2
 */
export function wintersExpectedPCO2(hco3: number): { low: number; high: number } {
  const expected = 1.5 * hco3 + 8
  return { low: expected - 2, high: expected + 2 }
}

/**
 * Metabolic alkalosis compensation:
 * Expected PaCO2 = 0.7 × (HCO3 − 24) + 40 ± 5
 */
export function metAlkalosisExpectedPCO2(hco3: number): { low: number; high: number } {
  const expected = 0.7 * (hco3 - 24) + 40
  return { low: expected - 5, high: expected + 5 }
}

/**
 * A-a gradient = (FiO2/100 × 713) − (PaCO2 / 0.8) − PaO2
 * Normal upper limit ≈ Age/4 + 4
 */
export function calcAaGradient(fio2Pct: number, pco2: number, pao2: number): number {
  return (fio2Pct / 100) * 713 - pco2 / 0.8 - pao2
}

/**
 * P/F ratio = PaO2 / (FiO2 / 100)
 */
export function calcPFRatio(pao2: number, fio2Pct: number): number {
  return pao2 / (fio2Pct / 100)
}

const abgInterpreterPlugin: ModulePlugin = {
  meta: {
    id: 'abg-interpreter',
    name: 'ABG Interpreter',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Arterial blood gas entry with automated acid-base interpretation, A-a gradient, and P/F ratio.',
    tags: ['critical-care', 'pulmonology', 'abg', 'acid-base'],
    pack: 'pulm',
  },
  schema: {
    config: {},
    data: {
      ph: { type: 'number' },
      pco2: { type: 'number' },
      pao2: { type: 'number' },
      hco3: { type: 'number' },
      spo2: { type: 'number' },
      fio2: { type: 'number' },
      patientAge: { type: 'number' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default abgInterpreterPlugin
