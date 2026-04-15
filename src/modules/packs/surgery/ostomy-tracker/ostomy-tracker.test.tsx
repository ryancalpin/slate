import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const today = new Date().toISOString().slice(0, 10)

const baseData = {
  stomaType: 'ileostomy',
  entries: [
    { date: today, shift: 'day', volumeMl: 300, character: 'liquid' },
    { date: today, shift: 'evening', volumeMl: 200, character: 'liquid' },
  ],
  skinStatus: 'intact',
  lastApplianceChange: '2026-04-12',
}

describe('Renderer', () => {
  it('renders stoma type selector', () => {
    render(
      <Renderer
        instanceId="ot-1"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('ileostomy')).toBeTruthy()
  })

  it('shows correct daily output total', () => {
    render(
      <Renderer
        instanceId="ot-2"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/500 mL/)).toBeTruthy()
  })

  it('renders entry rows', () => {
    render(
      <Renderer
        instanceId="ot-3"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getAllByDisplayValue('liquid').length).toBeGreaterThan(0)
  })

  it('calls onDataChange when Add Entry is clicked', () => {
    const onChange = vi.fn()
    render(
      <Renderer
        instanceId="ot-4"
        config={{}}
        data={{ ...baseData, entries: [] }}
        onDataChange={onChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText(/add entry/i))
    expect(onChange).toHaveBeenCalled()
  })

  it('renders skin status selector', () => {
    render(
      <Renderer
        instanceId="ot-5"
        config={{}}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('intact')).toBeTruthy()
  })
})

describe('PrintView', () => {
  it('renders stoma type and skin status in print view', () => {
    render(<PrintView config={{}} data={baseData} />)
    expect(screen.getByText(/ileostomy/i)).toBeTruthy()
    expect(screen.getByText(/intact/i)).toBeTruthy()
  })
})
