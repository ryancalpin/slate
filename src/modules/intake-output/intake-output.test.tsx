// src/modules/intake-output/intake-output.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { intakeOutputPlugin } from './index'
import { calcUOP, calcNetBalance } from './Renderer'

const defaultConfig = intakeOutputPlugin.defaultConfig
const emptyData = { po: 0, ivFluids: [], urine: 0, urineHours: 0, stool: 0, drains: [] }

describe('intake-output Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="io1"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows UOP calculation when data provided', () => {
    render(
      <Renderer
        instanceId="io2"
        config={defaultConfig}
        data={{ ...emptyData, urine: 1200, urineHours: 8 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/150/)).toBeInTheDocument()
  })

  it('shows build mode placeholder zeros', () => {
    render(
      <Renderer
        instanceId="io3"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getAllByPlaceholderText('0').length).toBeGreaterThan(0)
  })
})

describe('intake-output calculations', () => {
  it('calcUOP returns mL/hr rounded to 1 decimal', () => {
    expect(calcUOP(1200, 8)).toBe(150)
    expect(calcUOP(1000, 3)).toBeCloseTo(333.3, 1)
  })

  it('calcUOP returns 0 when hours is 0', () => {
    expect(calcUOP(500, 0)).toBe(0)
  })

  it('calcNetBalance totals intake minus output', () => {
    const data = {
      po: 500,
      ivFluids: [{ label: 'NS', ml: 1000 }, { label: 'LR', ml: 500 }],
      urine: 800,
      urineHours: 8,
      stool: 100,
      drains: [{ label: 'JP', ml: 50 }],
    }
    // intake: 500 + 1000 + 500 = 2000
    // output: 800 + 100 + 50 = 950
    expect(calcNetBalance(data)).toBe(1050)
  })
})

describe('intake-output PrintView', () => {
  it('renders without crashing', () => {
    render(<PrintView config={defaultConfig} data={emptyData} />)
  })
})
