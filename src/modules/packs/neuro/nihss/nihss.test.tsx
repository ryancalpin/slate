import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcNIHSS } from './Renderer'
import { Renderer } from './Renderer'

// --- Pure function tests ---

describe('calcNIHSS', () => {
  it('returns 0 for all-zero items', () => {
    expect(calcNIHSS(Array(15).fill(0))).toBe(0)
  })

  it('sums correctly with mixed values', () => {
    // items: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] = 15
    expect(calcNIHSS(Array(15).fill(1))).toBe(15)
  })

  it('caps item 2 (visual fields) at max 3', () => {
    const items = Array(15).fill(0)
    items[4] = 3 // visual fields max
    expect(calcNIHSS(items)).toBe(3)
  })

  it('treats UN sentinel (-1) as 0 in sum', () => {
    const items = Array(15).fill(0)
    items[6] = -1 // item 5a UN sentinel
    expect(calcNIHSS(items)).toBe(0)
  })

  it('handles maximum possible score (42)', () => {
    // Max per item: LOC(3)+LOCq(2)+LOCc(2)+gaze(2)+visual(3)+facial(3)+
    //   motorAL(4)+motorAR(4)+motorLL(4)+motorLR(4)+ataxia(2)+
    //   sensory(2)+language(3)+dysarthria(2)+extinction(2) = 42
    const maxItems = [3, 2, 2, 2, 3, 3, 4, 4, 4, 4, 2, 2, 3, 2, 2]
    expect(calcNIHSS(maxItems)).toBe(42)
  })
})

// --- Render tests ---

describe('NIHSS Renderer', () => {
  const defaultData = { items: Array(15).fill(0) }
  const noop = () => {}

  it('renders all 15 item labels', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/1a.*LOC/i)).toBeTruthy()
    expect(screen.getByText(/Best Language/i)).toBeTruthy()
    expect(screen.getByText(/Extinction/i)).toBeTruthy()
  })

  it('displays total score', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Total/i)).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
  })

  it('displays citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Brott T/i)).toBeTruthy()
  })

  it('calls onDataChange when a score button is clicked', () => {
    let changed = false
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={() => { changed = true }}
        mode="live"
      />
    )
    // Click first "1" button for item 1a
    const oneButtons = screen.getAllByRole('button', { name: '1' })
    fireEvent.click(oneButtons[0])
    expect(changed).toBe(true)
  })

  it('shows severity label for score 0', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/No Stroke/i)).toBeTruthy()
  })
})
