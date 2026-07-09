<!--
  @component SalesOrdersFilters
  @description Filter component for the sales-orders listing. Exposes search plus
  state (multi-select), fulfillment-status, customer and incoterm filters via
  FilterDropdown. Includes a primary "Nuovo ordine" CTA on the right.
  Provides filter state consumable by SalesOrdersTable.
  @keywords filter, search, sales-orders, common
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import Button from '$components/ui/button/button.svelte'
  import { usePageChat } from '$lib/chat/hooks/usePageChat'
  import { makeFilterChatRegistration } from '$lib/chat/page-tools/filter-registration'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerSummary } from '$lib/types/api-types'
  import {
    configToSelectItems,
    incotermLabels,
    salesOrderFulfillmentStatusConfig,
    salesOrderStateConfig,
    toSelectItems,
  } from '$lib/utils/enum-labels'
  import {
    createQueryRequestObject,
    type FilterConfig,
    type FilterOption,
    type PaginatedResponse,
  } from '$lib/utils/filters'
  import { api } from '$lib/utils/request'
  import { createRoute } from '$utils/route-builder.js'
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
    state: {
      type: 'tags',
      label: m.filters_state(),
      options: configToSelectItems(salesOrderStateConfig),
    },
    fulfillment_status: {
      type: 'enum',
      label: m.fulfillment_status(),
      options: configToSelectItems(salesOrderFulfillmentStatusConfig),
    },
    incoterm: {
      type: 'enum',
      label: m.incoterm(),
      options: toSelectItems(incotermLabels),
    },
  }

  usePageChat(
    makeFilterChatRegistration({
      id: 'sales-orders-filter',
      toolName: 'filter_sales_orders',
      resourceLabel: 'sales orders',
      config,
    }),
  )
</script>

<GenericFilters {...props} {config}>
  <Button variant="default" href={createRoute({ $id: 'sales-order-details' })}>
    {m.add_new_sales_order()}
  </Button>
</GenericFilters>
