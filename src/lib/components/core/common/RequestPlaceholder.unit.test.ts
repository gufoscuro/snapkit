import { render, screen, cleanup } from '@testing-library/svelte'
import { describe, expect, it, afterEach, vi } from 'vitest'
import RequestPlaceholder from './RequestPlaceholder.svelte'

function createMockResponse(
  error: { message: string } | null = null,
): Promise<{ data: unknown; error: typeof error }> {
  return Promise.resolve({ data: null, error })
}

describe('RequestPlaceholder', () => {
  afterEach(() => cleanup())

  it('renders nothing when promise is null', () => {
    const { container } = render(RequestPlaceholder, {
      props: { promise: null },
    })
    expect(container.textContent?.trim()).toBe('')
  })

  it('shows error heading after promise resolves with error', async () => {
    const promise = createMockResponse({ message: 'Something went wrong' })
    render(RequestPlaceholder, {
      props: { promise: promise as any },
    })

    await vi.waitFor(() => {
      expect(screen.getByText('Ouch!')).toBeInTheDocument()
    })
  })

  it('shows error message text after promise resolves with error', async () => {
    const promise = createMockResponse({ message: 'Something went wrong' })
    render(RequestPlaceholder, {
      props: { promise: promise as any },
    })

    await vi.waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  it('shows default error message when error.message is empty', async () => {
    const promise = createMockResponse({ message: '' })
    render(RequestPlaceholder, {
      props: { promise: promise as any },
    })

    await vi.waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument()
    })
  })
})
