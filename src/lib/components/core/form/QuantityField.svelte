<script lang="ts">
  import { browser } from '$app/environment'
  import { Input } from '$components/ui/input'
  import Label from '$components/ui/label/label.svelte'
  import * as m from '$lib/paraglide/messages'
  import { joinClassnames } from '$utils/classnames'
  import { getUserMessagingClasses } from '$utils/form'
  import { UnitOfMeasures, getUOMDisplayedSymbol, getUOMMinQuantity, getUOMStep } from '$utils/uom'
  import { InputFieldDefaults, type InputFieldProps } from './form'
  import { getFormContextOptional } from './form-context'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'

  type Props = InputFieldProps & {
    value?: number
    rightLabel?: string
    min?: number
    max?: number
    step?: number
    uom?: string
    allowNegativeValues?: boolean
    onChange?: (value: number) => void
  }

  let {
    name = 'quantity',
    label = m.quantity(),
    placeholder = InputFieldDefaults.placeholder,
    id = name,
    value: valueProp = $bindable<number | undefined>(undefined),
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
    min = undefined,
    max = undefined,
    step = undefined,
    uom = UnitOfMeasures.Default,
    allowNegativeValues = false,
    width = InputFieldDefaults.width,
    onChange,
    oninput,
    onfocus,
    onblur,
    class: className = '',
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()

  // Single source of truth: form context OR bindable prop
  const value = $derived(form ? (form.values[name] as number | undefined) : valueProp)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  // UOM-derived values
  const effectiveStep = $derived(step ?? (uom ? getUOMStep(uom) : 1))
  const effectiveMin = $derived(min ?? (uom ? getUOMMinQuantity(uom) : allowNegativeValues ? undefined : 0))
  const effectiveRightLabel = $derived(rightLabel ?? (uom ? getUOMDisplayedSymbol(uom) : undefined))

  const classes = $derived(
    joinClassnames(
      className,
      width,
      getUserMessagingClasses(error, warning),
      effectiveRightLabel ? 'pr-4 text-left' : 'text-right',
    ),
  )

  const labelAria = $derived({
    'aria-labelledby': `label-${id}`,
  })

  function normalizeQuantityByUOM(value: number): number {
    // Round to the nearest step
    const rounded = Math.round(value / effectiveStep) * effectiveStep
    // Apply minimum if negative values are not allowed
    if (allowNegativeValues) return rounded
    return Math.max(effectiveMin ?? 0, rounded)
  }

  function normalizeValue(value: string): number {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  function formatValue(value: string): string {
    return allowNegativeValues ? value.replace(/[^0-9.\-]/g, '') : value.replace(/[^0-9.,]/g, '')
  }

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
    const inputValue = e.currentTarget.value
    const nextValue = formatValue(inputValue)
    const numericValue = normalizeValue(nextValue)

    onChange?.(numericValue)

    if (form) {
      form.updateField(name, nextValue)
    } else {
      valueProp = numericValue
    }

    oninput?.(e)
  }

  function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    const inputValue = e.currentTarget.value
    const nextValue = formatValue(inputValue)
    const normalizedValue = normalizeQuantityByUOM(normalizeValue(nextValue))

    onChange?.(normalizedValue)

    if (form) {
      form.updateField(name, normalizedValue)
      form.touchField(name)
    } else {
      valueProp = normalizedValue
    }

    onblur?.(e)
  }
</script>

{#if browser}
  <div class="numeric" class:flex-1={autoWidth}>
    <Label for={name} id="label-{id}" class={showLabel ? '' : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} {error} {warning} {showErrorMessage} {errorPosition} {warningPosition}>
      {#snippet children({ aria })}
        <div class="relative">
          <Input
            {id}
            {name}
            {placeholder}
            type="number"
            disabled={isDisabled}
            autocomplete="off"
            autocorrect="off"
            value={value ?? ''}
            min={effectiveMin}
            {max}
            step={effectiveStep}
            {...labelAria}
            {...aria}
            class={classes}
            oninput={handleInput}
            {onfocus}
            onblur={handleBlur} />

          {#if effectiveRightLabel}
            <div
              class="pointer-events-none absolute top-0 right-0 mr-2.5 flex h-full max-w-16 items-center text-sm text-muted-foreground/60">
              {effectiveRightLabel}
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
