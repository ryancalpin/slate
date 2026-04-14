import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PageTabs } from './PageTabs'
import type { TemplatePage } from '../../core/template/types'

const pages: TemplatePage[] = [
  { id: 'p1', name: 'Rounding', canvasMode: 'grid', layout: [] },
  { id: 'p2', name: 'Discharge', canvasMode: 'grid', layout: [] },
]

describe('PageTabs', () => {
  it('renders all page tab names', () => {
    render(
      <PageTabs
        pages={pages}
        activePageId="p1"
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        canEdit={true}
      />,
    )
    expect(screen.getByText('Rounding')).toBeInTheDocument()
    expect(screen.getByText('Discharge')).toBeInTheDocument()
  })

  it('calls onSelect when a tab is clicked', () => {
    const onSelect = vi.fn()
    render(
      <PageTabs
        pages={pages}
        activePageId="p1"
        onSelect={onSelect}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        canEdit={true}
      />,
    )
    fireEvent.click(screen.getByText('Discharge'))
    expect(onSelect).toHaveBeenCalledWith('p2')
  })

  it('calls onDelete when × button is clicked', () => {
    const onDelete = vi.fn()
    render(
      <PageTabs
        pages={pages}
        activePageId="p1"
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={onDelete}
        canEdit={true}
      />,
    )
    // Find the delete button for the Discharge tab (second tab)
    const deleteButtons = screen.getAllByRole('button', { name: /delete page/i })
    fireEvent.click(deleteButtons[1])
    expect(onDelete).toHaveBeenCalledWith('p2')
  })

  it('calls onAdd when + button is clicked', () => {
    const onAdd = vi.fn()
    render(
      <PageTabs
        pages={pages}
        activePageId="p1"
        onSelect={vi.fn()}
        onAdd={onAdd}
        onDelete={vi.fn()}
        canEdit={true}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /add page/i }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('hides delete and add buttons when canEdit is false', () => {
    render(
      <PageTabs
        pages={pages}
        activePageId="p1"
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        canEdit={false}
      />,
    )
    expect(screen.queryByRole('button', { name: /delete page/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add page/i })).not.toBeInTheDocument()
  })
})
