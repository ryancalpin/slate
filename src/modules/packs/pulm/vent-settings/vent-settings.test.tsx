import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  calcDrivingPressure,
  calcPFRatio,
  calcTVperIBW,
} from './index'
import { Renderer } from './Renderer'

describe('vent-settings pure functions', () => {
  it('calcDrivingPressure: pPlat - PEEP', () => {
    expect(calcDrivingPressure(25, 8)).toBe(17)
    expect(calcDrivingPressure(20, 5)).toBe(15)
  })

  it('calcPFRatio: PaO2 / FiO2 fraction', () => {
    expect(calcPFRatio(80, 0.4)).toBeCloseTo(200)
    expect(calcPFRatio(100, 0.5)).toBeCloseTo(200)
  })

  it('calcTVperIBW: mL / kg', () => {
    expect(calcTVperIBW(420, 70)).toBe(6)
    expect(calcTVperIBW(500, 70)).toBeCloseTo(7.14, 1)
  })
})

describe('vent-settings Renderer', () => {
  const defaultData = {
    mode: 'AC/VC', fio2: 40, peep: 5, tv: 420, rr: 14,
    ie: '1:2', pPlat: 22, pao2: 84, ibwKg: 70,
  }

  it('renders mode dropdown', () => {
    render(
      <Renderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByRole('combobox')).toBeDefined()
  })

  it('shows ARDSnet warning when TV/IBW > 6', () => {
    render(
      <Renderer
        instanceId="test-2"
        config={{}}
        data={{ ...defaultData, tv: 500, ibwKg: 70 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/ARDSnet target/i)).toBeDefined()
  })

  it('does not show ARDSnet warning when TV/IBW <= 6', () => {
    render(
      <Renderer
        instanceId="test-3"
        config={{}}
        data={{ ...defaultData, tv: 420, ibwKg: 70 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.queryByText(/ARDSnet target/i)).toBeNull()
  })

  it('shows driving pressure auto-calc', () => {
    render(
      <Renderer
        instanceId="test-4"
        config={{}}
        data={{ ...defaultData, pPlat: 25, peep: 8 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/17/)).toBeDefined()
  })

  it('displays citation', () => {
    render(
      <Renderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/ARDSNet/i)).toBeDefined()
  })
})
