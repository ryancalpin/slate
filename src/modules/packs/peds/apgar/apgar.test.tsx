import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { calcApgar } from './index'

describe('calcApgar', () => {
  it('returns 0 for all zeros', () => {
    expect(calcApgar([0, 0, 0, 0, 0])).toBe(0)
  })

  it('returns 10 for all twos', () => {
    expect(calcApgar([2, 2, 2, 2, 2])).toBe(10)
  })

  it('returns correct partial score', () => {
    expect(calcApgar([1, 2, 1, 2, 1])).toBe(7)
  })
})

describe('Renderer', () => {
  it('renders Apgar score table', () => {
    render(
      <Renderer
        instanceId="apgar-1"
        config={{}}
        data={{ oneMin: [2, 2, 2, 2, 2], fiveMin: [2, 2, 2, 2, 2] }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Apgar Score/i)).toBeInTheDocument()
    expect(screen.getByText(/1-min/i)).toBeInTheDocument()
    expect(screen.getByText(/5-min/i)).toBeInTheDocument()
  })

  it('renders citation', () => {
    render(
      <Renderer instanceId="apgar-2" config={{}} data={{ oneMin: [0,0,0,0,0], fiveMin: [0,0,0,0,0] }} onDataChange={() => {}} mode="live" />
    )
    expect(screen.getByText(/Apgar V\./i)).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders scores and citation', () => {
    render(<PrintView config={{}} data={{ oneMin: [1,2,1,2,1], fiveMin: [2,2,2,2,2] }} />)
    expect(screen.getByText(/1-min.*7/i)).toBeInTheDocument()
    expect(screen.getByText(/5-min.*10/i)).toBeInTheDocument()
    expect(screen.getByText(/Apgar V\./i)).toBeInTheDocument()
  })
})
