<!--
  @component DateField
  @description Date picker field with calendar popover and keyboard-typeable date segments.
  Uses bits-ui DateField primitive for guided keyboard input and @internationalized/date for date handling.
  @keywords date, calendar, picker, form, field, keyboard, segments
-->
<script lang="ts">
  import { browser } from '$app/environment'
  import { getFormContextOptional } from './form-context'
  import { FormLabelClass, InputFieldDefaults, type InputFieldProps } from './form'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'
  import { DateField as DateFieldPrimitive } from 'bits-ui'
  import Label from '$components/ui/label/label.svelte'
  import Calendar from '$components/ui/calendar/calendar.svelte'
  import * as Popover from '$components/ui/popover'
  import { joinClassnames } from '$utils/classnames'
  import { getUserMessagingClasses } from '$utils/form'
  import {
    CalendarDate,
    getLocalTimeZone,
    today,
    type DateValue,
  } from '@internationalized/date'
  import { getLocale } from '$lib/paraglide/runtime'
  import CalendarIcon from '@lucide/svelte/icons/calendar'
  import XIcon from '@lucide/svelte/icons/x'
  import * as m from '$lib/paraglide/messages'

  const LOCALE_MAP: Record<string, string> = {
    en: 'en-US',
    it: 'it-IT',
  }

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
    locale = LOCALE_MAP[getLocale()] ?? 'en-US',
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

  const wrapperClasses = $derived(
    joinClassnames(
      'flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-background px-3 py-1 text-base ring-offset-background transition-[color,box-shadow] outline-none md:text-sm dark:bg-input/30',
      'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
      className,
      width,
      getUserMessagingClasses(error, warning),
      isDisabled ? 'cursor-not-allowed opacity-50' : ''
    )
  )

  const labelAria = $derived({
    'aria-labelledby': `label-${id}`,
  })

  // Keyboard input: bits-ui fires onValueChange with DateValue when complete, undefined when incomplete
  function handleDateFieldChange(dateValue: DateValue | undefined) {
    if (!dateValue) return

    const date = dateValue.toDate(getLocalTimeZone())

    if (form) {
      form.updateField(name, date)
      if (form.errors[name]) form.validateField(name)
    } else {
      valueProp = date
    }

    onChange?.(date, dateValue)
  }

  // Calendar selection: close popover + update value
  function handleCalendarChange(dateValue: DateValue | undefined) {
    if (!dateValue) return
    open = false
    handleDateFieldChange(dateValue)
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

  function handleContainerBlur(e: FocusEvent) {
    const container = e.currentTarget as HTMLElement
    if (container.contains(e.relatedTarget as Node)) return
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
        <DateFieldPrimitive.Root
          value={internalDateValue}
          onValueChange={handleDateFieldChange}
          minValue={calendarMin}
          maxValue={calendarMax}
          {locale}
          disabled={isDisabled}
        >
          <Popover.Root bind:open>
            <div
              class={wrapperClasses}
              {...labelAria}
              {...aria}
              onfocusout={handleContainerBlur}
              role="group"
            >
              <DateFieldPrimitive.Input>
                {#snippet children({ segments })}
                  {#each segments as { part, value }, i (part + i)}
                    {#if part === 'literal'}
                      <DateFieldPrimitive.Segment {part} class="text-muted-foreground px-0.5">
                        {value}
                      </DateFieldPrimitive.Segment>
                    {:else}
                      <DateFieldPrimitive.Segment
                        {part}
                        class="rounded px-0.5 py-0.5 tabular-nums focus:bg-accent focus:text-accent-foreground focus:outline-none aria-[valuetext=Empty]:text-muted-foreground"
                      >
                        {value}
                      </DateFieldPrimitive.Segment>
                    {/if}
                  {/each}
                {/snippet}
              </DateFieldPrimitive.Input>
              <Popover.Trigger>
                {#snippet child({ props })}
                  <button
                    {...props}
                    type="button"
                    class="ml-auto flex shrink-0 items-center text-muted-foreground hover:text-foreground disabled:pointer-events-none"
                    disabled={isDisabled}
                    tabindex={-1}
                  >
                    <CalendarIcon class="h-4 w-4" />
                  </button>
                {/snippet}
              </Popover.Trigger>
            </div>
            <Popover.Content align="end" class="w-auto p-0">
              <Calendar
                type="single"
                value={internalDateValue}
                {locale}
                minValue={calendarMin}
                maxValue={calendarMax}
                onValueChange={handleCalendarChange}
                captionLayout="dropdown"
                initialFocus
              />
              {#if allowClear && internalDateValue}
                <button
                  type="button"
                  class="m-3 flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                  onclick={handleClear}
                  disabled={isDisabled}
                >
                  <XIcon class="mr-1 h-3 w-3" />
                  {m.clear_date()}
                </button>
              {/if}
            </Popover.Content>
          </Popover.Root>
        </DateFieldPrimitive.Root>
      {/snippet}
    </FormFieldMessages>
  </div>
{:else if !isHidden}
  <FormFieldSkeleton {showLabel} {width} />
{/if}
