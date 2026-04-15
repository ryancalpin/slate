import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcNAS } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

describe('calcNAS', () => {
  it('sums all item scores', () => {
    // 25 items, all zeros
    expect(calcNAS(new Array(25).fill(0))).toBe(0)
  })

  it('sums mixed scores', () => {
    const items = new Array(25).fill(0)
    items[0] = 2   // crying
    items[4] = 3   // tremors undisturbed
    items[8] = 5   // generalized convulsions
    expect(calcNAS(items)).toBe(10)
  })

  it('handles threshold ≥8', () => {
    const items = new Array(25).fill(0)
    items[0] = 2
    items[1] = 3
    items[2] = 3
    expect(calcNAS(items)).toBeGreaterThanOrEqual(8)
  })
})

describe('Renderer', () => {
  it('renders NAS scoring form', () => {
    render(
      <Renderer
        instanceId="nas-1"
        config={{}}
        data={{ items: new Array(25).fill(0) }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/NAS.*Finnegan/i)).toBeInTheDocument()
  })

  it('renders citation', () => {
    render(
      <Renderer instanceId="nas-2" config={{}} data={{ items: new Array(25).fill(0) }} onDataChange={() => {}} mode="live" />
    )
    expect(screen.getByText(/Finnegan LP/i)).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders citation and total', () => {
    render(<PrintView config={{}} data={{ items: new Array(25).fill(0) }} />)
    expect(screen.getByText(/Finnegan LP/i)).toBeInTheDocument()
    expect(screen.getByText(/Total.*0/i)).toBeInTheDocument()
  })
})
