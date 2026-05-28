<!--
  @component InvoiceItemsListEditor
  @description Thin wrapper around QuotationItemsListEditor for invoices.
  Hides delivery-date fields and forwards `addItems` / `getItems` so the parent
  form can drive future import flows. The parent is responsible for remapping
  the editor's output (`uom`, `discount_percent`) to the invoice API shape
  (`unit_of_measure`, `discount_percentage`) at submit time — see
  `InvoicesDetails.svelte`.
  @keywords invoice, items, editor, line-items
  @uses QuotationItemsListEditor
-->
<script lang="ts">
  import type { VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { QuotationLineItem } from './QuotationItemsEditor.svelte'
  import QuotationItemsListEditor from './QuotationItemsListEditor.svelte'

  type Props = {
    name?: string
    label?: string
    showLabel?: boolean
    value?: QuotationLineItem[]
    currency?: string
    required?: boolean
    disabled?: boolean
    onChange?: (items: QuotationLineItem[]) => void
    refreshKey?: unknown
    defaultVatCode?: VatCodeSummary
    allowNegativePrices?: boolean
    /** Treat the list as structurally rigid: no add buttons, charge rows can't be removed. */
    lockStructure?: boolean
    /** Predicate flagging individual `item` rows as locked (read-only except description, not removable). */
    isItemLocked?: (item: QuotationLineItem) => boolean
    class?: string
  }

  let {
    name = 'items',
    label = m.invoice_line_items(),
    showLabel = true,
    value = [],
    currency,
    required = false,
    disabled = false,
    onChange,
    refreshKey = undefined,
    defaultVatCode = undefined,
    allowNegativePrices = true,
    lockStructure = false,
    isItemLocked,
    class: className = '',
  }: Props = $props()

  let editorRef: QuotationItemsListEditor | undefined = $state()

  /** Append imported line items, tagged with a shared `_groupId` for color coding. */
  export function addItems(newItems: QuotationLineItem[], options?: { groupId?: string }) {
    editorRef?.addItems(newItems, options)
  }

  /** Returns the current line items in editor shape — used to dedupe imports. */
  export function getItems(): QuotationLineItem[] {
    return editorRef?.getItems() ?? []
  }

  /** Drops every line item, including locked types like `charge`. */
  export function clearItems() {
    editorRef?.clearItems()
  }
</script>

<QuotationItemsListEditor
  bind:this={editorRef}
  {name}
  {label}
  {showLabel}
  {value}
  {currency}
  showDeliveryDates={false}
  {required}
  {disabled}
  {onChange}
  {refreshKey}
  {defaultVatCode}
  {allowNegativePrices}
  {lockStructure}
  {isItemLocked}
  class={className} />
