<!--
  @component SalesOrderItemsListEditor
  @description Thin wrapper around QuotationItemsListEditor for sales orders.
  Pre-fills `deliveryDateKey="confirmed_delivery_date"` and exposes `addItems` /
  `getItems` so the parent form can drive imports.
  @keywords sales-order, items, editor
  @uses QuotationItemsListEditor
-->
<script lang="ts">
  import type { VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { QuotationLineItem } from './QuotationItemsEditor.svelte'
  import QuotationItemsListEditor from './QuotationItemsListEditor.svelte'

  type Props = {
    /** Field name for form binding */
    name?: string
    /** Label for the field */
    label?: string
    /** Show visible label */
    showLabel?: boolean
    /** Initial value */
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
    /** When this value changes, items are re-hydrated */
    refreshKey?: unknown
    /** Default VAT code from customer commercial terms */
    defaultVatCode?: VatCodeSummary
    /** Default discount percentage from customer commercial terms (`trade_discount`) */
    defaultDiscountPercent?: number
    /** Default for requested_delivery_date on newly added items. Does not mutate existing items. */
    defaultDeliveryDate?: Date | string
    /** Allow negative prices in PriceField inputs */
    allowNegativePrices?: boolean
    /** Additional CSS classes */
    class?: string
  }

  let {
    name = 'items',
    label = m.sales_order_line_items(),
    showLabel = true,
    value = [],
    currency,
    showDeliveryDates = false,
    required = false,
    disabled = false,
    onChange,
    refreshKey = undefined,
    defaultVatCode = undefined,
    defaultDiscountPercent = undefined,
    defaultDeliveryDate = undefined,
    allowNegativePrices = true,
    class: className = '',
  }: Props = $props()

  let editorRef: QuotationItemsListEditor | undefined = $state()

  /**
   * Append imported line items. The parent form (SalesOrderDetails) drives the
   * import flow and calls this once per source record so each gets its own
   * color group via `groupId`.
   */
  export function addItems(newItems: QuotationLineItem[], options?: { groupId?: string }) {
    editorRef?.addItems(newItems, options)
  }

  /**
   * Returns the current line items in API shape — used by the parent form
   * to dedupe imports against rows already in the editor.
   */
  export function getItems(): QuotationLineItem[] {
    return editorRef?.getItems() ?? []
  }
</script>

<QuotationItemsListEditor
  bind:this={editorRef}
  {name}
  {label}
  {showLabel}
  {value}
  {currency}
  {showDeliveryDates}
  deliveryDateKey="confirmed_delivery_date"
  {required}
  {disabled}
  {onChange}
  {refreshKey}
  {defaultVatCode}
  {defaultDiscountPercent}
  {defaultDeliveryDate}
  {allowNegativePrices}
  class={className} />
