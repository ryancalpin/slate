import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const baseData = {
  fundalHeight: 2,
  fundalFirmness: 'firm',
  lochiaCharacter: 'rubra',
  lochiaVolume: 'light',
  perineumStatus: 'intact',
  breastfeeding: 'exclusive',
  moodNote: 'Appears well',
}

describe('Renderer', () => {
  it('renders postpartum fields', () => {
    render(
      <Renderer
        instanceId="pp-1"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Postpartum Assessment/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders all postpartum fields', () => {
    render(<PrintView config={{}} data={baseData} />)
    expect(screen.getByText(/Postpartum Assessment/i)).toBeInTheDocument()
    expect(screen.getByText(/rubra/i)).toBeInTheDocument()
    expect(screen.getByText(/Appears well/i)).toBeInTheDocument()
  })
})
