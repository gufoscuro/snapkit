<!--
  @component CustomerAddressSelector
  @description A single-select dropdown for choosing customer addresses.
  Fetches addresses from GET /customers/{customer}/addresses endpoint with search support.
  Displays address as "address_line_1, city (type)".
  Requires a customerId prop to scope addresses to the selected customer.
  @keywords customer, address, selector, picker, dropdown, shipping
  @uses FormGenericSingleSelector
  @api GET /api/legal-entities/{legalEntity}/customers/{customer}/addresses -> CustomerAddress[]
-->

<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerAddress } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'
  import { openRecordEdit } from '$lib/utils/record-creation'
  import { api } from '$lib/utils/request'
  import { getSnippetPropsContext } from '$utils/runtime'

  type Props = EntitySelectorProps & {
    /** The customer ID to scope addresses to */
    customerId: string | undefined
    /** Pre-selected address */
    attr?: CustomerAddress
    /** Callback when an address is selected */
    onChoose?: (item: CustomerAddress) => void
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
    /** Callback when "open record" is clicked (requires allowOpenRecord=true and a customerId) */
    onOpenRecord?: (option: ExtendedOption) => void
  }

  let {
    customerId,
    attr = undefined,
    label = m.ship_to_address(),
    placeholder = m.select_address_placeholder(),
    name = 'ship_to_address_id',
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
    allowOpenRecord = EntitySelectorDefaults.allowOpenRecord,
    class: className = '',
    onChoose = () => {},
    onChange = () => {},
    onClear = () => {},
    onOpenRecord = (option: ExtendedOption) => {
      if (!customerId) return
      openRecordEdit(
        'customer-address-details',
        { uuid: customerId, aid: option.value as string },
        m.new_tab_opened_for_customer_address_edit(),
        `/legal-entities/${legalEntityId}/customers/${customerId}/addresses`,
      )
    },
  }: Props = $props()

  const contextGetter = getSnippetPropsContext()
  const contextProps = contextGetter && contextGetter()
  const legalEntityId = contextProps?.legalEntity?.id as string

  function formatAddressLabel(address: CustomerAddress): string {
    const parts = [address.address_line_1, address.city].filter(Boolean)
    return `${parts.join(', ')} (${address.type})`
  }

  function optionMappingFunction(item: CustomerAddress): ExtendedOption {
    return {
      label: formatAddressLabel(item),
      value: item.id as string,
      attr: item,
    }
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<CustomerAddress[]> {
    if (!customerId) return []
    const params = createQueryRequestObject(query)

    return (
      await api.get<PaginatedResponse<CustomerAddress>>(
        `/legal-entities/${legalEntityId}/customers/${customerId}/addresses`,
        { queryParams: params },
      )
    ).data
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_addresses_found()}
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
  disabled={disabled || !customerId}
  {allowNewRecord}
  allowOpenRecord={allowOpenRecord && !!customerId}
  {optionMappingFunction}
  {fetchFunction}
  {onChoose}
  {onChange}
  {onClear}
  {onOpenRecord}
  class={className} />
