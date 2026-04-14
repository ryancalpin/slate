import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SepsisRenderer } from './Renderer'
import { calcQSOFA } from './Renderer'

const defaultData = {
  rrHigh: false,
  ams: false,
  sbpLow: false,
  suspectedInfection: false,
  sofaDelta: 0,
}

describe('calcQSOFA', () => {
  it('returns 0 when all false', () => {
    expect(calcQSOFA(false, false, false)).toBe(0)
  })

  it('returns 1 when one criterion true', () => {
    expect(calcQSOFA(true, false, false)).toBe(1)
    expect(calcQSOFA(false, true, false)).toBe(1)
    expect(calcQSOFA(false, false, true)).toBe(1)
  })

  it('returns 2 when two criteria true', () => {
    expect(calcQSOFA(true, true, false)).toBe(2)
  })

  it('returns 3 when all three criteria true', () => {
    expect(calcQSOFA(true, true, true)).toBe(3)
  })
})

describe('SepsisRenderer', () => {
  it('renders qSOFA checkboxes', () => {
    render(
      <SepsisRenderer
        instanceId="s-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/RR\s*≥\s*22/)).toBeTruthy()
    expect(screen.getByText(/Altered mental status/i)).toBeTruthy()
    expect(screen.getByText(/SBP\s*≤\s*100/)).toBeTruthy()
  })

  it('shows qSOFA score of 0 initially', () => {
    render(
      <SepsisRenderer
        instanceId="s-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('qSOFA Score: 0')).toBeTruthy()
  })

  it('shows alert when qSOFA ≥ 2', () => {
    render(
      <SepsisRenderer
        instanceId="s-3"
        config={{}}
        data={{ ...defaultData, rrHigh: true, ams: true }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/qSOFA ≥2: Consider sepsis workup/)).toBeTruthy()
  })

  it('does not show alert when qSOFA < 2', () => {
    render(
      <SepsisRenderer
        instanceId="s-4"
        config={{}}
        data={{ ...defaultData, rrHigh: true }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.queryByText(/Consider sepsis workup/)).toBeNull()
  })

  it('renders Sepsis-3 fields: suspected infection and SOFA delta', () => {
    render(
      <SepsisRenderer
        instanceId="s-5"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Suspected infection/i)).toBeTruthy()
    expect(screen.getByText(/SOFA delta/i)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <SepsisRenderer
        instanceId="s-6"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Singer M et al/)).toBeTruthy()
  })

  it('calls onDataChange when RR checkbox toggled', () => {
    const onDataChange = vi.fn()
    render(
      <SepsisRenderer
        instanceId="s-7"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    expect(onDataChange).toHaveBeenCalledOnce()
    expect(onDataChange.mock.calls[0][0].rrHigh).toBe(true)
  })
})
