import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcAnionGap, isDKAClosed } from './index'
import Renderer from './Renderer'

describe('calcAnionGap', () => {
  it('calculates correctly: 140 - 100 - 24 = 16', () => {
    expect(calcAnionGap(140, 100, 24)).toBe(16)
  })

  it('calculates correctly: 138 - 105 - 22 = 11', () => {
    expect(calcAnionGap(138, 105, 22)).toBe(11)
  })

  it('handles zero values', () => {
    expect(calcAnionGap(0, 0, 0)).toBe(0)
  })
})

describe('isDKAClosed', () => {
  it('returns true when all 4 criteria are met', () => {
    expect(isDKAClosed(10, 20, 180, true)).toBe(true)
  })

  it('returns false when AG >= 12', () => {
    expect(isDKAClosed(12, 20, 180, true)).toBe(false)
  })

  it('returns false when HCO3 < 18', () => {
    expect(isDKAClosed(10, 17, 180, true)).toBe(false)
  })

  it('returns false when glucose >= 200', () => {
    expect(isDKAClosed(10, 20, 200, true)).toBe(false)
  })

  it('returns false when patient not eating PO', () => {
    expect(isDKAClosed(10, 20, 180, false)).toBe(false)
  })

  it('returns false when multiple criteria fail', () => {
    expect(isDKAClosed(15, 10, 300, false)).toBe(false)
  })
})

describe('Renderer — dka-tracker', () => {
  const defaultData = {
    entries: [
      { timestamp: '2024-01-01T08:00', glucose: 350, na: 140, cl: 100, hco3: 10, ketones: 'large' },
      { timestamp: '2024-01-01T14:00', glucose: 180, na: 139, cl: 104, hco3: 20, ketones: 'trace' },
    ],
    patientEating: false,
  }
  const noop = () => {}

  it('renders citation', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText(/Kitabchi/)).toBeTruthy()
  })

  it('renders anion gap values in table', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    // First entry: 140 - 100 - 10 = 30
    expect(screen.getByText('30')).toBeTruthy()
    // Second entry: 139 - 104 - 20 = 15
    expect(screen.getByText('15')).toBeTruthy()
  })

  it('renders DKA closure criteria section', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText(/DKA Closure Criteria/i)).toBeTruthy()
  })

  it('renders ketones values', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText('large')).toBeTruthy()
    expect(screen.getByText('trace')).toBeTruthy()
  })
})
