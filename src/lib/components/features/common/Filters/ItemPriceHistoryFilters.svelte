<!--
  @component ItemPriceHistoryFilters
  @description Filters for the item price-history subpage: the document source
  (sales orders vs invoices), customer, a document date range, and free-text
  search over document number / customer / ODA cliente / line description.
  Provides filter state consumable by ItemPriceHistory.
  @keywords filter, search, item, price, history, source, customer, date-range
  @api GET /api/legal-entities/{legalEntity}/customers (Moddo API) -> CustomerSummary[]
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import { getPriceHistorySources } from '$components/features/items/ItemPriceHistory/default/source.js'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerSummary } from '$lib/types/api-types'
  import {
    createQueryRequestObject,
    type FilterConfig,
    type FilterOption,
    type PaginatedResponse,
  } from '$lib/utils/filters'
  import { api } from '$lib/utils/request'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()

  const legalEntityId = $derived(props.legalEntity?.id)

  // Only the sources the user can actually read. With a single one there is
  // nothing to choose, so the filter is omitted rather than rendered with one
  // option — ItemPriceHistory falls back to it on its own.
  const sources = $derived(getPriceHistorySources(props.user))

  async function fetchCustomers(search: string): Promise<FilterOption[]> {
    if (!legalEntityId) return []
    const params = createQueryRequestObject({ search })
    const res = await api.get<PaginatedResponse<CustomerSummary>>(`/legal-entities/${legalEntityId}/customers`, {
      queryParams: params,
    })
    return res.data.map(customer => ({ value: customer.id as string, label: customer.name }))
  }

  // Filter keys must match the API query param names — they're forwarded as-is.
  // `source` is the exception: it picks the endpoint, and ItemPriceHistory
  // strips it before the request goes out. It's also the only standalone one:
  // grouped inside the dropdown it would say nothing about which dataset is on
  // screen, which is the whole reason it's visible.
  const filterConfig = $derived<FilterConfig>({
    ...(sources.length > 1
      ? {
          source: {
            type: 'enum' as const,
            label: m.price_history_source(),
            standalone: true,
            options: sources,
            defaultValue: sources[0]?.value,
          },
        }
      : {}),
    customer_id: {
      type: 'customer',
      label: m.customer(),
      fetchFunction: fetchCustomers,
    },
    document_date_from: {
      type: 'date',
      label: m.filters_from(),
      allowPast: true,
      allowFuture: false,
      dayBoundary: 'startOf',
    },
    document_date_to: {
      type: 'date',
      label: m.filters_to(),
      allowPast: true,
      allowFuture: true,
      dayBoundary: 'endOf',
    },
  })
</script>

<GenericFilters {...props} config={filterConfig} />
