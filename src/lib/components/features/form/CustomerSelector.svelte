<!--
  @component CustomerSelector
  @description A single-select dropdown for choosing customers.
  Fetches customers from GET /customer endpoint with search support.
  Displays customer name.
  @keywords customer, selector, picker, dropdown, client
  @uses FormGenericSingleSelector
  @api GET /api/legal-entities/{legalEntity}/customers -> CustomerSummary[]
-->

<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'
  import { openRecordCreation } from '$lib/utils/record-creation'
  import { api } from '$lib/utils/request'
  import { getSnippetPropsContext } from '$utils/runtime'

  type Props = EntitySelectorProps & {
    /** Pre-selected customer */
    attr?: CustomerSummary
    /** Custom fetch function override */
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<CustomerSummary[]>
    /** Callback when a customer is selected */
    onChoose?: (item: CustomerSummary) => void
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
    label = m.customer(),
    placeholder = m.select_customer_placeholder(),
    name = 'customerId',
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
    onCreateRecord = () =>
      openRecordCreation('customer-details', m.new_tab_opened_for_customer(), `/legal-entities/${legalEntityId}/customers`),
  }: Props = $props()

  const contextGetter = getSnippetPropsContext()
  const contextProps = contextGetter && contextGetter()
  const legalEntityId = contextProps?.legalEntity?.id as string

  function optionMappingFunction(item: CustomerSummary): ExtendedOption {
    return {
      label: item.name,
      value: item.id as string,
      attr: item,
    }
  }

  async function defaultFetchFunction(query: Partial<FilterQuery>): Promise<CustomerSummary[]> {
    const params = createQueryRequestObject(query)

    return (
      await api.get<PaginatedResponse<CustomerSummary>>(`/legal-entities/${legalEntityId}/customers`, {
        queryParams: params,
      })
    ).data
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<CustomerSummary[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_customers_found()}
  newRecordText={m.add_new_customer()}
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
