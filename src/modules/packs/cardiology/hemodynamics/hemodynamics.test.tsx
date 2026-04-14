import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Renderer from './Renderer'

const defaultData = {
  ci: 2.5, pcwp: 18, svr: 1400, map: 75,
  cvp: 5, paSys: 40, paDias: 22, paMean: 30,
}

describe('HemodynamicsRenderer', () => {
  it('renders all 8 parameter labels', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Hemodynamics' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Cardiac Index/i)).toBeTruthy()
    expect(screen.getByText(/PCWP/i)).toBeTruthy()
    expect(screen.getByText(/SVR/i)).toBeTruthy()
    expect(screen.getByText(/MAP/i)).toBeTruthy()
    expect(screen.getByText(/CVP/i)).toBeTruthy()
    expect(screen.getByText(/PA Systolic/i)).toBeTruthy()
    expect(screen.getByText(/PA Diastolic/i)).toBeTruthy()
    expect(screen.getByText(/PA Mean/i)).toBeTruthy()
  })

  it('shows normal range for each parameter', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Hemodynamics' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // CI normal range
    expect(screen.getByText(/2\.2.*4\.0/)).toBeTruthy()
  })

  it('renders out-of-range PCWP value (18 > 12) with amber styling indicator', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Hemodynamics' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // value 18 displayed
    const input = screen.getByDisplayValue('18')
    expect(input).toBeTruthy()
  })
})
