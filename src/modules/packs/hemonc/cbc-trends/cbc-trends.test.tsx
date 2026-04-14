import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CBCTrendsRenderer } from './Renderer'
import { findNadir } from './Renderer'

const emptyData = { entries: [] }

const sampleData = {
  entries: [
    { date: '2026-04-10', wbc: 4.5, anc: 2.1, hgb: 12.0, plt: 180 },
    { date: '2026-04-11', wbc: 1.2, anc: 0.4, hgb: 9.5, plt: 55 },
    { date: '2026-04-12', wbc: 2.8, anc: 1.0, hgb: 10.2, plt: 90 },
  ],
}

const noop = () => {}

describe('findNadir', () => {
  it('returns the index and value of the minimum', () => {
    const result = findNadir([4.5, 1.2, 2.8])
    expect(result).toEqual({ index: 1, value: 1.2 })
  })

  it('handles a single-element array', () => {
    const result = findNadir([7.0])
    expect(result).toEqual({ index: 0, value: 7.0 })
  })

  it('returns the first occurrence when values tie', () => {
    const result = findNadir([3.0, 1.0, 1.0])
    expect(result).toEqual({ index: 1, value: 1.0 })
  })
})

describe('CBCTrendsRenderer', () => {
  it('renders column headers', () => {
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/WBC/)).toBeTruthy()
    expect(screen.getByText(/ANC/)).toBeTruthy()
    expect(screen.getByText(/Hgb/)).toBeTruthy()
    expect(screen.getByText(/Plt/)).toBeTruthy()
  })

  it('renders entry rows', () => {
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('2026-04-10')).toBeTruthy()
    expect(screen.getByText('2026-04-11')).toBeTruthy()
  })

  it('renders a nadir badge on the lowest WBC row', () => {
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    // nadir WBC is 1.2 on 2026-04-11
    const nadirBadges = screen.getAllByText('nadir')
    expect(nadirBadges.length).toBeGreaterThan(0)
  })

  it('renders recovery arrow when last value exceeds nadir', () => {
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    // Last WBC (2.8) > nadir (1.2) → should show ↑
    expect(screen.getAllByText('↑').length).toBeGreaterThan(0)
  })

  it('shows Add Row button in build mode', () => {
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={noop}
        mode="build"
      />
    )
    expect(screen.getByRole('button', { name: /add row/i })).toBeTruthy()
  })

  it('calls onDataChange when Add Row is clicked', () => {
    const onChange = vi.fn()
    render(
      <CBCTrendsRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={onChange}
        mode="build"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /add row/i }))
    expect(onChange).toHaveBeenCalled()
    const newData = onChange.mock.calls[0][0]
    expect(newData.entries).toHaveLength(1)
  })
})
