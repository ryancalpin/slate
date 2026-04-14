import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SofaApacheRenderer, calcSOFA, calcAPACHEII } from './Renderer'

describe('calcSOFA', () => {
  it('returns 0 when all components are 0', () => {
    expect(calcSOFA(0, 0, 0, 0, 0, 0)).toBe(0)
  })

  it('returns 24 when all components are 4', () => {
    expect(calcSOFA(4, 4, 4, 4, 4, 4)).toBe(24)
  })

  it('returns correct sum', () => {
    expect(calcSOFA(2, 1, 3, 2, 1, 0)).toBe(9)
    expect(calcSOFA(0, 4, 0, 0, 0, 0)).toBe(4)
  })
})

describe('calcAPACHEII', () => {
  it('returns 0 when all inputs are 0', () => {
    expect(calcAPACHEII(0, 0, 0)).toBe(0)
  })

  it('returns sum of aps + age + chronic', () => {
    expect(calcAPACHEII(20, 5, 2)).toBe(27)
    expect(calcAPACHEII(10, 3, 0)).toBe(13)
  })

  it('handles max realistic values', () => {
    expect(calcAPACHEII(60, 6, 5)).toBe(71)
  })
})

const defaultData = {
  sofa: {
    pf: 0,
    platelets: 0,
    bilirubin: 0,
    cardio: 0,
    gcs: 0,
    creatinine: 0,
    uoPerDay: 0,
  },
  apache: {
    aps: 0,
    ageYears: 0,
    chronicPoints: 0,
  },
}

const filledData = {
  sofa: {
    pf: 2,
    platelets: 1,
    bilirubin: 1,
    cardio: 2,
    gcs: 1,
    creatinine: 1,
    uoPerDay: 0,
  },
  apache: {
    aps: 15,
    ageYears: 3,
    chronicPoints: 2,
  },
}

describe('SofaApacheRenderer', () => {
  it('renders SOFA and APACHE II headings', () => {
    render(
      <SofaApacheRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/SOFA/i)).toBeTruthy()
    expect(screen.getByText(/APACHE II/i)).toBeTruthy()
  })

  it('renders all 6 SOFA component labels', () => {
    render(
      <SofaApacheRenderer
        instanceId="test-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Respiration/i)).toBeTruthy()
    expect(screen.getByText(/Coagulation/i)).toBeTruthy()
    expect(screen.getByText(/Liver/i)).toBeTruthy()
    expect(screen.getByText(/Cardiovascular/i)).toBeTruthy()
    expect(screen.getByText(/CNS/i)).toBeTruthy()
    expect(screen.getByText(/Renal/i)).toBeTruthy()
  })

  it('displays calculated SOFA total', () => {
    render(
      <SofaApacheRenderer
        instanceId="test-3"
        config={{}}
        data={filledData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // pf=2 + platelets=1 + bilirubin=1 + cardio=2 + gcs=1 + creatinine=1 = 8
    expect(screen.getByText(/SOFA Total/i)).toBeTruthy()
    expect(screen.getByText('8')).toBeTruthy()
  })

  it('displays calculated APACHE II total', () => {
    render(
      <SofaApacheRenderer
        instanceId="test-4"
        config={{}}
        data={filledData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // aps=15 + age=3 + chronic=2 = 20
    expect(screen.getByText(/APACHE II Total/i)).toBeTruthy()
    expect(screen.getByText('20')).toBeTruthy()
  })

  it('renders both citations', () => {
    render(
      <SofaApacheRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Singer M/i)).toBeTruthy()
    expect(screen.getByText(/Knaus WA/i)).toBeTruthy()
  })

  it('calls onDataChange when a SOFA component score changes', () => {
    const onDataChange = vi.fn()
    render(
      <SofaApacheRenderer
        instanceId="test-6"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    // Click the button for Respiration score = 2
    const buttons = screen.getAllByRole('button')
    // Find "2" buttons and click first one for Respiration
    const scoreButtons = buttons.filter((b) => b.textContent === '2')
    fireEvent.click(scoreButtons[0])
    expect(onDataChange).toHaveBeenCalledOnce()
  })
})
