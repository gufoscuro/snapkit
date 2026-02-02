<!--
  @component SalesChannelSelector
  @description A single-select dropdown for choosing sales channels.
  Fetches sales channels from GET /sales-channel endpoint with search support.
  Displays only active sales channels by default.
  @keywords sales channel, selector, picker, dropdown, channel
  @uses FormGenericSingleSelector
  @api GET /sales-channel (sales-api) -> SalesChannelSummary[]
-->

<script lang="ts">
  import { EntitySelectorDefaults, type EntitySelectorProps } from '$components/core/form/form'
  import FormGenericSingleSelector from '$components/core/form/FormGenericSingleSelector.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { SalesChannelSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterQuery } from '$lib/utils/filters'
  import type { ExtendedOption } from '$lib/utils/generics'
  import { apiRequest } from '$lib/utils/request'

  type Props = EntitySelectorProps & {
    /** Pre-selected sales channel */
    attr?: SalesChannelSummary
    /** Custom fetch function override */
    fetchFunction?: (query: Partial<FilterQuery>) => Promise<SalesChannelSummary[]>
    /** Callback when a sales channel is selected */
    onChoose?: (item: SalesChannelSummary) => void
    /** Callback when selection changes (includes clear) */
    onChange?: (item: ExtendedOption | undefined) => void
    /** Callback when selection is cleared */
    onClear?: () => void
    /** Callback when "create new" is clicked (requires allowNewRecord=true) */
    onCreateRecord?: () => void
    /** Filter by status (default: 'active' only) */
    filterStatus?: 'active' | 'inactive' | 'all'
  }

  let {
    attr = undefined,
    fetchFunction: customFetchFunction = undefined,
    label = m.sales_channel(),
    placeholder = m.select_sales_channel_placeholder(),
    name = 'salesChannelId',
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
    filterStatus = 'active',
  }: Props = $props()

  function optionMappingFunction(item: SalesChannelSummary): ExtendedOption {
    return {
      label: item.name,
      value: item.id as string,
      attr: item,
    }
  }

  async function defaultFetchFunction(query: Partial<FilterQuery>): Promise<SalesChannelSummary[]> {
    const params = createQueryRequestObject(query)

    const channels = await apiRequest<SalesChannelSummary[]>({
      url: 'sales/sales-channel',
      queryParams: params,
    })

    // Filter by status if needed
    if (filterStatus === 'all') {
      return channels
    }

    return channels.filter((channel) => channel.status === filterStatus)
  }

  async function fetchFunction(query: Partial<FilterQuery>): Promise<SalesChannelSummary[]> {
    if (customFetchFunction) {
      return customFetchFunction(query)
    }
    return defaultFetchFunction(query)
  }
</script>

<FormGenericSingleSelector
  selectedValue={attr ? optionMappingFunction(attr) : undefined}
  emptyText={m.no_sales_channels_found()}
  newRecordText={m.add_new_sales_channel()}
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
