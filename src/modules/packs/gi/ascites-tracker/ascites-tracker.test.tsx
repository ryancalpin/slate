import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { needsAlbumin, AscitesRenderer } from './Renderer'

describe('needsAlbumin', () => {
  it('returns true when volume > 5L', () => {
    expect(needsAlbumin(5.1)).toBe(true)
    expect(needsAlbumin(6)).toBe(true)
    expect(needsAlbumin(10)).toBe(true)
  })

  it('returns false when volume <= 5L', () => {
    expect(needsAlbumin(5)).toBe(false)
    expect(needsAlbumin(4.9)).toBe(false)
    expect(needsAlbumin(0)).toBe(false)
  })
})

describe('AscitesRenderer', () => {
  const emptyData = {
    paracenteses: [],
    fluidWbc: 0,
    sbpDiagnosed: false,
    sbpTreatmentStarted: false,
  }

  const largeVolumeNoAlbumin = {
    paracenteses: [
      { date: '2026-04-10', volumeL: 6, albuminGiven: false },
    ],
    fluidWbc: 0,
    sbpDiagnosed: false,
    sbpTreatmentStarted: false,
  }

  const largeVolumeWithAlbumin = {
    paracenteses: [
      { date: '2026-04-10', volumeL: 6, albuminGiven: true },
    ],
    fluidWbc: 0,
    sbpDiagnosed: false,
    sbpTreatmentStarted: false,
  }

  it('renders paracentesis table headers', () => {
    render(
      <AscitesRenderer
        instanceId="test-1"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Date/i)).toBeTruthy()
    expect(screen.getByText(/Volume/i)).toBeTruthy()
    expect(screen.getByText(/Albumin Given/i)).toBeTruthy()
  })

  it('shows amber warning for large-volume paracentesis without albumin', () => {
    render(
      <AscitesRenderer
        instanceId="test-2"
        config={{}}
        data={largeVolumeNoAlbumin}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Large-volume paracentesis/i)).toBeTruthy()
    expect(screen.getByText(/albumin 8g\/L/i)).toBeTruthy()
  })

  it('does NOT show warning when albumin was given', () => {
    render(
      <AscitesRenderer
        instanceId="test-3"
        config={{}}
        data={largeVolumeWithAlbumin}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.queryByText(/Large-volume paracentesis/i)).toBeNull()
  })

  it('does NOT show warning for small-volume paracentesis', () => {
    const smallVolume = {
      paracenteses: [{ date: '2026-04-10', volumeL: 4, albuminGiven: false }],
      fluidWbc: 0,
      sbpDiagnosed: false,
      sbpTreatmentStarted: false,
    }
    render(
      <AscitesRenderer
        instanceId="test-4"
        config={{}}
        data={smallVolume}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.queryByText(/Large-volume paracentesis/i)).toBeNull()
  })

  it('renders SBP section', () => {
    render(
      <AscitesRenderer
        instanceId="test-5"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/SBP/i)).toBeTruthy()
    expect(screen.getByLabelText(/Fluid WBC/i)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <AscitesRenderer
        instanceId="test-6"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/EASL/i)).toBeTruthy()
  })

  it('calls onDataChange when Add Row button clicked', () => {
    const onDataChange = vi.fn()
    render(
      <AscitesRenderer
        instanceId="test-7"
        config={{}}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText(/Add Paracentesis/i))
    expect(onDataChange).toHaveBeenCalled()
    const newData = onDataChange.mock.calls[0][0]
    expect(newData.paracenteses).toHaveLength(1)
  })
})
