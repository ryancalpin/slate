import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const baseData = {
  drugName: 'Amoxicillin',
  weightKg: 20,
  doseMgKg: 25,
  frequency: 'q8h',
  concentrationMgMl: 250,
}

describe('Renderer', () => {
  it('calculates total dose and volume', () => {
    render(
      <Renderer
        instanceId="wbd-1"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // total dose = 20 * 25 = 500 mg
    expect(screen.getByText(/500(\s*)mg/i)).toBeInTheDocument()
    // volume = 500 / 250 = 2.00 mL
    expect(screen.getByText(/2\.00\s*mL/i)).toBeInTheDocument()
  })

  it('renders disclaimer', () => {
    render(
      <Renderer instanceId="wbd-2" config={{}} data={baseData} onDataChange={() => {}} mode="live" />
    )
    expect(screen.getByText(/verify doses against institutional pharmacy/i)).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders drug name and disclaimer', () => {
    render(<PrintView config={{}} data={baseData} />)
    expect(screen.getByText(/Amoxicillin/i)).toBeInTheDocument()
    expect(screen.getByText(/verify doses against institutional pharmacy/i)).toBeInTheDocument()
  })
})
