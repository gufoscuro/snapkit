<!--
  @component QuotationItemsEditor
  @description Multi-line editor for quotation items.
  Supports two item types: "item" (product line with quantity, price, discounts, VAT)
  and "descriptive" (free-text description line).
  Based on EditableTableField pattern with form context autowiring.
  @keywords quotation, items, editor, line-items, sales, pricing
  @uses EditableTableField, ItemSelector, VatCodeSelector
-->
<script lang="ts" module>
  import type { FieldValidator } from '$components/core/form/validation'
  import * as m from '$lib/paraglide/messages'

  /**
   * Quotation item type enum
   */
  export type QuotationItemType = 'item' | 'descriptive'

  /**
   * Output line item type (matches API schema for create/update)
   */
  export type QuotationLineItem = {
    id?: string
    type: QuotationItemType
    item_id?: string
    item_snapshot?: Record<string, unknown>
    description?: string
    quantity?: number
    uom?: string
    unit_price?: number
    discount_percent?: number
    discount_amount?: number
    net_value?: number
    vat_code_id?: string
    vat_code_snapshot?: Record<string, unknown>
    tax_amount?: number
    requested_delivery_date?: string
    delivery_date?: string
    sort_order?: number
    rejection_reason?: string
    rejected_at?: string
    rejected_by?: string
    ordered_quantity?: number
    conversion_status?: 'none' | 'partial' | 'full'
    version?: number
  }

  /**
   * Validator: requires at least one quotation item.
   */
  export function quotationItemsRequired<T>(message?: string): FieldValidator<T> {
    return value => {
      const items = value as QuotationLineItem[] | undefined
      if (!items || items.length === 0) {
        return message ?? m.validation_required_generic()
      }
      return undefined
    }
  }

  /**
   * Validator: ensures all "item" type items have required fields filled.
   */
  export function quotationItemsValid<T>(message?: string): FieldValidator<T> {
    return value => {
      const items = value as QuotationLineItem[] | undefined
      if (!items || items.length === 0) return undefined
      const hasInvalid = items.some(
        item =>
          item.type === 'item' &&
          (!item.item_id || !item.quantity || item.quantity <= 0 || !item.unit_price || !item.vat_code_id),
      )
      if (hasInvalid) {
        return message ?? m.validation_required_generic()
      }
      return undefined
    }
  }
</script>

<script lang="ts">
  import ActionButton from '$components/core/ActionButton.svelte'
  import DateField from '$components/core/form/DateField.svelte'
  import EditableTableField from '$components/core/form/EditableTableField.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import PriceField from '$components/core/form/PriceField.svelte'
  import QuantityField from '$components/core/form/QuantityField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { EditableTableFieldClass, FormFieldClass } from '$components/core/form/form'
  import { getFormContextOptional } from '$components/core/form/form-context'
  import ItemSelector from '$components/features/form/ItemSelector.svelte'
  import VatCodeSelector, { type VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import * as Table from '$components/ui/table'
  import { UnitOfMeasures } from '$lib/config/uoms'
  import type { Item } from '$lib/types/api-types'
  import { formatPriceDisplay } from '$utils/prices'
  import type { BasicOption } from '$utils/generics'
  import { X } from '@lucide/svelte'

  /**
   * Internal line item type for editing
   */
  type InternalLineItem = {
    type: QuotationItemType
    itemId: string
    itemName: string
    itemCode: string
    description: string
    quantity: number
    uom: string
    unitPrice: number
    discountPercent: number
    discountAmount: number
    vatCodeId: string
    vatCodeRate: number
    vatCodeAttr?: VatCodeSummary
    requestedDeliveryDate: string
    deliveryDate: string
    itemAttr?: Item
  }

  type Props = {
    /** Field name for form binding */
    name?: string
    /** Label for the field */
    label?: string
    /** Show visible label */
    showLabel?: boolean
    /** Initial value (for loading existing data) */
    value?: QuotationLineItem[]
    /** Default currency for price fields */
    currency?: string
    /** Show delivery date columns */
    showDeliveryDates?: boolean
    /** Require at least one item */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Callback when line items change */
    onChange?: (items: QuotationLineItem[]) => void
    /** Additional CSS classes */
    class?: string
  }

  let {
    name = 'items',
    label = m.quotation_items(),
    showLabel = true,
    value = [],
    currency = 'EUR',
    showDeliveryDates = false,
    required = false,
    disabled = false,
    onChange,
    class: className = '',
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  // Internal items state
  let items = $state<InternalLineItem[]>([])

  // Item type options for SelectField
  const typeOptions: BasicOption[] = [
    { label: m.item(), value: 'item' },
    { label: m.descriptive(), value: 'descriptive' },
  ]

  // Create empty item
  function createEmptyItem(): InternalLineItem {
    return {
      type: 'item',
      itemId: '',
      itemName: '',
      itemCode: '',
      description: '',
      quantity: 0,
      uom: UnitOfMeasures.Default,
      unitPrice: 0,
      discountPercent: 0,
      discountAmount: 0,
      vatCodeId: '',
      vatCodeRate: 0,
      vatCodeAttr: undefined,
      requestedDeliveryDate: '',
      deliveryDate: '',
      itemAttr: undefined,
    }
  }

  // Check if item is empty — a row explicitly set to "descriptive" is never auto-removed
  function isEmptyItem(item: InternalLineItem): boolean {
    if (item.type === 'descriptive') return false
    return !item.itemId && !item.description
  }

  // Check if item is complete (valid for output)
  function isCompleteItem(item: InternalLineItem): boolean {
    if (item.type === 'descriptive') {
      return !!item.description
    }
    return !!item.itemId && item.quantity > 0
  }

  // Transform internal items to API output format
  function transformOutput(internalItems: InternalLineItem[]): QuotationLineItem[] {
    return internalItems.map(item => {
      if (item.type === 'descriptive') {
        return {
          type: 'descriptive' as const,
          description: item.description,
        }
      }
      return {
        type: 'item' as const,
        item_id: item.itemId || undefined,
        description: item.description || undefined,
        quantity: item.quantity,
        uom: item.uom,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent || undefined,
        discount_amount: item.discountAmount || undefined,
        vat_code_id: item.vatCodeId || undefined,
        requested_delivery_date: item.requestedDeliveryDate || undefined,
        delivery_date: item.deliveryDate || undefined,
      }
    })
  }

  // Load initial value
  $effect(() => {
    const initialValue = (form?.values[name] as QuotationLineItem[] | undefined) ?? value
    if (initialValue && initialValue.length > 0 && (items.length === 0 || items.every(isEmptyItem))) {
      items = initialValue.map(item => ({
        type: item.type || 'item',
        itemId: item.item_id ?? '',
        itemName: '',
        itemCode: (item.item_snapshot?.code as string) ?? '',
        description: item.description ?? '',
        quantity: item.quantity ?? 0,
        uom: item.uom || UnitOfMeasures.Default,
        unitPrice: item.unit_price ?? 0,
        discountPercent: item.discount_percent ?? 0,
        discountAmount: item.discount_amount ?? 0,
        vatCodeId: item.vat_code_id ?? '',
        vatCodeRate: 0,
        vatCodeAttr: item.vat_code_snapshot
          ? { ...(item.vat_code_snapshot as VatCodeSummary), id: item.vat_code_id }
          : undefined,
        requestedDeliveryDate: item.requested_delivery_date ?? '',
        deliveryDate: item.delivery_date ?? '',
        itemAttr: item.item_snapshot ? ({ id: item.item_id, ...item.item_snapshot } as Item) : undefined,
      }))
    }
  })

  /**
   * Handle item (product) selection
   */
  function handleItemSelect(
    index: number,
    selectedItem: Item,
    updateItem: (index: number, updates: Partial<InternalLineItem>) => void,
  ) {
    updateItem(index, {
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemCode: selectedItem.code,
      uom: selectedItem.primary_uom || UnitOfMeasures.Default,
      quantity: 1,
      unitPrice: selectedItem.standard_cost,
      itemAttr: selectedItem,
    })
  }

  /**
   * Handle item clear
   */
  function handleItemClear(index: number, updateItem: (index: number, updates: Partial<InternalLineItem>) => void) {
    updateItem(index, {
      itemId: '',
      itemName: '',
      itemCode: '',
      uom: UnitOfMeasures.Default,
      quantity: 0,
      unitPrice: 0,
      discountPercent: 0,
      discountAmount: 0,
      itemAttr: undefined,
    })
  }

  /**
   * Handle VAT code selection
   */
  function handleVatCodeSelect(
    index: number,
    vatCode: VatCodeSummary,
    updateItem: (index: number, updates: Partial<InternalLineItem>) => void,
  ) {
    updateItem(index, {
      vatCodeId: vatCode.id,
      vatCodeRate: vatCode.rate,
      vatCodeAttr: vatCode,
    })
  }

  /**
   * Handle type change - reset fields when switching types
   */
  function handleTypeChange(
    index: number,
    newType: string | null,
    updateItem: (index: number, updates: Partial<InternalLineItem>) => void,
  ) {
    if (!newType) return
    const resetItem = createEmptyItem()
    resetItem.type = newType as QuotationItemType
    updateItem(index, resetItem)
  }

  /**
   * Compute net value for display
   */
  function computeNetValue(item: InternalLineItem): number {
    if (item.type === 'descriptive') return 0
    const baseAmount = item.unitPrice * item.quantity
    const percentDiscount = item.discountPercent ? baseAmount * (item.discountPercent / 100) : 0
    const flatDiscount = item.discountAmount || 0
    return Math.max(0, baseAmount - percentDiscount - flatDiscount)
  }

  /**
   * Handle items change callback
   */
  function handleItemsChange(completedItems: InternalLineItem[]) {
    const output = transformOutput(completedItems)
    onChange?.(output)
  }
</script>

<EditableTableField
  {name}
  {label}
  {showLabel}
  {required}
  bind:items
  {createEmptyItem}
  {isEmptyItem}
  {isCompleteItem}
  {transformOutput}
  disabled={isDisabled}
  syncFromForm={false}
  minWidth="1100px"
  onItemsChange={handleItemsChange}
  class={className}>
  {#snippet header()}
    <Table.Head class="w-28">{m.type()}</Table.Head>
    <Table.Head class="min-w-48">{m.item()} / {m.description()}</Table.Head>
    <Table.Head class="w-20">{m.code()}</Table.Head>
    <Table.Head class="w-28">{m.quantity()}</Table.Head>
    <Table.Head class="w-32">{m.unit_price()}</Table.Head>
    <Table.Head class="w-24">{m.discount_percent()}</Table.Head>
    <Table.Head class="w-32">{m.vat_code()}</Table.Head>
    <Table.Head class="w-28">{m.net_value()}</Table.Head>
    {#if showDeliveryDates}
      <Table.Head class="w-36">{m.requested_delivery_date()}</Table.Head>
      <Table.Head class="w-36">{m.delivery_date()}</Table.Head>
    {/if}
    <Table.Head class="w-10"></Table.Head>
  {/snippet}

  {#snippet row({ item, index, updateItem, removeItem, onFocus, onBlur })}
    <!-- Type -->
    <Table.Cell class={EditableTableFieldClass.TableCell}>
      <SelectField
        name="type-{index}"
        items={typeOptions}
        value={item.type}
        showLabel={false}
        showErrorMessage={false}
        disabled={isDisabled}
        width="w-full"
        onChange={val => handleTypeChange(index, val, updateItem)}
        class={FormFieldClass.TableCell} />
    </Table.Cell>

    {#if item.type === 'descriptive'}
      <!-- Description (spans across remaining columns) -->
      <Table.Cell class={EditableTableFieldClass.TableCell} colspan={showDeliveryDates ? 9 : 7}>
        <TextField
          name="description-{index}"
          value={item.description}
          showLabel={false}
          showErrorMessage={false}
          disabled={isDisabled}
          width="w-full"
          placeholder={m.description()}
          oninput={e => updateItem(index, { description: e.currentTarget.value })}
          onfocus={onFocus}
          onblur={onBlur}
          class={FormFieldClass.TableCell} />
      </Table.Cell>
    {:else}
      <!-- Item Selector -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <ItemSelector
          name="item-{index}"
          mode="sellable"
          attr={item.itemAttr}
          class={FormFieldClass.TableCell}
          showLabel={false}
          showErrorMessage={false}
          width={FormFieldClass.SelectorTableCellWidth}
          contentWidth={FormFieldClass.SelectorContentTableCellWidth}
          readonly={isDisabled}
          onChoose={selectedItem => handleItemSelect(index, selectedItem, updateItem)}
          onClear={() => handleItemClear(index, updateItem)} />
      </Table.Cell>

      <!-- Item Code -->
      <Table.Cell class="{EditableTableFieldClass.TableCell} px-2">
        {#if item.itemCode}
          <span class="text-sm text-muted-foreground">{item.itemCode}</span>
        {:else}
          <span class="text-muted-foreground">-</span>
        {/if}
      </Table.Cell>

      <!-- Quantity -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <QuantityField
          name="quantity-{index}"
          value={item.quantity}
          uom={item.uom}
          showLabel={false}
          showErrorMessage={false}
          disabled={!item.itemId || isDisabled}
          width="w-full"
          onChange={qty => updateItem(index, { quantity: qty })}
          onfocus={onFocus}
          onblur={onBlur}
          class={FormFieldClass.TableCell} />
      </Table.Cell>

      <!-- Unit Price -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <PriceField
          name="unitPrice-{index}"
          value={item.unitPrice}
          {currency}
          showLabel={false}
          showErrorMessage={false}
          disabled={!item.itemId || isDisabled}
          width="w-full"
          onChange={price => updateItem(index, { unitPrice: price })}
          onfocus={onFocus}
          onblur={onBlur}
          class={FormFieldClass.TableCell} />
      </Table.Cell>

      <!-- Discount % -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <NumberField
          name="discountPercent-{index}"
          value={item.discountPercent}
          showLabel={false}
          showErrorMessage={false}
          disabled={!item.itemId || isDisabled}
          width="w-full"
          oninput={e => updateItem(index, { discountPercent: parseFloat(e.currentTarget.value) || 0 })}
          onfocus={onFocus}
          onblur={onBlur}
          class={FormFieldClass.TableCell} />
      </Table.Cell>

      <!-- VAT Code -->
      <Table.Cell class={EditableTableFieldClass.TableCell}>
        <VatCodeSelector
          name="vatCode-{index}"
          attr={item.vatCodeAttr}
          direction="vendita"
          showLabel={false}
          showErrorMessage={false}
          width="w-60 max-w-60"
          contentWidth={FormFieldClass.SelectorContentTableCellWidth}
          readonly={!item.itemId || isDisabled}
          onChoose={vatCode => handleVatCodeSelect(index, vatCode, updateItem)}
          onClear={() => updateItem(index, { vatCodeId: '', vatCodeRate: 0, vatCodeAttr: undefined })}
          class={FormFieldClass.TableCell} />
      </Table.Cell>

      <!-- Net Value (computed, read-only) -->
      <Table.Cell class="{EditableTableFieldClass.TableCell} px-2">
        <span class="text-sm tabular-nums">
          {formatPriceDisplay(computeNetValue(item), currency)}
        </span>
      </Table.Cell>

      {#if showDeliveryDates}
        <!-- Requested Delivery Date -->
        <Table.Cell class={EditableTableFieldClass.TableCell}>
          <DateField
            name="requestedDeliveryDate-{index}"
            value={item.requestedDeliveryDate}
            showLabel={false}
            showErrorMessage={false}
            disabled={!item.itemId || isDisabled}
            width="w-full"
            onChange={date => updateItem(index, { requestedDeliveryDate: date?.toISOString() ?? '' })}
            class={FormFieldClass.TableCell} />
        </Table.Cell>

        <!-- Delivery Date -->
        <Table.Cell class={EditableTableFieldClass.TableCell}>
          <DateField
            name="deliveryDate-{index}"
            value={item.deliveryDate}
            showLabel={false}
            showErrorMessage={false}
            disabled={!item.itemId || isDisabled}
            width="w-full"
            onChange={date => updateItem(index, { deliveryDate: date?.toISOString() ?? '' })}
            class={FormFieldClass.TableCell} />
        </Table.Cell>
      {/if}
    {/if}

    <!-- Delete row -->
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
