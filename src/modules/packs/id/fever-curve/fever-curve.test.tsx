import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FeverRenderer } from './Renderer'

const emptyData = { entries: [], feverThresholdC: 38.0 }
const sampleData = {
  entries: [
    { timestamp: '2026-04-10T08:00', tempC: 37.2 },
    { timestamp: '2026-04-10T14:00', tempC: 38.9 },
    { timestamp: '2026-04-11T08:00', tempC: 37.5 },
  ],
  feverThresholdC: 38.0,
}

describe('FeverRenderer', () => {
  it('renders column headers', () => {
    render(
      <FeverRenderer
        instanceId="f-1"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('Timestamp')).toBeTruthy()
    expect(screen.getByText('Temp (°C)')).toBeTruthy()
    expect(screen.getByText('Trend')).toBeTruthy()
  })

  it('renders entries and flags fever row', () => {
    render(
      <FeverRenderer
        instanceId="f-2"
        config={{}}
        data={sampleData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('38.9')).toBeTruthy()
    expect(screen.getByText('37.2')).toBeTruthy()
    // Fever row should have a red indicator label
    expect(screen.getByText('FEVER')).toBeTruthy()
  })

  it('calls onDataChange when Add Entry is clicked', () => {
    const onDataChange = vi.fn()
    render(
      <FeverRenderer
        instanceId="f-3"
        config={{}}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText('+ Add Entry'))
    expect(onDataChange).toHaveBeenCalledOnce()
    expect(onDataChange.mock.calls[0][0].entries).toHaveLength(1)
  })

  it('shows sparkline bars for each entry', () => {
    const { container } = render(
      <FeverRenderer
        instanceId="f-4"
        config={{}}
        data={sampleData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // Each entry gets a sparkline bar div with data-testid
    const bars = container.querySelectorAll('[data-testid="sparkline-bar"]')
    expect(bars.length).toBe(3)
  })

  it('does not show Add Entry button in build mode', () => {
    render(
      <FeverRenderer
        instanceId="f-5"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="build"
      />
    )
    expect(screen.queryByText('+ Add Entry')).toBeNull()
  })
})
