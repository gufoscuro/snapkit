<!--
  @component PaymentTermDueDatesEditor
  @description Multi-line editor for payment term due dates.
  Provides a select for reference_date and an editable table for due_dates
  (days, percentage, payment_method, amount_type).
  Autowires to form context via EditableTableField pattern.
  @keywords payment-terms, due-dates, editor, line-items
  @uses EditableTableField, SelectField, TextField
-->
<script lang="ts" module>
  import type { FieldValidator } from '$components/core/form/validation'
  import * as m from '$lib/paraglide/messages'
  import type { PaymentTermTerms } from '$lib/types/api-types'

  /**
   * Validator: requires at least one due date.
   * Use with v.schema(): terms: [termsRequired()]
   */
  export function termsRequired<T>(message?: string): FieldValidator<T> {
    return (value) => {
      const terms = value as PaymentTermTerms | undefined
      if (!terms || !terms.due_dates || terms.due_dates.length === 0) {
        return message ?? m.validation_required_generic()
      }
      if (!terms.reference_date) {
        return message ?? m.validation_required_generic()
      }
      return undefined
    }
  }
</script>

<script lang="ts">
  import EditableTableField from '$components/core/form/EditableTableField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { EditableTableFieldClass, FormFieldClass } from '$components/core/form/form'
  import * as Select from '$components/ui/select'
  import * as Table from '$components/ui/table'
  import SelectField from '$components/core/form/SelectField.svelte'
  import type { PaymentTermDueDate, PaymentTermTerms } from '$lib/types/api-types'
  import type { BasicOption } from '$utils/generics'

  /**
   * Internal line item type for editing (string values for inputs)
   */
  type InternalDueDateItem = {
    days: string
    percentage: string
    payment_method: string
    amount_type: string
  }

  type Props = {
    /** Field name for form binding */
    name?: string
    /** Label for the due dates table */
    label?: string
    /** Show visible label */
    showLabel?: boolean
    /** Initial value */
    value?: PaymentTermTerms
    /** Require at least one item */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Callback when terms change */
    onChange?: (terms: PaymentTermTerms) => void
    /** Additional CSS classes */
    class?: string
  }

  let {
    name = 'terms',
    label = m.payment_term_due_dates(),
    showLabel = true,
    value,
    required = false,
    disabled = false,
    onChange,
    class: className = '',
  }: Props = $props()

  // Reference date state
  let referenceDate = $state<string>('end_of_month')

  // Due dates items
  let items = $state<InternalDueDateItem[]>([])

  // Options for selects
  const referenceDateOptions: BasicOption[] = [
    { value: 'end_of_month', label: m.payment_term_reference_date_end_of_month() },
    { value: 'invoice_date', label: m.payment_term_reference_date_invoice_date() },
  ]

  const paymentMethodOptions: BasicOption[] = [
    { value: 'MP01', label: 'MP01 - Contanti' },
    { value: 'MP02', label: 'MP02 - Assegno' },
    { value: 'MP03', label: 'MP03 - Assegno circolare' },
    { value: 'MP04', label: 'MP04 - Contanti presso Tesoreria' },
    { value: 'MP05', label: 'MP05 - Bonifico' },
    { value: 'MP06', label: 'MP06 - Vaglia cambiario' },
    { value: 'MP07', label: 'MP07 - Bollettino bancario' },
    { value: 'MP08', label: 'MP08 - Carta di pagamento' },
    { value: 'MP09', label: 'MP09 - RID' },
    { value: 'MP10', label: 'MP10 - RID utenze' },
    { value: 'MP11', label: 'MP11 - RID veloce' },
    { value: 'MP12', label: 'MP12 - RIBA' },
    { value: 'MP13', label: 'MP13 - MAV' },
    { value: 'MP14', label: 'MP14 - Quietanza erario' },
    { value: 'MP15', label: 'MP15 - Giroconto' },
    { value: 'MP16', label: 'MP16 - Domiciliazione bancaria' },
    { value: 'MP17', label: 'MP17 - Domiciliazione postale' },
    { value: 'MP18', label: 'MP18 - Bollettino c/c postale' },
    { value: 'MP19', label: 'MP19 - SEPA Direct Debit' },
    { value: 'MP20', label: 'MP20 - SEPA DD CORE' },
    { value: 'MP21', label: 'MP21 - SEPA DD B2B' },
    { value: 'MP22', label: 'MP22 - Trattenuta su somme già riscosse' },
    { value: 'MP23', label: 'MP23 - PagoPA' },
  ]

  const amountTypeOptions: BasicOption[] = [
    { value: 'totale_documento', label: m.payment_term_amount_type_totale_documento() },
    { value: 'imponibile', label: m.payment_term_amount_type_imponibile() },
    { value: 'iva', label: m.payment_term_amount_type_iva() },
    { value: 'acconto', label: m.payment_term_amount_type_acconto() },
  ]

  function createEmptyItem(): InternalDueDateItem {
    return {
      days: '',
      percentage: '',
      payment_method: 'MP05',
      amount_type: 'totale_documento',
    }
  }

  function isEmptyItem(item: InternalDueDateItem): boolean {
    return !item.days && !item.percentage
  }

  function isCompleteItem(item: InternalDueDateItem): boolean {
    const days = parseInt(item.days)
    const pct = parseFloat(item.percentage)
    return !isNaN(days) && days >= 0 && !isNaN(pct) && pct > 0 && !!item.payment_method && !!item.amount_type
  }

  function transformOutput(internalItems: InternalDueDateItem[]): PaymentTermDueDate[] {
    return internalItems.map((item) => ({
      days: parseInt(item.days),
      percentage: parseFloat(item.percentage),
      payment_method: item.payment_method,
      amount_type: item.amount_type,
    }))
  }

  // Build the full terms object
  function buildTerms(completedItems: InternalDueDateItem[]): PaymentTermTerms {
    return {
      reference_date: referenceDate as 'end_of_month' | 'invoice_date',
      due_dates: transformOutput(completedItems),
    }
  }

  // Load initial value
  $effect(() => {
    if (value && items.length === 0) {
      referenceDate = value.reference_date || 'end_of_month'

      if (value.due_dates && value.due_dates.length > 0) {
        items = value.due_dates.map((dd) => ({
          days: dd.days.toString(),
          percentage: dd.percentage.toString(),
          payment_method: dd.payment_method || 'MP05',
          amount_type: dd.amount_type || 'totale_documento',
        }))
      }
    }
  })

  function handleItemsChange(completedItems: InternalDueDateItem[]) {
    onChange?.(buildTerms(completedItems))
  }

  function handleReferenceDateChange(newValue: string) {
    referenceDate = newValue
    const completedItems = items.filter(isCompleteItem)
    onChange?.(buildTerms(completedItems))
  }

  // Helper to get label from options
  function getPaymentMethodLabel(value: string): string {
    return paymentMethodOptions.find((o) => o.value === value)?.label ?? value
  }

  function getAmountTypeLabel(value: string): string {
    return amountTypeOptions.find((o) => o.value === value)?.label ?? value
  }
</script>

<div class="flex flex-col gap-4 {className}">
  <!-- Reference Date Select -->
  <SelectField
    name="{name}-reference-date"
    label={m.payment_term_reference_date()}
    items={referenceDateOptions}
    value={referenceDate}
    class={FormFieldClass.MaxWidth}
    {disabled}
    onChange={handleReferenceDateChange} />

  <!-- Due Dates Table -->
  <EditableTableField
    name="{name}-due-dates"
    {label}
    {showLabel}
    {required}
    bind:items
    {createEmptyItem}
    {isEmptyItem}
    {isCompleteItem}
    {transformOutput}
    {disabled}
    minWidth="800px"
    onItemsChange={handleItemsChange}>
    {#snippet header()}
      <Table.Head class="w-28">{m.payment_term_days()}</Table.Head>
      <Table.Head class="w-28">{m.payment_term_percentage()}</Table.Head>
      <Table.Head class="min-w-48">{m.payment_method()}</Table.Head>
      <Table.Head class="min-w-40">{m.payment_term_amount_type()}</Table.Head>
    {/snippet}

    {#snippet row({ item, index, updateItem, onFocus, onBlur })}
      <!-- Days -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <TextField
          name="days-{index}"
          type="number"
          value={item.days}
          placeholder={m.payment_term_days()}
          class={FormFieldClass.TableCell}
          showLabel={false}
          showErrorMessage={false}
          width="w-full"
          min={0}
          step={1}
          oninput={(e) => updateItem(index, { days: e.currentTarget.value })}
          onfocus={onFocus}
          onblur={onBlur} />
      </Table.Cell>

      <!-- Percentage -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <TextField
          name="percentage-{index}"
          type="number"
          value={item.percentage}
          placeholder="%"
          rightLabel="%"
          class="{FormFieldClass.TableCell} pr-8"
          showLabel={false}
          showErrorMessage={false}
          width="w-full"
          min={0}
          max={100}
          step={0.01}
          oninput={(e) => updateItem(index, { percentage: e.currentTarget.value })}
          onfocus={onFocus}
          onblur={onBlur} />
      </Table.Cell>

      <!-- Payment Method -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <Select.Root
          type="single"
          value={item.payment_method}
          onValueChange={(v) => updateItem(index, { payment_method: v })}>
          <Select.Trigger class="{FormFieldClass.TableCell} w-full">
            <span class="truncate">{getPaymentMethodLabel(item.payment_method)}</span>
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

      <!-- Amount Type -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <Select.Root
          type="single"
          value={item.amount_type}
          onValueChange={(v) => updateItem(index, { amount_type: v })}>
          <Select.Trigger class="{FormFieldClass.TableCell} w-full">
            <span class="truncate">{getAmountTypeLabel(item.amount_type)}</span>
          </Select.Trigger>
          <Select.Content class="w-56">
            {#each amountTypeOptions as opt (opt.value)}
              <Select.Item value={opt.value} label={opt.label}>
                {opt.label}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </Table.Cell>
    {/snippet}
  </EditableTableField>
</div>
