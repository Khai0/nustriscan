import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthScoreRing } from '@features/analysis/components/HealthScoreRing'

describe('HealthScoreRing', () => {
  it('renders the numeric score', () => {
    render(<HealthScoreRing score={82} grade="good" />)
    expect(screen.getByText('82')).toBeInTheDocument()
  })

  it('shows the grade label by default', () => {
    render(<HealthScoreRing score={90} grade="excellent" />)
    expect(screen.getByText(/Xuất sắc/)).toBeInTheDocument()
  })

  it('hides the grade label when showLabel is false', () => {
    render(<HealthScoreRing score={90} grade="excellent" showLabel={false} />)
    expect(screen.queryByText(/Xuất sắc/)).not.toBeInTheDocument()
  })

  it('renders correct label for poor grade', () => {
    render(<HealthScoreRing score={25} grade="poor" />)
    expect(screen.getByText(/Cần cải thiện/)).toBeInTheDocument()
  })

  it('renders correct label for fair grade', () => {
    render(<HealthScoreRing score={55} grade="fair" />)
    expect(screen.getByText(/Trung bình/)).toBeInTheDocument()
  })
})
