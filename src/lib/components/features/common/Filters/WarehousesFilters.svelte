<!--
  @component WarehousesFilters
  @description A filter component that provides filter state to sibling components.
  Provides filter state consumable by WarehousesTable.
  @keywords filter, warehouses, settings
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import Button from '$components/ui/button/button.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()
</script>

<GenericFilters {...props} hideSearch>
  <Button variant="default" href="/settings/warehouses/upsert">
    {m.add_new_warehouse()}
  </Button>
</GenericFilters>
