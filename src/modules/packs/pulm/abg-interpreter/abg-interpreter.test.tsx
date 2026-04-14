import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { interpretABG, calcAaGradient, calcPFRatio } from './index'
import { Renderer } from './Renderer'

describe('interpretABG pure function', () => {
  it('identifies respiratory acidosis', () => {
    const result = interpretABG(7.28, 55, 18)
    expect(result.disorder).toMatch(/acidosis/i)
    expect(result.type).toMatch(/respiratory/i)
  })

  it('identifies metabolic acidosis', () => {
    const result = interpretABG(7.28, 38, 16)
    expect(result.disorder).toMatch(/acidosis/i)
    expect(result.type).toMatch(/metabolic/i)
  })

  it('identifies respiratory alkalosis', () => {
    const result = interpretABG(7.50, 28, 24)
    expect(result.disorder).toMatch(/alkalosis/i)
    expect(result.type).toMatch(/respiratory/i)
  })

  it('identifies metabolic alkalosis', () => {
    const result = interpretABG(7.50, 44, 30)
    expect(result.disorder).toMatch(/alkalosis/i)
    expect(result.type).toMatch(/metabolic/i)
  })

  it('identifies normal pH', () => {
    const result = interpretABG(7.40, 40, 24)
    expect(result.disorder).toMatch(/normal/i)
  })
})

describe('calcAaGradient', () => {
  it('calculates A-a gradient correctly', () => {
    // (0.21/100 is wrong — FiO2 pct passed directly as percent)
    // A-a = (FiO2/100 * 713) - (PaCO2/0.8) - PaO2
    // FiO2=21%, PaCO2=40, PaO2=95 → (0.21*713) - 50 - 95 = 149.73-50-95 = 4.73
    const result = calcAaGradient(21, 40, 95)
    expect(result).toBeCloseTo(4.73, 1)
  })
})

describe('calcPFRatio (ABG)', () => {
  it('calculates P/F ratio from pct FiO2', () => {
    expect(calcPFRatio(80, 40)).toBeCloseTo(200)
    expect(calcPFRatio(100, 50)).toBeCloseTo(200)
  })
})

describe('abg-interpreter Renderer', () => {
  const defaultData = {
    ph: 7.38, pco2: 42, pao2: 88, hco3: 24, spo2: 97, fio2: 40, patientAge: 65,
  }

  it('renders pH input', () => {
    render(
      <Renderer
        instanceId="abg-1"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('7.38')).toBeDefined()
  })

  it('shows acid-base interpretation', () => {
    render(
      <Renderer
        instanceId="abg-2"
        config={{}}
        data={{ ...defaultData, ph: 7.28, pco2: 55, hco3: 24 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/acidosis/i)).toBeDefined()
  })

  it('displays Winter citation', () => {
    render(
      <Renderer
        instanceId="abg-3"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Albert MS/i)).toBeDefined()
  })
})
