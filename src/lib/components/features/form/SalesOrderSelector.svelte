<!--
  @component SalesOrderSelector
  @description A single-select dropdown for choosing sales orders.
  Fetches sales orders from GET /order endpoint with search support.
  Displays sales order internal ID as label.
  @keywords sales order, order, selector, picker, dropdown
  @uses FormGenericSingleSelector
  @api GET /order (sales-api) -> SalesOrderSummary[]
-->

<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { SalesOrderSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'
  import { apiRequest } from '$lib/utils/request'

  type Props = EntitySelectorProps & {
    /** Pre-selected sales order */
    attr?: SalesOrderSummary
    /** Custom fetch function override */
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<SalesOrderSummary[]>
    /** Callback when a sales order is selected */
    onChoose?: (item: SalesOrderSummary) => void
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
    /** Callback when "create new" is clicked (requires allowNewRecord=true) */
    onCreateRecord?: () => void
  }

  let {
    attr = undefined,
    fetchFunction: customFetchFunction = undefined,
    label = m.sales_order(),
    placeholder = m.select_sales_order_placeholder(),
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
  }: Props = $props()

  function optionMappingFunction(item: SalesOrderSummary): ExtendedOption {
    // Use internal_id as label, fallback to external_id or id
    const label = item.internal_id || item.external_id || item.id || 'N/A'

    return {
      label,
      value: item.id as string,
      attr: item,
    }
  }

  async function defaultFetchFunction(query: Partial<FilterQuery>): Promise<SalesOrderSummary[]> {
    const params = createQueryRequestObject(query)

    return apiRequest<SalesOrderSummary[]>({
      url: 'sales/order',
      queryParams: params,
    })
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<SalesOrderSummary[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_sales_orders_found()}
  newRecordText={m.add_new_sales_order()}
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
