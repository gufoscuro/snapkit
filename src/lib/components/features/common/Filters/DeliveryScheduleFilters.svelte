<!--
  @component DeliveryScheduleFilters
  @description Filter component for the delivery schedule ("to ship") listing.
  Exposes search, customer and delivery-date range filters via FilterDropdown.
  Provides filter state consumable by DeliveryScheduleTable.
  @keywords filter, search, delivery, schedule, shipment, to-ship, common
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, type FilterConfig, type FilterOption, type PaginatedResponse } from '$lib/utils/filters'
  import { api } from '$lib/utils/request'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()

  const legalEntityId = $derived(props.legalEntity?.id)

  async function fetchCustomers(search: string): Promise<FilterOption[]> {
    if (!legalEntityId) return []
    const params = createQueryRequestObject({ search })
    const res = await api.get<PaginatedResponse<CustomerSummary>>(`/legal-entities/${legalEntityId}/customers`, {
      queryParams: params,
    })
    return res.data.map(c => ({ value: c.id as string, label: c.name }))
  }

  const config: FilterConfig = {
    customer_id: {
      type: 'customer',
      label: m.customer(),
      fetchFunction: fetchCustomers,
    },
    delivery_date_from: {
      type: 'date',
      label: m.date_from(),
      dayBoundary: 'startOf',
    },
    delivery_date_to: {
      type: 'date',
      label: m.date_to(),
      dayBoundary: 'endOf',
    },
  }
</script>

<GenericFilters {...props} {config} />
