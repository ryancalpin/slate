// src/modules/calculated/calculated.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  calcAnionGap,
  calcMAP,
  calcBMI,
  calcAAGradient,
  calcCKDEPI,
  calcCorrectedCalcium,
} from './formulas'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import calculatedPlugin from './index'

const noop = () => {}

// Pure formula unit tests
describe('clinical calculator formulas', () => {
  it('calcAnionGap: Na=140, Cl=102, CO2=24 → 14', () => {
    expect(calcAnionGap(140, 102, 24)).toBe(14)
  })

  it('calcMAP: SBP=120, DBP=80 → 93.33...', () => {
    expect(calcMAP(120, 80)).toBeCloseTo(93.33, 1)
  })

  it('calcBMI: weight=70kg, height=1.75m → 22.86', () => {
    expect(calcBMI(70, 1.75)).toBeCloseTo(22.86, 1)
  })

  it('calcAAGradient: FiO2=0.21, PaCO2=40, PaO2=90 → ~9.73', () => {
    expect(calcAAGradient(0.21, 40, 90)).toBeCloseTo(9.73, 0)
  })

  it('calcCKDEPI female Cr≤0.7: Cr=0.6, age=50 → >60', () => {
    const gfr = calcCKDEPI(0.6, 50, 'female')
    expect(gfr).toBeGreaterThan(60)
  })

  it('calcCKDEPI male Cr>0.9: Cr=1.5, age=60 → <60', () => {
    const gfr = calcCKDEPI(1.5, 60, 'male')
    expect(gfr).toBeLessThan(60)
  })

  it('calcCorrectedCalcium: Ca=7.0, albumin=2.5 → 8.2', () => {
    expect(calcCorrectedCalcium(7.0, 2.5)).toBeCloseTo(8.2, 1)
  })
})

// React component tests
describe('calculated Renderer', () => {
  it('renders without crashing with default config', () => {
    render(
      <Renderer
        instanceId="test"
        config={calculatedPlugin.defaultConfig}
        data={{}}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Anion Gap')).toBeDefined()
  })

  it('shows — when inputs are empty', () => {
    render(
      <Renderer
        instanceId="test"
        config={calculatedPlugin.defaultConfig}
        data={{}}
        onDataChange={noop}
        mode="live"
      />
    )
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })
})

describe('calculated PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={calculatedPlugin.defaultConfig}
        data={{}}
      />
    )
    expect(screen.getByText('Clinical Calculators')).toBeDefined()
  })
})
