<!--
  @component QuotationItemsListEditor
  @description Card-based editor for quotation line items.
  Alternative to QuotationItemsEditor with vertical card layout for better
  space utilization when there are many fields per item.
  Supports two item types: "item" (product line) and "descriptive" (free-text).
  @keywords quotation, items, editor, line-items, sales, pricing, card
  @uses EditableListField, ItemSelector, VatCodeSelector
-->
<script lang="ts" module>
  /* eslint-disable no-import-assign */
  export {
    quotationItemsRequired,
    quotationItemsValid,
    type QuotationItemType,
    type QuotationLineItem,
  } from './QuotationItemsEditor.svelte'
</script>

<script lang="ts">
  import StackedAmountValues from '$components/core/StackedAmountValues.svelte'
  import DateField from '$components/core/form/DateField.svelte'
  import EditableListField from '$components/core/form/EditableListField.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import PriceField from '$components/core/form/PriceField.svelte'
  import QuantityField from '$components/core/form/QuantityField.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { FormFieldClass } from '$components/core/form/form'
  import { getFormContextOptional } from '$components/core/form/form-context'
  import ItemSelector from '$components/features/form/ItemSelector.svelte'
  import VatCodeSelector, { type VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import Button from '$components/ui/button/button.svelte'
  import Separator from '$components/ui/separator/separator.svelte'
  import * as Tooltip from '$components/ui/tooltip'
  import { UnitOfMeasures } from '$lib/config/uoms'
  import * as m from '$lib/paraglide/messages'
  import type { Item } from '$lib/types/api-types'
  import { DEFAULT_CURRENCY_CODE, floatToPriceString, getCurrencySymbol } from '$utils/prices'
  import { ArrowUpDown, GripVertical, Plus } from '@lucide/svelte'
  import { untrack, type Snippet } from 'svelte'
  import type { QuotationLineItem } from './QuotationItemsEditor.svelte'

  /**
   * Internal line item = API shape + UI-only fields
   */
  type InternalLineItem = QuotationLineItem & {
    /** UI toggle: discount as fixed amount vs percentage */
    useDiscountAmount: boolean
    /** Cached item entity for the selector */
    itemAttr?: Item
    /** Cached VAT code entity for the selector */
    vatCodeAttr?: VatCodeSummary
    /** Item base price from catalog (shown as suggestion, not auto-filled) */
    itemBasePrice?: number
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
    /** Show delivery date fields */
    showDeliveryDates?: boolean
    /** Require at least one item */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Callback when line items change */
    onChange?: (items: QuotationLineItem[]) => void
    /** When this value changes, items are re-hydrated from the form context */
    refreshKey?: unknown
    /** Default VAT code from customer commercial terms (overrides global is_default) */
    defaultVatCode?: import('$components/features/form/VatCodeSelector.svelte').VatCodeSummary
    /** Additional actions snippet rendered in the header (e.g. ImportMenu) */
    headerActions?: Snippet
    /** API field name for the delivery date. Quotations use 'delivery_date', sales orders use 'confirmed_delivery_date'. */
    deliveryDateKey?: 'delivery_date' | 'confirmed_delivery_date'
    /** Allow negative prices in PriceField inputs */
    allowNegativePrices?: boolean
    /** Additional CSS classes */
    class?: string
  }

  let {
    name = 'items',
    label = m.quotation_items(),
    showLabel = true,
    value = [],
    currency = DEFAULT_CURRENCY_CODE,
    showDeliveryDates = false,
    required = false,
    disabled = false,
    onChange,
    refreshKey = undefined,
    defaultVatCode = undefined,
    headerActions,
    allowNegativePrices = true,
    deliveryDateKey = 'delivery_date',
    class: className = '',
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)
  const currencyCode = $derived(currency)

  // Bulk delivery date
  let bulkDeliveryDate = $state<Date | string>(new Date())

  /**
   * Format a Date as a local ISO-like string (YYYY-MM-DDTHH:mm:ss.sss)
   * to avoid UTC timezone shift (e.g. Apr 30 CET → Apr 29 22:00 UTC).
   */
  function toLocalISOString(date: Date): string {
    const pad = (n: number, len = 2) => String(n).padStart(len, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
  }

  function applyBulkDeliveryDate(date: Date | null) {
    if (!date) return
    const iso = toLocalISOString(date)
    bulkDeliveryDate = date
    items = items.map(item => (item.type === 'item' ? { ...item, delivery_date: iso } : item))
    notifyFormUpdate()
  }

  // Internal items state
  let items = $state<InternalLineItem[]>([])

  function createEmptyItem(): InternalLineItem {
    return {
      type: 'item',
      item_id: '',
      description: '',
      quantity: 0,
      uom: UnitOfMeasures.Default,
      unit_price: 0,
      discount_percent: undefined,
      discount_amount: undefined,
      vat_code_id: defaultVatCode?.id ?? '',
      vat_code_snapshot: defaultVatCode ? (defaultVatCode as unknown as Record<string, unknown>) : undefined,
      requested_delivery_date: '',
      delivery_date: bulkDeliveryDate instanceof Date ? toLocalISOString(bulkDeliveryDate) : bulkDeliveryDate,
      useDiscountAmount: false,
      itemAttr: undefined,
      vatCodeAttr: defaultVatCode ?? undefined,
    }
  }

  // When defaultVatCode arrives (async from commercial terms), apply to items with empty vat_code_id.
  // Uses untrack on items to avoid read→write loop.
  $effect(() => {
    const vatCode = defaultVatCode
    if (!vatCode) return
    const current = untrack(() => items)
    const needsUpdate = current.some(item => item.type === 'item' && !item.vat_code_id)
    if (!needsUpdate) return
    items = current.map(item => {
      if (item.type !== 'item' || item.vat_code_id) return item

      return {
        ...item,
        vat_code_id: vatCode.id,
        vat_code_snapshot: vatCode as unknown as Record<string, unknown>,
        vatCodeAttr: vatCode,
      }
    })
  })

  function isCompleteItem(item: InternalLineItem): boolean {
    if (item.type === 'descriptive') {
      return !!item.description
    }
    return !!item.item_id && !!item.quantity && item.quantity > 0 && !!item.vat_code_id
  }

  function transformOutput(internalItems: InternalLineItem[]): QuotationLineItem[] {
    return internalItems.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ useDiscountAmount, itemAttr, vatCodeAttr, itemBasePrice, delivery_date, ...rest }, index) => {
        if (rest.type === 'descriptive')
          return {
            type: 'descriptive',
            description: rest.description,
          }

        return { ...rest, [deliveryDateKey]: delivery_date }
      },
    )
  }

  /**
   * Map API line items to internal format (add UI-only fields)
   */
  function mapFromApi(apiItems: QuotationLineItem[]): InternalLineItem[] {
    return apiItems.map(item => {
      const itemSnapshot = item.item_snapshot as Record<string, unknown> | undefined
      // Normalize: internally always use `delivery_date`, read from the correct API field
      const deliveryDateValue = item.delivery_date ?? item.confirmed_delivery_date ?? ''
      return {
        ...item,
        delivery_date: deliveryDateValue,
        useDiscountAmount: !!(item.discount_amount && !item.discount_percent),
        itemAttr: itemSnapshot ? ({ id: item.item_id, ...itemSnapshot } as Item) : undefined,
        vatCodeAttr:
          item.vat_code_snapshot && item.vat_code_id
            ? { ...(item.vat_code_snapshot as VatCodeSummary), id: item.vat_code_id }
            : undefined,
        itemBasePrice: (itemSnapshot?.standard_cost as number) ?? undefined,
      }
    })
  }

  // Load initial value from form context
  $effect(() => {
    const initialValue = (form?.values[name] as QuotationLineItem[] | undefined) ?? value
    if (initialValue && initialValue.length > 0 && (items.length === 0 || items.every(i => !isCompleteItem(i)))) {
      items = mapFromApi(initialValue)
    }
  })

  // Re-hydrate when refreshKey changes (e.g., backend version bumped after save)
  let lastRefreshKey: unknown = undefined
  $effect(() => {
    if (refreshKey === lastRefreshKey) return
    lastRefreshKey = refreshKey

    const formValue = form?.values[name] as QuotationLineItem[] | undefined
    if (formValue && formValue.length > 0) {
      setTimeout(() => {
        items = mapFromApi(form?.values[name] as QuotationLineItem[])
      }, 100)
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
      item_id: selectedItem.id,
      item_snapshot: selectedItem as unknown as Record<string, unknown>,
      description: selectedItem.name ?? '',
      uom: selectedItem.primary_uom || UnitOfMeasures.Default,
      quantity: 1,
      itemBasePrice: selectedItem.standard_cost ?? undefined,
      itemAttr: selectedItem,
    })
  }

  /**
   * Handle item clear
   */
  function handleItemClear(index: number, updateItem: (index: number, updates: Partial<InternalLineItem>) => void) {
    updateItem(index, {
      item_id: '',
      item_snapshot: undefined,
      description: '',
      uom: UnitOfMeasures.Default,
      quantity: 0,
      unit_price: 0,
      discount_percent: 0,
      discount_amount: 0,
      itemAttr: undefined,
      itemBasePrice: undefined,
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
      vat_code_id: vatCode.id,
      vat_code_snapshot: vatCode as unknown as Record<string, unknown>,
      vatCodeAttr: vatCode,
    })
  }

  /**
   * Notify onChange and form context of the current items state.
   * EditableListField calls this internally via onItemsChange for its own mutations,
   * but external mutations (addItems, applyBulkDeliveryDate) must call this directly.
   */
  function notifyFormUpdate() {
    const output = transformOutput(items.filter(isCompleteItem))
    onChange?.(output)
    if (form) {
      form.updateField(name, output as never)
    }
  }

  /**
   * Handle items change callback from EditableListField
   */
  function handleItemsChange(completedItems: InternalLineItem[]) {
    const output = transformOutput(completedItems)
    onChange?.(output)
  }

  /**
   * Append imported line items to the current list.
   * Called by wrapper components (e.g. SalesOrderItemsListEditor) after import.
   */
  export function addItems(newItems: QuotationLineItem[]) {
    const mapped = mapFromApi(newItems)
    const nonEmpty = items.filter(i => isCompleteItem(i))
    items = [...nonEmpty, ...mapped]
    notifyFormUpdate()
  }
</script>

<EditableListField
  {name}
  {label}
  {showLabel}
  {required}
  bind:items
  {createEmptyItem}
  {isCompleteItem}
  {transformOutput}
  disabled={isDisabled}
  syncFromForm={false}
  onItemsChange={handleItemsChange}
  allowReorder
  class={className}>
  {#snippet header({ options })}
    <div class="flex w-full items-end justify-between gap-4">
      {#if showDeliveryDates}
        <div class="max-w-xs flex-1">
          <DateField
            name="bulkDeliveryDate"
            label={m.set_delivery_date()}
            value={bulkDeliveryDate}
            width="w-full"
            disabled={isDisabled || options.dragAndDropActive}
            onChange={applyBulkDeliveryDate} />
        </div>
      {/if}
      {#if !isDisabled}
        <div class="flex items-center gap-2">
          {#if headerActions}
            {@render headerActions()}
          {/if}
          <Button
            variant={options.dragAndDropActive ? 'outline' : 'outline'}
            size="sm"
            onclick={options.toggleDragAndDrop}>
            <ArrowUpDown class="mr-1 size-4" />
            {options.dragAndDropActive ? m.done_reordering() : m.reorder_items()}
          </Button>
        </div>
      {/if}
    </div>
    <div class="my-8">
      <Separator />
    </div>
  {/snippet}

  {#snippet dragItem({ item, index })}
    <div class="flex w-full cursor-grab items-center gap-3 rounded border bg-muted/50 px-3 py-2">
      <GripVertical class="size-4 text-muted-foreground" />
      <span class="font-semibold text-primary"><span class="opacity-60">#</span>{index + 1}</span>
      {#if item.type === 'descriptive'}
        <span class="truncate text-sm text-muted-foreground">{item.description || m.description()}</span>
      {:else}
        <span class="truncate text-sm">
          {item.item_snapshot?.name || item.item_snapshot?.code || m.item()}
        </span>
        {#if item.quantity}
          <span class="text-xs text-muted-foreground">x{item.quantity}</span>
        {/if}
      {/if}
    </div>
  {/snippet}

  {#snippet item({ item, index, updateItem })}
    <div class="absolute -left-8 hidden h-6 text-sm leading-6 font-semibold text-primary md:block">
      <span class="opacity-60">#</span>{index + 1}
    </div>

    {#if item.type === 'descriptive'}
      <!-- Descriptive: full-width rich editor -->
      <div class="pr-8">
        <RichEditorField
          name="description-{index}"
          label={m.description()}
          value={item.description}
          showErrorMessage={false}
          disabled={isDisabled}
          width="w-full"
          minHeight="min-h-20 max-h-60 overflow-y-auto bg-input/10 dark:bg-input/30"
          onChange={md => updateItem(index, { description: md })} />
      </div>
    {:else}
      <!-- Item type: multi-row grid layout -->
      <div class="grid grid-cols-1 gap-x-4 gap-y-3 pr-8 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Row 1: Item Selector, Code, Quantity -->
        <ItemSelector
          name="item-{index}"
          label={m.item()}
          mode="sellable"
          attr={item.itemAttr}
          showErrorMessage={false}
          width="w-full"
          contentWidth={FormFieldClass.SelectorContentDefaultWidth}
          readonly={isDisabled}
          onChoose={selectedItem => handleItemSelect(index, selectedItem, updateItem)}
          onClear={() => handleItemClear(index, updateItem)} />

        <div class="flex flex-col justify-end">
          <span class="block text-sm leading-6 font-medium">{m.code()}</span>
          <div class="flex h-9 items-center">
            {#if item.item_snapshot?.code}
              <Tooltip.Root>
                <Tooltip.Trigger class="max-w-64 cursor-default truncate text-sm text-muted-foreground">
                  {item.item_snapshot.code}
                </Tooltip.Trigger>
                <Tooltip.Content>{item.item_snapshot.code}</Tooltip.Content>
              </Tooltip.Root>
            {:else}
              <span class="text-muted-foreground">-</span>
            {/if}
          </div>
        </div>

        <QuantityField
          name="quantity-{index}"
          label={m.quantity()}
          value={item.quantity ?? 0}
          uom={item.uom}
          showErrorMessage={false}
          disabled={!item.item_id || isDisabled}
          width="w-full"
          onChange={qty => updateItem(index, { quantity: qty })} />

        <!-- Description (customizable, defaults to item name) -->
        <div class="sm:col-span-2 lg:col-span-3">
          <TextField
            name="description-{index}"
            label={m.description()}
            value={item.description ?? ''}
            showErrorMessage={false}
            disabled={!item.item_id || isDisabled}
            width="w-full"
            oninput={e => updateItem(index, { description: e.currentTarget.value })} />
        </div>

        <!-- Row 2: Unit Price, Discount (with toggle), VAT -->
        <div class="flex flex-col">
          <div class="flex items-baseline justify-between gap-2">
            <span class="block text-sm leading-6 font-medium">{m.unit_price()}</span>
            {#if item.itemBasePrice != null && item.itemBasePrice > 0}
              <span class="text-xs text-muted-foreground">
                {m.item_cost()}: {floatToPriceString(item.itemBasePrice, currency, 4)}{getCurrencySymbol(currency)}
              </span>
            {/if}
          </div>
          <PriceField
            name="unitPrice-{index}"
            value={item.unit_price ?? 0}
            {currency}
            allowNegative={allowNegativePrices}
            showLabel={false}
            showErrorMessage={false}
            disabled={!item.item_id || isDisabled}
            width="w-full"
            onChange={price => updateItem(index, { unit_price: price })} />
        </div>

        <div class="flex flex-col">
          <div class="flex items-baseline justify-between gap-2">
            <span class="block text-sm leading-6 font-medium">
              {item.useDiscountAmount ? m.discount_amount() : m.discount_percent()}
            </span>
            {#if !isDisabled && item.item_id}
              <button
                type="button"
                class="text-xs text-primary hover:underline"
                onclick={() =>
                  updateItem(index, {
                    useDiscountAmount: !item.useDiscountAmount,
                    discount_percent: !item.useDiscountAmount ? 0 : item.discount_percent,
                    discount_amount: !item.useDiscountAmount ? item.discount_amount : 0,
                  })}>
                {item.useDiscountAmount ? m.switch_to_discount_percent() : m.switch_to_discount_amount()}
              </button>
            {/if}
          </div>
          {#if item.useDiscountAmount}
            <PriceField
              name="discountAmount-{index}"
              value={item.discount_amount ?? 0}
              {currency}
              allowNegative={allowNegativePrices}
              showLabel={false}
              showErrorMessage={false}
              disabled={!item.item_id || isDisabled}
              width="w-full"
              onChange={amount => updateItem(index, { discount_amount: amount, discount_percent: 0 })} />
          {:else}
            <NumberField
              name="discountPercent-{index}"
              value={item.discount_percent}
              showLabel={false}
              showErrorMessage={false}
              disabled={!item.item_id || isDisabled}
              width="w-full"
              oninput={e =>
                updateItem(index, { discount_percent: parseFloat(e.currentTarget.value) || 0, discount_amount: 0 })} />
          {/if}
        </div>

        <VatCodeSelector
          name="vatCode-{index}"
          label={m.vat_code()}
          attr={item.vatCodeAttr || defaultVatCode}
          direction="vendita"
          showErrorMessage={false}
          width="w-full"
          contentWidth={FormFieldClass.SelectorContentDefaultWidth}
          readonly={!item.item_id || isDisabled}
          onChoose={vatCode => handleVatCodeSelect(index, vatCode, updateItem)}
          onClear={() =>
            updateItem(index, { vat_code_id: '', vat_code_snapshot: undefined, vatCodeAttr: undefined })} />

        <!-- Row 3: Delivery dates (conditional) -->
        {#if showDeliveryDates}
          <DateField
            name="requestedDeliveryDate-{index}"
            label={m.requested_delivery_date()}
            value={item.requested_delivery_date}
            showErrorMessage={false}
            disabled={!item.item_id || isDisabled}
            width="w-full"
            onChange={date => updateItem(index, { requested_delivery_date: date ? toLocalISOString(date) : '' })} />

          <DateField
            name="deliveryDate-{index}"
            label={m.delivery_date()}
            value={item.delivery_date}
            showErrorMessage={false}
            disabled={!item.item_id || isDisabled}
            width="w-full"
            onChange={date => updateItem(index, { delivery_date: date ? toLocalISOString(date) : '' })} />
        {/if}

        <StackedAmountValues
          rows={[
            { label: m.net_value(), value: item.net_value, currencyCode },
            { label: m.tax_value(), value: item.tax_amount, currencyCode },
          ]} />
      </div>
    {/if}
  {/snippet}

  {#snippet addButton({ addItem, disabled: addDisabled, options: opts })}
    {#if !opts.dragAndDropActive}
      <div class="mt-1 gap-2 md:flex">
        <Button variant="outline" size="sm" disabled={addDisabled} onclick={() => addItem({ type: 'item' })}>
          <Plus class="mr-1 size-4" />
          {m.add_item_line()}
        </Button>

        <Button variant="ghost" size="sm" disabled={addDisabled} onclick={() => addItem({ type: 'descriptive' })}>
          <Plus class="mr-1 size-4" />
          {m.add_description_line()}
        </Button>
      </div>
    {/if}
  {/snippet}
</EditableListField>
