<!--
  @component InvoiceDueDatesEditor
  @description Editable multi-row editor for an invoice payment schedule (scadenze).
  Each row carries a concrete due date, an absolute amount and a FatturaPA payment
  method (MP01..MP23). Mirrors PaymentCompositionEditor: grabs the parent form
  context, clears it so children don't autowire, and manually syncs a single
  `due_dates` array (shape `{position, due_date, amount, payment_method}`) back to
  the form. The backend stores the rows verbatim (no re-derivation, no balancing
  against the invoice total) — see business-logic doc → Invoice → Payment due dates.
  @keywords invoice, due-dates, scadenze, payment-schedule, editor, line-items, form
  @uses EditableTableField, DateField
-->
<script lang="ts" module>
  import type { FieldValidator } from '$components/core/form/validation'
  import * as m from '$lib/paraglide/messages'
  import type { PaymentMethod } from '$lib/types/api-types'
  import { floatToPriceString } from '$utils/prices'

  /** Output shape synced to the parent form (matches the invoice create/update `due_dates[]`). */
  export type InvoiceDueDateInput = {
    position: number
    due_date: string
    amount: number
    payment_method: PaymentMethod
  }

  /**
   * Validator factory: the scheduled amounts must sum to the invoice total.
   * Use with `v.schema()`: `due_dates: [dueDatesMatchTotal(() => total)]`.
   *
   * Skips validation when the schedule is empty (the "no schedule" case the API
   * allows) or when the expected total is not yet known (e.g. a manual create
   * before server-side totals exist). `getExpectedTotal` is read lazily at
   * validation time so it always reflects the latest server-computed total.
   */
  export function dueDatesMatchTotal<T>(
    getExpectedTotal: () => number | null | undefined,
    message?: string,
  ): FieldValidator<T> {
    return (value, values) => {
      const total = getExpectedTotal()
      if (total == null) return undefined
      const rows = (value as InvoiceDueDateInput[] | undefined) ?? []
      if (rows.length === 0) return undefined
      const sum = rows.reduce((acc, row) => acc + (Number(row.amount) || 0), 0)
      if (Math.round((sum - total) * 100) / 100 === 0) return undefined
      const currency = (values as { currency?: string } | undefined)?.currency
      return message ?? m.validation_due_dates_total_mismatch({ total: floatToPriceString(total, currency) })
    }
  }
</script>

<script lang="ts">
  import DateField from '$components/core/form/DateField.svelte'
  import EditableTableField from '$components/core/form/EditableTableField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { EditableTableFieldClass, FormFieldClass } from '$components/core/form/form'
  import { clearFormContext, getFormContextOptional } from '$components/core/form/form-context'
  import Label from '$components/ui/label/label.svelte'
  import * as Select from '$components/ui/select'
  import * as Table from '$components/ui/table'
  import ActionButton from '$components/core/ActionButton.svelte'
  import { getPaymentMethodLabel, paymentMethodLabels, toSelectItems } from '$lib/utils/enum-labels'
  import X from '@lucide/svelte/icons/x'
  import { untrack } from 'svelte'

  /** Internal row type for editing — inputs hold string values. */
  type InternalDueDate = {
    due_date: string
    amount: string
    payment_method: string
  }

  /**
   * Minimal structural shape accepted for hydration — satisfied by both the
   * saved `InvoiceDueDate` (record) and the leaner `InvoicePrefillDueDate`.
   */
  type DueDateSeed = {
    due_date: string
    amount: string | number
    payment_method: PaymentMethod
  }

  type Props = {
    /** Field name for form binding (must match the key in initialValues) */
    name?: string
    /** Label for the schedule table */
    label?: string
    /** Show visible label */
    showLabel?: boolean
    /** Initial value (record / prefill due dates). Re-hydrates when its content changes. */
    value?: DueDateSeed[]
    /** Currency code used to format the scheduled-total indicator */
    currency?: string
    /** Expected invoice total — surfaced as a sum-vs-total hint (non-blocking) */
    expectedTotal?: number
    /** Require at least one row */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Additional CSS classes */
    class?: string
  }

  let {
    name = 'due_dates',
    label = m.invoice_due_dates(),
    showLabel = true,
    value,
    currency,
    expectedTotal,
    required = false,
    disabled = false,
    class: className = '',
  }: Props = $props()

  // Grab parent form context BEFORE clearing it
  const form = getFormContextOptional()

  // Clear context so children (DateField, TextField, EditableTableField) don't autowire
  clearFormContext()

  // Internal state
  let items = $state<InternalDueDate[]>([])

  // Derived error from parent form
  const error = $derived(form?.errors[name] as string | undefined)

  // Disabled when explicitly set or when the parent form is locked (read-only document).
  const isDisabled = $derived(disabled || (form?.locked ?? false))

  // Payment method options (FatturaPA MP01..MP23)
  const paymentMethodOptions = toSelectItems(paymentMethodLabels)

  // Running total of entered amounts (for the header indicator)
  const totalAmount = $derived(
    items.reduce((sum, it) => {
      const a = parseFloat(it.amount)
      return sum + (isNaN(a) ? 0 : a)
    }, 0),
  )
  const totalMatches = $derived(expectedTotal == null || Math.round((totalAmount - expectedTotal) * 100) / 100 === 0)

  // EditableTableField callbacks
  function createEmptyItem(): InternalDueDate {
    return { due_date: '', amount: '', payment_method: 'MP05' }
  }

  function isEmptyItem(item: InternalDueDate): boolean {
    return !item.due_date && !item.amount
  }

  function isCompleteItem(item: InternalDueDate): boolean {
    const amount = parseFloat(item.amount)
    return !!item.due_date && !isNaN(amount) && amount > 0 && !!item.payment_method
  }

  function transformDueDates(internalItems: InternalDueDate[]): InvoiceDueDateInput[] {
    return internalItems.map((item, index) => ({
      position: index + 1,
      due_date: item.due_date,
      amount: parseFloat(item.amount),
      payment_method: item.payment_method as PaymentMethod,
    }))
  }

  /** Sync the completed schedule to the parent form. */
  function syncToForm(completedItems: InternalDueDate[]) {
    if (!form) return
    form.updateField(name, transformDueDates(completedItems))
    // Re-run validation so a previously-shown total mismatch clears as soon as
    // the amounts add up again (the editor cleared context, so EditableTableField
    // can't do this itself).
    if (form.errors[name]) form.validateField(name)
  }

  // Re-hydrate from the `value` prop whenever its content changes (record load,
  // prefill apply, clear). User edits don't flow back through `value`, so they
  // are never clobbered. Assignments use untrack to avoid self-retriggering.
  let lastValueJson = ''
  $effect(() => {
    const incoming = value ?? []
    const json = JSON.stringify(incoming)
    if (json === lastValueJson) return
    lastValueJson = json

    untrack(() => {
      items = incoming.map(dd => ({
        due_date: toIsoDate(dd.due_date),
        amount: typeof dd.amount === 'string' ? dd.amount : (dd.amount?.toString() ?? ''),
        payment_method: dd.payment_method || 'MP05',
      }))
    })
  })

  /** Normalize an API date (ISO string) to a `YYYY-MM-DD` string for the editor. */
  function toIsoDate(value: string): string {
    if (!value) return ''
    return value.length > 10 ? value.slice(0, 10) : value
  }

  /** DateField hands back a UTC-midnight Date; keep only the calendar day. */
  function handleDateChange(
    index: number,
    date: Date | null,
    updateItem: (i: number, u: Partial<InternalDueDate>) => void,
  ) {
    updateItem(index, { due_date: date ? date.toISOString().slice(0, 10) : '' })
  }

  function handleItemsChange(completedItems: InternalDueDate[]) {
    syncToForm(completedItems)
  }
</script>

<div class="flex w-full flex-col gap-1.5 {className}">
  {#if showLabel}
    <div class="flex items-center justify-between">
      <Label for={name} class="leading-6">
        {label}{#if required}<span class="text-destructive"> *</span>{/if}
      </Label>
      {#if expectedTotal != null}
        <span class="text-xs font-semibold {totalMatches ? 'text-muted-foreground' : 'text-destructive'}">
          {m.invoice_due_dates_total()}: {floatToPriceString(totalAmount, currency)}
        </span>
      {/if}
    </div>
  {/if}

  <EditableTableField
    {name}
    label=""
    showLabel={false}
    {required}
    {error}
    bind:items
    {createEmptyItem}
    {isEmptyItem}
    {isCompleteItem}
    transformOutput={transformDueDates}
    disabled={isDisabled}
    minWidth="720px"
    onItemsChange={handleItemsChange}>
    {#snippet header()}
      <Table.Head class="min-w-52">{m.due_date()}</Table.Head>
      <Table.Head class="w-40">{m.amount()}</Table.Head>
      <Table.Head class="min-w-72">{m.payment_method()}</Table.Head>
      <Table.Head class="w-10"></Table.Head>
    {/snippet}

    {#snippet row({ item, index, updateItem, removeItem, onFocus, onBlur })}
      <!-- Due date -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <DateField
          name="due-date-{index}"
          showLabel={false}
          showErrorMessage={false}
          width="w-full"
          value={item.due_date}
          disabled={isDisabled}
          onChange={date => handleDateChange(index, date, updateItem)} />
      </Table.Cell>

      <!-- Amount -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <TextField
          name="amount-{index}"
          type="number"
          value={item.amount}
          placeholder={m.amount()}
          rightLabel={currency}
          class="{FormFieldClass.TableCell} pr-12"
          showLabel={false}
          showErrorMessage={false}
          width="w-full"
          disabled={isDisabled}
          oninput={e => updateItem(index, { amount: e.currentTarget.value })}
          onfocus={onFocus}
          onblur={onBlur} />
      </Table.Cell>

      <!-- Payment method -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <Select.Root
          type="single"
          value={item.payment_method}
          disabled={isDisabled}
          onValueChange={v => updateItem(index, { payment_method: v })}>
          <Select.Trigger class="{FormFieldClass.TableCell} h-10! w-full">
            <span class="truncate">{getPaymentMethodLabel(item.payment_method as PaymentMethod)}</span>
          </Select.Trigger>
          <Select.Content class="max-h-60 w-80">
            {#each paymentMethodOptions as opt (opt.value)}
              <Select.Item value={opt.value} label={opt.label}>
                {opt.label}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </Table.Cell>

      <!-- Remove row -->
      <Table.Cell class="{EditableTableFieldClass.TableCell} px-0 text-center">
        {#if !isEmptyItem(item)}
          <ActionButton
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-muted-foreground hover:text-destructive"
            tooltip={m.remove_table_resource_line()}
            disabled={isDisabled}
            onclick={() => removeItem(index)}>
            <X class="size-4" />
          </ActionButton>
        {/if}
      </Table.Cell>
    {/snippet}
  </EditableTableField>
</div>
