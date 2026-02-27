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
  import type { LegalEntityResourceConfig } from '$lib/stores/tenant-config/types'
  import type { ApiError } from '$utils/request'
  import type { Snippet } from 'svelte'
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
    class?: string
    children?: Snippet
    withContext?: Snippet<[FormAPI<T>]>
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
    class: className = '',
    children,
    withContext,
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
    reset: formState.reset,
    submit: triggerSubmit,
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

    inflight = true
    errorMessage = ''
    errorResponse = null

    try {
      const result = (await onSubmit(formState.values)) as T
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
            for (const [field, messages] of Object.entries(serverErrors)) {
              if (Array.isArray(messages) && messages.length > 0) {
                fieldErrors[field as keyof T] = messages[0]
              }
            }
            if (Object.keys(fieldErrors).length > 0) {
              formState.setErrors(fieldErrors)
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
</form>
