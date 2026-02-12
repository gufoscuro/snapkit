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
  import { dev } from '$app/environment'
  import { registerForm } from '$components/runtime/devtools'
  import type { Snippet } from 'svelte'
  import { setFormContext, type FormAPI } from './form-context'
  import { createFormState, type ValidateFn } from './form-state.svelte'

  type Props = {
    initialValues: T
    validate?: ValidateFn<T>
    onSubmit: (values: T) => Promise<unknown>
    onSuccess?: (payload: SuccessPayload) => void
    onFailure?: (payload: FailurePayload) => void
    locked?: boolean
    novalidate?: boolean
    class?: string
    children: Snippet
  }

  let {
    initialValues,
    validate,
    onSubmit,
    onSuccess,
    onFailure,
    locked = false,
    novalidate = true,
    class: className = '',
    children,
  }: Props = $props()

  const formState = createFormState({
    getInitialValues: () => initialValues,
    getValidate: () => validate,
  })

  // UI state
  let inflight = $state(false)
  let errorMessage = $state<string | null>(null)
  let errorResponse = $state<unknown>(null)
  let submitOption = $state<SubmitOption>(null)
  let submitter: HTMLInputElement | null = $state(null)

  const DEFAULT_ERROR_MESSAGE = 'Generic Error'

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
    errorMessage = null
    errorResponse = null

    try {
      const result = await onSubmit(formState.values)
      onSuccess?.({ result, option: submitOption })
    } catch (error: unknown) {
      if (dev) console.info('FormUtil error:', error)

      try {
        const response = await (error as { response?: { json?: () => Promise<unknown> } })?.response?.json?.()
        const responseObj = response as { error?: string } | undefined
        errorMessage = responseObj?.error ?? DEFAULT_ERROR_MESSAGE
        errorResponse = response
      } catch {
        errorMessage = DEFAULT_ERROR_MESSAGE
      }

      onFailure?.({ error, message: errorMessage, response: errorResponse })
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
  {@render children()}
</form>
