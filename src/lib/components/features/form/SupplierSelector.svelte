<!--
  @component SupplierSelector
  @description A single-select dropdown for choosing suppliers.
  Fetches suppliers from GET /supplier endpoint with search support.
  Displays supplier name.
  @keywords supplier, selector, picker, dropdown, supply
  @uses FormGenericSingleSelector
  @api GET /supplier (supply-api) -> SupplierSummary[]
-->

<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { SupplierSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'
  import { apiRequest } from '$lib/utils/request'

  type Props = EntitySelectorProps & {
    /** Pre-selected supplier */
    attr?: SupplierSummary
    /** Custom fetch function override */
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<SupplierSummary[]>
    /** Callback when a supplier is selected */
    onChoose?: (item: SupplierSummary) => void
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
    label = m.supplier(),
    placeholder = m.select_supplier_placeholder(),
    name = 'supplierId',
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

  function optionMappingFunction(item: SupplierSummary): ExtendedOption {
    return {
      label: item.name,
      value: item.id as string,
      attr: item,
    }
  }

  async function defaultFetchFunction(query: Partial<FilterQuery>): Promise<SupplierSummary[]> {
    const params = createQueryRequestObject(query)

    return apiRequest<SupplierSummary[]>({
      url: 'supply/supplier',
      queryParams: params,
    })
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<SupplierSummary[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_suppliers_found()}
  newRecordText={m.add_new_supplier()}
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
