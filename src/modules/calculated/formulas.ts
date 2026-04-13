// src/modules/calculated/formulas.ts

/** Anion Gap = Na − (Cl + CO2). Normal: 8–12.
 * Citation: Emmett M & Narins RG, Medicine 1977;56(1):38-54 */
export function calcAnionGap(na: number, cl: number, co2: number): number {
  return na - (cl + co2)
}

/** MAP = (SBP + 2×DBP) / 3.
 * Citation: Magder S, Crit Care 2016 */
export function calcMAP(sbp: number, dbp: number): number {
  return (sbp + 2 * dbp) / 3
}

/** BMI = weight(kg) / height(m)².
 * Citation: WHO, 1995 */
export function calcBMI(weightKg: number, heightM: number): number {
  return weightKg / (heightM * heightM)
}

/** A-a Gradient = (FiO2 × 713) − (PaCO2 / 0.8) − PaO2. Normal rises with age.
 * Citation: Sorbini CA et al., Respiration 1968;25(1):3-13 */
export function calcAAGradient(fio2: number, paco2: number, pao2: number): number {
  return fio2 * 713 - paco2 / 0.8 - pao2
}

/** CKD-EPI GFR 2021 (race-free).
 * Female: Cr≤0.7: 142×(Cr/0.7)^−0.241×(0.9938)^age
 *         Cr>0.7: 142×(Cr/0.7)^−1.200×(0.9938)^age
 * Male:   Cr≤0.9: 142×(Cr/0.9)^−0.302×(0.9938)^age
 *         Cr>0.9: 142×(Cr/0.9)^−1.200×(0.9938)^age
 * Citation: Inker LA et al., NEJM 2021;385(19):1737-1749 */
export function calcCKDEPI(cr: number, age: number, sex: 'male' | 'female'): number {
  if (sex === 'female') {
    const exp = cr <= 0.7 ? -0.241 : -1.200
    return 142 * Math.pow(cr / 0.7, exp) * Math.pow(0.9938, age)
  }
  const exp = cr <= 0.9 ? -0.302 : -1.200
  return 142 * Math.pow(cr / 0.9, exp) * Math.pow(0.9938, age)
}

/** Corrected Calcium = measured Ca + 0.8 × (4.0 − albumin).
 * Citation: Payne RB et al., BMJ 1973;4(5893):643-6 */
export function calcCorrectedCalcium(measuredCa: number, albumin: number): number {
  return measuredCa + 0.8 * (4.0 - albumin)
}
