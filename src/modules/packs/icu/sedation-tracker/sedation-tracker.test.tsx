import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SedationRenderer } from './Renderer'
import { calcCPOT } from './Renderer'

const defaultData = {
  rass: 0,
  cpotFace: 0,
  cpotBody: 0,
  cpotMuscle: 0,
  cpotCompliance: 0,
  goalRassMin: -2,
  goalRassMax: 0,
}

describe('calcCPOT', () => {
  it('returns 0 when all subscales are 0', () => {
    expect(calcCPOT(0, 0, 0, 0)).toBe(0)
  })

  it('returns 8 when all subscales are 2', () => {
    expect(calcCPOT(2, 2, 2, 2)).toBe(8)
  })

  it('returns sum of all subscales', () => {
    expect(calcCPOT(1, 2, 0, 1)).toBe(4)
    expect(calcCPOT(0, 1, 2, 1)).toBe(4)
    expect(calcCPOT(2, 0, 1, 0)).toBe(3)
  })
})

describe('SedationRenderer', () => {
  it('renders RASS heading and descriptor for RASS 0', () => {
    render(
      <SedationRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/RASS/i)).toBeTruthy()
    expect(screen.getByText(/Alert & calm/i)).toBeTruthy()
  })

  it('shows IN GOAL badge when RASS is within goal range', () => {
    const inGoalData = { ...defaultData, rass: -1, goalRassMin: -2, goalRassMax: 0 }
    render(
      <SedationRenderer
        instanceId="test-2"
        config={{}}
        data={inGoalData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/IN GOAL/i)).toBeTruthy()
  })

  it('shows OUT OF GOAL badge when RASS is outside goal range', () => {
    const outData = { ...defaultData, rass: -4, goalRassMin: -2, goalRassMax: 0 }
    render(
      <SedationRenderer
        instanceId="test-3"
        config={{}}
        data={outData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/OUT OF GOAL/i)).toBeTruthy()
  })

  it('renders CPOT section with all 4 subscale labels', () => {
    render(
      <SedationRenderer
        instanceId="test-4"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Facial Expression/i)).toBeTruthy()
    expect(screen.getByText(/Body Movements/i)).toBeTruthy()
    expect(screen.getByText(/Muscle Tension/i)).toBeTruthy()
    expect(screen.getByText(/Compliance/i)).toBeTruthy()
  })

  it('renders both citations', () => {
    render(
      <SedationRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Sessler CN/i)).toBeTruthy()
    expect(screen.getByText(/Gélinas C/i)).toBeTruthy()
  })

  it('calls onDataChange when RASS changes', () => {
    const onDataChange = vi.fn()
    render(
      <SedationRenderer
        instanceId="test-6"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    const select = screen.getByLabelText(/RASS Score/i)
    fireEvent.change(select, { target: { value: '-3' } })
    expect(onDataChange).toHaveBeenCalledOnce()
    expect(onDataChange.mock.calls[0][0].rass).toBe(-3)
  })
})
