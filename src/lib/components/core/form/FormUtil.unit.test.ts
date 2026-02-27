import { render, fireEvent, cleanup } from '@testing-library/svelte'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'

vi.mock('$app/environment', () => ({ dev: false }))
vi.mock('$components/runtime/devtools', () => ({ registerForm: vi.fn(() => vi.fn()) }))
vi.mock('$lib/paraglide/messages', () => ({
  validation_required_generic: () => 'This field is required',
  validation_error_generic: () => 'Validation Error',
  common_error: () => 'Generic Error',
}))

import FormUtil from './FormUtil.svelte'

function getForm(): HTMLFormElement {
  const form = document.querySelector('form')
  if (!form) throw new Error('Form element not found')
  return form
}

describe('FormUtil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => cleanup())

  it('renders a form element', () => {
    render(FormUtil, {
      props: {
        initialValues: { name: '' },
        onSubmit: vi.fn(),
      },
    })
    expect(getForm()).toBeInTheDocument()
  })

  it('sets novalidate by default', () => {
    render(FormUtil, {
      props: {
        initialValues: { name: '' },
        onSubmit: vi.fn(),
      },
    })
    expect(getForm()).toHaveAttribute('novalidate')
  })

  it('applies custom class to form element', () => {
    render(FormUtil, {
      props: {
        initialValues: { name: '' },
        onSubmit: vi.fn(),
        class: 'my-custom-class',
      },
    })
    expect(getForm().className).toContain('my-custom-class')
  })

  it('calls onSubmit with form values on form submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue({})
    render(FormUtil, {
      props: {
        initialValues: { name: 'test' },
        onSubmit,
      },
    })

    await fireEvent.submit(getForm())
    expect(onSubmit).toHaveBeenCalledWith({ name: 'test' })
  })

  it('calls onSuccess after successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ id: 1 })
    const onSuccess = vi.fn()
    render(FormUtil, {
      props: {
        initialValues: { name: 'test' },
        onSubmit,
        onSuccess,
      },
    })

    await fireEvent.submit(getForm())

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        result: { id: 1 },
        option: null,
      })
    })
  })

  it('does not submit when validation fails', async () => {
    const onSubmit = vi.fn().mockResolvedValue({})
    render(FormUtil, {
      props: {
        initialValues: { name: '' },
        onSubmit,
        validate: (values: { name: string }) => {
          const errors: Record<string, string> = {}
          if (!values.name) errors.name = 'Required'
          return errors
        },
      },
    })

    await fireEvent.submit(getForm())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit when locked', async () => {
    const onSubmit = vi.fn().mockResolvedValue({})
    render(FormUtil, {
      props: {
        initialValues: { name: 'test' },
        onSubmit,
        locked: true,
      },
    })

    await fireEvent.submit(getForm())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onFailure when submit throws', async () => {
    const error = new Error('Network error')
    const onSubmit = vi.fn().mockRejectedValue(error)
    const onFailure = vi.fn()
    render(FormUtil, {
      props: {
        initialValues: { name: 'test' },
        onSubmit,
        onFailure,
      },
    })

    await fireEvent.submit(getForm())

    await vi.waitFor(() => {
      expect(onFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          error,
          message: 'Generic Error',
        }),
      )
    })
  })

  it('prevents double submission while inflight', async () => {
    let resolveSubmit: (value: unknown) => void
    const submitPromise = new Promise((resolve) => {
      resolveSubmit = resolve
    })
    const onSubmit = vi.fn().mockReturnValue(submitPromise)

    render(FormUtil, {
      props: {
        initialValues: { name: 'test' },
        onSubmit,
      },
    })

    const form = getForm()

    // First submit
    await fireEvent.submit(form)
    // Second submit while first is pending
    await fireEvent.submit(form)

    expect(onSubmit).toHaveBeenCalledTimes(1)

    // Resolve the promise
    resolveSubmit!({})
  })
})
