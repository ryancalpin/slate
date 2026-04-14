import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NutritionRenderer, calcPctGoal } from './Renderer'

describe('calcPctGoal', () => {
  it('returns 0 when goal is 0', () => {
    expect(calcPctGoal(100, 0)).toBe(0)
  })

  it('returns 100 when current equals goal', () => {
    expect(calcPctGoal(2000, 2000)).toBe(100)
  })

  it('returns correct percentage', () => {
    expect(calcPctGoal(1500, 2000)).toBe(75)
  })

  it('caps at 100 when over goal', () => {
    expect(calcPctGoal(2500, 2000)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calcPctGoal(1, 3)).toBe(33)
  })
})

const defaultData = {
  mode: 'EN' as const,
  weightKg: 70,
  kcalGoalPerKg: 25,
  proteinGoalPerKg: 1.2,
  kcalCurrentPerDay: 0,
  proteinCurrentPerDay: 0,
}

const filledData = {
  mode: 'EN' as const,
  weightKg: 80,
  kcalGoalPerKg: 30,
  proteinGoalPerKg: 2.0,
  kcalCurrentPerDay: 1800,
  proteinCurrentPerDay: 120,
}

describe('NutritionRenderer', () => {
  it('renders EN and PN mode buttons', () => {
    render(
      <NutritionRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('EN')).toBeTruthy()
    expect(screen.getByText('PN')).toBeTruthy()
  })

  it('renders weight, kcal, and protein fields', () => {
    render(
      <NutritionRenderer
        instanceId="test-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/Weight/i)).toBeTruthy()
    expect(screen.getByLabelText(/kcal goal/i)).toBeTruthy()
    expect(screen.getByLabelText(/protein goal/i)).toBeTruthy()
  })

  it('calculates total kcal goal from weight × kcalGoalPerKg', () => {
    render(
      <NutritionRenderer
        instanceId="test-3"
        config={{}}
        data={filledData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // 80 × 30 = 2400 kcal/day goal
    expect(screen.getByText(/2400/)).toBeTruthy()
  })

  it('calculates total protein goal from weight × proteinGoalPerKg', () => {
    render(
      <NutritionRenderer
        instanceId="test-4"
        config={{}}
        data={filledData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // 80 × 2.0 = 160 g/day goal
    expect(screen.getByText(/160/)).toBeTruthy()
  })

  it('calls onDataChange when mode toggled to PN', () => {
    const onDataChange = vi.fn()
    render(
      <NutritionRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText('PN'))
    expect(onDataChange).toHaveBeenCalledOnce()
    expect(onDataChange.mock.calls[0][0].mode).toBe('PN')
  })

  it('shows % of goal for kcal', () => {
    render(
      <NutritionRenderer
        instanceId="test-6"
        config={{}}
        data={filledData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // 1800 / 2400 = 75%
    expect(screen.getByText(/75%/)).toBeTruthy()
  })
})
