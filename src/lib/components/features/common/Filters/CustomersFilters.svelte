<!--
  @component CustomersFilters
  @description Filter component for the customers listing. Exposes search plus
  commercial-status (single-select) and tags (multi-select: suspended / ceased)
  filters via FilterDropdown. Includes a primary "Nuovo cliente" CTA on the right.
  Provides filter state consumable by CustomersTable.
  @keywords filter, search, customers, common
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
  import { configToSelectItems, customerCommercialStatusConfig, customerTagConfig } from '$lib/utils/enum-labels'
  import type { FilterConfig } from '$lib/utils/filters'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()

  const config: FilterConfig = {
    commercial_status: {
      type: 'enum',
      label: m.commercial_status(),
      options: configToSelectItems(customerCommercialStatusConfig),
    },
    tags: {
      type: 'tags',
      label: m.status(),
      options: configToSelectItems(customerTagConfig),
    },
  }

  usePageChat(
    makeFilterChatRegistration({
      id: 'customers-filter',
      toolName: 'filter_customers',
      resourceLabel: 'customers',
      config,
    }),
  )
</script>

<GenericFilters {...props} {config}>
  <Button variant="default" href={createRoute({ $id: 'customer-details' })}>
    {m.add_new_customer()}
  </Button>
</GenericFilters>
