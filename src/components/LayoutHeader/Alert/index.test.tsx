import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import LayoutAlert from './index'

describe('LayoutAlert', () => {
  it('links to the webinar registration page with the event details', () => {
    const { container } = render(<LayoutAlert onDismiss={vi.fn()} />)

    const link = screen.getByRole('link', {
      name: /See how AWS built end-to-end ML lineage with DVC, SageMaker & MLflow/i
    })
    const time = container.querySelector('time')

    expect(link.getAttribute('href')).toBe(
      'https://dvc.org/webinars/end-to-end-lineage-aws-dvc-mlflow/'
    )
    expect(time?.getAttribute('datetime')).toBe('2026-09-22')
    expect(link.textContent).toContain('Join us Sept. 22')
  })

  it('can be dismissed', () => {
    const onDismiss = vi.fn()

    render(<LayoutAlert onDismiss={onDismiss} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss webinar announcement' })
    )

    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
