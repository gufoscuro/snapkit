<!--
  @component SupplyOrderSelector
  @description A single-select dropdown for choosing supply/purchase orders.
  Fetches supply orders from GET /order endpoint with search support.
  Optionally filters by supplier ID.
  Displays supply order internal ID as label.
  @keywords supply order, purchase order, order, selector, picker, dropdown
  @uses FormGenericSingleSelector
  @api GET /order (supply-api) -> SupplyOrderSummary[]
  @api GET /supplier/{supplierId}/order (supply-api) -> SupplyOrderSummary[]
-->

<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { SupplyOrderSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'
  import { apiRequest } from '$lib/utils/request'

  type Props = EntitySelectorProps & {
    /** Pre-selected supply order */
    attr?: SupplyOrderSummary
    /** Custom fetch function override */
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<SupplyOrderSummary[]>
    /** Callback when a supply order is selected */
    onChoose?: (item: SupplyOrderSummary) => void
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
    /** Callback when "create new" is clicked (requires allowNewRecord=true) */
    onCreateRecord?: () => void
    /** Optional supplier ID to filter orders by supplier */
    supplierId?: string
  }

  let {
    attr = undefined,
    fetchFunction: customFetchFunction = undefined,
    label = m.supply_order(),
    placeholder = m.select_supply_order_placeholder(),
    name = 'orderId',
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
    onCreateRecord = () => {},
    supplierId = undefined,
  }: Props = $props()

  function optionMappingFunction(item: SupplyOrderSummary): ExtendedOption {
    // Use internal_id as label, fallback to name or id
    const label = item.internal_id || item.name || item.id || 'N/A'

    return {
      label,
      value: item.id as string,
      attr: item,
    }
  }

  async function defaultFetchFunction(query: Partial<FilterQuery>): Promise<SupplyOrderSummary[]> {
    const params = createQueryRequestObject(query)

    // If supplierId is provided, filter by supplier
    if (supplierId) {
      return apiRequest<SupplyOrderSummary[]>({
        url: `supply/supplier/${supplierId}/order`,
        queryParams: params,
      })
    }

    // Otherwise, fetch all orders
    return apiRequest<SupplyOrderSummary[]>({
      url: 'supply/order',
      queryParams: params,
    })
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<SupplyOrderSummary[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_supply_orders_found()}
  newRecordText={m.add_new_supply_order()}
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
  onCreateNew={onCreateRecord}
  class={className} />
