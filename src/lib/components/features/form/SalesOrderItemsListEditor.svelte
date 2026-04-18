<!--
  @component SalesOrderItemsListEditor
  @description Thin wrapper around QuotationItemsListEditor for sales orders.
  Adds ImportMenu to import line items from approved quotations.
  Maps quotation items to sales order items (sets quotation_item_id).
  @keywords sales-order, items, editor, import, quotation
  @uses QuotationItemsListEditor, ImportMenu
-->
<script lang="ts">
  import { ImportMenu } from '$components/core/common/import-menu'
  import type { VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { BasicOption } from '$lib/utils/generics'
  import { floatToPriceString } from '$utils/prices'
  import { apiRequest } from '$utils/request'
  import type { QuotationLineItem } from './QuotationItemsEditor.svelte'
  import QuotationItemsListEditor from './QuotationItemsListEditor.svelte'

  type QuotationWithItems = {
    id: string
    document_number: string
    document_date: string
    net_value: number
    currency: string
    items?: QuotationItem[]
  }

  const MAX_PREVIEW_ITEMS = 10

  type QuotationItem = {
    id: string
    type: 'item' | 'descriptive'
    item_id: string
    item_snapshot: Record<string, unknown>
    description: string
    quantity: number
    uom: string
    unit_price: number
    discount_percent: number
    discount_amount: number
    vat_code_id: string
    vat_code_snapshot: Record<string, unknown>
    requested_delivery_date: string
    delivery_date: string
  }

  type Props = {
    /** Legal entity ID for API calls */
    legalEntityId: string | undefined
    /** Customer ID to filter quotations */
    customerId: string | undefined
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
    /** Allow negative prices in PriceField inputs */
    allowNegativePrices?: boolean
    /**
     * Builds the descriptive header inserted before each imported quotation's items.
     * Defaults to `m.quotation_reference({ documentNumber, date })`.
     * Return an empty string to skip insertion.
     */
    referenceMessageBuilder?: (source: QuotationWithItems) => string
    /** Additional CSS classes */
    class?: string
  }

  function defaultReferenceMessage(source: QuotationWithItems): string {
    return m.quotation_reference({
      documentNumber: source.document_number,
      date: new Date(source.document_date).toLocaleDateString(),
    })
  }

  let {
    legalEntityId,
    customerId,
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
    allowNegativePrices = true,
    referenceMessageBuilder = defaultReferenceMessage,
    class: className = '',
  }: Props = $props()

  let editorRef: QuotationItemsListEditor | undefined = $state()

  const canImport = $derived(!!legalEntityId && !!customerId && !disabled)

  async function fetchApprovedQuotations(search?: string): Promise<QuotationWithItems[]> {
    if (!legalEntityId || !customerId) return []
    const response = await apiRequest<{ data: QuotationWithItems[] }>({
      url: `/legal-entities/${legalEntityId}/quotations`,
      method: 'GET',
      queryParams: {
        state: 'approved',
        customer_id: customerId,
        ...(search ? { search } : {}),
      },
    })
    return response.data ?? []
  }

  function mapQuotationToOption(q: QuotationWithItems): BasicOption {
    return { label: q.document_number, value: q.id }
  }

  function handleImport(quotations: QuotationWithItems[]) {
    if (!editorRef) return

    const newItems: QuotationLineItem[] = quotations.flatMap(q => {
      const productItems: QuotationLineItem[] = (q.items ?? [])
        .filter(item => item.type === 'item')
        .map(item => ({
          type: 'item',
          quotation_item_id: item.id,
          item_id: item.item_id,
          item_snapshot: item.item_snapshot,
          description: item.description,
          quantity: item.quantity,
          uom: item.uom,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          discount_amount: item.discount_amount,
          vat_code_id: item.vat_code_id,
          vat_code_snapshot: item.vat_code_snapshot,
          requested_delivery_date: item.requested_delivery_date,
          delivery_date: item.delivery_date,
        }))

      if (productItems.length === 0) return []

      const referenceText = referenceMessageBuilder(q)
      const referenceItem: QuotationLineItem[] = referenceText
        ? [{ type: 'descriptive', description: referenceText }]
        : []

      return [...referenceItem, ...productItems]
    })

    editorRef.addItems(newItems)
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
  {allowNegativePrices}
  class={className}>
  {#snippet headerActions()}
    {#if canImport}
      <ImportMenu
        fetchFunction={fetchApprovedQuotations}
        optionMappingFunction={mapQuotationToOption}
        onimport={handleImport}
        label={m.common_import()}>
        {#snippet previewSnippet(quotation)}
          {@const productItems = (quotation.items ?? []).filter(i => i.type === 'item')}
          <div class="space-y-2">
            <div>
              <p class="text-sm font-semibold">{quotation.document_number}</p>
              <p class="text-xs text-muted-foreground">{new Date(quotation.document_date).toLocaleDateString()}</p>
            </div>
            <div class="flex items-baseline justify-between text-xs">
              <span class="text-muted-foreground">{productItems.length} {m.items()}</span>
              <span class="font-medium">{floatToPriceString(quotation.net_value, quotation.currency)}</span>
            </div>
            {#if productItems.length > 0}
              <div class="space-y-1 border-t pt-2">
                {#each productItems.slice(0, MAX_PREVIEW_ITEMS) as item, index (item.id + index)}
                  <div class="flex items-baseline justify-between gap-2 text-xs">
                    <span class="truncate">{item.item_snapshot?.name ?? item.item_snapshot?.code ?? '-'}</span>
                    <span class="shrink-0 text-muted-foreground">x{item.quantity}</span>
                  </div>
                {/each}
                {#if productItems.length > MAX_PREVIEW_ITEMS}
                  <p class="text-xs text-muted-foreground">+{productItems.length - MAX_PREVIEW_ITEMS} {m.items()}…</p>
                {/if}
              </div>
            {/if}
          </div>
        {/snippet}
      </ImportMenu>
    {/if}
  {/snippet}
</QuotationItemsListEditor>
