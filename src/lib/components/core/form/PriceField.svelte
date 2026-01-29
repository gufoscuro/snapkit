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
  import {
    DEFAULT_CURRENCY_CODE,
    formatPriceInput,
    floatToPriceString,
    parsePriceToFloat,
    getCurrencySymbol,
  } from '$utils/prices'
  import * as m from '$lib/paraglide/messages'

  type Props = InputFieldProps & {
    value?: number
    currency?: string
    rounded?: boolean
    onChange?: (value: number) => void
  }

  let {
    name = 'price',
    label = m.price(),
    placeholder = InputFieldDefaults.placeholder,
    id = name,
    value = $bindable<number | undefined>(undefined),
    currency = DEFAULT_CURRENCY_CODE,
    error: errorProp = undefined,
    warning = undefined,
    errorPosition = InputFieldDefaults.errorPosition,
    warningPosition = InputFieldDefaults.warningPosition,
    focus = InputFieldDefaults.focus,
    showLabel = InputFieldDefaults.showLabel,
    showErrorMessage = InputFieldDefaults.showErrorMessage,
    autoWidth = InputFieldDefaults.autoWidth,
    disabled = InputFieldDefaults.disabled,
    rounded = true,
    width = InputFieldDefaults.width,
    onChange,
    oninput,
    onfocus,
    onblur,
    class: className = '',
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()

  // Track focus state to avoid syncing during user input
  let isFocused = $state(false)

  // Internal display value (formatted string for user interaction)
  let displayValue = $state('')

  // Single source of truth: form context OR bindable prop
  const numericValue = $derived(form ? (form.values[name] as number | undefined) : value)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  // Currency symbol
  const currencySymbol = $derived(getCurrencySymbol(currency))

  // Sync display value from numeric value ONLY when not focused (external changes like form reset)
  $effect(() => {
    if (!isFocused) {
      displayValue =
        numericValue !== undefined && numericValue !== null
          ? floatToPriceString(numericValue, currency)
          : ''
    }
  })

  const classes = $derived(
    joinClassnames(
      className,
      width,
      getUserMessagingClasses(error, warning),
      'pr-12 text-right' // Space for currency symbol
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

  function handleFocus(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    isFocused = true
    onfocus?.(e)
  }

  function handleInput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    const rawValue = e.currentTarget.value
    displayValue = formatPriceInput(rawValue, currency)

    // Update the input element's value to the formatted version
    e.currentTarget.value = displayValue

    const numericVal = parsePriceToFloat(displayValue)
    onChange?.(numericVal)

    if (form) {
      form.updateField(name, numericVal)
    } else {
      value = numericVal
    }

    oninput?.(e)
  }

  function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    isFocused = false

    // On blur, ensure proper formatting
    const numericVal = parsePriceToFloat(displayValue)

    if (displayValue.trim() !== '') {
      displayValue = floatToPriceString(numericVal, currency)
    }

    onChange?.(numericVal)

    if (form) {
      form.updateField(name, numericVal)
      form.touchField(name)
    } else {
      value = numericVal
    }

    onblur?.(e)
  }
</script>

{#if browser}
  <div class:flex-1={autoWidth}>
    <Label for={name} id="label-{id}" class={showLabel ? '' : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} {error} {warning} {showErrorMessage} {errorPosition} {warningPosition}>
      {#snippet children({ aria })}
        <div class="relative">
          <Input
            {id}
            {name}
            {placeholder}
            type="text"
            inputmode="decimal"
            disabled={isDisabled}
            autocomplete="off"
            autocorrect="off"
            value={displayValue}
            {...labelAria}
            {...aria}
            class={classes}
            oninput={handleInput}
            onfocus={handleFocus}
            onblur={handleBlur}
          />

          <div
            class="pointer-events-none absolute right-0 top-0 flex h-full max-w-16 items-center px-2.5 text-sm text-muted-foreground/60 {rounded
              ? 'rounded-r-md'
              : ''}"
          >
            {currencySymbol}
          </div>
        </div>
      {/snippet}
    </FormFieldMessages>
  </div>
{:else}
  <FormFieldSkeleton {showLabel} {width} />
{/if}
