import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MacroBadge, MacroRow } from '@components/common/MacroBadge'

describe('MacroBadge', () => {
  it('renders rounded value and unit for calories', () => {
    render(<MacroBadge type="calories" value={452.6} />)
    expect(screen.getByText('453')).toBeInTheDocument()
    expect(screen.getByText('kcal')).toBeInTheDocument()
  })

  it('renders grams unit for protein', () => {
    render(<MacroBadge type="protein" value={28} />)
    expect(screen.getByText('28')).toBeInTheDocument()
    expect(screen.getByText('g')).toBeInTheDocument()
  })
})

describe('MacroRow', () => {
  it('renders all four macro badges', () => {
    render(<MacroRow calories={450} protein={28} carbs={52} fats={12} />)
    expect(screen.getByText('450')).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
    expect(screen.getByText('52')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })
})
