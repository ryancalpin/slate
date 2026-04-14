import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CultureRenderer } from './Renderer'

const emptyData = { cultures: [] }
const sampleData = {
  cultures: [
    {
      date: '2026-04-10',
      source: 'blood',
      organism: 'S. aureus',
      gramStain: 'Gram+ cocci in clusters',
      sensitivities: 'Oxacillin R, Vancomycin S',
      implications: 'Switch to Vancomycin',
    },
  ],
}

describe('CultureRenderer', () => {
  it('renders table headers', () => {
    render(
      <CultureRenderer
        instanceId="c-1"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('Date')).toBeTruthy()
    expect(screen.getByText('Source')).toBeTruthy()
    expect(screen.getByText('Organism')).toBeTruthy()
    expect(screen.getByText('Gram Stain')).toBeTruthy()
    expect(screen.getByText('Sensitivities')).toBeTruthy()
    expect(screen.getByText('Treatment Implications')).toBeTruthy()
  })

  it('renders existing culture rows', () => {
    render(
      <CultureRenderer
        instanceId="c-2"
        config={{}}
        data={sampleData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('S. aureus')).toBeTruthy()
    expect(screen.getByDisplayValue('Oxacillin R, Vancomycin S')).toBeTruthy()
  })

  it('calls onDataChange with new row when Add is clicked', () => {
    const onDataChange = vi.fn()
    render(
      <CultureRenderer
        instanceId="c-3"
        config={{}}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText('+ Add Culture'))
    expect(onDataChange).toHaveBeenCalledOnce()
    expect(onDataChange.mock.calls[0][0].cultures).toHaveLength(1)
  })

  it('source dropdown has expected options', () => {
    render(
      <CultureRenderer
        instanceId="c-4"
        config={{}}
        data={sampleData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('blood')).toBeTruthy()
  })

  it('removes a row when remove button is clicked', () => {
    const onDataChange = vi.fn()
    render(
      <CultureRenderer
        instanceId="c-5"
        config={{}}
        data={sampleData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByLabelText('Remove culture'))
    expect(onDataChange).toHaveBeenCalledOnce()
    expect(onDataChange.mock.calls[0][0].cultures).toHaveLength(0)
  })
})
