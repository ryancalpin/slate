// src/modules/medications/medications.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { medicationsPlugin } from './index'
import { getCategoryColor } from './Renderer'

const defaultConfig = medicationsPlugin.defaultConfig
const emptyData = { medications: [] }

describe('medications Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="m1"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows 2 placeholder rows in build mode', () => {
    const { container } = render(
      <Renderer
        instanceId="m2"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="build"
      />
    )
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(2)
  })

  it('calls onDataChange when add medication clicked', async () => {
    const user = userEvent.setup()
    const onDataChange = vi.fn()
    render(
      <Renderer
        instanceId="m3"
        config={defaultConfig}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    await user.click(screen.getByText('+ Add Medication'))
    expect(onDataChange).toHaveBeenCalled()
  })
})

describe('medications category highlighting', () => {
  const categories = defaultConfig.categories as Array<{ name: string; keywords: string; color: string }>

  it('matches vasopressor category for norepi', () => {
    expect(getCategoryColor('norepinephrine', categories)).toBe('red')
  })

  it('matches antibiotic category for vancomycin', () => {
    expect(getCategoryColor('vancomycin', categories)).toBe('yellow')
  })

  it('returns null for unmatched drug', () => {
    expect(getCategoryColor('aspirin', categories)).toBeNull()
  })
})

describe('medications PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={defaultConfig}
        data={{ medications: [{ id: '1', drug: 'Vancomycin', dose: '1g', route: 'IV', frequency: 'q12h', indication: 'MRSA' }] }}
      />
    )
  })
})
