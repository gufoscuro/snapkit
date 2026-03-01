<script lang="ts" module>
  // Re-export types for convenience
  export type { FormAPI } from './form-context'
  export type { ValidateFn } from './form-state.svelte'

  export type SubmitOption = string | null

  export type SuccessPayload<T = unknown> = {
    result: T
    option: SubmitOption
  }

  export type FailurePayload = {
    error: unknown
    message: string
    response?: unknown
  }
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import { browser, dev } from '$app/environment'
  import { registerForm } from '$components/runtime/devtools'
  import * as m from '$lib/paraglide/messages'
  import type { LegalEntityResourceConfig, ResourceCustomFieldConfig } from '$lib/stores/tenant-config/types'
  import type { ApiError } from '$utils/request'
  import type { Snippet } from 'svelte'
  import CustomFields from './CustomFields.svelte'
  import { setFormContext, type FormAPI } from './form-context'
  import { createFormState, type ValidateFn } from './form-state.svelte'

  type Props = {
    initialValues: T
    validate?: ValidateFn<T>
    resourceConfig?: LegalEntityResourceConfig
    onSubmit: (values: T) => Promise<unknown>
    onSuccess?: (payload: SuccessPayload<T>) => void
    onFailure?: (payload: FailurePayload) => void
    onServerSideValidationError?: (errors: Partial<Record<keyof T, string>>) => void
    locked?: boolean
    novalidate?: boolean
    /** Show custom fields section at the bottom of the form. Default: true */
    showCustomFields?: boolean
    class?: string
    children?: Snippet
    withContext?: Snippet<[FormAPI<T>]>
    bottom?: Snippet<[FormAPI<T>]>
  }

  let {
    initialValues,
    validate,
    resourceConfig,
    onSubmit,
    onSuccess,
    onFailure,
    locked = false,
    novalidate = true,
    showCustomFields = true,
    class: className = '',
    children,
    withContext,
    bottom,
    onServerSideValidationError = () => {
      if (browser) document.querySelector('[data-scrollable-content]')?.scrollTo({ top: 0, behavior: 'smooth' })
    },
  }: Props = $props()

  function buildEffectiveValidate(
    base: ValidateFn<T> | undefined,
    config: LegalEntityResourceConfig | undefined,
  ): ValidateFn<T> | undefined {
    if (!config) return base
    return (values: T): Partial<Record<keyof T, string>> => {
      const configErrors: Partial<Record<keyof T, string>> = {}
      for (const [field, fieldConfig] of Object.entries(config.fields)) {
        if (fieldConfig.required) {
          const value = values[field as keyof T]
          const empty =
            value === null ||
            value === undefined ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0)
          if (empty) {
            configErrors[field as keyof T] = m.validation_required_generic()
          }
        }
      }
      const baseErrors = base ? base(values) : {}
      return { ...configErrors, ...baseErrors }
    }
  }

  const formState = createFormState({
    getInitialValues: () => initialValues,
    getValidate: () => buildEffectiveValidate(validate, resourceConfig),
  })

  // === Custom Fields State ===
  const customFieldConfigs = $derived<ResourceCustomFieldConfig[]>(resourceConfig?.custom_fields ?? [])
  let customFieldValues = $state<Record<string, unknown>>({})
  let customFieldErrors = $state<Record<string, string>>({})
  let customFieldTouched = $state<Record<string, boolean>>({})

  function initCustomFieldValues(source: T) {
    const existing = (source as Record<string, unknown>).custom_fields
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      customFieldValues = { ...(existing as Record<string, unknown>) }
    } else {
      customFieldValues = {}
    }
  }

  // Initialize on mount
  initCustomFieldValues(initialValues)

  function updateCustomField(key: string, value: unknown) {
    customFieldValues = { ...customFieldValues, [key]: value }
  }

  function touchCustomField(key: string) {
    customFieldTouched = { ...customFieldTouched, [key]: true }
  }

  function isEmptyCustomFieldValue(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'number' && isNaN(value))
    )
  }

  function validateCustomField(key: string) {
    const config = customFieldConfigs.find(c => c.key === key)
    if (!config) return

    if (config.required && isEmptyCustomFieldValue(customFieldValues[key])) {
      customFieldErrors = { ...customFieldErrors, [key]: m.validation_required_generic() }
      return
    }

    // Clear error if valid
    const { [key]: _, ...rest } = customFieldErrors
    customFieldErrors = rest
  }

  function validateAllCustomFields(): boolean {
    const errors: Record<string, string> = {}
    const touched: Record<string, boolean> = {}
    for (const config of customFieldConfigs) {
      if (config.required && isEmptyCustomFieldValue(customFieldValues[config.key])) {
        errors[config.key] = m.validation_required_generic()
        touched[config.key] = true
      }
    }
    customFieldErrors = errors
    if (Object.keys(touched).length > 0) {
      customFieldTouched = { ...customFieldTouched, ...touched }
    }
    return Object.keys(errors).length === 0
  }

  // UI state
  let inflight = $state(false)
  let errorMessage = $state<string | null>(null)
  let errorResponse = $state<unknown>(null)
  let submitOption = $state<SubmitOption>(null)
  let submitter: HTMLInputElement | null = $state(null)

  // Form API exposed via context
  const formAPI: FormAPI<T> = {
    get values() {
      return formState.values
    },
    get errors() {
      return formState.errors
    },
    get touched() {
      return formState.touched
    },
    get isValid() {
      return formState.isValid
    },
    get isDirty() {
      return formState.isDirty
    },
    get inflight() {
      return inflight
    },
    get locked() {
      return locked
    },
    get errorMessage() {
      return errorMessage
    },
    get resourceConfig() {
      return resourceConfig
    },
    updateField: formState.updateField,
    validateField: formState.validateField,
    touchField: formState.touchField,
    reset: () => {
      formState.reset()
      initCustomFieldValues(initialValues)
      customFieldErrors = {}
      customFieldTouched = {}
    },
    submit: triggerSubmit,

    // Custom Fields
    get customFieldValues() {
      return customFieldValues
    },
    get customFieldErrors() {
      return customFieldErrors
    },
    get customFieldTouched() {
      return customFieldTouched
    },
    updateCustomField,
    touchCustomField,
    validateCustomField,
  }

  setFormContext(formAPI)

  // Register with devtools in development
  if (dev) {
    // Generate unique ID for this form instance
    const formId = `form-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    // Create lazy data getter
    const cleanup = registerForm({
      id: formId,
      label: 'Form',
      getData: () => ({
        values: formState.values,
        errors: formState.errors,
        touched: formState.touched,
        isValid: formState.isValid,
        isDirty: formState.isDirty,
        inflight: inflight,
        customFieldValues,
        customFieldErrors,
      }),
    })

    // Cleanup on unmount
    $effect(() => {
      return cleanup
    })
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    if (inflight || locked) return
    if (!formState.validate()) return

    // Validate custom fields (only when enabled and configured)
    const hasCustomFields = showCustomFields && customFieldConfigs.length > 0
    if (hasCustomFields && !validateAllCustomFields()) return

    inflight = true
    errorMessage = ''
    errorResponse = null

    try {
      // Build payload: inject custom_fields when enabled
      let payload: T
      if (hasCustomFields) {
        // Ensure boolean fields have explicit values
        const finalCustomFields = { ...customFieldValues }
        for (const config of customFieldConfigs) {
          if (config.type === 'boolean' && finalCustomFields[config.key] === undefined) {
            finalCustomFields[config.key] = false
          }
        }
        payload = { ...formState.values, custom_fields: finalCustomFields } as T
      } else {
        payload = formState.values
      }

      const result = (await onSubmit(payload)) as T
      onSuccess?.({ result, option: submitOption })
    } catch (error: unknown) {
      if (dev) console.info('FormUtil error:', error)

      try {
        const exception = error as ApiError
        errorResponse = exception.data

        if (exception.status === 422) {
          errorMessage = m.validation_error_generic()

          // Map server-side validation errors to form field errors
          const serverErrors = exception.data?.errors
          if (serverErrors && typeof serverErrors === 'object') {
            const fieldErrors: Partial<Record<keyof T, string>> = {}
            const cfErrors: Record<string, string> = {}

            for (const [field, messages] of Object.entries(serverErrors)) {
              if (Array.isArray(messages) && messages.length > 0) {
                // Route custom_fields.* errors to custom field state
                if (field.startsWith('custom_fields.')) {
                  const cfKey = field.replace('custom_fields.', '')
                  cfErrors[cfKey] = messages[0]
                  customFieldTouched = { ...customFieldTouched, [cfKey]: true }
                } else {
                  fieldErrors[field as keyof T] = messages[0]
                }
              }
            }

            if (Object.keys(fieldErrors).length > 0) {
              formState.setErrors(fieldErrors)
            }
            if (Object.keys(cfErrors).length > 0) {
              customFieldErrors = { ...customFieldErrors, ...cfErrors }
            }
            onServerSideValidationError(fieldErrors)
          }

          return
        }

        errorMessage = exception?.data?.error || m.common_error()
      } catch (parseError) {
        errorMessage = m.common_error()
      }

      onFailure?.({ error, message: errorMessage as string, response: errorResponse })
    } finally {
      inflight = false
    }
  }

  function triggerSubmit(option?: SubmitOption) {
    if (option) submitOption = option
    submitter?.click()
  }

  // Watch initialValues changes - only reset when initialValues actually changes
  let lastInitialValuesJson = $state('')
  let isFirstEffect = true

  $effect(() => {
    const currentJson = JSON.stringify(initialValues)

    // On first run, just capture the initial JSON and skip
    if (isFirstEffect) {
      isFirstEffect = false
      lastInitialValuesJson = currentJson
      return
    }

    // On subsequent runs, update form state if values changed
    if (currentJson !== lastInitialValuesJson) {
      lastInitialValuesJson = currentJson
      formState.setValues(initialValues)
      // Also re-initialize custom fields from new data
      initCustomFieldValues(initialValues)
      customFieldErrors = {}
      customFieldTouched = {}
    }
  })
</script>

<form onsubmit={handleSubmit} {novalidate} class={className}>
  <input bind:this={submitter} type="submit" class="hidden" aria-hidden="true" tabindex="-1" />
  {#if withContext}
    {@render withContext(formAPI)}
  {:else}
    {@render children?.()}
  {/if}

  {#if showCustomFields && customFieldConfigs.length > 0}
    <CustomFields configs={customFieldConfigs} />
  {/if}

  {#if bottom}
    {@render bottom(formAPI)}
  {/if}
</form>
