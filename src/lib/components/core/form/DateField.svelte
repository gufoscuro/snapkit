<!--
  @component DateField
  @description Date picker field with calendar popover and form context autowiring.
  Uses @internationalized/date for date handling and shadcn-svelte calendar component.
  @keywords date, calendar, picker, form, field
-->
<script lang="ts">
  import { browser } from '$app/environment'
  import { getFormContextOptional } from './form-context'
  import { FormLabelClass, InputFieldDefaults, type InputFieldProps } from './form'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'
  import { Button } from '$components/ui/button'
  import Label from '$components/ui/label/label.svelte'
  import Calendar from '$components/ui/calendar/calendar.svelte'
  import * as Popover from '$components/ui/popover'
  import { joinClassnames } from '$utils/classnames'
  import { getUserMessagingClasses } from '$utils/form'
  import {
    CalendarDate,
    DateFormatter,
    getLocalTimeZone,
    today,
    type DateValue,
  } from '@internationalized/date'
  import CalendarIcon from 'lucide-svelte/icons/calendar'
  import XIcon from 'lucide-svelte/icons/x'
  import * as m from '$lib/paraglide/messages'

  type Props = Omit<InputFieldProps, 'type' | 'focus' | 'autoWidth'> & {
    /** Date value (can be Date or ISO string) */
    value?: Date | string
    /** Minimum date offset from today (in days) */
    minDaysFromNow?: number
    /** Maximum date offset from today (in days) */
    maxDaysFromNow?: number
    /** Allow clearing the selected date */
    allowClear?: boolean
    /** Locale for date formatting */
    locale?: string
    /** Date format style */
    dateStyle?: 'full' | 'long' | 'medium' | 'short'
    /** Custom placeholder text */
    placeholder?: string
    /** Callback when value changes */
    onChange?: (date: Date | null, dateValue: DateValue | null) => void
  }

  let {
    name,
    label = m.date_label(),
    placeholder = m.select_date_placeholder(),
    id = name,
    value: valueProp = $bindable<Date | string | undefined>(undefined),
    error: errorProp = undefined,
    warning = undefined,
    errorPosition = InputFieldDefaults.errorPosition,
    warningPosition = InputFieldDefaults.warningPosition,
    showLabel = InputFieldDefaults.showLabel,
    showErrorMessage = InputFieldDefaults.showErrorMessage,
    disabled = InputFieldDefaults.disabled,
    hidden = false,
    width = InputFieldDefaults.width,
    minDaysFromNow = 0,
    maxDaysFromNow,
    allowClear = false,
    locale = 'en-US',
    dateStyle = 'medium',
    onChange,
    oninput,
    onfocus,
    onblur,
    onkeyup,
    class: className = '',
  }: Props = $props()

  // Autowire to form context (optional = works standalone too)
  const form = getFormContextOptional()

  const isHidden = $derived(hidden || form?.resourceConfig?.fields?.[name]?.visible === false)

  // Internal state
  let open = $state(false)
  let internalDateValue = $state<DateValue | undefined>(undefined)

  // Single source of truth: form context OR bindable prop
  const formValue = $derived(form ? (form.values[name] as Date | string | undefined) : valueProp)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  // Date formatter (reactive to locale and dateStyle changes)
  const df = $derived.by(() => new DateFormatter(locale, { dateStyle }))

  // Calculate calendar min/max values
  const calendarMin = $derived(
    minDaysFromNow > 0 ? today(getLocalTimeZone()).add({ days: minDaysFromNow }) : undefined
  )
  const calendarMax = $derived(
    maxDaysFromNow !== undefined
      ? today(getLocalTimeZone()).add({ days: maxDaysFromNow })
      : undefined
  )

  // Convert Date or ISO string to DateValue
  function toDateValue(value: Date | string | undefined): DateValue | undefined {
    if (!value) return undefined

    const date = value instanceof Date ? value : new Date(value)
    if (isNaN(date.getTime())) return undefined

    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }

  // Sync internal date value with form/prop value when it changes externally
  $effect(() => {
    const newDateValue = toDateValue(formValue)
    // Only update if the value is actually different to avoid unnecessary re-renders
    if (
      (!newDateValue && internalDateValue) ||
      (newDateValue &&
        (!internalDateValue ||
          newDateValue.compare(internalDateValue) !== 0))
    ) {
      internalDateValue = newDateValue
    }
  })

  const classes = $derived(
    joinClassnames(
      className,
      width,
      'justify-start text-left font-normal',
      getUserMessagingClasses(error, warning),
      !internalDateValue ? 'text-muted-foreground' : ''
    )
  )

  const labelAria = $derived({
    'aria-labelledby': `label-${id}`,
  })

  function handleValueChange(dateValue: DateValue | undefined) {
    if (!dateValue) return

    open = false
    const date = dateValue.toDate(getLocalTimeZone())

    if (form) {
      form.updateField(name, date)
      if (form.errors[name]) form.validateField(name)
    } else {
      valueProp = date
    }

    onChange?.(date, dateValue)
  }

  function handleClear() {
    open = false
    internalDateValue = undefined

    if (form) {
      form.updateField(name, null)
      if (form.errors[name]) form.validateField(name)
    } else {
      valueProp = undefined
    }

    onChange?.(null, null)
  }

  function handleBlur() {
    form?.touchField(name)
  }
</script>

{#if browser && !isHidden}
  <div>
    <Label for={name} id="label-{id}" class={showLabel ? FormLabelClass : 'sr-only'}>{label}</Label
    >
    <FormFieldMessages
      {id}
      {error}
      {warning}
      {showErrorMessage}
      {errorPosition}
      {warningPosition}
    >
      {#snippet children({ aria })}
        <Popover.Root bind:open>
          <Popover.Trigger id={id}>
            {#snippet child({ props })}
              <Button
                {...props}
                variant="outline"
                class={classes}
                disabled={isDisabled}
                {...labelAria}
                {...aria}
                onblur={handleBlur}
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {internalDateValue
                  ? df.format(internalDateValue.toDate(getLocalTimeZone()))
                  : placeholder}
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content align="end" class="w-auto p-0">
            <Calendar
              type="single"
              value={internalDateValue}
              {locale}
              minValue={calendarMin}
              maxValue={calendarMax}
              onValueChange={handleValueChange}
              captionLayout="dropdown"
              initialFocus
            />
            {#if allowClear && internalDateValue}
              <Button
                variant="outline"
                size="sm"
                class="m-3 flex h-8 items-center text-xs"
                onclick={handleClear}
                disabled={isDisabled}
              >
                <XIcon class="mr-1 h-3 w-3" />
                {m.clear_date()}
              </Button>
            {/if}
          </Popover.Content>
        </Popover.Root>
      {/snippet}
    </FormFieldMessages>
  </div>
{:else if !isHidden}
  <FormFieldSkeleton {showLabel} {width} />
{/if}
