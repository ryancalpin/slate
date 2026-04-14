import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer, calcFENa, calcFEUrea } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const defaultData = {
  naU: 20, crU: 100, naS: 140, crS: 2.0,
  ureaNu: 400, ureaS: 40, uOsm: 500, proteinU: 100,
}

const defaultConfig = {}

describe('calcFENa', () => {
  it('computes FENa correctly', () => {
    // (20 * 2.0) / (140 * 100) * 100 = 0.286%
    expect(calcFENa(20, 2.0, 140, 100)).toBeCloseTo(0.286, 2)
  })

  it('returns 0 if denominator is 0', () => {
    expect(calcFENa(20, 2.0, 0, 100)).toBe(0)
  })
})

describe('calcFEUrea', () => {
  it('computes FEUrea correctly', () => {
    // (400 * 2.0) / (40 * 100) * 100 = 20%
    expect(calcFEUrea(400, 2.0, 40, 100)).toBeCloseTo(20, 1)
  })

  it('returns 0 if denominator is 0', () => {
    expect(calcFEUrea(400, 2.0, 0, 100)).toBe(0)
  })
})

describe('urine-studies Renderer', () => {
  it('renders input fields', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByLabelText(/urine Na/i)).toBeDefined()
    expect(screen.getByLabelText(/serum Na/i)).toBeDefined()
  })

  it('renders FENa result', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/FENa/i)).toBeDefined()
  })

  it('renders FEUrea result', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/FEUrea/i)).toBeDefined()
  })

  it('renders protein/Cr ratio', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/protein.*cr ratio/i)).toBeDefined()
  })

  it('renders FENa citation', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/Miller TR/i)).toBeDefined()
  })

  it('renders FEUrea citation', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/Carvounis/i)).toBeDefined()
  })
})

describe('urine-studies Editor', () => {
  it('renders without crashing', () => {
    render(<Editor config={defaultConfig} onConfigChange={vi.fn()} />)
    expect(screen.getByText(/urine studies/i)).toBeDefined()
  })
})

describe('urine-studies PrintView', () => {
  it('renders calculated results', () => {
    render(<PrintView config={defaultConfig} data={defaultData} />)
    expect(screen.getByText(/FENa/i)).toBeDefined()
    expect(screen.getByText(/FEUrea/i)).toBeDefined()
  })
})
