<!--
  @component SuppliersFilters
  @description Filter component for the suppliers listing. Exposes search plus a
  tags (multi-select: suspended / ceased) filter via FilterDropdown. Includes a
  primary "Nuovo fornitore" CTA on the right.
  Provides filter state consumable by SuppliersTable.
  @keywords filter, search, suppliers, common
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
  import { configToSelectItems, supplierTagConfig } from '$lib/utils/enum-labels'
  import type { FilterConfig } from '$lib/utils/filters'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()

  const config: FilterConfig = {
    tags: {
      type: 'tags',
      label: m.status(),
      options: configToSelectItems(supplierTagConfig),
    },
  }

  usePageChat(
    makeFilterChatRegistration({
      id: 'suppliers-filter',
      toolName: 'filter_suppliers',
      resourceLabel: 'suppliers',
      config,
    }),
  )
</script>

<GenericFilters {...props} {config}>
  <Button variant="default" href={createRoute({ $id: 'supplier-details' })}>
    {m.add_new_supplier()}
  </Button>
</GenericFilters>
