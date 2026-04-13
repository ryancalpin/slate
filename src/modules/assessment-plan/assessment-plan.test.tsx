// src/modules/assessment-plan/assessment-plan.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { assessmentPlanPlugin } from './index'

const defaultConfig = assessmentPlanPlugin.defaultConfig
const emptyData = { problems: [] }

describe('assessment-plan Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="ap1"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows problem fields when problems provided', () => {
    render(
      <Renderer
        instanceId="ap2"
        config={defaultConfig}
        data={{ problems: [{ id: '1', name: 'Sepsis', assessment: 'Improving', plan: 'Continue abx' }] }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Sepsis')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Improving')).toBeInTheDocument()
  })

  it('shows one placeholder problem in build mode', () => {
    render(
      <Renderer
        instanceId="ap3"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getByPlaceholderText('Problem name')).toBeInTheDocument()
  })

  it('calls onDataChange when add problem clicked', async () => {
    const user = userEvent.setup()
    const onDataChange = vi.fn()
    render(
      <Renderer
        instanceId="ap4"
        config={defaultConfig}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    await user.click(screen.getByText('+ Add Problem'))
    expect(onDataChange).toHaveBeenCalled()
  })
})

describe('assessment-plan PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={defaultConfig}
        data={{ problems: [{ id: '1', name: 'HTN', assessment: 'Stable', plan: 'Continue home meds' }] }}
      />
    )
  })
})
