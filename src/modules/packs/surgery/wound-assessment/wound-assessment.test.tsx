import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const baseData = {
  location: 'Right lower quadrant',
  woundType: 'surgical incision',
  vac: null,
  dehiscence: 'none',
  description: 'Clean, dry, intact',
  assessmentDate: '2026-04-13',
}

describe('Renderer', () => {
  it('renders wound location', () => {
    render(
      <Renderer
        instanceId="w-1"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Right lower quadrant')).toBeTruthy()
  })

  it('shows VAC settings when woundType is VAC', () => {
    const vacData = { ...baseData, woundType: 'VAC', vac: { mode: 'continuous', pressure: 125, dressingDate: '2026-04-12' } }
    render(
      <Renderer
        instanceId="w-2"
        config={{}}
        data={vacData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/VAC Settings/i)).toBeTruthy()
    expect(screen.getByDisplayValue('125')).toBeTruthy()
  })

  it('hides VAC settings when woundType is not VAC', () => {
    render(
      <Renderer
        instanceId="w-3"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.queryByText(/VAC Settings/i)).toBeNull()
  })

  it('calls onDataChange when location input changes', () => {
    const onChange = vi.fn()
    render(
      <Renderer
        instanceId="w-4"
        config={{}}
        data={baseData}
        onDataChange={onChange}
        mode="live"
      />
    )
    const input = screen.getByDisplayValue('Right lower quadrant')
    fireEvent.change(input, { target: { value: 'Midline' } })
    expect(onChange).toHaveBeenCalled()
  })
})

describe('PrintView', () => {
  it('renders wound location and type in print view', () => {
    render(<PrintView config={{}} data={baseData} />)
    expect(screen.getByText('Right lower quadrant')).toBeTruthy()
    expect(screen.getByText(/surgical incision/i)).toBeTruthy()
  })
})
