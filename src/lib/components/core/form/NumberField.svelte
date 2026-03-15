<script lang="ts">
  import { browser } from '$app/environment'
  import { getFormContextOptional } from './form-context'
  import { FormLabelClass, InputFieldDefaults, type InputFieldProps } from './form'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'
  import { Input } from '$components/ui/input'
  import Label from '$components/ui/label/label.svelte'
  import { joinClassnames } from '$utils/classnames'
  import { getUserMessagingClasses } from '$utils/form'

  type Props = InputFieldProps & {
    value?: number | string
    step?: number | string
    min?: number | string
    max?: number | string
    rightLabel?: string
  }

  let {
    name,
    label = InputFieldDefaults.label,
    placeholder = InputFieldDefaults.placeholder,
    id = name,
    value: valueProp = $bindable<number | string | undefined>(undefined),
    error: errorProp = undefined,
    warning = undefined,
    errorPosition = InputFieldDefaults.errorPosition,
    warningPosition = InputFieldDefaults.warningPosition,
    focus = InputFieldDefaults.focus,
    showLabel = InputFieldDefaults.showLabel,
    showErrorMessage = InputFieldDefaults.showErrorMessage,
    autoWidth = InputFieldDefaults.autoWidth,
    step = 'any',
    min = undefined,
    max = undefined,
    rightLabel = undefined,
    disabled = InputFieldDefaults.disabled,
    hidden = false,
    width = InputFieldDefaults.width,
    oninput,
    onfocus,
    onblur,
    onkeyup,
    class: className = '',
  }: Props = $props()

  const form = getFormContextOptional()

  const isHidden = $derived(hidden || form?.resourceConfig?.fields?.[name]?.visible === false)

  const value = $derived(form ? (form.values[name] as number | string | undefined) : valueProp)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  const classes = $derived(
    joinClassnames(
      className,
      width,
      getUserMessagingClasses(error, warning),
      rightLabel ? 'pr-4' : '',
      'text-right'
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
    const raw = e.currentTarget.value
    const numeric = raw === '' ? 0 : Number(raw)
    if (form) {
      form.updateField(name, numeric)
      if (form.errors[name]) form.validateField(name)
    } else {
      valueProp = numeric
    }
    oninput?.(e)
  }

  function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    form?.touchField(name)
    onblur?.(e)
  }
</script>

{#if browser && !isHidden}
  <div class="numeric" class:flex-1={autoWidth}>
    <Label for={name} id="label-{id}" class={showLabel ? FormLabelClass : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} {error} {warning} {showErrorMessage} {errorPosition} {warningPosition}>
      {#snippet children({ aria })}
        <div class="relative">
          <Input
            {id}
            {name}
            {placeholder}
            type="number"
            {step}
            {min}
            {max}
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

          {#if rightLabel}
            <div
              class="pointer-events-none absolute top-0 right-0 mr-2.5 flex h-full max-w-16 items-center text-sm text-muted-foreground/60"
            >
              {rightLabel}
            </div>
          {/if}
        </div>
      {/snippet}
    </FormFieldMessages>
  </div>
{:else if !isHidden}
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
