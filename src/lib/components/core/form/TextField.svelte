<script lang="ts">
  import { browser } from '$app/environment'
  import { getFormContextOptional } from './form-context'
  import { InputFieldDefaults, type InputFieldProps } from './form'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'
  import { Input } from '$components/ui/input'
  import Label from '$components/ui/label/label.svelte'
  import { joinClassnames } from '$utils/classnames'
  import { getUserMessagingClasses } from '$utils/form'
  import type { Snippet } from 'svelte'

  type Props = InputFieldProps & {
    type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search'
    value?: string | number
    rightLabel?: string
    textAlign?: 'left' | 'right'
    right?: Snippet
  }

  let {
    name,
    label = InputFieldDefaults.label,
    placeholder = InputFieldDefaults.placeholder,
    id = name,
    type = 'text',
    value: valueProp = $bindable<string | number | undefined>(undefined),
    error: errorProp = undefined,
    warning = undefined,
    errorPosition = InputFieldDefaults.errorPosition,
    warningPosition = InputFieldDefaults.warningPosition,
    focus = InputFieldDefaults.focus,
    showLabel = InputFieldDefaults.showLabel,
    showErrorMessage = InputFieldDefaults.showErrorMessage,
    autoWidth = InputFieldDefaults.autoWidth,
    rightLabel = undefined,
    disabled = InputFieldDefaults.disabled,
    textAlign = 'left',
    width = InputFieldDefaults.width,
    right,
    oninput,
    onfocus,
    onblur,
    onkeyup,
    class: className = '',
  }: Props = $props()

  // Autowire to form context (optional = works standalone too)
  const form = getFormContextOptional()

  // Single source of truth: form context OR bindable prop
  const value = $derived(form ? (form.values[name] as string | number | undefined) : valueProp)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  const classes = $derived(
    joinClassnames(
      className,
      width,
      getUserMessagingClasses(error, warning),
      rightLabel && textAlign === 'left' ? 'pr-4' : '',
      rightLabel && textAlign === 'right' ? 'pl-4' : '',
      textAlign === 'right' ? 'text-right' : ''
    )
  )

  const labelAria = $derived({
    'aria-labelledby': `label-${id}`,
  })

  function focusField() {
    if (!browser) return

    setTimeout(() => {
      const field = document.querySelector<HTMLInputElement>(`#${id}`)
      field?.focus()
    }, 1)
  }

  $effect(() => {
    if (focus) focusField()
  })

  function handleInput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    if (form) {
      form.updateField(name, e.currentTarget.value)
      if (form.errors[name]) form.validateField(name)
    } else {
      valueProp = e.currentTarget.value
    }
    oninput?.(e)
  }

  function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    form?.touchField(name)
    onblur?.(e)
  }
</script>

{#if browser}
  <div class:numeric={type === 'number'} class:flex-1={autoWidth}>
    <Label for={name} id="label-{id}" class={showLabel ? '' : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} {error} {warning} {showErrorMessage} {errorPosition} {warningPosition}>
      {#snippet children({ aria })}
        <div class="relative">
          <Input
            {id}
            {name}
            {placeholder}
            {type}
            disabled={isDisabled}
            autocomplete="off"
            autocorrect="off"
            value={value ?? ''}
            {...labelAria}
            {...aria}
            class={classes}
            oninput={handleInput}
            onfocus={onfocus}
            onblur={handleBlur}
            onkeyup={onkeyup}
          />

          {#if right}
            {@render right()}
          {:else if rightLabel}
            <div
              class="pointer-events-none absolute top-0 flex h-full max-w-16 items-center text-sm text-muted-foreground/60 {textAlign ===
              'left'
                ? 'right-0 mr-2.5'
                : 'left-0 ml-2.5'}"
            >
              {rightLabel}
            </div>
          {/if}
        </div>
      {/snippet}
    </FormFieldMessages>
  </div>
{:else}
  <FormFieldSkeleton {showLabel} {width} />
{/if}

<style>
  .numeric :global(input[type='number']::-webkit-outer-spin-button),
  .numeric :global(input[type='number']::-webkit-inner-spin-button) {
    appearance: none;
    -webkit-appearance: none;
    margin: 0;
  }
  .numeric :global(input[type='number']) {
    appearance: textfield;
    -moz-appearance: textfield;
  }
</style>
