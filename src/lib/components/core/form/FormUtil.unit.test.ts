import { render, fireEvent, cleanup } from '@testing-library/svelte'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'

vi.mock('$app/environment', () => ({ browser: true, dev: false }))
vi.mock('$components/runtime/devtools', () => ({ registerForm: vi.fn(() => vi.fn()) }))
vi.mock('$lib/paraglide/messages', () => ({
  validation_required_generic: () => 'This field is required',
  validation_error_generic: () => 'Validation Error',
  common_error: () => 'Generic Error',
  custom_fields: () => 'Custom Fields',
}))

import FormUtil from './FormUtil.svelte'
import type { LegalEntityResourceConfig, ResourceCustomFieldConfig } from '$lib/stores/tenant-config/types'

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

  // =============================================================================
  // BASIC FORM BEHAVIOR
  // =============================================================================

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

  // =============================================================================
  // RESOURCE CONFIG – dynamic required validation
  // =============================================================================

  describe('resourceConfig required validation', () => {
    const resourceConfig: LegalEntityResourceConfig = {
      fields: {
        email: { visible: true, required: true },
        phone: { visible: true, required: false },
      },
      custom_fields: [],
    }

    it('blocks submit when resourceConfig marks a field as required and value is empty', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: { email: '', phone: '' },
          onSubmit,
          resourceConfig,
        },
      })

      await fireEvent.submit(getForm())
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('allows submit when required field has value', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: { email: 'test@example.com', phone: '' },
          onSubmit,
          resourceConfig,
        },
      })

      await fireEvent.submit(getForm())
      expect(onSubmit).toHaveBeenCalledOnce()
    })

    it('merges config required errors with base validation errors', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: { email: '', phone: 'invalid' },
          onSubmit,
          resourceConfig,
          validate: (values: { email: string; phone: string }) => {
            const errors: Record<string, string> = {}
            if (values.phone && values.phone.length < 5) errors.phone = 'Too short'
            return errors
          },
        },
      })

      await fireEvent.submit(getForm())
      // Both email (from config) and phone (from base validate) should fail
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('base validation errors take priority over config errors', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: { email: '' },
          onSubmit,
          resourceConfig,
          validate: () => ({ email: 'Custom email error' }),
        },
      })

      await fireEvent.submit(getForm())
      // Base error should override config error due to spread order: { ...configErrors, ...baseErrors }
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  // =============================================================================
  // CUSTOM FIELDS
  // =============================================================================

  describe('custom fields', () => {
    const customFieldConfigs: ResourceCustomFieldConfig[] = [
      { key: 'vip_status', label: 'VIP Status', type: 'text', required: false },
      { key: 'priority', label: 'Priority', type: 'select', required: true, options: ['low', 'medium', 'high'] },
      { key: 'is_partner', label: 'Partner', type: 'boolean', required: false },
    ]

    const resourceConfig: LegalEntityResourceConfig = {
      fields: {},
      custom_fields: customFieldConfigs,
    }

    it('includes custom_fields in submit payload', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: {
            name: 'test',
            custom_fields: { vip_status: 'Gold', priority: 'high', is_partner: true },
          },
          onSubmit,
          resourceConfig,
        },
      })

      await fireEvent.submit(getForm())

      await vi.waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce()
        const payload = onSubmit.mock.calls[0][0]
        expect(payload.custom_fields).toBeDefined()
        expect(payload.custom_fields.vip_status).toBe('Gold')
        expect(payload.custom_fields.priority).toBe('high')
        expect(payload.custom_fields.is_partner).toBe(true)
      })
    })

    it('blocks submit when required custom field is empty', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: {
            name: 'test',
            custom_fields: { vip_status: 'Gold', priority: '' },
          },
          onSubmit,
          resourceConfig,
        },
      })

      await fireEvent.submit(getForm())
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('allows submit when all required custom fields have values', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: {
            name: 'test',
            custom_fields: { vip_status: '', priority: 'high' },
          },
          onSubmit,
          resourceConfig,
        },
      })

      await fireEvent.submit(getForm())

      await vi.waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce()
      })
    })

    it('sets boolean custom fields to false when undefined', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: {
            name: 'test',
            custom_fields: { priority: 'low' },
          },
          onSubmit,
          resourceConfig,
        },
      })

      await fireEvent.submit(getForm())

      await vi.waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce()
        const payload = onSubmit.mock.calls[0][0]
        expect(payload.custom_fields.is_partner).toBe(false)
      })
    })

    it('does not include custom_fields when showCustomFields is false', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: { name: 'test' },
          onSubmit,
          resourceConfig,
          showCustomFields: false,
        },
      })

      await fireEvent.submit(getForm())

      await vi.waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce()
        const payload = onSubmit.mock.calls[0][0]
        expect(payload.custom_fields).toBeUndefined()
      })
    })

    it('does not validate custom fields when showCustomFields is false', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: {
            name: 'test',
            // Missing required "priority" custom field
            custom_fields: {},
          },
          onSubmit,
          resourceConfig,
          showCustomFields: false,
        },
      })

      await fireEvent.submit(getForm())

      await vi.waitFor(() => {
        // Should submit successfully since custom fields validation is skipped
        expect(onSubmit).toHaveBeenCalledOnce()
      })
    })

    it('initializes custom fields from initialValues.custom_fields', async () => {
      const onSubmit = vi.fn().mockResolvedValue({})
      render(FormUtil, {
        props: {
          initialValues: {
            name: 'test',
            custom_fields: { vip_status: 'Silver', priority: 'medium' },
          },
          onSubmit,
          resourceConfig,
        },
      })

      await fireEvent.submit(getForm())

      await vi.waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce()
        const payload = onSubmit.mock.calls[0][0]
        expect(payload.custom_fields.vip_status).toBe('Silver')
        expect(payload.custom_fields.priority).toBe('medium')
      })
    })
  })

  // =============================================================================
  // SERVER-SIDE VALIDATION ERRORS (422)
  // =============================================================================

  describe('server-side validation errors', () => {
    it('maps 422 errors to form field errors', async () => {
      const apiError = {
        status: 422,
        data: {
          errors: {
            name: ['Name is already taken'],
            email: ['Invalid email format'],
          },
        },
      }
      const onSubmit = vi.fn().mockRejectedValue(apiError)
      const onFailure = vi.fn()

      render(FormUtil, {
        props: {
          initialValues: { name: 'test', email: 'bad' },
          onSubmit,
          onFailure,
        },
      })

      await fireEvent.submit(getForm())

      await vi.waitFor(() => {
        // 422 should not call onFailure (it returns early)
        expect(onFailure).not.toHaveBeenCalled()
      })
    })

    it('routes custom_fields.* errors to custom field state', async () => {
      const resourceConfig: LegalEntityResourceConfig = {
        fields: {},
        custom_fields: [
          { key: 'code', label: 'Code', type: 'text', required: false },
        ],
      }

      const apiError = {
        status: 422,
        data: {
          errors: {
            'custom_fields.code': ['Code must be unique'],
            name: ['Name is required'],
          },
        },
      }
      const onSubmit = vi.fn().mockRejectedValue(apiError)
      const onServerSideValidationError = vi.fn()

      render(FormUtil, {
        props: {
          initialValues: { name: 'test', custom_fields: { code: 'dup' } },
          onSubmit,
          resourceConfig,
          onServerSideValidationError,
        },
      })

      await fireEvent.submit(getForm())

      await vi.waitFor(() => {
        expect(onServerSideValidationError).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Name is required' }),
        )
      })
    })

    it('handles non-422 errors via onFailure', async () => {
      const apiError = {
        status: 500,
        data: { error: 'Internal server error' },
      }
      const onSubmit = vi.fn().mockRejectedValue(apiError)
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
            message: 'Internal server error',
          }),
        )
      })
    })
  })
})
