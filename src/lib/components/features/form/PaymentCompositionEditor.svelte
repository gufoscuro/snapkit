<!--
  @component PaymentCompositionEditor
  @description Generic multi-row editor for a payment composition (Acconto / SAL / Saldo slices).
  Each row carries a slice type, a percentage and its own payment term (via PaymentTermSelector).
  Clears form context and manually syncs a single `composition` array to the parent form.
  Reusable across customer/supplier commercial terms and document payment compositions.
  @keywords payment-composition, payment-terms, slices, editor, line-items, form
  @uses EditableTableField, PaymentTermSelector
-->
<script lang="ts" module>
  // Re-exported from the shared util so existing imports
  // (`import { compositionRules } from '...PaymentCompositionEditor.svelte'`) keep working.
  export { compositionRules } from '$lib/utils/payment-composition'
</script>

<script lang="ts">
  import ActionButton from '$components/core/ActionButton.svelte'
  import EditableTableField from '$components/core/form/EditableTableField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { EditableTableFieldClass, FormFieldClass } from '$components/core/form/form'
  import { clearFormContext, getFormContextOptional } from '$components/core/form/form-context'
  import PaymentTermSelector from '$components/features/form/PaymentTermSelector.svelte'
  import Label from '$components/ui/label/label.svelte'
  import * as Select from '$components/ui/select'
  import * as Table from '$components/ui/table'
  import X from '@lucide/svelte/icons/x'
  import * as m from '$lib/paraglide/messages'
  import type { PaymentComposition, PaymentSliceType, PaymentTerm } from '$lib/types/api-types'
  import { paymentSliceTypeLabels, toSelectItems } from '$lib/utils/enum-labels'
  import { untrack } from 'svelte'

  /**
   * Internal line item type for editing (string values for inputs).
   */
  type InternalSlice = {
    type: string
    percentage: string
    payment_term_id: string
    payment_term?: PaymentTerm
  }

  type Props = {
    /** Field name for form binding (must match the key in initialValues) */
    name?: string
    /** Label for the composition table */
    label?: string
    /** Show visible label */
    showLabel?: boolean
    /** Initial value (from form's initialValues) */
    value?: PaymentComposition[]
    /** Require at least one item */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Additional CSS classes */
    class?: string
  }

  let {
    name = 'composition',
    label = m.payment_composition(),
    showLabel = true,
    value,
    required = false,
    disabled = false,
    class: className = '',
  }: Props = $props()

  // Grab parent form context BEFORE clearing it
  const form = getFormContextOptional()

  // Clear context so children (TextField, EditableTableField, PaymentTermSelector) don't autowire
  clearFormContext()

  // Internal state
  let items = $state<InternalSlice[]>([])
  let hydrated = false

  // Derived error from parent form
  const error = $derived(form?.errors[name] as string | undefined)

  // Running total of entered percentages (for the header indicator)
  const totalPercentage = $derived(
    items.reduce((sum, it) => {
      const p = parseFloat(it.percentage)
      return sum + (isNaN(p) ? 0 : p)
    }, 0),
  )
  const totalValid = $derived(Math.round(totalPercentage * 100) / 100 === 100)

  // Disabled when explicitly set or when the parent form is locked (e.g. read-only document).
  const isDisabled = $derived(disabled || (form?.locked ?? false))

  // Options
  const sliceTypeOptions = toSelectItems(paymentSliceTypeLabels)

  function getSliceTypeLabel(val: string): string {
    return sliceTypeOptions.find(o => o.value === val)?.label ?? val
  }

  // EditableTableField callbacks
  function createEmptyItem(): InternalSlice {
    return { type: '', percentage: '', payment_term_id: '', payment_term: undefined }
  }

  function isEmptyItem(item: InternalSlice): boolean {
    return !item.type && !item.percentage && !item.payment_term_id
  }

  function isCompleteItem(item: InternalSlice): boolean {
    const pct = parseFloat(item.percentage)
    return !!item.type && !isNaN(pct) && pct > 0 && !!item.payment_term_id
  }

  function transformComposition(internalItems: InternalSlice[]): PaymentComposition[] {
    return internalItems.map((item, index) => ({
      position: index + 1,
      percentage: parseFloat(item.percentage),
      type: item.type as PaymentSliceType,
      payment_term_id: item.payment_term_id,
    }))
  }

  /**
   * Sync the completed composition to the parent form.
   */
  function syncToForm(completedItems: InternalSlice[]) {
    if (!form) return
    form.updateField(name, transformComposition(completedItems))
  }

  // Load initial value from prop — only `value` is tracked as dependency.
  // Assignments use untrack to avoid re-triggering this effect.
  $effect(() => {
    if (!value || hydrated) return
    hydrated = true

    untrack(() => {
      if (value && value.length > 0) {
        items = value.map(c => ({
          type: c.type,
          percentage: c.percentage?.toString() ?? '',
          payment_term_id: c.payment_term_id,
          payment_term: c.payment_term,
        }))
      }
    })
  })

  function handleItemsChange(completedItems: InternalSlice[]) {
    syncToForm(completedItems)
  }
</script>

<div class="flex w-full flex-col gap-1.5 {className}">
  {#if showLabel}
    <div class="flex items-center justify-between">
      <Label for={name} class="leading-6">
        {label}{#if required}<span class="text-destructive"> *</span>{/if}
      </Label>
      <span class="text-xs font-semibold {totalValid ? 'text-muted-foreground' : 'text-destructive'}">
        {m.payment_composition_total()}: {totalPercentage}%
      </span>
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
    transformOutput={transformComposition}
    disabled={isDisabled}
    minWidth="720px"
    onItemsChange={handleItemsChange}>
    {#snippet header()}
      <Table.Head class="min-w-56">{m.type()}</Table.Head>
      <Table.Head class="w-28">{m.payment_term_percentage()}</Table.Head>
      <Table.Head class="min-w-72">{m.payment_term()}</Table.Head>
      <Table.Head class="w-10"></Table.Head>
    {/snippet}

    {#snippet row({ item, index, updateItem, removeItem, onFocus, onBlur })}
      <!-- Slice type -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <Select.Root
          type="single"
          value={item.type}
          disabled={isDisabled}
          onValueChange={v => updateItem(index, { type: v })}>
          <Select.Trigger class="{FormFieldClass.TableCell} h-10! w-full">
            <span class="truncate">{getSliceTypeLabel(item.type)}</span>
          </Select.Trigger>
          <Select.Content>
            {#each sliceTypeOptions as opt (opt.value)}
              <Select.Item value={opt.value} label={opt.label}>
                {opt.label}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
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
          disabled={isDisabled}
          oninput={e => updateItem(index, { percentage: e.currentTarget.value })}
          onfocus={onFocus}
          onblur={onBlur} />
      </Table.Cell>

      <!-- Payment term -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <PaymentTermSelector
          name="composition-pt-{index}"
          showLabel={false}
          showErrorMessage={false}
          width="w-full"
          class={FormFieldClass.TableCell}
          disabled={isDisabled}
          attr={item.payment_term}
          onChoose={pt => updateItem(index, { payment_term_id: pt.id as string, payment_term: pt })}
          onClear={() => updateItem(index, { payment_term_id: '', payment_term: undefined })} />
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
