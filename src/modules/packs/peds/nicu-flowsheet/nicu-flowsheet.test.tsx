import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const baseData = {
  tpn: { dextrose: 10, aa: 3, lipids: 2, calcium: 1.5, phosphate: 1, zinc: 400 },
  uac: { position: 'high T6-T9', insertDate: '2026-04-10', complications: 'None' },
  uvc: { position: 'junction of RA/IVC', insertDate: '2026-04-10', complications: 'None' },
  weights: [{ date: '2026-04-12', weightG: 1250 }, { date: '2026-04-13', weightG: 1260 }],
}

describe('Renderer', () => {
  it('renders NICU flowsheet sections', () => {
    render(
      <Renderer instanceId="nicu-1" config={{}} data={baseData} onDataChange={() => {}} mode="live" />
    )
    expect(screen.getByText(/NICU Flowsheet/i)).toBeInTheDocument()
    expect(screen.getByText(/TPN/i)).toBeInTheDocument()
    expect(screen.getByText(/UAC/i)).toBeInTheDocument()
    expect(screen.getByText(/UVC/i)).toBeInTheDocument()
  })

  it('renders lipid citation', () => {
    render(
      <Renderer instanceId="nicu-2" config={{}} data={baseData} onDataChange={() => {}} mode="live" />
    )
    expect(screen.getByText(/Koletzko/i)).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders weight trend', () => {
    render(<PrintView config={{}} data={baseData} />)
    expect(screen.getByText(/1250/)).toBeInTheDocument()
    expect(screen.getByText(/1260/)).toBeInTheDocument()
    expect(screen.getByText(/Koletzko/i)).toBeInTheDocument()
  })
})
