<!--
  @component CarrierSelector
  @description A single-select dropdown for choosing carriers.
  Carriers are stored as suppliers (today every supplier is `type: 'courier'`).
  Fetches from GET /api/legal-entities/{legalEntity}/suppliers endpoint.
  Displays the supplier name.
  @keywords carrier, courier, supplier, selector, picker, dropdown
  @uses FormGenericSingleSelector
  @api GET /api/legal-entities/{legalEntity}/suppliers -> Supplier[]
-->
<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'
  import { api } from '$utils/request'
  import { getSnippetPropsContext } from '$utils/runtime'

  export type CarrierSummary = {
    id: string
    name: string
    trade_name?: string
  }

  type Props = EntitySelectorProps & {
    /** Pre-selected carrier */
    attr?: CarrierSummary
    /** Custom fetch function override */
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<CarrierSummary[]>
    /** Callback when a carrier is selected */
    onChoose?: (item: CarrierSummary) => void
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
  }

  let {
    attr = undefined,
    fetchFunction: customFetchFunction = undefined,
    label = m.carrier(),
    placeholder = m.select_carrier_placeholder(),
    name = 'carrierId',
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
    class: className = '',
    onChoose = () => {},
    onChange = () => {},
    onClear = () => {},
  }: Props = $props()

  const contextGetter = getSnippetPropsContext()
  const contextProps = contextGetter && contextGetter()
  const legalEntityId = contextProps?.legalEntity?.id as string

  function optionMappingFunction(item: CarrierSummary): ExtendedOption {
    return {
      label: item.name,
      value: item.id,
      attr: item,
    }
  }

  async function defaultFetchFunction(query: Partial<FilterQuery>): Promise<CarrierSummary[]> {
    const params = createQueryRequestObject(query)

    return (
      await api.get<PaginatedResponse<CarrierSummary>>(`/legal-entities/${legalEntityId}/suppliers`, {
        queryParams: params,
      })
    ).data
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<CarrierSummary[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_carriers_found()}
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
  {optionMappingFunction}
  {fetchFunction}
  {onChoose}
  {onChange}
  {onClear}
  class={className}
  allowClear />
