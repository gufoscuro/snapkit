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
  import { Button } from '$components/ui/button'
  import { IconForms, IconX } from '@tabler/icons-svelte'
  import type { Snippet } from 'svelte'
  import { fly } from 'svelte/transition'
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
  let debug = $state(false)
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
  let lastInitialValuesJson = $state(JSON.stringify(initialValues))

  $effect(() => {
    const currentJson = JSON.stringify(initialValues)
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

{#if dev}
  <div class="fixed right-2 bottom-22 z-20">
    <Button
      size="icon"
      variant={debug ? 'default' : 'secondary'}
      class="relative z-10"
      onclick={() => (debug = !debug)}>
      <IconForms />
    </Button>
  </div>

  {#if debug}
    <div
      class="fixed bottom-0 left-0 flex h-[35vh] w-full flex-col gap-2 overflow-y-auto border-t bg-background"
      transition:fly={{ y: 50, duration: 300 }}>
      <div class="sticky top-0 flex h-8 shrink-0 items-center justify-between gap-4 border-b bg-muted/80 backdrop-blur">
        <div class="flex items-center gap-2 px-4">
          <div class="text-sm font-semibold">Form</div>
        </div>

        <Button size="icon" variant="ghost" onclick={() => (debug = false)}>
          <IconX />
        </Button>
      </div>

      <div class="space-y-1 text-sm">
        <p class="sticky top-8 flex h-8 items-center border-b bg-muted/80 px-4 backdrop-blur">Form -> Values:</p>
        <pre class="px-4 text-xs">{JSON.stringify(formState.values, null, 2)}</pre>
        <p class="sticky top-8 flex h-8 items-center border-b bg-muted/80 px-4 backdrop-blur">Form -> Errors:</p>
        <pre class="px-4 text-xs">{JSON.stringify(formState.errors, null, 2)}</pre>
        <p class="px-4"><strong>Is Valid:</strong> {formState.isValid ? 'Yes' : 'No'}</p>
        <p class="px-4"><strong>Is Dirty:</strong> {formState.isDirty ? 'Yes' : 'No'}</p>
        <p class="px-4"><strong>Inflight:</strong> {inflight ? 'Yes' : 'No'}</p>
      </div>
    </div>
    <div class="h-[35vh] w-full"></div>
  {/if}
{/if}
