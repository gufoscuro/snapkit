<!--
  @component ProductLotSelector
  @description A single-select dropdown for choosing product inventory lots.
  Fetches lots from GET /product/{productId}/inventory endpoint with search support.
  Displays lot identifier with available quantity.
  @keywords product, lot, inventory, selector, picker, dropdown
  @uses FormGenericSingleSelector
  @api GET /product/{productId}/inventory (product-api) -> productInventoryItemSummary[]
-->

<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { ProductInventoryItemSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'
  import { apiRequest } from '$lib/utils/request'

  type Props = EntitySelectorProps & {
    /** Product ID to fetch lots for */
    productId: string
    /** Warehouse ID to filter by (optional) */
    warehouseId?: string
    /** Order ID to filter by (optional) */
    orderId?: string
    /** Filter mode: 'available' only shows lots with available stock */
    mode?: 'all' | 'available'
    /** Pre-selected lot */
    attr?: ProductInventoryItemSummary
    /** Custom fetch function override */
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<ProductInventoryItemSummary[]>
    onChoose?: (item: ProductInventoryItemSummary) => void
    onChange?: (item: ExtendedOption | undefined) => void
    onClear?: () => void
  }

  let {
    productId,
    warehouseId = undefined,
    orderId = undefined,
    mode = 'available',
    attr = undefined,
    fetchFunction: customFetchFunction = undefined,
    label = m.lot(),
    placeholder = m.select_lot_placeholder(),
    name = 'lot',
    id = name,
    error = EntitySelectorDefaults.error,
    warning = EntitySelectorDefaults.warning,
    warningPosition = EntitySelectorDefaults.warningPosition,
    showLabel = EntitySelectorDefaults.showLabel,
    showErrorMessage = EntitySelectorDefaults.showErrorMessage,
    width = EntitySelectorDefaults.width,
    contentWidth = width,
    align = EntitySelectorDefaults.align,
    readonly = EntitySelectorDefaults.readonly,
    disabled = EntitySelectorDefaults.disabled,
    allowNewRecord = EntitySelectorDefaults.allowNewRecord,
    class: className = '',
    onChoose = () => {},
    onChange = () => {},
    onClear = () => {},
  }: Props = $props()

  function optionMappingFunction(item: ProductInventoryItemSummary): ExtendedOption {
    const lotDisplay = item.lot || item.external_lot || item.internal_id
    const availableQty = item.buckets?.available ?? 0
    return {
      label: `${lotDisplay} ${item.buckets ? `(${availableQty} ${item.uom})` : ''}`,
      value: item.id as string,
      attr: item,
    }
  }

  async function defaultFetchFunction(query: Partial<FilterQuery>): Promise<ProductInventoryItemSummary[]> {
    if (!productId) return []

    const params = createQueryRequestObject(query)
    if (warehouseId) params.warehouseId = warehouseId
    if (orderId) params.orderId = orderId
    if (mode) params.mode = mode

    const items = await apiRequest<ProductInventoryItemSummary[]>({
      url: `product/product/${productId}/inventory`,
      queryParams: params,
    })

    // Filter to only items with lot identifiers and sort by creation date
    return items
      .filter(item => !!item.lot || !!item.external_lot)
      .sort((a, b) => {
        const dateA = a.created?.at ? new Date(a.created.at).getTime() : 0
        const dateB = b.created?.at ? new Date(b.created.at).getTime() : 0
        return dateA - dateB
      })
  }

  // Use custom fetch function if provided, otherwise use default
  async function fetchFunction(query: Partial<FilterQuery>): Promise<ProductInventoryItemSummary[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  {label}
  {placeholder}
  {name}
  {id}
  {error}
  {warning}
  {warningPosition}
  {showLabel}
  {showErrorMessage}
  {width}
  {contentWidth}
  {align}
  {readonly}
  {disabled}
  {allowNewRecord}
  {optionMappingFunction}
  {fetchFunction}
  {onChoose}
  {onChange}
  {onClear}
  class={className} />
