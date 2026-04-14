import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AncRenderer, classifyANC } from './Renderer'

const emptyData = { entries: [], antifungals: [], antivirals: [] }

describe('classifyANC', () => {
  it('classifies severe neutropenia when ANC < 500', () => {
    expect(classifyANC(499)).toBe('Severe neutropenia')
    expect(classifyANC(0)).toBe('Severe neutropenia')
  })

  it('classifies moderate neutropenia when ANC 500-1000', () => {
    expect(classifyANC(500)).toBe('Moderate neutropenia')
    expect(classifyANC(999)).toBe('Moderate neutropenia')
  })

  it('classifies mild neutropenia when ANC 1000-1500', () => {
    expect(classifyANC(1000)).toBe('Mild neutropenia')
    expect(classifyANC(1499)).toBe('Mild neutropenia')
  })

  it('classifies normal when ANC >= 1500', () => {
    expect(classifyANC(1500)).toBe('Normal')
    expect(classifyANC(5000)).toBe('Normal')
  })
})

describe('AncRenderer', () => {
  it('renders ANC log section headers', () => {
    render(
      <AncRenderer
        instanceId="a-1"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('Date')).toBeTruthy()
    expect(screen.getByText('ANC')).toBeTruthy()
    expect(screen.getByText('Classification')).toBeTruthy()
  })

  it('renders antifungal and antiviral sections', () => {
    render(
      <AncRenderer
        instanceId="a-2"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('Antifungals')).toBeTruthy()
    expect(screen.getByText('Antivirals')).toBeTruthy()
  })

  it('shows correct classification in rendered row', () => {
    render(
      <AncRenderer
        instanceId="a-3"
        config={{}}
        data={{
          entries: [{ date: '2026-04-10', anc: 350 }],
          antifungals: [],
          antivirals: [],
        }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('Severe neutropenia')).toBeTruthy()
  })

  it('calls onDataChange when Add ANC Entry is clicked', () => {
    const onDataChange = vi.fn()
    render(
      <AncRenderer
        instanceId="a-4"
        config={{}}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText('+ Add ANC Entry'))
    expect(onDataChange).toHaveBeenCalledOnce()
    expect(onDataChange.mock.calls[0][0].entries).toHaveLength(1)
  })

  it('renders antifungal input when one exists', () => {
    render(
      <AncRenderer
        instanceId="a-5"
        config={{}}
        data={{ entries: [], antifungals: ['Fluconazole'], antivirals: [] }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Fluconazole')).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <AncRenderer
        instanceId="a-6"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/NCCN/)).toBeTruthy()
  })
})
